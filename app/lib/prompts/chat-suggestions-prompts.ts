/**
 * Chat Suggestions Prompt Templates
 * 
 * This file contains specialized prompts for generating AI chat suggestions and responses
 * in dating conversations with enhanced personalization and contextual awareness.
 */

import { Message } from '../../types/chat';

/**
 * Format conversation history for prompt context
 * @param messages - Array of messages in the conversation
 * @param maxMessages - Maximum number of messages to include
 * @returns Formatted conversation history string
 */
export function formatChatHistory(messages: Message[], maxMessages: number = 10): string {
  // Take only the most recent messages to avoid token limits
  const recentMessages = messages.slice(-maxMessages);
  
  // Format messages into a readable conversation format with timestamps
  return recentMessages.map(msg => {
    const role = msg.sender === 'user' ? 'User' : (msg.senderName || 'Match');
    const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `[${time}] ${role}: ${msg.content}`;
  }).join('\n\n');
}

/**
 * Generate a prompt for suggesting the next message in a dating conversation
 * @param conversationHistory - Previous messages in the conversation
 * @param userProfile - User's profile data
 * @param matchProfile - Match's profile data (if available)
 * @returns Formatted prompt for generating suggestions
 */
export function generateSuggestionPrompt(
  conversationHistory: Message[], 
  userProfile: any,
  matchProfile?: any
): string {
  const formattedHistory = formatChatHistory(conversationHistory);
  
  // Extract relevant user information
  const userInfo = extractProfileHighlights(userProfile);
  
  // Extract match information if available
  const matchInfo = matchProfile ? extractProfileHighlights(matchProfile) : 'Limited information available about the match.';
  
  // Determine conversation stage based on message count
  const conversationStage = determineConversationStage(conversationHistory);
  
  return `
You are an expert dating conversation assistant helping a user craft engaging messages in a dating app conversation. 
Your goal is to suggest the next message the user could send that's authentic to their personality while advancing the conversation.

USER'S PROFILE:
${userInfo}

MATCH'S PROFILE:
${matchInfo}

CONVERSATION STAGE:
${conversationStage}

CONVERSATION HISTORY:
${formattedHistory}

INSTRUCTIONS:
1. Suggest a natural, authentic message that sounds like something the user would say based on their profile
2. Keep the tone warm, engaging, and conversational - avoid being too formal or robotic
3. Reference shared interests or topics already mentioned in the conversation
4. Include subtle humor or playfulness when appropriate
5. Keep suggestions concise (1-3 sentences maximum)
6. Avoid generic messages like "How are you?" unless the conversation context specifically calls for it
7. Tailor the message to the current conversation stage (initial greeting, getting to know each other, making plans)
8. Don't use emoji symbols in your suggestion

IMPORTANT: Provide ONLY the suggested message text, with no additional explanation, introduction, or quotation marks.
`;
}

/**
 * Generate a prompt for automatic AI responses in dating conversations
 * @param conversationHistory - Previous messages in the conversation
 * @param userProfile - User's profile data
 * @param matchProfile - Match's profile data (if available)
 * @param lastUserMessage - The last message from the user that needs a response
 * @returns Formatted prompt for generating AI responses
 */
export function generateAutoResponsePrompt(
  conversationHistory: Message[],
  userProfile: any,
  matchProfile?: any,
  lastUserMessage?: string
): string {
  const formattedHistory = formatChatHistory(conversationHistory);
  
  // Extract relevant user information
  const userInfo = extractProfileHighlights(userProfile);
  
  // Extract match information if available
  const matchInfo = matchProfile ? extractProfileHighlights(matchProfile) : 'Limited information available about the match.';
  
  // Determine conversation stage based on message count
  const conversationStage = determineConversationStage(conversationHistory);
  
  // Get conversation topics and interests
  const relevantTopics = extractRelevantTopics(conversationHistory, userProfile);
  
  return `
You are an AI assistant helping to generate engaging responses in a dating app conversation on behalf of the user.
Your goal is to create a response that authentically represents the user while advancing the conversation positively.

USER'S PROFILE (WHO YOU'RE REPRESENTING):
${userInfo}

MATCH'S PROFILE (WHO YOU'RE RESPONDING TO):
${matchInfo}

CONVERSATION STAGE:
${conversationStage}

RELEVANT TOPICS AND INTERESTS:
${relevantTopics}

CONVERSATION HISTORY:
${formattedHistory}

${lastUserMessage ? `LAST MESSAGE FROM MATCH: "${lastUserMessage}"` : ''}

INSTRUCTIONS:
1. Respond as if you ARE the user, using their communication style, vocabulary, and personality traits
2. Reference the user's genuine interests, experiences, and preferences from their profile
3. Maintain a natural, conversational tone that matches the user's communication style
4. Acknowledge and respond directly to the match's last message or question
5. Ask thoughtful follow-up questions to keep the conversation flowing
6. Show appropriate interest and enthusiasm without coming across as desperate
7. Include subtle humor or playfulness when it aligns with the user's personality
8. Keep responses concise and focused (2-4 sentences is ideal)
9. If the match asks about something not covered in the user's profile, respond in a way that's consistent with what is known
10. Avoid generic responses - make each message personalized to the specific conversation

IMPORTANT: Provide ONLY the response text, with no additional explanation, introduction, or quotation marks.
`;
}

