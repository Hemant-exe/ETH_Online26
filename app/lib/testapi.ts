'use client';

/**
 * Utility for testing API connectivity to Verida services
 * This can be used to diagnose connection issues with the Verida API
 */

// Constants
const API_BASE_URL = 'https://api.verida.ai';
const AUTH_TOKEN = '58d16670-2dee-11f0-b8ca-5b198f1a59d7pduhzxgYXXdVHL5liF0coKxSTCZMXAUidn63_UnddHHLwm+I';

// Using standard schema shorthand for querying datastore (no need to base64 encode for common schemas)
const PROFILE_SCHEMA = 'social-post'; // For dating profiles using standard social-post schema

/**
 * Test the API connectivity with a simple GET request
 * @returns Promise<{success: boolean, message: string, data?: any}>
 */
export const testApiConnectivity = async () => {
  try {
    console.log('Testing API connectivity...');
    
    // Basic health check endpoint
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error (${response.status}): ${errorText}`);
      return {
        success: false,
        message: `API error (${response.status}): ${errorText}`
      };
    }
    
    const data = await response.json();
    console.log('API connection successful:', data);
    
    return {
      success: true,
      message: 'Successfully connected to Verida API',
      data
    };
  } catch (error) {
    console.error('API connectivity test failed', error);
    return {
      success: false,
      message: `Failed to connect to Verida API: ${error instanceof Error ? error.message : String(error)}`
    };
  }
};

/**
 * Test datastore query functionality
 * @returns Promise<{success: boolean, message: string, data?: any}>
 */
export const testDatabaseQuery = async () => {
  try {
    console.log('Testing datastore query...');
    
    // Get the proper schema URL for social-post
    const { SCHEMA_URLS } = await import('./verida-schema-mapping');
    const schemaUrl = SCHEMA_URLS.SOCIAL_POST;
    
    // Base64 encode the schema URL for the endpoint
    let encodedSchema;
    if (typeof window === 'undefined') {
      // Node.js environment
      encodedSchema = Buffer.from(schemaUrl).toString('base64')
        .replace(/\+/g, '-') // Convert + to -
        .replace(/\//g, '_') // Convert / to _
        .replace(/=+$/, ''); // Remove trailing =
    } else {
      // Browser environment
      encodedSchema = btoa(schemaUrl)
        .replace(/\+/g, '-') // Convert + to -
        .replace(/\//g, '_') // Convert / to _
        .replace(/=+$/, ''); // Remove trailing =
    }
    
    console.log(`Using encoded schema: ${encodedSchema}`);
    console.log(`Full schema URL: ${schemaUrl}`);
    
    // Try to query with authenticated request
    const response = await fetch(`${API_BASE_URL}/api/rest/v1/ds/query/${encodedSchema}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: {
          "metadata.profileType": "dating"
        },
        options: {
          limit: 5
        }
      })
    });
    
    if (!response.ok) {
      let errorDetails;
      try {
        errorDetails = await response.json();
      } catch {
        errorDetails = await response.text();
      }
      
      console.error(`Query error (${response.status}):`, errorDetails);
      return {
        success: false,
        message: `Query error (${response.status}): ${JSON.stringify(errorDetails)}`,
        data: {
          encodedSchema,
          fullSchemaUrl: schemaUrl
        }
      };
    }
    
    const data = await response.json();
    console.log('Query successful:', data);
    
    return {
      success: true,
      message: `Successfully queried datastore using encoded schema`,
      data: {
        queryResult: data,
        encodedSchema,
        fullSchemaUrl: schemaUrl
      }
    };
  } catch (error) {
    console.error('Database query test failed', error);
    return {
      success: false,
      message: `Failed to query datastore: ${error instanceof Error ? error.message : String(error)}`
    };
  }
};

/**
 * Get token information to check available scopes
 * @returns Promise<{success: boolean, message: string, data?: any}>
 */
export const getTokenInfo = async () => {
  try {
    console.log('Getting token info...');
    
    const response = await fetch(`${API_BASE_URL}/api/rest/v1/auth/token-info`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error (${response.status}): ${errorText}`);
      return {
        success: false,
        message: `API error (${response.status}): ${errorText}`
      };
    }
    
    const data = await response.json();
    console.log('Token info obtained successfully:', data);
    
    return {
      success: true,
      message: 'Successfully retrieved token info',
      data
    };
  } catch (error) {
    console.error('Get token info failed', error);
    return {
      success: false,
      message: `Failed to get token info: ${error instanceof Error ? error.message : String(error)}`
    };
  }
};

/**
 * Get all available API endpoints for debugging
 * @returns Promise<{success: boolean, message: string, data?: any}>
 */
export const getApiEndpoints = async () => {
  try {
    console.log('Getting API endpoints...');
    
    const response = await fetch(`${API_BASE_URL}/api/rest`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error (${response.status}): ${errorText}`);
      return {
        success: false,
        message: `API error (${response.status}): ${errorText}`
      };
    }
    
    const data = await response.json();
    return {
      success: true,
      message: 'API endpoints retrieved successfully',
      data
    };
  } catch (error) {
    console.error('API endpoints test error:', error);
    return {
      success: false,
      message: `API endpoints test error: ${error instanceof Error ? error.message : String(error)}`
    };
  }
};

