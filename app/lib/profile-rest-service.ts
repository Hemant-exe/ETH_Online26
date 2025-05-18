'use client';

import { 
  APP_SCHEMA_MAPPING, 
  SCHEMA_SHORTHAND, 
  SCHEMA_URLS,
  formatDataToSchema, 
  formatSchemaToData,
  encodeSchemaUrl,
  prepareSchemaForEndpoint
} from './verida-schema-mapping';
import { API_BASE_URL, AUTH_TOKEN, DB_NAMES, APP_INFO } from './verida-config';

// Constants
// Using centralized config values instead of hardcoding values

// Using standard Verida schemas
const PROFILE_SCHEMA_URL = SCHEMA_URLS.SOCIAL_POST; // For profile information
const PREFERENCES_SCHEMA_URL = SCHEMA_URLS.SOCIAL_FOLLOWING; // For preferences
const PHOTOS_SCHEMA_URL = SCHEMA_URLS.FILE; // For photos

// Encoded schema parameters for API endpoints - always use full URL encoding, not shortcuts
const PROFILE_SCHEMA_PARAM = encodeSchemaUrl(PROFILE_SCHEMA_URL);
const PREFERENCES_SCHEMA_PARAM = encodeSchemaUrl(PREFERENCES_SCHEMA_URL);
const PHOTOS_SCHEMA_PARAM = encodeSchemaUrl(PHOTOS_SCHEMA_URL);

// Required scopes for each schema
const REQUIRED_SCOPES = {
  [SCHEMA_SHORTHAND.SOCIAL_POST]: APP_SCHEMA_MAPPING.DATING_PROFILE.requiredScope,
  [SCHEMA_SHORTHAND.SOCIAL_FOLLOWING]: APP_SCHEMA_MAPPING.DATING_PREFERENCES.requiredScope,
  [SCHEMA_SHORTHAND.FILE]: APP_SCHEMA_MAPPING.PROFILE_PHOTOS.requiredScope
};

// API scopes required for operations
const API_SCOPES = {
  QUERY: 'api:ds-query',
  CREATE: 'api:ds-create',
  UPDATE: 'api:ds-update',
  GET_BY_ID: 'api:ds-get-by-id',
  DELETE: 'api:ds-delete'
};

// Function to properly encode schema URLs for API endpoints
function encodeSchemaForEndpoint(schemaUrl: string): string {
  // Use the encodeSchemaUrl function from our mapping file
  return encodeSchemaUrl(schemaUrl);
}

// Same interfaces as in profile-service.ts
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
  _id?: string;
  _rev?: string;
}

export interface ProfilePhoto {
  did: string;
  photoUrl: string;
  description: string;
  isPrivate: boolean;
  order: number;
  uniqueId?: string;
  extension?: string;
  mimeType?: string;
  size?: number;
  createdAt: string;
  _id?: string;
  _rev?: string;
}

export interface DatingPreferences {
  did: string;
  ageRange: { min: number; max: number };
  locationPreference: string;
  distanceRange: number;
  lookingFor: string[];
  dealBreakers: string[];
  interests?: string[];
  relationshipGoals?: string;
  createdAt: string;
  updatedAt: string;
  _id?: string;
  _rev?: string;
}

/**
 * ProfileRestService
 * Handles API communication with Verida REST API for profile operations
 */
