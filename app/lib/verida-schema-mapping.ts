/**
 * VERIDA SCHEMA MAPPING
 * 
 * This file documents the mapping between our app's data models and Verida's standard schemas,
 * along with all the required permissions and scope information.
 */

// Standard Verida Schema URLs
export const SCHEMA_URLS = {
  SOCIAL_POST: 'https://common.schemas.verida.io/social/post/v0.1.0/schema.json',
  SOCIAL_FOLLOWING: 'https://common.schemas.verida.io/social/following/v0.1.0/schema.json',
  SOCIAL_EMAIL: 'https://common.schemas.verida.io/social/email/v0.1.0/schema.json',
  FAVOURITE: 'https://common.schemas.verida.io/favourite/v0.1.0/schema.json',
  FILE: 'https://common.schemas.verida.io/file/v0.1.0/schema.json',
  SOCIAL_CHAT_GROUP: 'https://common.schemas.verida.io/social/chat/group/v0.1.0/schema.json',
  SOCIAL_CHAT_MESSAGE: 'https://common.schemas.verida.io/social/chat/message/v0.1.0/schema.json',
  SOCIAL_CALENDAR: 'https://common.schemas.verida.io/social/calendar/v0.1.0/schema.json',
  SOCIAL_EVENT: 'https://common.schemas.verida.io/social/event/v0.1.0/schema.json'
};

// Shorthand names for standard schemas (used in scope definitions)
export const SCHEMA_SHORTHAND = {
  SOCIAL_POST: 'social-post',
  SOCIAL_FOLLOWING: 'social-following',
  SOCIAL_EMAIL: 'social-email',
  FAVOURITE: 'favourite',
  FILE: 'file',
  SOCIAL_CHAT_GROUP: 'social-chat-group',
  SOCIAL_CHAT_MESSAGE: 'social-chat-message',
  SOCIAL_CALENDAR: 'social-calendar',
  SOCIAL_EVENT: 'social-event'
};

// Schema mapping for our dating app - maps our app models to Verida schemas
export const APP_SCHEMA_MAPPING = {
  // Our dating profile uses the social-post schema
  DATING_PROFILE: {
    schema: SCHEMA_SHORTHAND.SOCIAL_POST,
    schemaUrl: SCHEMA_URLS.SOCIAL_POST,
    // How we're mapping our DatingProfile fields to the social-post schema
    fieldMapping: {
      displayName: 'name',
      bio: 'content',
      // These fields are stored in metadata
      age: 'metadata.age',
      location: 'metadata.location',
      interests: 'metadata.interests',
      relationshipGoals: 'metadata.relationshipGoals',
      primaryPhotoIndex: 'metadata.primaryPhotoIndex'
    },
    // Metadata marker to identify our app's data
    metadataType: 'dating',
    // Required scope for read/write access
    requiredScope: 'ds:rw:social-post'
  },
  
  // Dating preferences uses the social-following schema
  DATING_PREFERENCES: {
    schema: SCHEMA_SHORTHAND.SOCIAL_FOLLOWING,
    schemaUrl: SCHEMA_URLS.SOCIAL_FOLLOWING,
    // How we're mapping our DatingPreferences fields to the social-following schema
    fieldMapping: {
      ageRange: 'metadata.ageRange',
      locationPreference: 'metadata.locationPreference',
      distanceRange: 'metadata.distanceRange',
      lookingFor: 'metadata.lookingFor',
      dealBreakers: 'metadata.dealBreakers'
    },
    // Metadata marker to identify our app's data
    metadataType: 'dating',
    // Required scope for read/write access
    requiredScope: 'ds:rw:social-following'
  },
  
  // Profile photos use the file schema
  PROFILE_PHOTOS: {
    schema: SCHEMA_SHORTHAND.FILE,
    schemaUrl: SCHEMA_URLS.FILE,
    // How we're mapping our ProfilePhoto fields to the file schema
    fieldMapping: {
      photoUrl: 'uri',
      description: 'metadata.description',
      isPrivate: 'metadata.isPrivate',
      order: 'metadata.order'
    },
    // Metadata marker to identify our app's data
    metadataType: 'dating',
    // Required scope for read/write access
    requiredScope: 'ds:rw:file'
  }
};

