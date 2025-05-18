/**
 * Verida AI Twin Service
 * 
 * Handles storing and retrieving AI twin data using the Verida Favourite schema
 * Uses the schema at https://common.schemas.verida.io/favourite/v0.1.0/schema.json
 */

import { veridaClient } from './verida-client';
import { SCHEMA_URLS, encodeSchemaUrl, prepareSchemaForEndpoint } from './verida-schema-mapping';
import { ProfileRestService } from './profile-rest-service';
import { API_BASE_URL, AUTH_TOKEN, DB_NAMES, APP_INFO } from './verida-config';

// Database name for AI twins in Verida
const AI_TWIN_DB_NAME = DB_NAMES.AI_TWIN;

// Favourite Schema URL
const FAVOURITE_SCHEMA = SCHEMA_URLS.FAVOURITE;

// API constants for direct REST calls if needed
// Using the centralized config instead of hardcoded values

/**
 * Save AI twin data to Verida
 * @param twinData - The AI twin data formatted according to the Favourite schema
 * @returns {Promise<any>} - The saved record
 */
export async function saveAiTwin(twinData: any): Promise<any> {
  try {
    // Ensure required fields are present
    if (!twinData.name || !twinData.favouriteType || !twinData.contentType || !twinData.uri) {
      throw new Error('Missing required fields for Verida Favourite schema');
    }

    // Set required schema field
    twinData.schema = FAVOURITE_SCHEMA;
    
    // Set timestamps if not already set
    if (!twinData.insertedAt) {
      twinData.insertedAt = new Date().toISOString();
    }
    
    // Always update the modifiedAt timestamp
    twinData.modifiedAt = new Date().toISOString();
    
    // Connect to Verida if not already connected
    if (!veridaClient.isConnected()) {
      await veridaClient.connect();
    }
    
    // Check if a record with the same URI already exists
    const db = await veridaClient.openDatabase(AI_TWIN_DB_NAME);
    let existingRecord = null;
    
    try {
      // Search for an existing record with the same URI
      const results = await db.getMany({
        uri: twinData.uri
      });
      
      if (results && results.length > 0) {
        existingRecord = results[0];
        console.log(`Found existing record with URI ${twinData.uri} and _id ${existingRecord._id}`);
      }
    } catch (searchError) {
      console.warn('Error searching for existing record:', searchError);
      // Continue with save even if search fails
    }
    
    if (existingRecord) {
      // If we found an existing record, update it
      console.log('Updating existing AI twin record');
      
      // Preserve the _id and _rev for update
      twinData._id = existingRecord._id;
      if (existingRecord._rev) {
        twinData._rev = existingRecord._rev;
      }
      
      return await db.save(twinData);
    } else {
      // No existing record found, create a new one
      console.log('Creating new AI twin record');
      return await db.save(twinData);
    }
  } catch (error) {
    console.error('Failed to save AI twin:', error);
    
    // Try using REST API as fallback
    return saveAiTwinViaRest(twinData);
  }
}

/**
 * Save AI twin data to Verida using REST API (fallback method)
 * @param twinData - The AI twin data formatted according to the Favourite schema
 * @returns {Promise<any>} - The saved record
 */
