'use client';

import { accountSession } from './account/session';
import {
  ProfileService,
  type DatingPreferences,
  type DatingProfile,
  type ProfilePhoto,
} from './profile-service';
import { COLLECTIONS, findOne, storage, type Stored } from './storage';

/**
 * Query-oriented profile access.
 *
 * `ProfileService` owns writes for the *current* user. This module owns reads
 * that span users — the Explore feed, looking up a match's profile, filtering
 * to verified humans only — plus the id-addressed update the settings screen
 * needs.
 *
 * It was previously a REST client against a remote encrypted store, which is
 * why its methods take an explicit account id where `ProfileService` infers
 * one from the session.
 */

export interface ProfileSearchCriteria {
  ageMin?: number;
  ageMax?: number;
  location?: string;
  interests?: string[];
  /**
   * Restrict results to accounts that have passed Selfie Check.
   *
   * This backs the "verified only" toggle in Explore. Unverified profiles are
   * not hidden by default — they are shown flagged — because concealing them
   * would remove the incentive to verify.
   */
  verifiedOnly?: boolean;
  limit?: number;
  offset?: number;
}

export const ProfileRepository = {
  async saveProfile(profileData: Partial<DatingProfile>): Promise<DatingProfile> {
    return await ProfileService.saveProfile(profileData);
  },

  async getProfile(did: string): Promise<DatingProfile | null> {
    if (!did) return null;
    return await findOne<DatingProfile>(COLLECTIONS.PROFILE, { did });
  },

  /**
   * Patches a profile by account id.
   *
   * The settings screen has always called this method; it was never actually
   * implemented on the previous REST service, so editing a profile from the
   * user page failed with "updateProfile is not a function".
   */
  async updateProfile(did: string, patch: Partial<DatingProfile>): Promise<DatingProfile | null> {
    const existing = await findOne<DatingProfile>(COLLECTIONS.PROFILE, { did });
    if (!existing) return null;

    // `did` and `humanAnchor` are identity, not profile content. A patch must
    // not be able to move a profile onto another account or borrow its proof.
    const { did: _ignoredDid, humanAnchor: _ignoredAnchor, ...safePatch } = patch;

    const updated: DatingProfile = {
      ...existing,
      ...safePatch,
      did: existing.did,
      updatedAt: new Date().toISOString(),
    };

    await storage.put(COLLECTIONS.PROFILE, existing._id, updated);
    return updated;
  },

  async deleteProfile(did: string): Promise<boolean> {
    const existing = await findOne<DatingProfile>(COLLECTIONS.PROFILE, { did });
    if (!existing) return false;
    await storage.delete(COLLECTIONS.PROFILE, existing._id);
    return true;
  },

  /**
   * Finds profiles matching the given criteria, excluding the current user.
   */
  async searchProfiles(criteria: ProfileSearchCriteria = {}): Promise<DatingProfile[]> {
    const all = await storage.list<Stored<DatingProfile>>(COLLECTIONS.PROFILE);
    const self = accountSession.getAccountId();

    const matched = all.filter((profile) => {
      if (self && profile.did === self) return false;
      if (criteria.verifiedOnly && !profile.humanAnchor) return false;

      if (criteria.ageMin !== undefined || criteria.ageMax !== undefined) {
        const age = Number.parseInt(profile.age, 10);
        // A profile with no usable age is kept rather than dropped; an age
        // filter should narrow the feed, not silently empty it.
        if (Number.isFinite(age)) {
          if (criteria.ageMin !== undefined && age < criteria.ageMin) return false;
          if (criteria.ageMax !== undefined && age > criteria.ageMax) return false;
        }
      }

      if (criteria.location) {
        const wanted = criteria.location.toLowerCase();
        if (!profile.location?.toLowerCase().includes(wanted)) return false;
      }

      if (criteria.interests?.length) {
        const wanted = criteria.interests.map((interest) => interest.toLowerCase());
        const held = (profile.interests ?? []).map((interest) => interest.toLowerCase());
        if (!wanted.some((interest) => held.includes(interest))) return false;
      }

      return true;
    });

    // Verified profiles rank above unverified ones, then most recently
    // updated first. Ranking rather than filtering is the intended product
    // behaviour: verification buys reach, not exclusivity.
    matched.sort((a, b) => {
      const verificationRank = Number(Boolean(b.humanAnchor)) - Number(Boolean(a.humanAnchor));
      if (verificationRank !== 0) return verificationRank;
      return (b.updatedAt ?? '').localeCompare(a.updatedAt ?? '');
    });

    const offset = criteria.offset ?? 0;
    const limit = criteria.limit ?? matched.length;
    return matched.slice(offset, offset + limit);
  },

  async saveProfilePhoto(photoData: Partial<ProfilePhoto>): Promise<ProfilePhoto> {
    return await ProfileService.saveProfilePhoto(
      photoData.photoUrl ?? '',
      photoData.description ?? '',
      photoData.isPrivate ?? false,
      photoData.order ?? 0,
    );
  },

  async getProfilePhotos(did: string): Promise<ProfilePhoto[]> {
    if (!did) return [];
    const photos = await storage.list<Stored<ProfilePhoto>>(COLLECTIONS.PHOTOS, { did });
    return photos.sort((a, b) => a.order - b.order);
  },

  async getPreferences(did: string): Promise<DatingPreferences | null> {
    if (!did) return null;
    return await findOne<DatingPreferences>(COLLECTIONS.PREFERENCES, { did });
  },

  async savePreferences(preferences: Partial<DatingPreferences>): Promise<DatingPreferences> {
    return await ProfileService.savePreferences(preferences);
  },
};

export type { DatingProfile, ProfilePhoto, DatingPreferences };
export default ProfileRepository;
