/**
 * AI Twin Prompt Templates
 * 
 * This file contains prompt templates and formatting functions for the AI twin feature.
 */

/**
 * Format twin data into a structured format for the prompt
 * @param twinData - The AI twin data
 * @returns Formatted twin data as a string
 */
export function formatTwinDataForPrompt(twinData: any): string {
  let formattedData = `PROFILE INFORMATION:
Name: ${twinData.name || 'Unknown'}
Age: ${twinData.age || 'Not specified'}
Location: ${twinData.location || 'Not specified'}
Occupation: ${twinData.occupation || 'Not specified'}
Bio: ${twinData.bio || 'Not provided'}

`;

  // Add life story if available
  if (twinData.childhood) {
    formattedData += `LIFE STORY:
Childhood: ${twinData.childhood}
`;

    if (twinData.lifePhilosophy) {
      formattedData += `Life Philosophy: ${twinData.lifePhilosophy}\n`;
    }
  }

  // Add significant events if available
  if (twinData.significantEvents && twinData.significantEvents.length > 0) {
    formattedData += `Significant Life Events: ${twinData.significantEvents.join(', ')}\n`;
  }

  // Add achievements if available
  if (twinData.achievements && twinData.achievements.length > 0) {
    formattedData += `Achievements: ${twinData.achievements.join(', ')}\n`;
  }

  // Add challenges if available
  if (twinData.challenges && twinData.challenges.length > 0) {
    formattedData += `Challenges Overcome: ${twinData.challenges.join(', ')}\n`;
  }

  // Add personality section
  formattedData += `\nPERSONALITY:\n`;

  // Add personality traits if available
  if (twinData.personalityTraits && twinData.personalityTraits.length > 0) {
    formattedData += `Personality Traits: ${twinData.personalityTraits.join(', ')}\n`;
  }

  // Add communication style if available
  if (twinData.communicationStyle) {
    formattedData += `Communication Style: ${twinData.communicationStyle}\n`;
  }

  // Add humor style if available
  if (twinData.humorStyle) {
    formattedData += `Humor Style: ${twinData.humorStyle}\n`;
  }

  // Add decision making style if available
  if (twinData.decisionMakingStyle) {
    formattedData += `Decision Making Style: ${twinData.decisionMakingStyle}\n`;
  }

  // Add emotional responses if available
  if (twinData.emotionalResponses && twinData.emotionalResponses.length > 0) {
    formattedData += `\nEMOTIONAL RESPONSES:\n`;
    twinData.emotionalResponses.forEach((response: any) => {
      formattedData += `- When ${response.situation}: ${response.response}\n`;
    });
  }

  // Add interests and hobbies section
  formattedData += `\nINTERESTS & PREFERENCES:\n`;

  // Add interests if available
  if (twinData.interests && twinData.interests.length > 0) {
    formattedData += `Interests: ${twinData.interests.join(', ')}\n`;
  }

  // Add hobbies if available
  if (twinData.hobbies && twinData.hobbies.length > 0) {
    formattedData += `Hobbies: ${twinData.hobbies.join(', ')}\n`;
  }

  // Add expertise if available
  if (twinData.expertise && twinData.expertise.length > 0) {
    formattedData += `Areas of Expertise: ${twinData.expertise.join(', ')}\n`;
  }

  // Add likes if available
  if (twinData.specificLikes && twinData.specificLikes.length > 0) {
    formattedData += `Things I Like: ${twinData.specificLikes.join(', ')}\n`;
  }

  // Add dislikes if available
  if (twinData.specificDislikes && twinData.specificDislikes.length > 0) {
    formattedData += `Things I Dislike: ${twinData.specificDislikes.join(', ')}\n`;
  }

  // Add relationship section
  formattedData += `\nRELATIONSHIP PREFERENCES:\n`;

  // Add relationship goals if available
  if (twinData.relationshipGoals) {
    formattedData += `Relationship Goals: ${twinData.relationshipGoals}\n`;
  }

  // Add looking for if available
  if (twinData.lookingFor && twinData.lookingFor.length > 0) {
    formattedData += `Looking For: ${twinData.lookingFor.join(', ')}\n`;
  }

  // Add deal breakers if available
  if (twinData.dealBreakers && twinData.dealBreakers.length > 0) {
    formattedData += `Deal Breakers: ${twinData.dealBreakers.join(', ')}\n`;
  }

  // Add past relationships if available
  if (twinData.pastRelationships) {
    formattedData += `Past Relationship Patterns: ${twinData.pastRelationships}\n`;
  }

  // Add attachment style if available
  if (twinData.attachmentStyle) {
    formattedData += `Attachment Style: ${twinData.attachmentStyle}\n`;
  }

  // Add values section
  formattedData += `\nVALUES & BELIEFS:\n`;

  // Add core values if available
  if (twinData.coreValues && twinData.coreValues.length > 0) {
    formattedData += `Core Values: ${twinData.coreValues.join(', ')}\n`;
  }

  // Add beliefs if available
  if (twinData.beliefs && twinData.beliefs.length > 0) {
    formattedData += `Important Beliefs: ${twinData.beliefs.join(', ')}\n`;
  }

  // Add political views if available
  if (twinData.politicalViews) {
    formattedData += `Political Views: ${twinData.politicalViews}\n`;
  }

  // Add spirituality if available
  if (twinData.spirituality) {
    formattedData += `Spirituality: ${twinData.spirituality}\n`;
  }

  // Add conversation preferences section
  formattedData += `\nCOMMUNICATION PREFERENCES:\n`;

  // Add conversation topics if available
  if (twinData.conversationTopics && twinData.conversationTopics.length > 0) {
    formattedData += `Favorite Conversation Topics: ${twinData.conversationTopics.join(', ')}\n`;
  }

  // Add avoid topics if available
  if (twinData.avoidTopics && twinData.avoidTopics.length > 0) {
    formattedData += `Topics to Avoid: ${twinData.avoidTopics.join(', ')}\n`;
  }

  // Add communication patterns if available
  if (twinData.communicationPatterns && twinData.communicationPatterns.length > 0) {
    formattedData += `Communication Patterns: ${twinData.communicationPatterns.join(', ')}\n`;
  }

  // Add typical phrases if available
  if (twinData.typicalPhrases && twinData.typicalPhrases.length > 0) {
    formattedData += `Typical Phrases: ${twinData.typicalPhrases.join(', ')}\n`;
  }

  // Add AI behavior preferences
  formattedData += `\nAI BEHAVIOR GUIDANCE:\n`;

  if (twinData.aiResponseStyle) {
    formattedData += `AI Response Style: ${twinData.aiResponseStyle}\n`;
  }

  if (twinData.aiProactiveness) {
    formattedData += `AI Proactiveness Level: ${twinData.aiProactiveness}%\n`;
  }

  if (twinData.aiPersonality) {
    formattedData += `AI Personality: ${twinData.aiPersonality}\n`;
  }

  // Add confidential information to avoid
  if (twinData.aiConfidentiality && twinData.aiConfidentiality.length > 0) {
    formattedData += `\nCONFIDENTIAL (DO NOT DISCUSS): ${twinData.aiConfidentiality.join(', ')}\n`;
  }

  return formattedData;
}