// Scope Definitions
export const SCOPE_TYPES = {
  // API operation scopes
  API: {
    // Database operations
    DB_GET_BY_ID: 'api:db-get-by-id',     // GET /db/$dbName/$id
    DB_CREATE: 'api:db-create',           // POST /db/$dbName
    DB_UPDATE: 'api:db-update',           // PUT /db/$dbName/$id
    DB_QUERY: 'api:db-query',             // POST /db/query/$dbName
    
    // Datastore operations
    DS_GET_BY_ID: 'api:ds-get-by-id',     // GET /ds/$dsUrlEncoded/$id
    DS_CREATE: 'api:ds-create',           // POST /ds/$dsUrlEncoded
    DS_UPDATE: 'api:ds-update',           // PUT /ds/$dsUrlEncoded/$id
    DS_QUERY: 'api:ds-query',             // POST /ds/query/$dsUrlEncoded or GET /ds/watch/$dsUrlEncoded
    DS_DELETE: 'api:ds-delete',           // DELETE /ds/$dsUrlEncoded/$id
    
    // AI operations
    LLM_PROMPT: 'api:llm-prompt',                 // LLM without user data access
    LLM_AGENT_PROMPT: 'api:llm-agent-prompt',     // LLM with user data access
    LLM_PROFILE_PROMPT: 'api:llm-profile-prompt', // Generate profile from user data
    
    // Search operations
    SEARCH_CHAT_THREADS: 'api:search-chat-threads', // Search across chat threads
    SEARCH_DS: 'api:search-ds',                     // Search specific datastore
    SEARCH_UNIVERSAL: 'api:search-universal',       // Search all user data
    
    // Connection operations
    CONNECTIONS_PROFILES: 'api:connections-profiles', // Access third-party profiles
    CONNECTIONS_STATUS: 'api:connections-status',     // Status info for connected accounts
    
    // Developer operations
    APP_DEVELOPER: 'api:app-developer'  // Access app developer features
  },
  
  // Datastore access scopes with permissions
  // r = read, w = write, d = delete
  DS: {
    // Format: ds:{permission}:{datastoreShorthandOrBase64Url}
    // Where permission can be r, rw, or rwd
    
    // Example scope formats for social-post schema (used for profiles)
    SOCIAL_POST_READ: 'ds:r:social-post', 
    SOCIAL_POST_READ_WRITE: 'ds:rw:social-post',
    SOCIAL_POST_READ_WRITE_DELETE: 'ds:rwd:social-post',
    
    // Example scope formats for file schema (used for photos)
    FILE_READ: 'ds:r:file',
    FILE_READ_WRITE: 'ds:rw:file',
    FILE_READ_WRITE_DELETE: 'ds:rwd:file',
    
    // Example scope formats for social-following schema (used for preferences)
    FOLLOWING_READ: 'ds:r:social-following',
    FOLLOWING_READ_WRITE: 'ds:rw:social-following',
    FOLLOWING_READ_WRITE_DELETE: 'ds:rwd:social-following'
  }
};

/**
 * Get the required scope for a specific operation on a specific schema
 * @param operation - The operation to perform (get, create, update, delete, query)
 * @param schema - The schema shorthand name
 * @param permission - Optional permission level (r, rw, rwd) - defaults to 'rw'
 * @returns The required scope string
 */
export function getRequiredScope(
  operation: 'get' | 'create' | 'update' | 'delete' | 'query',
  schema: string,
  permission: 'r' | 'rw' | 'rwd' = 'rw'
): string {
  // For API operation scopes
  if (operation === 'get') {
    return 'api:ds-get-by-id';
  } else if (operation === 'create') {
    return 'api:ds-create';
  } else if (operation === 'update') {
    return 'api:ds-update';
  } else if (operation === 'delete') {
    return 'api:ds-delete';
  } else if (operation === 'query') {
    return 'api:ds-query';
  }
  
  // For schema access scopes
  return `ds:${permission}:${schema}`;
}

/**
 * Format our app's data model to the appropriate Verida schema structure
 * @param modelType - The type of model being converted (DATING_PROFILE, DATING_PREFERENCES, PROFILE_PHOTOS)
 * @param data - The data to convert
 * @returns Data formatted according to the appropriate Verida schema
 */