async function saveAiTwinViaRest(twinData: any): Promise<any> {
  try {
    // Ensure schema is set
    twinData.schema = FAVOURITE_SCHEMA;
    
    // Always set modified timestamp
    twinData.modifiedAt = new Date().toISOString();
    
    // Convert schema URL to endpoint format
    const schemaEndpoint = prepareSchemaForEndpoint(FAVOURITE_SCHEMA);
    
    // First check if a record with the same URI already exists
    let existingRecord = null;
    let endpoint = '';
    let method = '';
    let requestBody = {};
    
    try {
      // Create the query endpoint URL
      const queryEndpoint = `${API_BASE_URL}/api/rest/v1/ds/query/${schemaEndpoint}`;
      
      // Search for an existing record with the same URI
      const searchResponse = await fetch(queryEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AUTH_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recordFilter: {
            uri: twinData.uri
          }
        })
      });
      
      if (searchResponse.ok) {
        const searchResult = await searchResponse.json();
        if (searchResult?.items?.length > 0) {
          existingRecord = searchResult.items[0];
          console.log(`Found existing record via REST with URI ${twinData.uri}`);
        }
      }
    } catch (searchError) {
      console.warn('Error searching for existing record via REST:', searchError);
      // Continue with save even if search fails
    }
    
    if (existingRecord) {
      // Update existing record
      console.log('Updating existing record via REST API');
      endpoint = `${API_BASE_URL}/api/rest/v1/ds/${schemaEndpoint}/${existingRecord._id}`;
      method = 'PUT';
      
      // Preserve _id and _rev for update
      twinData._id = existingRecord._id;
      if (existingRecord._rev) {
        twinData._rev = existingRecord._rev;
      }
      
      requestBody = {
        record: twinData
      };
    } else {
      // Create new record
      console.log('Creating new record via REST API');
      endpoint = `${API_BASE_URL}/api/rest/v1/ds/${schemaEndpoint}`;
      method = 'POST';
      requestBody = {
        record: twinData
      };
    }
    
    // Make the API request to save/update
    const response = await fetch(endpoint, {
      method: method,
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to save AI twin via REST API:', error);
    throw error;
  }
}

/**
 * Get the latest AI twin data for the current user
 * This function fetches the most recent AI twin data, prioritizing twins with matching DID
 * @returns {Promise<any>} - The formatted AI twin data ready for the form
 */
export async function getUserAiTwin(): Promise<any> {
  try {
    // Try to get the data using the client API first
    const twins = await getUserAiTwins();
    
    console.log(`Fetched ${twins.length} twins from Verida client API`);
    
    if (twins && twins.length > 0) {
      // Get current DID if available through verida client
      let did = null;
      try {
        if (veridaClient.isConnected()) {
          did = await veridaClient.getDid();
          console.log('Current user DID:', did);
        }
      } catch (didError) {
        console.warn('Could not get DID:', didError);
      }
      
      // If we have a DID, prioritize twins that match the DID
      let twinToUse = twins[0]; // Default to most recent
      
      if (did) {
        const didMatchingTwin = twins.find((twin: any) => 
          twin.did && twin.did.toLowerCase() === did.toLowerCase()
        );
        
        if (didMatchingTwin) {
          console.log('Found matching DID twin from client API');
          twinToUse = didMatchingTwin;
        }
      }
      
      return mapTwinDataToFormData(twinToUse);
    }
    
    console.log('No twins found from client API, trying REST API');
    
    // If no data found, try REST API as fallback
    return getUserAiTwinViaRest();
  } catch (error) {
    console.error('Failed to get AI twin:', error);
    console.log('Falling back to REST API after error');
    return getUserAiTwinViaRest();
  }
}

/**
 * Get the latest AI twin data for the current user using REST API (fallback method)
 * @returns {Promise<any>} - The formatted AI twin data ready for the form
 */
