'use client';

import { veridaClient } from './verida-client-wrapper';
import { DB_NAMES } from './verida-config';

// Database names for different profile data types
const PROFILE_DB = DB_NAMES.PROFILE;
const PREFERENCES_DB = DB_NAMES.PREFERENCES;
const PHOTOS_DB = DB_NAMES.PHOTOS;
const MATCHES_DB = DB_NAMES.MATCHES;
const MESSAGES_DB = DB_NAMES.MESSAGES;

// Interface for dating profile
export interface DatingProfile {
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
}

// Interface for photos data
export interface ProfilePhoto {
  did: string;
  photoUrl: string;
  description: string;
  isPrivate: boolean;
  order: number;
  createdAt: string;
}

// Interface for preferences data
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
 * ProfileService class to handle storing and retrieving profile data from Verida
 */
export class ProfileService {
  /**
   * Save or update user profile
   * @param {Partial<DatingProfile>} profileData - Profile data to save
   * @returns {Promise<DatingProfile>} - Saved profile
   */
  public static async saveProfile(profileData: Partial<DatingProfile>): Promise<DatingProfile> {
    try {
      // Ensure connected to Verida
      if (!veridaClient.isConnected()) {
        console.log("Not connected to Verida, attempting to connect...");
        const connected = await veridaClient.connect();
        if (!connected) {
          throw new Error('Failed to connect to Verida network');
        }
        console.log("Connected to Verida successfully");
      }

      const did = veridaClient.getDid();
      if (!did) {
        throw new Error('User not authenticated with Verida');
      }

      let profileDb;
      try {
        // Open profile database
        profileDb = await veridaClient.openDatabase(PROFILE_DB);
      } catch (dbError) {
        console.error("Initial database open failed, reconnecting...", dbError);
        
        // If opening the database fails, try reconnecting
        await veridaClient.disconnect();
        await veridaClient.connect();
        
        // Try opening the database again
        profileDb = await veridaClient.openDatabase(PROFILE_DB);
      }

      // Check if profile already exists
      const existingProfiles = await profileDb.getMany({
        did: did
      });

      const now = new Date().toISOString();
      
      let profile: DatingProfile;
      
      if (existingProfiles.length > 0) {
        // Update existing profile
        profile = {
          ...existingProfiles[0],
          ...profileData,
          did,
          updatedAt: now
        };
        
        await profileDb.save(profile, {
          did: did
        });
      } else {
        // Create new profile
        profile = {
          did,
          displayName: profileData.displayName || '',
          age: profileData.age || '',
          location: profileData.location || '',
          bio: profileData.bio || '',
          interests: profileData.interests || [],
          relationshipGoals: profileData.relationshipGoals || '',
          primaryPhotoIndex: profileData.primaryPhotoIndex || 0,
          createdAt: now,
          updatedAt: now
        };
        
        await profileDb.save(profile);
      }
      
      return profile;
    } catch (error) {
      console.error('Error saving profile to Verida:', error);
      throw error;
    }
  }

  /**
   * Get user profile
   * @param {string} did - DID of the user (optional, uses current user if not provided)
   * @returns {Promise<DatingProfile | null>} - User profile or null if not found
   */
  public static async getProfile(did?: string): Promise<DatingProfile | null> {
    try {
      // Ensure connected to Verida
      if (!veridaClient.isConnected()) {
        await veridaClient.connect();
      }

      const userDid = did || veridaClient.getDid();
      if (!userDid) {
        throw new Error('User not authenticated with Verida');
      }

      // Open profile database
      const profileDb = await veridaClient.openDatabase(PROFILE_DB);

      // Get profile data
      const profiles = await profileDb.getMany({
        did: userDid
      });

      return profiles.length > 0 ? profiles[0] : null;
    } catch (error) {
      console.error('Error getting profile from Verida:', error);
      throw error;
    }
  }