export function formatDataToSchema(modelType: keyof typeof APP_SCHEMA_MAPPING, data: any): any {
  const mapping = APP_SCHEMA_MAPPING[modelType];
  
  // Base object structure based on the schema
  let schemaData: any = {
    // Explicitly set the schema URL - this is required by the API
    schema: mapping.schemaUrl,
    metadata: {
      profileType: mapping.metadataType
    }
  };
  
  // Apply specific schema structure based on model type
  if (modelType === 'DATING_PROFILE') {
    // Social-post schema required fields: 'name', 'uri'
    // See: https://common.schemas.verida.io/social/post/v0.1.0/schema.json
    schemaData.name = data.displayName || `User Profile`;
    schemaData.content = data.bio || '';
    schemaData.uri = `dating:profile:${data.did || Date.now()}`;
    schemaData.type = "status"; // From enum: ["link", "status", "photo", ...]
    
    // Add metadata fields
    schemaData.metadata.age = data.age || '';
    schemaData.metadata.location = data.location || '';
    schemaData.metadata.interests = data.interests || [];
    schemaData.metadata.relationshipGoals = data.relationshipGoals || '';
    schemaData.metadata.primaryPhotoIndex = data.primaryPhotoIndex || 0;
  } 
  else if (modelType === 'DATING_PREFERENCES') {
    // Social-following schema required fields: 'name'
    // See: https://common.schemas.verida.io/social/following/v0.1.0/schema.json
    schemaData.name = "Dating Preferences";
    schemaData.uri = `dating:preferences:${data.did || Date.now()}`;
    schemaData.followedTimestamp = new Date().toISOString();
    
    // Add metadata fields
    schemaData.metadata.ageRange = data.ageRange || { min: 18, max: 50 };
    schemaData.metadata.locationPreference = data.locationPreference || 'worldwide';
    schemaData.metadata.distanceRange = data.distanceRange || 50;
    schemaData.metadata.lookingFor = data.lookingFor || [];
    schemaData.metadata.dealBreakers = data.dealBreakers || [];
  }
  else if (modelType === 'PROFILE_PHOTOS') {
    // File schema required fields: 'name', 'extension', 'mimeType', 'size'
    // See: https://common.schemas.verida.io/file/v0.1.0/schema.json
    schemaData.name = data.description || `Profile Photo ${data.order || 0}`;
    
    // Extract extension from URL or use a default
    let extension = 'jpg';
    if (data.photoUrl) {
      const urlParts = data.photoUrl.split('.');
      if (urlParts.length > 1) {
        extension = urlParts[urlParts.length - 1].split('?')[0].toLowerCase();
      }
    }
    schemaData.extension = extension;
    
    // Determine MIME type based on extension
    const mimeTypes: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml'
    };
    schemaData.mimeType = mimeTypes[extension] || "image/jpeg"; // Default to JPEG
    
    // Size is required field - use provided size or estimate
    schemaData.size = data.size || 1024 * 100; // Default to 100KB if size not provided
    
    // URI is the photo URL
    schemaData.uri = data.photoUrl || ''; 
    
    // Add metadata fields
    schemaData.metadata.description = data.description || '';
    schemaData.metadata.isPrivate = data.isPrivate || false;
    schemaData.metadata.order = data.order || 0;
    schemaData.metadata.profileType = mapping.metadataType;
    schemaData.metadata.did = data.did || '';
  }
  
  // Add common fields
  if (data.did) {
    schemaData.did = data.did;
  }
  
  // Add timestamps
  schemaData.createdAt = data.createdAt || new Date().toISOString();
  schemaData.updatedAt = data.updatedAt || new Date().toISOString();
  
  return schemaData;
}

/**
 * Convert data from a Verida schema format to our app's data model
 * @param modelType - The type of model being converted (DATING_PROFILE, DATING_PREFERENCES, PROFILE_PHOTOS)
 * @param schemaData - The schema-formatted data to convert
 * @returns Data formatted according to our app's data model
 */
export function formatSchemaToData(modelType: keyof typeof APP_SCHEMA_MAPPING, schemaData: any): any {
  // Base object for app data
  let appData: any = {
    did: schemaData.did || '',
    createdAt: schemaData.createdAt || '',
    updatedAt: schemaData.updatedAt || ''
  };
  
  // Apply specific app model structure based on model type
  if (modelType === 'DATING_PROFILE') {
    // Convert from social-post schema to DatingProfile
    appData.displayName = schemaData.name || '';
    appData.bio = schemaData.content || '';
    appData.age = schemaData.metadata?.age || '';
    appData.location = schemaData.metadata?.location || '';
    appData.interests = schemaData.metadata?.interests || [];
    appData.relationshipGoals = schemaData.metadata?.relationshipGoals || '';
    appData.primaryPhotoIndex = schemaData.metadata?.primaryPhotoIndex || 0;
  }
  else if (modelType === 'DATING_PREFERENCES') {
    // Convert from social-following schema to DatingPreferences
    appData.ageRange = schemaData.metadata?.ageRange || { min: 18, max: 50 };
    appData.locationPreference = schemaData.metadata?.locationPreference || 'worldwide';
    appData.distanceRange = schemaData.metadata?.distanceRange || 50;
    appData.lookingFor = schemaData.metadata?.lookingFor || [];
    appData.dealBreakers = schemaData.metadata?.dealBreakers || [];
  }
  else if (modelType === 'PROFILE_PHOTOS') {
    // Convert from file schema to ProfilePhoto
    appData.photoUrl = schemaData.uri || '';
    appData.description = schemaData.metadata?.description || schemaData.name || '';
    appData.isPrivate = schemaData.metadata?.isPrivate || false;
    appData.order = schemaData.metadata?.order || 0;
    appData.size = schemaData.size || 0;
    appData.extension = schemaData.extension || 'jpg';
    appData.mimeType = schemaData.mimeType || 'image/jpeg';
  }
  
  return appData;
}

