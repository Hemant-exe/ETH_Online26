/**
 * Dating application data models
 */

/**
 * Dating Profile Model
 * Represents a user's dating profile
 */
export interface DatingProfile {
  did: string;
  displayName: string;
  age: string;
  location: string;
  bio: string;
  interests: string[];
  relationshipGoals: string;
  primaryPhotoIndex: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Dating Preferences Model
 * Represents a user's dating preferences
 */
export interface DatingPreferences {
  did: string;
  ageRange: {
    min: number;
    max: number;
  };
  locationPreference: string;
  distanceRange: number;
  lookingFor: string[];
  dealBreakers: string[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Profile Photo Model
 * Represents a photo in the user's profile
 */
export interface ProfilePhoto {
  did: string;
  photoUrl: string;
  description: string;
  isPrivate: boolean;
  order: number;
  size?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Match Model
 * Represents a match between two users
 */
export interface Match {
  id: string;
  user1Did: string;
  user2Did: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  updatedAt?: string;
}

/**
 * Message Model
 * Represents a message between matched users
 */
export interface Message {
  id: string;
  matchId: string;
  senderDid: string;
  receiverDid: string;
  content: string;
  sentAt: string;
  readAt?: string;
} 