export const ProfileRestService = {
  /**
   * Generic API call method
   */
  async apiCall(endpoint: string, method: string = 'GET', body?: any): Promise<any> {
    try {
      // Ensure endpoint starts with a slash if needed
      if (!endpoint.startsWith('/')) {
        endpoint = '/' + endpoint;
      }
      
      const url = `${API_BASE_URL}${endpoint}`;
      console.log(`Making ${method} request to ${url}`);
      
      // Add detailed debugging info
      console.log(`FULL REQUEST DETAILS:
Raw URL: ${url}
Method: ${method}
Headers: Bearer token (hidden for security)
Body: ${body ? JSON.stringify(body, null, 2) : 'none'}`);
      
      if (body) {
        console.log(`Request body:`, body);
      }
      
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${AUTH_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // Get response text first for better error handling
      const responseText = await response.text();
      
      if (!response.ok) {
        // Try to parse as JSON for structured error info
        let errorDetails: string;
        try {
          const errorJson = JSON.parse(responseText);
          errorDetails = JSON.stringify(errorJson);
          console.error(`API Error Response:`, errorJson);
        } catch {
          errorDetails = responseText;
          console.error(`API Error Response (text):`, responseText);
        }
        
        // Log and throw the error
        console.error(`API Error (${response.status}): ${errorDetails}`);
        throw new Error(`API Error (${response.status}): ${errorDetails}`);
      }
      
      // Parse successful response as JSON
      let result;
      try {
        result = JSON.parse(responseText);
        console.log(`API Success Response:`, result);
      } catch (parseError) {
        console.error(`Error parsing API response as JSON:`, parseError);
        throw new Error(`Invalid JSON response: ${responseText}`);
      }
      
      return result;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error("API request timed out");
        throw new Error("Request timed out while communicating with Verida API");
      }
      
      console.error('API call failed', error);
      throw error;
    }
  },
  
  /**
   * Save a profile to the Verida network
   */
  async saveProfile(profileData: Partial<DatingProfile>): Promise<DatingProfile> {
    try {
      console.log("Saving profile data via REST API using social-post schema:", profileData);
      
      // Use our mapping utility to format data according to the schema
      const socialPostData = formatDataToSchema('DATING_PROFILE', profileData);
      console.log("Formatted data for Verida schema:", JSON.stringify(socialPostData, null, 2));
      
      // Ensure that these required fields are set (most common causes of 500 errors)
      if (!socialPostData.schema) {
        console.error("ERROR: Schema URL missing from formatted data");
        socialPostData.schema = SCHEMA_URLS.SOCIAL_POST;
      }
      
      if (!socialPostData.name) {
        console.error("ERROR: 'name' field missing (required by schema)");
        socialPostData.name = profileData.displayName || "User Profile";
      }
      
      if (!socialPostData.uri) {
        console.error("ERROR: 'uri' field missing (required by schema)");
        socialPostData.uri = `dating:profile:${profileData.did || Date.now()}`;
      }
      
      console.log("Final data after validation checks:", JSON.stringify(socialPostData, null, 2));
      
      // Check if profile already exists by querying
      let existingProfiles;
      try {
        // Query using DID to see if profile exists
        const queryEndpoint = `/api/rest/v1/ds/query/${PROFILE_SCHEMA_PARAM}`;
        // Use the correct format expected by the API for queries
        const queryBody = {
          recordFilter: {
            did: profileData.did,
            "metadata.profileType": "dating" 
          },
          options: {
            limit: 1
          }
        };
        
        existingProfiles = await this.apiCall(queryEndpoint, 'POST', queryBody);
        console.log("Query result:", JSON.stringify(existingProfiles, null, 2));
      } catch (error) {
        console.warn("Error querying for existing profile", error);
        existingProfiles = { items: [] };
      }
      
      let result;
      if (existingProfiles?.items?.length > 0) {
        // Update existing profile
        const existingProfile = existingProfiles.items[0];
        const recordId = existingProfile._id;
        
        console.log(`Found existing profile with _id: ${recordId}`);
        
        // Important: Preserve the _id and _rev for update
        socialPostData._id = recordId;
        if (existingProfile._rev) {
          socialPostData._rev = existingProfile._rev;
        }
        
        const updateEndpoint = `/api/rest/v1/ds/${PROFILE_SCHEMA_PARAM}/${recordId}`;
        console.log(`Updating profile at endpoint: ${updateEndpoint}`);
        
        // Update instead of creating new record - Wrap in 'record' object as required by the API
        const requestBody = {
          record: socialPostData
        };
        console.log("With update data:", JSON.stringify(requestBody, null, 2));
        
        result = await this.apiCall(updateEndpoint, 'PUT', requestBody);
        console.log("Updated profile:", result);
      } else {
        // Create new profile
        const createEndpoint = `/api/rest/v1/ds/${PROFILE_SCHEMA_PARAM}`;
        console.log("Creating new profile at endpoint:", createEndpoint);
        
        // IMPORTANT FIX: Wrap the data in a 'record' object as required by the Verida API
        const requestBody = {
          record: socialPostData
        };
        console.log("With data:", JSON.stringify(requestBody, null, 2));
        
        // Make the API call to create the profile
        result = await this.apiCall(createEndpoint, 'POST', requestBody);
        console.log("Created new profile:", result);
      }
      
      // Convert back to our app's format (result.record contains the created/updated data)
      const profile = result.record;
      return {
        did: profile.did,
        displayName: profile.name || "",
        age: profile.metadata?.age || "",
        location: profile.metadata?.location || "",
        bio: profile.content || "",
        interests: profile.metadata?.interests || [],
        relationshipGoals: profile.metadata?.relationshipGoals || "",
        primaryPhotoIndex: profile.metadata?.primaryPhotoIndex || 0,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
        _id: profile._id,
        _rev: profile._rev
      } as DatingProfile;
    } catch (error) {
      console.error('Error saving profile', error);
      throw error;
    }
  },
  
  /**
   * Get a profile from the Verida network
   */
  async getProfile(did: string): Promise<DatingProfile | null> {
    try {
      console.log(`Getting profile for DID: ${did}`);
      
      // Query for profile with the given DID
      const queryEndpoint = `/api/rest/v1/ds/query/${PROFILE_SCHEMA_PARAM}`;
      const queryBody = {
        recordFilter: {
          did: did,
          "metadata.profileType": "dating"
        },
        options: {
          limit: 1
        }
      };
      
      const result = await this.apiCall(queryEndpoint, 'POST', queryBody);
      console.log(`Query result:`, result);
      
      // Check for items array instead of data array
      if (result?.items?.length > 0) {
        // Convert to our app format and return
        const profile = result.items[0];
        
        // Extract data from the correct structure
        return {
          did: profile.did,
          displayName: profile.name || "",
          age: profile.metadata?.age || "",
          location: profile.metadata?.location || "",
          bio: profile.content || "",
          interests: profile.metadata?.interests || [],
          relationshipGoals: profile.metadata?.relationshipGoals || "",
          primaryPhotoIndex: profile.metadata?.primaryPhotoIndex || 0,
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt,
          _id: profile._id,
          _rev: profile._rev
        } as DatingProfile;
      } else {
        console.log(`No profile found for DID: ${did}`);
        return null;
      }
    } catch (error) {
      console.error('Error getting profile', error);
      throw error;
    }
  },
  
  /**
   * Delete a profile from the Verida network
   */
  async deleteProfile(did: string): Promise<boolean> {
    try {
      console.log(`Deleting profile for DID: ${did}`);
      
      // First find the profile ID
      const queryEndpoint = `/api/rest/v1/ds/query/${PROFILE_SCHEMA_PARAM}`;
      const queryBody = {
        recordFilter: {
          did: did,
          "metadata.profileType": "dating"
        },
        options: {
          limit: 1
        }
      };
      
      const result = await this.apiCall(queryEndpoint, 'POST', queryBody);
      
      if (result?.items?.length > 0) {
        const recordId = result.items[0]._id;
        // Delete the record
        const deleteEndpoint = `/api/rest/v1/ds/${PROFILE_SCHEMA_PARAM}/${recordId}`;
        await this.apiCall(deleteEndpoint, 'DELETE');
        console.log(`Profile deleted successfully`);
        return true;
      } else {
        console.log(`No profile found to delete for DID: ${did}`);
        return false;
      }
    } catch (error) {
      console.error('Error deleting profile', error);
      throw error;
    }
  },
  
  /**
   * Search for profiles with given criteria
   */
  async searchProfiles(criteria: {
    ageMin?: number;
    ageMax?: number;
    location?: string;
    interests?: string[];
    limit?: number;
    offset?: number;
  }): Promise<DatingProfile[]> {
    try {
      console.log(`Searching profiles with criteria:`, criteria);
      
      // Build query object based on criteria
      const filter: any = {
        "metadata.profileType": "dating" // Always filter to our app's profiles
      };
      
      // Add age filtering if provided
      if (criteria.ageMin !== undefined || criteria.ageMax !== undefined) {
        filter["metadata.age"] = {};
        if (criteria.ageMin !== undefined) {
          filter["metadata.age"]["$gte"] = criteria.ageMin.toString();
        }
        if (criteria.ageMax !== undefined) {
          filter["metadata.age"]["$lte"] = criteria.ageMax.toString();
        }
      }
      
      // Add location filtering if provided
      if (criteria.location) {
        filter["metadata.location"] = criteria.location;
      }
      
      // Add interests filtering if provided
      if (criteria.interests && criteria.interests.length > 0) {
        filter["metadata.interests"] = { "$in": criteria.interests };
      }
      
      const queryEndpoint = `/api/rest/v1/ds/query/${PROFILE_SCHEMA_PARAM}`;
      const queryBody = {
        recordFilter: filter,
        options: {
          limit: criteria.limit || 20,
          skip: criteria.offset || 0
        }
      };
      
      const result = await this.apiCall(queryEndpoint, 'POST', queryBody);
      
      if (result?.items?.length > 0) {
        // Convert each profile to our app format
        return result.items.map((profile: any) => {
          return {
            did: profile.did,
            displayName: profile.name || "",
            age: profile.metadata?.age || "",
            location: profile.metadata?.location || "",
            bio: profile.content || "",
            interests: profile.metadata?.interests || [],
            relationshipGoals: profile.metadata?.relationshipGoals || "",
            primaryPhotoIndex: profile.metadata?.primaryPhotoIndex || 0,
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt
          } as DatingProfile;
        });
      } else {
        console.log(`No profiles found matching criteria`);
        return [];
      }
    } catch (error) {
      console.error('Error searching profiles', error);
      throw error;
    }
  },

  // Add a new method for handling photo uploads
  async saveProfilePhoto(photoData: Partial<ProfilePhoto>): Promise<ProfilePhoto> {
    try {
      console.log("Saving profile photo via REST API:", photoData);
      
      // Extract file extension and mimeType from the photoUrl (data:image/jpeg;base64 or data:image/png;base64)
      let extension = 'jpg'; // Default extension
      let mimeType = 'image/jpeg'; // Default mimeType
      
      if (photoData.photoUrl) {
        const mimeTypeMatch = photoData.photoUrl.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9]+);base64/);
        if (mimeTypeMatch && mimeTypeMatch[1]) {
          mimeType = mimeTypeMatch[1];
          const extMatch = mimeType.split('/');
          if (extMatch.length > 1) {
            extension = extMatch[1].toLowerCase();
            // Normalize extensions
            if (extension === 'jpeg') extension = 'jpg';
          }
        }
      }
      
      // Calculate size in bytes from base64 string
      // Base64 encodes 3 bytes into 4 characters
      let size = 0;
      if (photoData.photoUrl) {
        // Get the base64 part without the data:image/xxx;base64, prefix
        const base64Data = photoData.photoUrl.split(',')[1];
        if (base64Data) {
          // Calculate approximate size: 3/4 of base64 length is roughly the decoded size in bytes
          size = Math.ceil((base64Data.length * 3) / 4);
        }
      }
      
      // Use uniqueId if provided, otherwise generate a timestamp
      const uniqueId = photoData.uniqueId || `${Date.now()}-${photoData.order || 0}`;
      
      // Format data for the file schema
      const fileSchemaData: any = {
        schema: SCHEMA_URLS.FILE,
        name: photoData.description || `Profile Photo`,
        uri: `dating:photo:${photoData.did}:${uniqueId}`,
        contentType: "image",
        did: photoData.did,
        // Add the required extension property
        extension: extension,
        // Add the required mimeType property
        mimeType: mimeType,
        // Add the required size property
        size: size,
        // Store photo data in metadata
        metadata: {
          photoUrl: photoData.photoUrl,
          description: photoData.description,
          isPrivate: photoData.isPrivate || false,
          order: photoData.order || 0,
          uniqueId: uniqueId,
          profileType: "dating"
        }
      };
      
      console.log("Formatted photo data for Verida schema:", JSON.stringify(fileSchemaData, null, 2));
      
      // Create new photo (we're not checking for existing ones since we're using uniqueId)
      console.log("Creating new photo record");
      const createEndpoint = `/api/rest/v1/ds/${PHOTOS_SCHEMA_PARAM}`;
      
      // Wrap the data in a 'record' object as required by the API
      const requestBody = {
        record: fileSchemaData
      };
      
      const result = await this.apiCall(createEndpoint, 'POST', requestBody);
      console.log("Created new photo record:", result);
      
      // Convert back to our app's format
      const savedPhoto = result.record;
      return {
        did: savedPhoto.did,
        photoUrl: savedPhoto.metadata?.photoUrl || "",
        description: savedPhoto.metadata?.description || savedPhoto.name || "",
        isPrivate: savedPhoto.metadata?.isPrivate || false,
        order: savedPhoto.metadata?.order || 0,
        uniqueId: savedPhoto.metadata?.uniqueId || uniqueId,
        extension: savedPhoto.extension || "",
        mimeType: savedPhoto.mimeType || "",
        size: savedPhoto.size || 0,
        createdAt: savedPhoto.createdAt || new Date().toISOString(),
        _id: savedPhoto._id,
        _rev: savedPhoto._rev
      } as ProfilePhoto;
    } catch (error) {
      console.error('Error saving photo', error);
      throw error;
    }
  },

  /**
   * Get all profile photos for a user
   * @param {string} did - DID of the user
   * @returns {Promise<ProfilePhoto[]>} - Array of user photos
   */
  async getProfilePhotos(did: string): Promise<ProfilePhoto[]> {
    try {
      console.log(`Getting photos for DID: ${did}`);
      
      // Query for photos with the given DID
      const queryEndpoint = `/api/rest/v1/ds/query/${PHOTOS_SCHEMA_PARAM}`;
      const queryBody = {
        recordFilter: {
          did: did
        },
        options: {
          limit: 20 // Increased limit to make sure we get all photos
        }
      };
      
      const result = await this.apiCall(queryEndpoint, 'POST', queryBody);
      console.log(`Photos query result:`, result);
      
      if (result?.items?.length > 0) {
        // Convert each photo to our app format
        const photos = result.items.map((photo: any) => {
          return {
            did: photo.did,
            photoUrl: photo.metadata?.photoUrl || photo.uri || photo.url || "",
            description: photo.metadata?.description || photo.name || "",
            isPrivate: photo.metadata?.isPrivate || false,
            order: photo.metadata?.order || 0,
            extension: photo.metadata?.extension || "",
            mimeType: photo.metadata?.mimeType || "",
            createdAt: photo.createdAt || new Date().toISOString(),
            _id: photo._id,
            _rev: photo._rev
          } as ProfilePhoto;
        });
        
        // Sort photos by order in JavaScript
        return photos.sort((a: ProfilePhoto, b: ProfilePhoto) => a.order - b.order);
      } else {
        console.log(`No photos found for DID: ${did}`);
        return [];
      }
    } catch (error) {
      console.error('Error getting photos', error);
      throw error;
    }
  },

  /**
   * Get preferences for a user
   * @param {string} did - DID of the user
   * @returns {Promise<DatingPreferences | null>} - User preferences or null if not found
   */
  async getPreferences(did: string): Promise<DatingPreferences | null> {
    try {
      console.log(`Getting preferences for DID: ${did}`);
      
      // First try to get the full profile, as preferences are stored within the profile
      const profile = await this.getProfile(did);
      
      if (profile) {
        console.log("Found profile with preferences:", profile);
        
        // Extract preferences from profile
        return {
          did: profile.did,
          // If we have specific preferences data, use it, otherwise use what's in the profile
          ageRange: { min: 18, max: 50 }, // Default values
          locationPreference: profile.location || "",
          distanceRange: 50, // Default value
          lookingFor: [],
          dealBreakers: [],
          interests: profile.interests || [],
          relationshipGoals: profile.relationshipGoals || "",
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt
        };
      }
      
      console.log(`No preferences found for DID: ${did}`);
      return null;
    } catch (error) {
      console.error('Error getting preferences', error);
      throw error;
    }
  }
}

export default ProfileRestService; 