async function getUserAiTwinViaRest(): Promise<any> {
  try {
    // Function to encode schema URL for API endpoint
    const encodeSchemaForEndpoint = (url: string): string => {
      // Use Buffer in Node.js or btoa in browser
      let base64Encoded = btoa(url);
      
      // Convert standard base64 to URL-safe base64
      return base64Encoded
        .replace(/\+/g, '-') // Convert + to -
        .replace(/\//g, '_') // Convert / to _
        .replace(/=+$/, ''); // Remove trailing =
    };

    // Create a controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
    
    // Get current DID if available through verida client
    let did = null;
    try {
      if (veridaClient.isConnected()) {
        did = await veridaClient.getDid();
      }
    } catch (didError) {
      console.warn('Could not get DID:', didError);
    }
    
    // Prepare the API request
    const schemaEndpoint = encodeSchemaForEndpoint(FAVOURITE_SCHEMA);
    const endpoint = `${API_BASE_URL}/api/rest/v1/ds/query/${schemaEndpoint}`;
    
    // Make the API request
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        recordFilter: {
          'metadata.profileType': 'ai-twin'
        },
        options: {
          limit: 10
        }
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const result = await response.json();
    
    // Check if we have results - API returns items array instead of data
    if (result?.items?.length > 0) {
      console.log('Verida API response:', result);
      
      // Sort by insertedAt timestamp in descending order
      const sortedTwins = result.items.sort((a: any, b: any) => {
        return new Date(b.insertedAt).getTime() - new Date(a.insertedAt).getTime();
      });
      
      // If we have a DID, prioritize twins that match the DID
      let twinToUse = sortedTwins[0]; // Default to most recent
      
      if (did) {
        console.log(`Looking for twin with DID: ${did}`);
        const didMatchingTwin = sortedTwins.find((twin: any) => 
          twin.did && twin.did.toLowerCase() === did.toLowerCase()
        );
        
        if (didMatchingTwin) {
          console.log('Found matching DID twin:', didMatchingTwin.did);
          twinToUse = didMatchingTwin;
        } else {
          console.log('No exact DID match found, using most recent twin');
        }
      }
      
      // Map the twin data to form data
      return mapTwinDataToFormData(twinToUse);
    }
    
    return null;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error("Fetch request timed out");
      throw new Error("Request timed out while loading data");
    }
    
    console.error('Failed to get AI twin via REST API:', error);
    throw error;
  }
}

/**
 * Maps Verida twin data to the form data structure
 * @param twinData - The raw twin data from Verida
 * @returns {Object} - Formatted data for the form
 */