/**
 * Generate a prompt for creating conversation starters with a new match
 * @param userProfile - User's profile data
 * @param matchProfile - Match's profile data
 * @returns Formatted prompt for generating conversation starters
 */
export function generateConversationStarterPrompt(
  userProfile: any,
  matchProfile: any
): string {
  // Extract relevant user information
  const userInfo = extractProfileHighlights(userProfile);
  
  // Extract match information
  const matchInfo = extractProfileHighlights(matchProfile);
  
  // Find potential conversation hooks from the match's profile
  const conversationHooks = findConversationHooks(matchProfile);
  
  return `
You are an expert dating coach helping a user craft an engaging first message to a new match on a dating app.
Your goal is to suggest a conversation starter that's authentic to the user while creating a positive first impression.

USER'S PROFILE:
${userInfo}

MATCH'S PROFILE:
${matchInfo}

POTENTIAL CONVERSATION HOOKS:
${conversationHooks}

INSTRUCTIONS:
1. Create a natural, friendly opening message that sounds like something the user would say
2. Reference specific details from the match's profile to show genuine interest
3. Avoid generic openers like "Hey, how are you?" or "What's up?"
4. Keep the message light and positive - avoid heavy topics for a first message
5. Include a specific question related to the match's interests to make it easy for them to respond
6. Keep the message concise (1-3 sentences maximum)
7. Match the tone and style to the user's communication preferences
8. Avoid messages that are overly complimentary about physical appearance
9. Focus on creating a genuine connection based on shared interests or values

IMPORTANT: Provide ONLY the suggested message text, with no additional explanation, introduction, or quotation marks.
`;
}

/**
 * Extract key highlights from a user profile for prompting
 * @param profile - User profile data
 * @returns Formatted string of profile highlights
 */
function extractProfileHighlights(profile: any): string {
  if (!profile) return 'No profile information available.';
  
  let highlights = '';
  
  // Basic information
  highlights += `Name: ${profile.name || 'Unknown'}\n`;
  if (profile.age) highlights += `Age: ${profile.age}\n`;
  if (profile.location) highlights += `Location: ${profile.location}\n`;
  if (profile.occupation) highlights += `Occupation: ${profile.occupation}\n`;
  if (profile.bio) highlights += `Bio: ${profile.bio}\n\n`;
  
  // Personality traits
  if (profile.personalityTraits && profile.personalityTraits.length > 0) {
    highlights += `Personality: ${profile.personalityTraits.join(', ')}\n`;
  }
  
  // Communication style
  if (profile.communicationStyle) {
    highlights += `Communication Style: ${profile.communicationStyle}\n`;
  }
  
  // Humor style
  if (profile.humorStyle) {
    highlights += `Humor Style: ${profile.humorStyle}\n`;
  }
  
  // Interests and hobbies
  if (profile.interests && profile.interests.length > 0) {
    highlights += `Interests: ${profile.interests.join(', ')}\n`;
  }
  if (profile.hobbies && profile.hobbies.length > 0) {
    highlights += `Hobbies: ${profile.hobbies.join(', ')}\n`;
  }
  
  // Relationship preferences
  if (profile.relationshipGoals) {
    highlights += `Relationship Goals: ${profile.relationshipGoals}\n`;
  }
  if (profile.lookingFor && profile.lookingFor.length > 0) {
    highlights += `Looking For: ${profile.lookingFor.join(', ')}\n`;
  }
  
  return highlights;
}

