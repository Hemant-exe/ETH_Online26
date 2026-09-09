'use client';

import { REQUIRED_APP_SCOPES } from './verida-schema-mapping';
import { API_BASE_URL } from './verida-config';

// Constants

/**
 * Verify if the auth token is valid and has the necessary scopes
 * @param authToken - The authentication token to verify
 * @returns Promise<{valid: boolean, message: string, scopes?: string[], missingScopes?: string[]}>
 */
export async function verifyAuthToken(authToken: string): Promise<{
  valid: boolean;
  message: string;
  scopes?: string[];
  missingScopes?: string[];
}> {
  try {
    console.log('Verifying auth token...');
    
    // Check if token is provided
    if (!authToken) {
      return {
        valid: false,
        message: 'No authentication token provided'
      };
    }
    
    // Call the token info endpoint
    const response = await fetch(`${API_BASE_URL}/api/rest/v1/auth/token-info`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Token verification error (${response.status}): ${errorText}`);
      return {
        valid: false,
        message: `Token verification failed (${response.status}): ${errorText}`
      };
    }
    
    const data = await response.json();
    
    // Check if token has scopes
    if (!data.scopes || !Array.isArray(data.scopes) || data.scopes.length === 0) {
      return {
        valid: false,
        message: 'Token does not have any scopes',
        scopes: []
      };
    }
    
    // Check if token has all required scopes
    const missingScopes = REQUIRED_APP_SCOPES.filter(
      requiredScope => !data.scopes.includes(requiredScope)
    );
    
    if (missingScopes.length > 0) {
      return {
        valid: false,
        message: `Token is missing ${missingScopes.length} required scopes`,
        scopes: data.scopes,
        missingScopes
      };
    }
    
    return {
      valid: true,
      message: 'Token is valid and has all required scopes',
      scopes: data.scopes
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return {
      valid: false,
      message: `Token verification error: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Generate a formatted HTML report of token scopes and missing scopes
 * @param tokenValidation - Result from verifyAuthToken
 * @returns HTML string with formatted report
 */
export function generateScopeReport(tokenValidation: {
  valid: boolean;
  message: string;
  scopes?: string[];
  missingScopes?: string[];
}): string {
  const { valid, message, scopes = [], missingScopes = [] } = tokenValidation;
  
  const validClass = valid ? 'text-green-600' : 'text-red-600';
  const validIcon = valid 
    ? '<svg class="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>'
    : '<svg class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /></svg>';
  
  let html = `
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <div class="flex items-center mb-4">
        ${validIcon}
        <h3 class="text-lg font-semibold ml-2 ${validClass}">${message}</h3>
      </div>
  `;
  
  if (scopes && scopes.length > 0) {
    html += `
      <div class="mb-4">
        <h4 class="font-medium text-gray-700 mb-2">Available Scopes (${scopes.length}):</h4>
        <ul class="list-disc pl-5 text-sm">
    `;
    
    scopes.forEach(scope => {
      const isRequired = REQUIRED_APP_SCOPES.includes(scope);
      const scopeClass = isRequired ? 'text-green-700 font-semibold' : 'text-gray-600';
      
      html += `
        <li class="${scopeClass}">
          ${scope} ${isRequired ? '(Required)' : ''}
        </li>
      `;
    });
    
    html += `
        </ul>
      </div>
    `;
  }
  
  if (missingScopes && missingScopes.length > 0) {
    html += `
      <div class="mb-4">
        <h4 class="font-medium text-red-600 mb-2">Missing Required Scopes (${missingScopes.length}):</h4>
        <ul class="list-disc pl-5 text-sm">
    `;
    
    missingScopes.forEach(scope => {
      html += `
        <li class="text-red-600 font-medium">${scope}</li>
      `;
    });
    
    html += `
        </ul>
      </div>
    `;
  }
  
  html += `
    </div>
  `;
  
  return html;
}

/**
 * Generate instructions for obtaining a new authentication token with correct scopes
 * @returns string - HTML formatted instructions
 */
export function getScopeInstructionsHTML(): string {
  return `
    <div class="bg-indigo-50 border border-indigo-200 rounded-lg p-6 mb-6">
      <h3 class="text-lg font-semibold text-indigo-800 mb-4">How to Generate a New Auth Token</h3>
      
      <ol class="list-decimal pl-5 space-y-3 text-indigo-700">
        <li>Go to the <a href="https://console.verida.io" target="_blank" class="text-indigo-600 underline hover:text-indigo-800">Verida Developer Console</a></li>
        
        <li>Create a new application or select your existing application</li>
        
        <li>
          When creating an OAuth application, ensure you request these specific scopes:
          <ul class="list-disc pl-5 mt-2 text-sm">
            <li class="text-indigo-600 font-semibold">api:ds-query (Query a datastore)</li>
            <li class="text-indigo-600 font-semibold">api:ds-get-by-id (Get datastore record by ID)</li>
            <li class="text-indigo-600 font-semibold">api:ds-create (Create datastore records)</li>
            <li class="text-indigo-600 font-semibold">api:ds-update (Update datastore records)</li>
            <li class="text-indigo-600 font-semibold">api:ds-delete (Delete datastore records)</li>
            <li class="text-indigo-600 font-semibold">ds:rw:social-post (Read/write access to posts - for profiles)</li>
            <li class="text-indigo-600 font-semibold">ds:rw:file (Read/write access to files - for photos)</li>
            <li class="text-indigo-600 font-semibold">ds:rw:social-following (Read/write access to following data - for preferences)</li>
          </ul>
        </li>
        
        <li>Generate a new auth token with these scopes</li>
        
        <li>Update the <code class="bg-indigo-100 px-2 py-1 rounded text-indigo-800 font-mono">AUTH_TOKEN</code> constant in the <code class="bg-indigo-100 px-2 py-1 rounded text-indigo-800 font-mono">app/lib/profile-rest-service.ts</code> file with your new token</li>
      </ol>
      
      <div class="mt-4 pt-4 border-t border-indigo-200">
        <p class="text-sm text-indigo-600">For testing with curl commands, you can check your token's scopes with:</p>
        <pre class="bg-indigo-100 p-3 rounded text-indigo-800 font-mono text-xs mt-2 overflow-x-auto">curl -v "https://api.verida.ai/api/rest/v1/auth/token-info" -H "Authorization: Bearer YOUR_TOKEN_HERE"</pre>
      </div>
    </div>
  `;
} 