function mapTwinDataToFormData(twinData: any): any {
  if (!twinData) return null;
  
  console.log('Mapping twin data to form data:', twinData.name);
  
  try {
    // Initialize with basic data
    const formData: any = {
      name: twinData.name || "",
      favouriteType: twinData.favouriteType || "recommendation",
      contentType: twinData.contentType || "document",
      uri: twinData.uri || "",
      bio: twinData.description || "",
    };
    
    // Preserve document metadata for updates
    if (twinData._id) formData._id = twinData._id;
    if (twinData._rev) formData._rev = twinData._rev;
    if (twinData.did) formData.did = twinData.did;
    if (twinData.insertedAt) formData.insertedAt = twinData.insertedAt;
    if (twinData.sourceId) formData.sourceId = twinData.sourceId;
    
    // Extract metadata fields if available
    if (twinData.metadata) {
      // Personal details
      if (twinData.metadata.personalDetails) {
        formData.age = twinData.metadata.personalDetails.age || "";
        formData.location = twinData.metadata.personalDetails.location || "";
        formData.occupation = twinData.metadata.personalDetails.occupation || "";
      }
      
      // Life story
      if (twinData.metadata.lifeStory) {
        formData.childhood = twinData.metadata.lifeStory.childhood || "";
        formData.significantEvents = twinData.metadata.lifeStory.significantEvents || [];
        formData.achievements = twinData.metadata.lifeStory.achievements || [];
        formData.challenges = twinData.metadata.lifeStory.challenges || [];
        formData.lifePhilosophy = twinData.metadata.lifeStory.lifePhilosophy || "";
      }
      
      // Personality
      if (twinData.metadata.personality) {
        formData.personalityTraits = twinData.metadata.personality.personalityTraits || [];
        formData.communicationStyle = twinData.metadata.personality.communicationStyle || "";
        formData.humorStyle = twinData.metadata.personality.humorStyle || "";
        formData.emotionalResponses = twinData.metadata.personality.emotionalResponses || [];
        formData.decisionMakingStyle = twinData.metadata.personality.decisionMakingStyle || "";
      }
      
      // Interests
      if (twinData.metadata.interests) {
        formData.interests = twinData.metadata.interests.interests || [];
        formData.hobbies = twinData.metadata.interests.hobbies || [];
        formData.expertise = twinData.metadata.interests.expertise || [];
        formData.specificLikes = twinData.metadata.interests.specificLikes || [];
        formData.specificDislikes = twinData.metadata.interests.specificDislikes || [];
      }
      
      // Relationships
      if (twinData.metadata.relationships) {
        formData.relationshipGoals = twinData.metadata.relationships.relationshipGoals || "";
        formData.dealBreakers = twinData.metadata.relationships.dealBreakers || [];
        formData.lookingFor = twinData.metadata.relationships.lookingFor || [];
        formData.pastRelationships = twinData.metadata.relationships.pastRelationships || "";
        formData.attachmentStyle = twinData.metadata.relationships.attachmentStyle || "";
      }
      
      // Values
      if (twinData.metadata.values) {
        formData.coreValues = twinData.metadata.values.coreValues || [];
        formData.beliefs = twinData.metadata.values.beliefs || [];
        formData.politicalViews = twinData.metadata.values.politicalViews || "";
        formData.spirituality = twinData.metadata.values.spirituality || "";
      }
      
      // Communication
      if (twinData.metadata.communication) {
        formData.conversationTopics = twinData.metadata.communication.conversationTopics || [];
        formData.avoidTopics = twinData.metadata.communication.avoidTopics || [];
        formData.communicationPatterns = twinData.metadata.communication.communicationPatterns || [];
        formData.typicalPhrases = twinData.metadata.communication.typicalPhrases || [];
      }
      
      // AI Behavior
      if (twinData.metadata.aiBehavior) {
        formData.aiResponseStyle = twinData.metadata.aiBehavior.aiResponseStyle || "";
        formData.aiProactiveness = twinData.metadata.aiBehavior.aiProactiveness || 50;
        formData.aiPersonality = twinData.metadata.aiBehavior.aiPersonality || "";
        formData.aiConfidentiality = twinData.metadata.aiBehavior.aiConfidentiality || [];
      }
    }
    
    console.log('Successfully mapped form data');
    return formData;
  } catch (error) {
    console.error('Error mapping twin data to form data:', error);
    // Return basic data even if mapping fails
    return {
      name: twinData.name || "",
      favouriteType: twinData.favouriteType || "recommendation",
      contentType: twinData.contentType || "document",
      uri: twinData.uri || "",
      bio: twinData.description || "",
      // Include metadata for updates even in error case
      _id: twinData._id,
      _rev: twinData._rev,
      did: twinData.did,
    };
  }
}

/**
 * Get all AI twins for the current user
 * @returns {Promise<any[]>} - Array of AI twin records
 */
export async function getUserAiTwins(): Promise<any[]> {
  try {
    // Connect to Verida if not already connected
    if (!veridaClient.isConnected()) {
      await veridaClient.connect();
    }
    
    // Query options to filter for AI twins
    const options = {
      filter: {
        'metadata.profileType': 'ai-twin'
      }
    };
    
    // Use database API to query the data
    const db = await veridaClient.openDatabase(AI_TWIN_DB_NAME);
    return await db.getMany(options);
  } catch (error) {
    console.error('Failed to get AI twins:', error);
    
    // Try using REST API as fallback
    return getUserAiTwinsViaRest();
  }
}

/**
 * Get all AI twins for the current user using REST API (fallback method)
 * @returns {Promise<any[]>} - Array of AI twin records
 */
