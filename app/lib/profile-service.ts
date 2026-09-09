'use client';

import { accountSession } from './account/session';
import { COLLECTIONS, findOne, storage, upsert, type Stored } from './storage';

/**
 * Profile, photo and preference persistence.
 *
 * All six public methods keep the signatures they have always had. Only the
 * storage layer underneath them changed: reads and writes now go through
 * `StorageAdapter` instead of a remote encrypted database, so the app works
 * offline and needs no vendor session to render a profile.
 */

/** A user's public dating profile. */
export interface DatingProfile {
  /** Account key. Derived from the human anchor once the user is verified. */
  did: string;
  displayName: string;
  age: string;
  location: string;
  bio: string;
  interests: string[];
  relationshipGoals: string;
  primaryPhotoIndex: number;
  createdAt: string;
  updatedAt: string;

  /**
   * World ID nullifier hash for this person, or absent if unverified.
   *
   * This is the uniqueness key for the whole product: one nullifier holds at
   * most one active profile, which is what makes duplicate and catfish
   * profiles impossible rather than merely discouraged. Enforced server-side
   * in `app/api/world/verify/route.ts` — never trust a client-set value.
   */
  humanAnchor?: string;
  /** When Selfie Check last succeeded, ISO 8601. */
  verifiedAt?: string;
  /** The credential that was presented, e.g. Selfie Check. */
  credentialType?: string;
  /** AgentBook id of this user's twin, once registered. */
  agentId?: string;
}

export interface ProfilePhoto {
  did: string;
  photoUrl: string;
  description: string;
  isPrivate: boolean;
  order: number;
  createdAt: string;
}

export interface DatingPreferences {
  did: string;
  ageRange: { min: number; max: number };
  locationPreference: string;
  distanceRange: number;
  lookingFor: string[];
  dealBreakers: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Resolves the account key to operate on.
 *
 * Every method accepts an optional explicit key and otherwise falls back to
 * the current session, matching the previous behaviour. Establishing a session
 * cannot fail the way connecting to a remote vault could, but the guard is
 * kept so callers still get a clear error during server rendering.
 */
async function requireAccountId(explicit?: string): Promise<string> {
  if (explicit) return explicit;

  if (!accountSession.isConnected()) {
    await accountSession.connect();
  }

  const accountId = accountSession.getAccountId();
  if (!accountId) {
    throw new Error('No active account session. Complete onboarding first.');
  }
  return accountId;
}

export class ProfileService {
  /**
   * Creates or updates the current user's profile.
   *
   * Upsert keyed on the account id, so a user has exactly one profile row.
   */
  public static async saveProfile(profileData: Partial<DatingProfile>): Promise<DatingProfile> {
    const did = await requireAccountId(profileData.did);
    const now = new Date().toISOString();

    const existing = await findOne<DatingProfile>(COLLECTIONS.PROFILE, { did });

    const profile: DatingProfile = existing
      ? { ...existing, ...profileData, did, updatedAt: now }
      : {
          did,
          displayName: profileData.displayName || '',
          age: profileData.age || '',
          location: profileData.location || '',
          bio: profileData.bio || '',
          interests: profileData.interests || [],
          relationshipGoals: profileData.relationshipGoals || '',
          primaryPhotoIndex: profileData.primaryPhotoIndex || 0,
          createdAt: now,
          updatedAt: now,
        };

    // The human anchor is authoritative from the session, not from caller
    // input, so a crafted `profileData` cannot claim someone else's proof.
    const anchor = accountSession.getHumanAnchor();
    if (anchor) {
      const snapshot = accountSession.getSnapshot();
      profile.humanAnchor = anchor;
      profile.verifiedAt = snapshot?.verifiedAt ?? profile.verifiedAt;
      profile.credentialType = snapshot?.credentialType ?? profile.credentialType;
    }

    await upsert(COLLECTIONS.PROFILE, { did }, profile as unknown as Record<string, unknown>);
    return profile;
  }

  public static async getProfile(did?: string): Promise<DatingProfile | null> {
    const accountId = await requireAccountId(did);
    return await findOne<DatingProfile>(COLLECTIONS.PROFILE, { did: accountId });
  }

  /**
   * Appends a photo to the user's gallery.
   *
   * Photos are separate rows rather than an array on the profile so a large
   * base64 image cannot fail the write for the profile's text fields.
   */
  public static async saveProfilePhoto(
    photoUrl: string,
    description: string = '',
    isPrivate: boolean = false,
    order: number = 0,
  ): Promise<ProfilePhoto> {
    const did = await requireAccountId();

    const photo: ProfilePhoto = {
      did,
      photoUrl,
      description,
      isPrivate,
      order,
      createdAt: new Date().toISOString(),
    };

    // Keyed on (owner, order) so re-saving slot 2 replaces slot 2 rather than
    // accumulating duplicates each time the photo step is revisited.
    await upsert(
      COLLECTIONS.PHOTOS,
      { did, order },
      photo as unknown as Record<string, unknown>,
      'photo',
    );
    return photo;
  }

  public static async getProfilePhotos(did?: string): Promise<ProfilePhoto[]> {
    const accountId = await requireAccountId(did);
    const photos = await storage.list<Stored<ProfilePhoto>>(COLLECTIONS.PHOTOS, {
      did: accountId,
    });
    return photos.sort((a, b) => a.order - b.order);
  }

  public static async savePreferences(
    preferencesData: Partial<DatingPreferences>,
  ): Promise<DatingPreferences> {
    const did = await requireAccountId(preferencesData.did);
    const now = new Date().toISOString();

    const existing = await findOne<DatingPreferences>(COLLECTIONS.PREFERENCES, { did });

    const preferences: DatingPreferences = existing
      ? { ...existing, ...preferencesData, did, updatedAt: now }
      : {
          did,
          ageRange: preferencesData.ageRange || { min: 18, max: 99 },
          locationPreference: preferencesData.locationPreference || '',
          distanceRange: preferencesData.distanceRange || 50,
          lookingFor: preferencesData.lookingFor || [],
          dealBreakers: preferencesData.dealBreakers || [],
          createdAt: now,
          updatedAt: now,
        };

    await upsert(
      COLLECTIONS.PREFERENCES,
      { did },
      preferences as unknown as Record<string, unknown>,
    );
    return preferences;
  }

  public static async getPreferences(did?: string): Promise<DatingPreferences | null> {
    const accountId = await requireAccountId(did);
    return await findOne<DatingPreferences>(COLLECTIONS.PREFERENCES, { did: accountId });
  }

  /**
   * Deletes a photo by display slot.
   *
   * Added for the photo step's remove action, which previously had no way to
   * delete and left orphaned rows behind.
   */
  public static async deleteProfilePhoto(order: number, did?: string): Promise<void> {
    const accountId = await requireAccountId(did);
    const existing = await findOne<ProfilePhoto>(COLLECTIONS.PHOTOS, { did: accountId, order });
    if (existing) {
      await storage.delete(COLLECTIONS.PHOTOS, existing._id);
    }
  }
}

export default ProfileService;