  /**
   * Save profile photo
   * @param {string} photoUrl - URL or base64 data of the photo
   * @param {string} description - Description of the photo
   * @param {boolean} isPrivate - Whether the photo is private
   * @param {number} order - Display order of the photo
   * @returns {Promise<ProfilePhoto>} - Saved photo data
   */
  public static async saveProfilePhoto(
    photoUrl: string,
    description: string = '',
    isPrivate: boolean = false,
    order: number = 0
  ): Promise<ProfilePhoto> {
    try {
      // Ensure connected to Verida
      if (!veridaClient.isConnected()) {
        await veridaClient.connect();
      }

      const did = veridaClient.getDid();
      if (!did) {
        throw new Error('User not authenticated with Verida');
      }

      // Open photos database
      const photosDb = await veridaClient.openDatabase(PHOTOS_DB);

      const now = new Date().toISOString();
      
      // Create photo object
      const photo: ProfilePhoto = {
        did,
        photoUrl,
        description,
        isPrivate,
        order,
        createdAt: now
      };
      
      // Save to database
      await photosDb.save(photo);
      
      return photo;
    } catch (error) {
      console.error('Error saving photo to Verida:', error);
      throw error;
    }
  }

  /**
   * Get all profile photos
   * @param {string} did - DID of the user (optional, uses current user if not provided)
   * @returns {Promise<ProfilePhoto[]>} - Array of user photos
   */
  public static async getProfilePhotos(did?: string): Promise<ProfilePhoto[]> {
    try {
      // Ensure connected to Verida
      if (!veridaClient.isConnected()) {
        await veridaClient.connect();
      }

      const userDid = did || veridaClient.getDid();
      if (!userDid) {
        throw new Error('User not authenticated with Verida');
      }

      // Open photos database
      const photosDb = await veridaClient.openDatabase(PHOTOS_DB);

      // Get photos data
      const photos = await photosDb.getMany({
        did: userDid
      });

      // Sort by order
      return photos.sort((a: ProfilePhoto, b: ProfilePhoto) => a.order - b.order);
    } catch (error) {
      console.error('Error getting photos from Verida:', error);
      throw error;
    }
  }

  /**
   * Save user preferences
   * @param {Partial<DatingPreferences>} preferencesData - Preferences data to save
   * @returns {Promise<DatingPreferences>} - Saved preferences
   */
  public static async savePreferences(preferencesData: Partial<DatingPreferences>): Promise<DatingPreferences> {
    try {
      // Ensure connected to Verida
      if (!veridaClient.isConnected()) {
        await veridaClient.connect();
      }

      const did = veridaClient.getDid();
      if (!did) {
        throw new Error('User not authenticated with Verida');
      }

      // Open preferences database
      const preferencesDb = await veridaClient.openDatabase(PREFERENCES_DB);

      // Check if preferences already exist
      const existingPreferences = await preferencesDb.getMany({
        did: did
      });

      const now = new Date().toISOString();
      
      let preferences: DatingPreferences;
      
      if (existingPreferences.length > 0) {
        // Update existing preferences
        preferences = {
          ...existingPreferences[0],
          ...preferencesData,
          did,
          updatedAt: now
        };
        
        await preferencesDb.save(preferences, {
          did: did
        });
      } else {
        // Create new preferences
        preferences = {
          did,
          ageRange: preferencesData.ageRange || { min: 18, max: 50 },
          locationPreference: preferencesData.locationPreference || 'worldwide',
          distanceRange: preferencesData.distanceRange || 50,
          lookingFor: preferencesData.lookingFor || [],
          dealBreakers: preferencesData.dealBreakers || [],
          createdAt: now,
          updatedAt: now
        };
        
        await preferencesDb.save(preferences);
      }
      
      return preferences;
    } catch (error) {
      console.error('Error saving preferences to Verida:', error);
      throw error;
    }
  }

  /**
   * Get user preferences
   * @param {string} did - DID of the user (optional, uses current user if not provided)
   * @returns {Promise<DatingPreferences | null>} - User preferences or null if not found
   */
  public static async getPreferences(did?: string): Promise<DatingPreferences | null> {
    try {
      // Ensure connected to Verida
      if (!veridaClient.isConnected()) {
        await veridaClient.connect();
      }

      const userDid = did || veridaClient.getDid();
      if (!userDid) {
        throw new Error('User not authenticated with Verida');
      }

      // Open preferences database
      const preferencesDb = await veridaClient.openDatabase(PREFERENCES_DB);

      // Get preferences data
      const preferences = await preferencesDb.getMany({
        did: userDid
      });

      return preferences.length > 0 ? preferences[0] : null;
    } catch (error) {
      console.error('Error getting preferences from Verida:', error);
      throw error;
    }
  }
} 