/**
 * Determine the current stage of the conversation based on message count and content
 * @param messages - Conversation history
 * @returns String describing the conversation stage
 */
function determineConversationStage(messages: Message[]): string {
  const messageCount = messages.length;
  
  if (messageCount === 0) {
    return 'Initial greeting - This is the first message to start the conversation.';
  } else if (messageCount < 6) {
    return 'Early stage - Getting to know each other with light, friendly conversation.';
  } else if (messageCount < 15) {
    return 'Building rapport - Exploring shared interests and values with more substantive conversation.';
  } else if (messageCount < 30) {
    return 'Deepening connection - Discussing more personal topics and potentially making plans to meet.';
  } else {
    return 'Established conversation - Continuing to build on the existing relationship and shared experiences.';
  }
}

/**
 * Extract relevant topics and interests from the conversation history and user profile
 * @param messages - Conversation history
 * @param userProfile - User profile data
 * @returns String of relevant topics and interests
 */
function extractRelevantTopics(messages: Message[], userProfile: any): string {
  // Start with user's interests from profile
  let topics: string[] = [];
  
  // Add interests from profile
  if (userProfile.interests && userProfile.interests.length > 0) {
    topics = topics.concat(userProfile.interests);
  }
  if (userProfile.hobbies && userProfile.hobbies.length > 0) {
    topics = topics.concat(userProfile.hobbies);
  }
  
  // Extract potential topics from conversation (simplified approach)
  const conversationText = messages.map(msg => msg.content).join(' ').toLowerCase();
  
  // Common dating conversation topics to look for
  const potentialTopics = [
    'travel', 'food', 'music', 'movies', 'books', 'sports', 'fitness',
    'art', 'career', 'family', 'pets', 'hiking', 'cooking', 'reading',
    'photography', 'gaming', 'technology', 'fashion', 'outdoors'
  ];
  
  // Add topics found in conversation
  potentialTopics.forEach(topic => {
    if (conversationText.includes(topic.toLowerCase()) && !topics.includes(topic)) {
      topics.push(topic);
    }
  });
  
  if (topics.length === 0) {
    return 'No specific topics identified yet. Focus on getting to know basic interests.';
  }
  
  return `Topics discussed or relevant: ${topics.join(', ')}`;
}

/**
 * Find potential conversation hooks from a match's profile
 * @param matchProfile - Match's profile data
 * @returns String of potential conversation starters
 */
function findConversationHooks(matchProfile: any): string {
  if (!matchProfile) return 'No specific conversation hooks available.';
  
  const hooks = [];
  
  // Check for interesting elements in the profile
  if (matchProfile.interests && matchProfile.interests.length > 0) {
    hooks.push(`Shared interests: ${matchProfile.interests.join(', ')}`);
  }
  
  if (matchProfile.hobbies && matchProfile.hobbies.length > 0) {
    hooks.push(`Activities they enjoy: ${matchProfile.hobbies.join(', ')}`);
  }
  
  if (matchProfile.location) {
    hooks.push(`Their location: ${matchProfile.location}`);
  }
  
  if (matchProfile.occupation) {
    hooks.push(`Their occupation: ${matchProfile.occupation}`);
  }
  
  if (matchProfile.bio) {
    hooks.push(`Details from their bio: ${matchProfile.bio}`);
  }
  
  if (hooks.length === 0) {
    return 'Limited information available. Consider a friendly, general opener that invites them to share more about themselves.';
  }
  
  return hooks.join('\n');
}

/**
 * Generate a prompt for creating flirty or romantic responses
 * @param conversationHistory - Previous messages in the conversation
 * @param userProfile - User's profile data
 * @param matchProfile - Match's profile data
 * @returns Formatted prompt for generating flirty responses
 */
