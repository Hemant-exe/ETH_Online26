/**
 * AI Twin Chat Service
 * 
 * Handles generating AI twin chat responses using the LLM API
 * Provides specialized prompts and formatting for different types of interactions
 */

import { sendAgentPrompt, AgentPromptRequest } from './verida-llm-service';
import { 
  generateSuggestionPrompt, 
  generateConversationStarterPrompt,
  generateFlirtyResponsePrompt,
  generateAutoResponsePrompt
} from './prompts/chat-suggestions-prompts';
import { generateAiTwinPrompt, formatTwinDataForPrompt } from './prompts/ai-twin-prompts';
import { Message } from '../types/chat';

/**
 * Interface for AI twin chat request
 */
export interface AiTwinChatRequest {
  userMessage: string;
  conversationHistory?: Message[];
  profileData?: any;
  temperature?: number;
  maxHistoryMessages?: number;
  promptType?: 'suggestion' | 'response' | 'starter' | 'flirty' | 'auto';
  matchProfile?: any;
}

/**
 * Generate AI twin chat response using the LLM API and specialized prompts
 * @param request - The AI twin chat request parameters
 * @returns Promise with the generated response text
 */
export async function generateAiTwinChatResponse(request: AiTwinChatRequest): Promise<string> {
  try {
    // Validate request
    if (!request.userMessage && (!request.conversationHistory || request.conversationHistory.length === 0)) {
      throw new Error('User message or conversation history is required');
    }

    // Limit conversation history if needed
    const maxHistory = request.maxHistoryMessages || 10;
    const limitedHistory = request.conversationHistory && request.conversationHistory.length > maxHistory
      ? request.conversationHistory.slice(-maxHistory)
      : request.conversationHistory || [];

    // Get the full formatted twin data to ensure all profile details are available
    const fullProfileData = request.profileData ? formatTwinDataForPrompt(request.profileData) : '';

    // Determine which prompt type to use
    const promptType = request.promptType || 'response';
    let prompt = '';

    switch (promptType) {
      case 'suggestion':
        // For suggesting the next message
        prompt = generateSuggestionPrompt(limitedHistory, request.profileData, request.matchProfile);
        // Add the full profile data to ensure all details are available
        prompt = prompt + `\n\nADDITIONAL PROFILE INFORMATION:\n${fullProfileData}`;
        break;
      
      case 'starter':
        // For starting a new conversation
        if (!request.profileData || !request.matchProfile) {
          throw new Error('Profile data and match profile are required for conversation starters');
        }
        prompt = generateConversationStarterPrompt(request.profileData, request.matchProfile);
        // Add the full profile data to ensure all details are available
        prompt = prompt + `\n\nADDITIONAL PROFILE INFORMATION:\n${fullProfileData}`;
        break;
      
      case 'flirty':
        // For flirty responses
        if (!request.profileData || !request.matchProfile) {
          throw new Error('Profile data and match profile are required for flirty responses');
        }
        prompt = generateFlirtyResponsePrompt(limitedHistory, request.profileData, request.matchProfile);
        // Add the full profile data to ensure all details are available
        prompt = prompt + `\n\nADDITIONAL PROFILE INFORMATION:\n${fullProfileData}`;
        break;
      
      case 'auto':
        // For automatic responses (similar to response but with different prompt)
        const lastUserMessage = limitedHistory.length > 0 ? 
          limitedHistory[limitedHistory.length - 1].content : request.userMessage;
        prompt = generateAutoResponsePrompt(limitedHistory, request.profileData, request.matchProfile, lastUserMessage);
        // Add the full profile data to ensure all details are available
        prompt = prompt + `\n\nADDITIONAL PROFILE INFORMATION:\n${fullProfileData}`;
        break;
      
      case 'response':
      default:
        // For normal responses - use the AI twin prompt for more detailed personalization
        // Create a formatted conversation history string
        const formattedHistory = limitedHistory.map(msg => {
          const role = msg.sender === 'user' ? 'User' : (request.profileData?.name || 'AI Twin');
          return `${role}: ${msg.content}`;
        }).join('\n\n');
        
        // Use the AI twin prompt with the full profile data
        prompt = generateAiTwinPrompt(
          request.profileData, 
          `${formattedHistory ? formattedHistory + '\n\nUser: ' : ''}${request.userMessage || ''}`
        );
        break;
    }

    // Use the agent prompt endpoint for better context awareness
    const response = await sendAgentPrompt({
      prompt,
      temperature: request.temperature || 0.7
    });

    // Extract the response text from the API response
    let responseText = '';
    
    if (response && response.response && response.response.output) {
      responseText = response.response.output;
    } else if (response && response.result && response.result.content) {
      responseText = response.result.content;
    } else if (response && response.result && response.result.choices && response.result.choices.length > 0) {
      responseText = response.result.choices[0].message.content;
    } else {
      throw new Error('Could not extract response from LLM API result');
    }

    // Clean up the response
    responseText = responseText
      .replace(/^["']|["']$/g, '') // Remove quotes
      .replace(/^(AI: |Assistant: |Response: )/i, ''); // Remove role prefixes

    return responseText;
  } catch (error) {
    console.error('Error generating AI twin chat response:', error);
    return `I'm sorry, I couldn't process your request at the moment. Could we try again?`;
  }
}

/**
 * Extract and format the AI twin's response from the LLM API result
 * @param apiResponse - The raw API response from the LLM
 * @returns Cleaned and formatted response text
 */
export function extractAiTwinResponse(apiResponse: any): string {
  let responseText = '';
  
  // Check for the response structure that contains the output field
  if (apiResponse && apiResponse.response && apiResponse.response.output) {
    responseText = apiResponse.response.output;
  }
  // Check for the older format with result.content
  else if (apiResponse && apiResponse.result && apiResponse.result.content) {
    responseText = apiResponse.result.content;
  }
  // Check for the format with choices array
  else if (apiResponse && apiResponse.result && apiResponse.result.choices && apiResponse.result.choices.length > 0) {
    responseText = apiResponse.result.choices[0].message.content;
  }
  else {
    throw new Error('Could not extract response from LLM API result');
  }
  
  // Clean up the response
  return responseText
    .replace(/^["']|["']$/g, '') // Remove quotes
    .replace(/^(AI: |Assistant: |Response: )/i, ''); // Remove role prefixes
} 