async function getUserAiTwinsViaRest(): Promise<any[]> {
  try {
    // Convert schema URL to endpoint format
    const schemaEndpoint = prepareSchemaForEndpoint(FAVOURITE_SCHEMA);
    
    // Create the query endpoint URL
    const endpoint = `/api/rest/v1/ds/query/${schemaEndpoint}`;
    
    // Prepare the query with filter for AI twins
    const queryBody = {
      recordFilter: {
        'metadata.profileType': 'ai-twin'
      },
      options: {
        limit: 20
      }
    };
    
    // Use the apiCall method directly
    const result = await ProfileRestService.apiCall(endpoint, 'POST', queryBody);
    
    // Return items array as expected by the API response
    return result?.items || [];
  } catch (error) {
    console.error('Failed to get AI twins via REST API:', error);
    throw error;
  }
}

/**
 * Format AI twin form data to match the Verida Favourite schema
 * @param formData - The form data from the AI twin creation form
 * @returns {Object} - Data formatted according to the Verida Favourite schema
 */
export function formatAiTwinData(formData: any): any {
  // Create the base object with 'any' type to allow dynamic properties
  const veridaData: any = {
    // Required fields from Favourite schema
    name: formData.name || "AI Twin Profile",
    favouriteType: formData.favouriteType || "recommendation",
    contentType: formData.contentType || "document",
    // Use existing URI if available, otherwise create a new one
    // This ensures we update the same record instead of creating new ones
    uri: formData.uri || `dating:twin:${Date.now()}`,
    schema: FAVOURITE_SCHEMA,
    
    // Optional fields
    description: formData.bio || "",
    
    // Add metadata for our app-specific fields
    metadata: {
      profileType: "ai-twin",
      personalDetails: {
        age: formData.age,
        location: formData.location,
        occupation: formData.occupation,
      },
      lifeStory: {
        childhood: formData.childhood,
        significantEvents: formData.significantEvents,
        achievements: formData.achievements,
        challenges: formData.challenges,
        lifePhilosophy: formData.lifePhilosophy,
      },
      personality: {
        personalityTraits: formData.personalityTraits,
        communicationStyle: formData.communicationStyle,
        humorStyle: formData.humorStyle,
        emotionalResponses: formData.emotionalResponses,
        decisionMakingStyle: formData.decisionMakingStyle,
      },
      interests: {
        interests: formData.interests,
        hobbies: formData.hobbies,
        expertise: formData.expertise,
        specificLikes: formData.specificLikes,
        specificDislikes: formData.specificDislikes,
      },
      relationships: {
        relationshipGoals: formData.relationshipGoals,
        dealBreakers: formData.dealBreakers,
        lookingFor: formData.lookingFor,
        pastRelationships: formData.pastRelationships,
        attachmentStyle: formData.attachmentStyle,
      },
      values: {
        coreValues: formData.coreValues,
        beliefs: formData.beliefs,
        politicalViews: formData.politicalViews,
        spirituality: formData.spirituality,
      },
      communication: {
        conversationTopics: formData.conversationTopics,
        avoidTopics: formData.avoidTopics,
        communicationPatterns: formData.communicationPatterns,
        typicalPhrases: formData.typicalPhrases,
      },
      aiBehavior: {
        aiResponseStyle: formData.aiResponseStyle,
        aiProactiveness: formData.aiProactiveness,
        aiPersonality: formData.aiPersonality,
        aiConfidentiality: formData.aiConfidentiality,
      }
    },
    
    // Add required timestamps and sources
    insertedAt: formData.insertedAt || new Date().toISOString(),
    sourceApplication: "DecentralMatch Dating AI Twin Creator",
    sourceId: formData.sourceId || `twin:${Date.now()}`
  };
  
  // Preserve existing _id and _rev if available
  if (formData._id) {
    console.log(`Preserving existing _id: ${formData._id}`);
    veridaData._id = formData._id;
  }
  
  if (formData._rev) {
    console.log(`Preserving existing _rev: ${formData._rev}`);
    veridaData._rev = formData._rev;
  }
  
  // Create the result object, potentially with DID
  const result = formData.did 
    ? { ...veridaData, did: formData.did }
    : veridaData;
    
  if (formData.did) {
    console.log(`Adding DID to formatted data: ${formData.did}`);
  }
  
  return result;
} 