/**
 * Generate curl commands for testing API endpoints
 * @returns string[] - Array of curl commands
 */
export const generateCurlCommands = () => {
  return [
    // Verify token
    `curl -v "https://api.verida.ai/api/rest/v1/auth/token-verify" -H "Authorization: Bearer ${AUTH_TOKEN}" -H "Content-Type: application/json"`,
    
    // Get token info - useful for checking available scopes
    `curl -v "https://api.verida.ai/api/rest/v1/auth/token-info" -H "Authorization: Bearer ${AUTH_TOKEN}" -H "Content-Type: application/json"`,
    
    // Query datastore (social-post) - use shorthand name for standard schemas
    `curl -v -X POST "https://api.verida.ai/api/rest/v1/ds/query/${PROFILE_SCHEMA}" -H "Authorization: Bearer ${AUTH_TOKEN}" -H "Content-Type: application/json" -d '{"filters": {"metadata.profileType": "dating"}, "options": {"limit": 10}}'`,
    
    // List available API endpoints
    `curl -v "https://api.verida.ai/api/rest" -H "Authorization: Bearer ${AUTH_TOKEN}" -H "Content-Type: application/json"`,
    
    // Create a new profile record
    `curl -v -X POST "https://api.verida.ai/api/rest/v1/ds/${PROFILE_SCHEMA}" -H "Authorization: Bearer ${AUTH_TOKEN}" -H "Content-Type: application/json" -d '{"did":"test_user","title":"Test User","content":"Test bio","schema":"https://common.schemas.verida.io/social/post/v0.1.0/schema.json","metadata":{"profileType":"dating","age":"30","location":"Test Location","interests":["test"],"relationshipGoals":"Test","primaryPhotoIndex":0},"createdAt":"2023-01-01T00:00:00.000Z","updatedAt":"2023-01-01T00:00:00.000Z"}'`
  ];
};

/**
 * Generate instructions for obtaining a new authentication token with proper scopes
 * @returns string - Instructions text
 */
export const getScopeInstructions = (): string => {
  return `
To generate a new Verida authentication token with the proper scopes, follow these steps:

1. Go to the Verida Developer Console (https://console.verida.io)

2. Create a new application or select your existing application

3. When creating an OAuth application, ensure you request these specific scopes:
   - api:ds-query       (Query a datastore)
   - api:ds-get-by-id   (Get datastore record by ID)
   - api:ds-create      (Create datastore records)
   - api:ds-update      (Update datastore records)
   - api:ds-delete      (Delete datastore records)
   - ds:rw:social-post  (Read/write access to posts - for profiles)
   - ds:rw:file         (Read/write access to files - for photos)
   - ds:rw:social-following (Read/write access to following data - for preferences)

4. Generate a new auth token with these scopes

5. Update the AUTH_TOKEN constant in the app/lib/profile-rest-service.ts file with your new token

For testing with curl commands, you can check your token's scopes with:
curl -v "https://api.verida.ai/api/rest/v1/auth/token-info" -H "Authorization: Bearer YOUR_TOKEN_HERE"
`;
};

/**
 * Verify token scopes against required scopes from app schema mapping
 * @returns Promise<{success: boolean, message: string, data?: any}>
 */