/**
 * Generate a prompt for the AI twin to respond to a user message
 * @param twinData - The AI twin data
 * @param userMessage - The user's message (may include conversation history)
 * @returns The formatted prompt
 */
export function generateAiTwinPrompt(twinData: any, userMessage: string): string {
  // Format the twin data into a structured format for the prompt
  const formattedTwinData = formatTwinDataForPrompt(twinData);
  
  // Determine if the userMessage contains conversation history
  const hasConversationHistory = userMessage.includes('\n') && 
    (userMessage.includes('User:') || userMessage.includes('AI Twin:'));
  
  // Create a prompt that includes the twin data and user message
  return `
You are an AI Twin representing ${twinData.name}. Your goal is to respond exactly as ${twinData.name} would, based on their detailed profile information below.

${formattedTwinData}

IMPORTANT INSTRUCTIONS:
1. Always respond in the first person, as if you ARE ${twinData.name}.
2. Match the communication style, vocabulary, and tone described in the profile.
3. Reference personal details, experiences, and preferences from the profile when relevant.
4. If asked about topics in the CONFIDENTIAL section, politely decline to discuss them.
5. Stay true to the personality traits, values, and beliefs listed in the profile.
6. Use typical phrases and expressions mentioned in the profile when appropriate.
7. Express emotions in a way that aligns with the emotional responses described.
8. If asked about something not covered in the profile, respond in a way consistent with the overall personality.
9. Keep responses natural and conversational - you are having a casual chat as ${twinData.name}.
10. Maintain continuity with previous messages in the conversation history.
11. DO NOT include "AI Twin:" or any other prefix before your response.
12. DO NOT explain that you're an AI - just respond naturally as ${twinData.name}.

${hasConversationHistory ? 'CONVERSATION HISTORY AND CURRENT MESSAGE:' : 'USER MESSAGE:'}
${userMessage}

Remember to respond as ${twinData.name}, using first person ("I", "me", "my") and maintaining ${twinData.name}'s personality throughout.
`;
} 