/**
 * List of all required scopes for our dating application
 * These scopes should be requested when generating an auth token
 */
export const REQUIRED_APP_SCOPES = [
  // API operation scopes
  SCOPE_TYPES.API.DS_GET_BY_ID,
  SCOPE_TYPES.API.DS_CREATE,
  SCOPE_TYPES.API.DS_UPDATE,
  SCOPE_TYPES.API.DS_DELETE,
  SCOPE_TYPES.API.DS_QUERY,
  
  // Schema access scopes - read/write access to schemas we use
  SCOPE_TYPES.DS.SOCIAL_POST_READ_WRITE,
  SCOPE_TYPES.DS.FILE_READ_WRITE,
  SCOPE_TYPES.DS.FOLLOWING_READ_WRITE
];

/**
 * Troubleshooting guide for common Verida permission errors
 */
export const TROUBLESHOOTING_GUIDE = {
  "Invalid permission": `
    This error occurs when you try to perform an operation without the required scope.
    Common reasons:
    1. The token doesn't have the required scope
    2. You're using the wrong schema name or URL
    3. There's a mismatch between the API operation and the schema permission
    
    Solution:
    1. Check your token scopes using the /api/rest/v1/auth/token-info endpoint
    2. Regenerate a token with all required scopes: ${REQUIRED_APP_SCOPES.join(', ')}
    3. Use the correct schema names as defined in SCHEMA_SHORTHAND
    4. For custom schemas, ensure the base64 encoding is correct
  `,
  
  "Missing scope": `
    This error occurs when a specific scope is missing from your token.
    
    Solution:
    1. Note the missing scope mentioned in the error message
    2. Regenerate a token that includes this scope
    3. If using shorthand names, ensure they match exactly: 'social-post', 'file', etc.
    4. If using base64 URLs, check for encoding issues
  `,
  
  "Authentication failed": `
    This error occurs when your auth token is invalid or expired.
    
    Solution:
    1. Regenerate a new token from the Verida console
    2. Ensure the token is copied correctly without extra spaces
    3. Check if the token has expired
  `
};

/**
 * Instructions for generating a new auth token
 */
export const TOKEN_GENERATION_GUIDE = `
To generate a new Verida authentication token with all required scopes:

1. Go to the Verida Developer Console (https://console.verida.io)
2. Create a new application or select your existing application
3. Request these specific scopes:
   - API operation scopes:
     * api:ds-get-by-id
     * api:ds-create
     * api:ds-update
     * api:ds-delete
     * api:ds-query
   
   - Schema access scopes:
     * ds:rw:social-post
     * ds:rw:file
     * ds:rw:social-following

4. Generate the auth token
5. Update the AUTH_TOKEN constant in your app
`;

/**
 * Token validation function - checks if a token has all required scopes
 * @param scopes - Array of scopes in the token
 * @returns Object containing validation result and any missing scopes
 */
export function validateTokenScopes(scopes: string[]): { valid: boolean; missingScopes: string[] } {
  const missingScopes = REQUIRED_APP_SCOPES.filter(requiredScope => !scopes.includes(requiredScope));
  return {
    valid: missingScopes.length === 0,
    missingScopes
  };
}

/**
 * Utility function to properly encode a schema URL to Base64 for use in scopes
 * This helps prevent the "Invalid permission (Missing scope: ds:w:\"j_)" error
 * @param url - The schema URL to encode
 * @returns Properly encoded Base64 string
 */
export function encodeSchemaUrl(url: string): string {
  // Using Buffer in Node.js or btoa in browser
  let base64Encoded: string;
  if (typeof window === 'undefined') {
    // Node.js environment
    base64Encoded = Buffer.from(url).toString('base64');
  } else {
    // Browser environment
    base64Encoded = btoa(url);
  }
  
  // Convert standard base64 to URL-safe base64
  return base64Encoded
    .replace(/\+/g, '-') // Convert + to -
    .replace(/\//g, '_') // Convert / to _
    .replace(/=+$/, ''); // Remove trailing =
}

/**
 * Get a properly formatted scope string for a schema URL
 * @param url - The schema URL
 * @param permission - Permission level (r, rw, rwd)
 * @returns Formatted scope string
 */
export function getSchemaScope(url: string, permission: 'r' | 'rw' | 'rwd' = 'rw'): string {
  const encodedSchema = encodeSchemaUrl(url);
  return `ds:${permission}:${encodedSchema}`;
}

/**
 * Prepares a schema for use in an API endpoint
 * @param schemaUrl The schema URL
 * @returns {string} The endpoint parameter to use in the API URL
 */
export function prepareSchemaForEndpoint(schemaUrl: string): string {
  // Always use base64 encoding of the full URL for API endpoints
  return encodeSchemaUrl(schemaUrl);
} 