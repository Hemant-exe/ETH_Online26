/**
 * AI Twin Service
 * 
 * This file contains functions for generating AI twin responses using the LLM API.
 */

import { sendAgentPrompt } from '../verida-llm-service';
import { generateAiTwinPrompt } from './ai-twin-prompts';
import { Message } from '../../types/chat';
import { extractAiTwinResponse } from '../ai-twin-chat-service';

/**
 * Generate a response from the AI Twin using the agent LLM API
 * @param twinData - The AI twin data
 * @param userMessage - The user's message
 * @param conversationHistory - Optional conversation history for context
 * @returns Promise with the AI twin's response
 */
export async function generateAiTwinResponse(
  twinData: any, 
  userMessage: string,
  conversationHistory?: Message[]
): Promise<string> {
  try {
    // Format conversation history if provided
    let formattedMessage = userMessage;
    
    if (conversationHistory && conversationHistory.length > 0) {
      const formattedHistory = conversationHistory.map(msg => {
        const role = msg.sender === 'user' ? 'User' : (twinData?.name || 'AI Twin');
        return `${role}: ${msg.content}`;
      }).join('\n\n');
      
      formattedMessage = `${formattedHistory}\n\nUser: ${userMessage}`;
    }
    
    // Generate the prompt using the template with full conversation context
    const prompt = generateAiTwinPrompt(twinData, formattedMessage);

    // Send the agent prompt
    const response = await sendAgentPrompt({
      prompt,
      temperature: 0.7 // Slightly creative but still coherent
    });

    console.log("API Response:", JSON.stringify(response, null, 2));
    
    // Use the shared utility function to extract and format the response
    return extractAiTwinResponse(response);
  } catch (error) {
    console.error('Error generating AI twin response:', error);
    return "I'm having trouble connecting right now. Let's try again in a moment.";
  }
} 