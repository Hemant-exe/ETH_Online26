import type { ProfileData } from "../profile/components/profile-creation-flow";

interface ProfileMetadata {
  name: string;
  description: string;
  image: string; // URL to primary image
  attributes: {
    trait_type: string;
    value: string | number;
  }[];
  veridaDID: string;
  cheqdDID?: string;
  properties: {
    photos?: string[];
    interests?: string[];
    [key: string]: any;
  };
}

export class ProfileMetadataService {
  /**
   * Generate metadata JSON for an NFT based on profile data
   * @param profileData - Profile data from the creation flow
   * @param didId - Verida DID for the user
   * @returns JSON metadata compatible with NFT standards
   */
  generateMetadata(profileData: ProfileData, didId: string): ProfileMetadata {
    // Get primary photo if available
    const primaryPhoto = profileData.photos[profileData.primaryPhotoIndex] || "";
    
    // Generate description from bio or create a default one
    const description = profileData.bio || 
      `${profileData.displayName}'s dating profile. ${profileData.age} years old from ${profileData.location}.`;
    
    // Create attributes array from profile data
    const attributes = [
      {
        trait_type: "Age",
        value: profileData.age || 0
      },
      {
        trait_type: "Location",
        value: profileData.location || "Unknown"
      },
      {
        trait_type: "Relationship Goal",
        value: profileData.relationshipGoals || "Not specified"
      }
    ];
    
    // Add interests as attributes if available
    if (profileData.interests && profileData.interests.length > 0) {
      attributes.push({
        trait_type: "Interests",
        value: profileData.interests.length
      });
    }
    
    // Create the metadata object
    const metadata: ProfileMetadata = {
      name: profileData.displayName || "Dating Profile",
      description: description,
      image: primaryPhoto, // Primary photo as the NFT image
      attributes: attributes,
      veridaDID: didId,
      properties: {
        photos: profileData.photos,
        interests: profileData.interests
      }
    };
    
    return metadata;
  }
  
  /**
   * Create a Verida URI pointing to the profile data
   * This would typically store the data in Verida and return a URI
   * For now, we'll simulate it with a placeholder URI
   * 
   * @param metadata - The metadata to store
   * @returns A URI pointing to the metadata
   */
  async storeMetadata(metadata: ProfileMetadata): Promise<string> {
    try {
      console.log("Storing metadata in Verida:", metadata);
      
      // In a real implementation, we would store this in Verida
      // For now, we'll simulate it with a placeholder URI
      
      // Create a unique identifier (in production, this would be a proper Verida URI)
      const timestamp = Date.now();
      const uri = `verida://profile/${metadata.veridaDID}/${timestamp}`;
      
      console.log("Stored metadata at URI:", uri);
      
      return uri;
    } catch (error) {
      console.error("Error storing metadata:", error);
      throw error;
    }
  }
}

// Singleton instance of the metadata service
export const profileMetadataService = new ProfileMetadataService(); 