export const verifyTokenScopes = async () => {
  try {
    console.log('Verifying token scopes...');
    
    // First get token info to check available scopes
    const response = await fetch(`${API_BASE_URL}/api/rest/v1/auth/token-info`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error (${response.status}): ${errorText}`);
      return {
        success: false,
        message: `API error (${response.status}): ${errorText}`
      };
    }
    
    const tokenInfo = await response.json();
    console.log('Token info retrieved:', tokenInfo);
    
    // Import the required scopes from schema mapping
    const { REQUIRED_APP_SCOPES, validateTokenScopes } = await import('./verida-schema-mapping');
    
    // Check for missing scopes
    const validation = validateTokenScopes(tokenInfo.scopes || []);
    
    if (validation.valid) {
      return {
        success: true,
        message: 'Token has all required scopes',
        data: {
          tokenScopes: tokenInfo.scopes,
          requiredScopes: REQUIRED_APP_SCOPES
        }
      };
    } else {
      return {
        success: false,
        message: `Token is missing ${validation.missingScopes.length} required scopes`,
        data: {
          tokenScopes: tokenInfo.scopes,
          requiredScopes: REQUIRED_APP_SCOPES,
          missingScopes: validation.missingScopes
        }
      };
    }
  } catch (error) {
    console.error('Token scope verification failed', error);
    return {
      success: false,
      message: `Failed to verify token scopes: ${error instanceof Error ? error.message : String(error)}`
    };
  }
};

/**
 * Test data formatting for schema compliance
 * @returns Promise<{success: boolean, message: string, data?: any}>
 */
export const testDataFormatting = async () => {
  try {
    console.log('Testing data formatting for schema compliance...');
    
    // Import required functions
    const { formatDataToSchema, SCHEMA_URLS } = await import('./verida-schema-mapping');
    
    // Create a sample profile
    const sampleProfile = {
      did: 'did:test:123',
      displayName: 'Test User',
      age: '30',
      location: 'Test City',
      bio: 'This is a test bio',
      interests: ['hiking', 'reading'],
      relationshipGoals: 'casual'
    };
    
    // Format using our utility
    const formattedData = formatDataToSchema('DATING_PROFILE', sampleProfile);
    
    // Verify required fields are present according to schema
    const missingRequiredFields = [];
    
    // Required fields for social-post schema
    const requiredFields = ['name', 'uri'];
    
    for (const field of requiredFields) {
      if (!formattedData[field]) {
        missingRequiredFields.push(field);
      }
    }
    
    if (missingRequiredFields.length > 0) {
      return {
        success: false,
        message: `Formatted data is missing required fields: ${missingRequiredFields.join(', ')}`,
        data: {
          original: sampleProfile,
          formatted: formattedData,
          missingFields: missingRequiredFields,
          schemaUrl: SCHEMA_URLS.SOCIAL_POST
        }
      };
    }
    
    return {
      success: true,
      message: 'Data formatting produces valid schema-compliant data',
      data: {
        original: sampleProfile,
        formatted: formattedData,
        schemaUrl: SCHEMA_URLS.SOCIAL_POST
      }
    };
  } catch (error) {
    console.error('Data formatting test failed', error);
    return {
      success: false,
      message: `Failed to test data formatting: ${error instanceof Error ? error.message : String(error)}`
    };
  }
};

/**
 * Test creating a social post record with the required schema format
 * @returns Promise<{success: boolean, message: string, data?: any}>
 */
export const testCreateSocialPost = async () => {
  try {
    console.log('Testing social post creation with proper schema format...');
    
    // Get the schema URL
    const { SCHEMA_URLS } = await import('./verida-schema-mapping');
    const schemaUrl = SCHEMA_URLS.SOCIAL_POST;
    
    // Encode schema URL for endpoint
    let encodedSchema;
    if (typeof window === 'undefined') {
      // Node.js environment
      encodedSchema = Buffer.from(schemaUrl).toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    } else {
      // Browser environment
      encodedSchema = btoa(schemaUrl)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    }
    
    // Create a test record with all required fields
    const testData = {
      schema: schemaUrl,  // This is required!
      name: "Test Post",  // Required by schema
      uri: `test:post:${Date.now()}`, // Required by schema
      content: "This is a test post",
      type: "status",
      metadata: {
        profileType: "test",
        testField: "test value"
      },
      did: "test:did:123",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log('Sending test data:', JSON.stringify(testData, null, 2));
    console.log('To endpoint:', `/api/rest/v1/ds/${encodedSchema}`);
    
    // Make the API call
    const response = await fetch(`${API_BASE_URL}/api/rest/v1/ds/${encodedSchema}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    if (!response.ok) {
      let errorDetails;
      try {
        errorDetails = await response.json();
      } catch {
        errorDetails = await response.text();
      }
      
      return {
        success: false,
        message: `Failed to create social post: ${JSON.stringify(errorDetails)}`,
        data: {
          testData,
          encodedSchema,
          schemaUrl,
          status: response.status,
          statusText: response.statusText
        }
      };
    }
    
    const result = await response.json();
    
    return {
      success: true,
      message: 'Successfully created social post',
      data: {
        result,
        testData,
        encodedSchema,
        schemaUrl
      }
    };
  } catch (error) {
    console.error('Test failed:', error);
    return {
      success: false,
      message: `Error testing social post creation: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}; 