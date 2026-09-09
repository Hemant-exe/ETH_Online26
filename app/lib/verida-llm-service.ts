/**
 * Verida LLM Service
 * 
 * Handles interactions with Verida's LLM API endpoints
 * Provides methods for basic prompts, agent prompts, and profile generation
 */

import { API_BASE_URL, AUTH_TOKEN } from './verida-config';
import { 
  generateSuggestionPrompt, 
  generateAutoResponsePrompt, 
  generateConversationStarterPrompt,
  generateFlirtyResponsePrompt
} from './prompts/chat-suggestions-prompts';
import { formatTwinDataForPrompt, generateAiTwinPrompt } from './prompts/ai-twin-prompts';
import { Message } from '../types/chat';
import { generateAiTwinChatResponse } from './ai-twin-chat-service';

// LLM API endpoints
const LLM_API_ENDPOINTS = {
  BASIC_PROMPT: '/api/rest/v1/llm/prompt',
  AGENT_PROMPT: '/api/rest/v1/llm/agent',
  PROFILE_PROMPT: '/api/rest/v1/llm/profile'
};

// Default LLM parameters
const DEFAULT_LLM_PARAMS = {
  provider: 'bedrock',
  model: 'LLAMA3_70B',
  tokenLimit: 2000
};

/**
 * Interface for basic prompt request
 */
export interface BasicPromptRequest {
  prompt: string;
  provider?: string;
  model?: string;
  tokenLimit?: number;
  customEndpoint?: string;
  customKey?: string;
}

/**
 * Interface for agent prompt request
 */
export interface AgentPromptRequest {
  prompt: string;
  temperature?: number;
}

/**
 * Interface for profile prompt request
 */
export interface ProfilePromptRequest {
  schema: string;
  promptSearchTip?: string;
}

/**
 * Send a basic prompt to the LLM API
 * @param request - The prompt request parameters
 * @returns Promise with the LLM response
 */
export async function sendBasicPrompt(request: BasicPromptRequest): Promise<any> {
  try {
    // Ensure prompt is provided
    if (!request.prompt) {
      throw new Error('Prompt is required');
    }

    // Prepare request body with defaults
    const requestBody = {
      prompt: request.prompt,
      provider: request.provider || DEFAULT_LLM_PARAMS.provider,
      model: request.model || DEFAULT_LLM_PARAMS.model,
      tokenLimit: request.tokenLimit || DEFAULT_LLM_PARAMS.tokenLimit,
      ...(request.customEndpoint && { customEndpoint: request.customEndpoint }),
      ...(request.customKey && { customKey: request.customKey })
    };

    // Make API request
    const response = await fetch(`${API_BASE_URL}${LLM_API_ENDPOINTS.BASIC_PROMPT}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`LLM API error (${response.status}): ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending basic prompt:', error);
    throw error;
  }
}

/**
 * Send an agent prompt to the LLM API
 * This uses RAG to access user data
 * @param request - The agent prompt request parameters
 * @returns Promise with the LLM response
 */
export async function sendAgentPrompt(request: AgentPromptRequest): Promise<any> {
  try {
    // Ensure prompt is provided
    if (!request.prompt) {
      throw new Error('Prompt is required');
    }

    // Prepare request body
    const requestBody = {
      prompt: request.prompt,
      ...(request.temperature !== undefined && { temperature: request.temperature })
    };

    // Make API request
    const response = await fetch(`${API_BASE_URL}${LLM_API_ENDPOINTS.AGENT_PROMPT}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Agent LLM API error (${response.status}): ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending agent prompt:', error);
    throw error;
  }
}

/**
 * Generate a profile using the LLM API
 * @param request - The profile prompt request parameters
 * @returns Promise with the generated profile
 */
export async function generateProfile(request: ProfilePromptRequest): Promise<any> {
  try {
    // Ensure schema is provided
    if (!request.schema) {
      throw new Error('Schema is required');
    }

    // Prepare request body
    const requestBody = {
      schema: request.schema,
      ...(request.promptSearchTip && { promptSearchTip: request.promptSearchTip })
    };

    // Make API request
    const response = await fetch(`${API_BASE_URL}${LLM_API_ENDPOINTS.PROFILE_PROMPT}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Profile LLM API error (${response.status}): ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating profile:', error);
    throw error;
  }
} 