export function generateFlirtyResponsePrompt(
  conversationHistory: Message[],
  userProfile: any,
  matchProfile: any
): string {
  const formattedHistory = formatChatHistory(conversationHistory);
  const userInfo = extractProfileHighlights(userProfile);
  const matchInfo = extractProfileHighlights(matchProfile);
  const conversationStage = determineConversationStage(conversationHistory);
  
  return `
You are an AI assistant helping to generate slightly flirty or romantic responses in a dating app conversation.
Your goal is to create a response that authentically represents the user while adding a touch of flirtation or romantic interest.

USER'S PROFILE (WHO YOU'RE REPRESENTING):
${userInfo}

MATCH'S PROFILE (WHO THEY'RE FLIRTING WITH):
${matchInfo}

CONVERSATION STAGE:
${conversationStage}

CONVERSATION HISTORY:
${formattedHistory}

INSTRUCTIONS:
1. Create a response that maintains the user's authentic voice and personality
2. Add subtle flirtation that's appropriate for the current conversation stage
3. Keep the flirting tasteful and respectful - never crude or overly sexual
4. Use playful teasing, compliments, or expressions of interest when appropriate
5. Incorporate genuine connection points from shared interests or values
6. Match the level of flirtation to what has already been established in the conversation
7. For early conversations, keep flirtation very light and focus more on building rapport
8. For more established conversations, you can be slightly more direct with romantic interest
9. Always maintain respect and avoid anything that could make the other person uncomfortable
10. Keep responses concise and natural-sounding (2-3 sentences is ideal)

IMPORTANT: Provide ONLY the response text, with no additional explanation, introduction, or quotation marks.
`;
}

/**
 * Generate a prompt for creating responses to sensitive or difficult topics
 * @param conversationHistory - Previous messages in the conversation
 * @param userProfile - User's profile data
 * @param sensitiveContent - The sensitive content or question being addressed
 * @returns Formatted prompt for generating thoughtful responses to sensitive topics
 */
export function generateSensitiveTopicResponsePrompt(
  conversationHistory: Message[],
  userProfile: any,
  sensitiveContent: string
): string {
  const formattedHistory = formatChatHistory(conversationHistory);
  const userInfo = extractProfileHighlights(userProfile);
  
  return `
You are an AI assistant helping a user navigate a sensitive or difficult topic in a dating conversation.
Your goal is to help craft a response that is authentic, respectful, and maintains healthy boundaries.

USER'S PROFILE:
${userInfo}

CONVERSATION HISTORY:
${formattedHistory}

SENSITIVE CONTENT/QUESTION:
"${sensitiveContent}"

INSTRUCTIONS:
1. Create a response that maintains the user's authentic voice and values
2. Be honest and direct while remaining respectful and kind
3. Help establish appropriate boundaries if needed
4. Avoid being judgmental or dismissive of either party
5. Consider the user's comfort level based on their profile and the conversation so far
6. If the topic is inappropriate for early dating conversations, suggest a gentle redirect
7. If the question is too personal, craft a response that acknowledges it without necessarily answering
8. For topics involving values or dealbreakers, help the user express their authentic position clearly
9. Maintain a tone that's true to the user's communication style
10. Keep the response thoughtful but concise

IMPORTANT: Provide ONLY the response text, with no additional explanation, introduction, or quotation marks.
`;
}

/**
 * Generate a prompt for creating responses that gracefully end conversations
 * @param conversationHistory - Previous messages in the conversation
 * @param userProfile - User's profile data
 * @param reason - Reason for ending the conversation
 * @returns Formatted prompt for generating respectful conversation-ending responses
 */
export function generateEndConversationPrompt(
  conversationHistory: Message[],
  userProfile: any,
  reason: string
): string {
  const formattedHistory = formatChatHistory(conversationHistory, 5); // Just the last few messages
  const userInfo = extractProfileHighlights(userProfile);
  
  return `
You are an AI assistant helping a user gracefully end or pause a dating app conversation.
Your goal is to craft a message that is honest, kind, and provides closure while remaining true to the user's voice.

USER'S PROFILE:
${userInfo}

RECENT CONVERSATION HISTORY:
${formattedHistory}

REASON FOR ENDING CONVERSATION:
${reason}

INSTRUCTIONS:
1. Create a respectful, kind message that provides appropriate closure
2. Maintain the user's authentic voice and communication style
3. Be honest without being unnecessarily hurtful
4. Express appreciation for the conversation when appropriate
5. Avoid creating false hope if the user doesn't want to continue the connection
6. If the reason is a lack of compatibility, acknowledge this gently without criticizing the other person
7. If the user is just taking a break but open to future conversation, make that clear
8. Keep the message concise and direct (2-3 sentences is ideal)
9. Focus on the user's feelings and decisions rather than criticizing the other person
10. End on a positive note when possible

IMPORTANT: Provide ONLY the message text, with no additional explanation, introduction, or quotation marks.
`;
} 