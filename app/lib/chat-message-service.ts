/**
 * Verida Chat Message Service
 * 
 * Handles storing and retrieving chat messages using the Verida Chat Message schema via REST API
 * Uses the schema at https://common.schemas.verida.io/social/chat/message/v0.1.0/schema.json
 */

import { veridaClient } from './verida-client';
import { ProfileRestService } from './profile-rest-service';
import { API_BASE_URL, AUTH_TOKEN, DB_NAMES, APP_INFO } from './verida-config';

// Constants
// Using centralized configuration instead of hardcoding values

// Schema and database names
const CHAT_MESSAGE_SCHEMA = 'https://common.schemas.verida.io/social/chat/message/v0.1.0/schema.json';
const CHAT_DB_NAME = DB_NAMES.CHAT_MESSAGES;

/**
 * Encode schema URL for API endpoint
 * @param {string} schemaUrl - The schema URL to encode
 * @returns {string} - Encoded schema URL for API endpoint
 */
function encodeSchemaForEndpoint(schemaUrl: string): string {
  // Use btoa for base64 encoding
  const base64Encoded = btoa(schemaUrl);
  
  // Convert to URL-safe base64
  return base64Encoded
    .replace(/\+/g, '-') 
    .replace(/\//g, '_') 
    .replace(/=+$/, '');
}

// Encode the schema URL once
const ENCODED_SCHEMA = encodeSchemaForEndpoint(CHAT_MESSAGE_SCHEMA);

// Interface for individual message entry in the messages dictionary
export interface MessageEntry {
  id: string;         // Message ID
  text: string;       // Plain text message
  html?: string;      // Optional HTML formatted message
  fromId: string;     // Sender's DID
  fromName?: string;  // Optional sender's display name
  timestamp: string;  // ISO timestamp
  read?: boolean;     // Whether the message has been read
}

// Interface for chat message
export interface ChatMessage {
  name: string;           // Required by schema
  groupId: string;        // Conversation/group ID
  groupName?: string;     // Optional name for the conversation/group
  type: 'send' | 'receive'; // Message direction (keeping for compatibility)
  messageText: string;    // Plain text message or JSON string of message dictionary
  messageHTML?: string;   // Optional HTML formatted message (keeping for backward compatibility)
  fromId: string;         // Sender's DID
  fromHandle?: string;    // Optional sender's handle
  fromName?: string;      // Optional sender's display name
  sentAt: string;         // ISO timestamp
  
  // Additional fields from base schema that might be needed
  _id?: string;
  _rev?: string;
  schema?: string;
  sourceApplication?: string;
  sourceId?: string;
  
  // Flag to indicate messageText contains serialized messages
  isMessageDict?: boolean; // True if messageText is a serialized dictionary
}

// Interface for chat group/conversation
export interface ChatGroup {
  id: string;
  name: string;
  participants: {
    did: string;
    name: string;
    avatar?: string;
  }[];
  lastMessage?: ChatMessage;
  unreadCount?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Save a chat message to Verida using REST API
 * @param message - The chat message to save
 * @returns Promise<ChatMessage> - The saved message
 */
export async function saveMessage(message: Partial<ChatMessage>): Promise<ChatMessage> {
  try {
    // Ensure required fields are present
    if (!message.groupId || !message.type || !message.messageText || !message.fromId) {
      throw new Error('Missing required fields for chat message');
    }
    
    // Set schema field
    message.schema = CHAT_MESSAGE_SCHEMA;
    
    // Set name if not provided (required by schema)
    if (!message.name) {
      message.name = `Chat message in ${message.groupName || message.groupId}`;
    }
    
    // Set timestamp if not provided
    if (!message.sentAt) {
      message.sentAt = new Date().toISOString();
    }
    
    // Set source info if not provided
    if (!message.sourceApplication) {
      message.sourceApplication = 'DecentralMatch Dating App';
    }
    
    if (!message.sourceId) {
      message.sourceId = `msg-${Date.now()}`;
    }
    
    console.log('Processing message for group:', message.groupId);
    
    // First, try to find an existing record for this group
    const existingRecords = await findGroupRecords(message.groupId);
    
    // If we found existing records for this group
    if (existingRecords && existingRecords.length > 0) {
      console.log(`Found ${existingRecords.length} existing records for group ${message.groupId}`);
      
      // Find a record with matching groupName if provided
      let matchingRecord = null;
      
      if (message.groupName) {
        // Try to find a record with matching groupName
        matchingRecord = existingRecords.find(record => record.groupName === message.groupName);
        
        if (matchingRecord) {
          console.log('Found existing record with matching groupName, appending message');
          return await appendMessageToExistingRecord(matchingRecord, message);
        } else {
          console.log('No record with matching groupName found, creating new record');
        }
      } else {
        // If no groupName provided, use the first record
        matchingRecord = existingRecords[0];
        console.log('Using first existing record for this group, appending message');
        return await appendMessageToExistingRecord(matchingRecord, message);
      }
    }
    
    // No existing record found or no matching groupName, create a new one with messages dictionary
    console.log('Creating new record with message dictionary');
    
    // Convert message to dictionary format
    const messageId = message.sourceId || `msg-${Date.now()}`;
    const messageEntry: MessageEntry = {
      id: messageId,
      text: typeof message.messageText === 'string' ? message.messageText : 'Chat message',
      fromId: message.fromId,
      fromName: message.fromName,
      timestamp: message.sentAt
    };
    
    if (message.messageHTML) {
      messageEntry.html = message.messageHTML;
    }
    
    // Create new record with messages dictionary
    const newRecord: Partial<ChatMessage> = {
      ...message,
      messageText: serializeMessageDict({ [messageId]: messageEntry }),
      isMessageDict: true
    };
    
    console.log('Saving new group record with message dictionary');
    
    // Create endpoint URL
    const endpoint = `${API_BASE_URL}/api/rest/v1/ds/${ENCODED_SCHEMA}`;
    
    // Make API call
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        record: newRecord
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error (${response.status}) saving message:`, errorText);
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('New group record saved successfully:', result);
    return result.record as ChatMessage;
  } catch (error) {
    console.error('Failed to save chat message:', error);
    throw error;
  }
}

/**
 * Find existing records for a chat group
 * @param groupId - The group ID to search for
 * @returns Promise<ChatMessage[]> - Array of existing records or empty array if none found
 */
async function findGroupRecords(groupId: string): Promise<ChatMessage[]> {
  try {
    // Query for records with this groupId
    const endpoint = `${API_BASE_URL}/api/rest/v1/ds/query/${ENCODED_SCHEMA}`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        recordFilter: {
          groupId: groupId
        },
        options: {
          limit: 10 // Get up to 10 matching records
        }
      })
    });
    
    if (!response.ok) {
      console.error(`API error searching for group records: ${response.status}`);
      return [];
    }
    
    const result = await response.json();
    const records = result.items || result.data || [];
    
    return records as ChatMessage[];
  } catch (error) {
    console.error('Error finding group records:', error);
    return [];
  }
}

/**
 * Find existing record for a chat group
 * @param groupId - The group ID to search for
 * @returns Promise<ChatMessage | null> - The existing record or null if not found
 */
async function findGroupRecord(groupId: string): Promise<ChatMessage | null> {
  const records = await findGroupRecords(groupId);
  return records.length > 0 ? records[0] : null;
}

/**
 * Append a new message to an existing group record
 * @param existingRecord - The existing record
 * @param newMessage - The new message to append
 * @returns Promise<ChatMessage> - The updated record
 */
async function appendMessageToExistingRecord(
  existingRecord: ChatMessage,
  newMessage: Partial<ChatMessage>
): Promise<ChatMessage> {
  try {
    // Generate message ID
    const messageId = newMessage.sourceId || `msg-${Date.now()}`;
    
    // Create message entry
    const messageEntry: MessageEntry = {
      id: messageId,
      text: typeof newMessage.messageText === 'string' ? newMessage.messageText : 'Chat message',
      fromId: newMessage.fromId!,
      fromName: newMessage.fromName,
      timestamp: newMessage.sentAt!
    };
    
    if (newMessage.messageHTML) {
      messageEntry.html = newMessage.messageHTML;
    }
    
    // Convert existing messageText from string to dictionary if needed
    let updatedMessageText: Record<string, MessageEntry> = {};

    if (existingRecord.isMessageDict) {
      // Deserialize the JSON string to dictionary
      updatedMessageText = deserializeMessageDict(existingRecord.messageText);
    } else if (typeof existingRecord.messageText === 'string') {
      // If old format, create a single entry for the existing message
      updatedMessageText = {
        [`legacy-${Date.now()}`]: {
          id: `legacy-${Date.now()}`,
          text: existingRecord.messageText,
          fromId: existingRecord.fromId,
          fromName: existingRecord.fromName,
          timestamp: existingRecord.sentAt
        }
      };
    }
    
    // Add new message to dictionary
    updatedMessageText[messageId] = messageEntry;
    
    console.log(`Appending message ${messageId} to existing record with ${Object.keys(updatedMessageText).length} total messages`);
    
    // Update record
    const updatedRecord = {
      ...existingRecord,
      messageText: serializeMessageDict(updatedMessageText),
      isMessageDict: true,
      sentAt: newMessage.sentAt, // Update the record's sentAt to the latest message time
    };
    
    // Create endpoint URL
    const endpoint = `${API_BASE_URL}/api/rest/v1/ds/${ENCODED_SCHEMA}/${existingRecord._id}`;
    
    // Make API call
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        record: updatedRecord
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error (${response.status}) updating message:`, errorText);
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('Message appended successfully to existing record');
    return result.record as ChatMessage;
  } catch (error) {
    console.error('Failed to append message to existing record:', error);
    throw error;
  }
}

/**
 * Get messages for a specific chat group/conversation
 * @param groupId - The ID of the chat group
 * @param groupName - Optional name of the group to filter messages
 * @param options - Query options (limit, offset, etc.)
 * @returns Promise<MessageEntry[]> - Array of message entries
 */
export async function getMessages(
  groupId: string,
  groupName?: string,
  options: { 
    limit?: number; 
    offset?: number; 
    fromDate?: Date;
    toDate?: Date;
  } = {}
): Promise<MessageEntry[]> {
  try {
    console.log(`Fetching messages for group: ${groupId}${groupName ? `, name: ${groupName}` : ''} via REST API`);
    
    // Find group records - get all records for this groupId
    const groupRecords = await findGroupRecords(groupId);
    
    if (groupRecords.length === 0) {
      console.log('No records found for this group');
      return [];
    }
    
    console.log(`Found ${groupRecords.length} records for group ${groupId}`);
    
    // If groupName is provided, filter records by name
    let filteredRecords = groupRecords;
    if (groupName) {
      filteredRecords = groupRecords.filter(record => record.groupName === groupName);
      console.log(`Filtered to ${filteredRecords.length} records with name "${groupName}"`);
    }
    
    // Extract messages from all matching records
    let allMessages: MessageEntry[] = [];
    
    for (const record of filteredRecords) {
      let recordMessages: MessageEntry[] = [];
      
      if (typeof record.messageText === 'string') {
        if (record.isMessageDict) {
          // Handle dictionary serialized as JSON string
          const messageDict = deserializeMessageDict(record.messageText);
          recordMessages = Object.values(messageDict);
        } else {
          // Handle legacy format - create a single message entry
          recordMessages = [{
            id: record._id || `legacy-${Date.now()}`,
            text: record.messageText,
            fromId: record.fromId,
            fromName: record.fromName,
            timestamp: record.sentAt
          }];
        }
      }
      
      // Add these messages to our collection
      allMessages = [...allMessages, ...recordMessages];
    }
    
    // Apply date filters
    if (options.fromDate || options.toDate) {
      allMessages = allMessages.filter(msg => {
        const msgTime = new Date(msg.timestamp).getTime();
        
        if (options.fromDate && msgTime < options.fromDate.getTime()) {
          return false;
        }
        
        if (options.toDate && msgTime > options.toDate.getTime()) {
          return false;
        }
        
        return true;
      });
    }
    
    // Sort messages by timestamp
    allMessages.sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return dateA - dateB; // Ascending order
    });
    
    console.log(`Returning ${allMessages.length} total messages for group ${groupId}${groupName ? ` with name "${groupName}"` : ''}`);
    
    // Apply pagination
    const limit = options.limit || allMessages.length;
    const offset = options.offset || 0;
    
    return allMessages.slice(offset, offset + limit);
  } catch (error) {
    console.error('Failed to get chat messages:', error);
    throw error;
  }
}

/**
 * Get all chat groups/conversations for the current user
 * @returns Promise<ChatGroup[]> - Array of chat groups
 */
export async function getChatGroups(): Promise<ChatGroup[]> {
  try {
    // Get user DID
    const did = await getCurrentUserDid();
    if (!did) {
      throw new Error('User not authenticated');
    }
    
    console.log(`Getting chat groups for user: ${did}`);
    
    // Query for all group records involving this user
    const endpoint = `${API_BASE_URL}/api/rest/v1/ds/query/${ENCODED_SCHEMA}`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        recordFilter: {
          $or: [
            { fromId: did }
            // Could add recipient filter if available
          ]
        },
        options: {
          limit: 100
        }
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error (${response.status}) getting groups:`, errorText);
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    const records = result.items || result.data || [];
    
    console.log(`Retrieved ${records.length} group records`);
    
    // Extract unique group IDs
    const groupMap = new Map<string, ChatMessage>();
    records.forEach((record: ChatMessage) => {
      if (record.groupId) {
        // Keep only the latest record for each group
        const existingRecord = groupMap.get(record.groupId);
        if (!existingRecord || new Date(record.sentAt) > new Date(existingRecord.sentAt)) {
          groupMap.set(record.groupId, record);
        }
      }
    });
    
    // Create chat group objects
    const chatGroups: ChatGroup[] = [];
    
    // Convert map entries to array to avoid iterator compatibility issues
    const groupEntries = Array.from(groupMap.entries());
    
    for (const [groupId, record] of groupEntries) {
      // Extract messages from record
      let messages: MessageEntry[] = [];
      
      if (typeof record.messageText === 'string') {
        if (record.isMessageDict) {
          // Handle dictionary serialized as JSON string
          const messageDict = deserializeMessageDict(record.messageText);
          messages = Object.values(messageDict);
        } else {
          // Handle legacy format
          messages = [{
            id: record._id || `legacy-${Date.now()}`,
            text: record.messageText,
            fromId: record.fromId,
            fromName: record.fromName,
            timestamp: record.sentAt
          }];
        }
      }
      
      // Skip if no messages
      if (messages.length === 0) continue;
      
      // Sort by date to get the latest message
      messages.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      const lastMessageEntry = messages[0];
      
      // Create a ChatMessage from the last MessageEntry
      const lastMessage: ChatMessage = {
        name: record.name,
        groupId: record.groupId,
        groupName: record.groupName,
        type: record.type,
        messageText: lastMessageEntry.text,
        fromId: lastMessageEntry.fromId,
        fromName: lastMessageEntry.fromName,
        sentAt: lastMessageEntry.timestamp
      };
      
      // Extract unique participant DIDs
      const participantDidSet = new Set<string>();
      messages.forEach(msg => {
        if (msg.fromId) {
          participantDidSet.add(msg.fromId);
        }
      });
      
      const participantDids = Array.from(participantDidSet);
      
      // Create participants array
      const participants = participantDids.map(participantDid => {
        // Find a message from this participant to get their name
        const participantMessage = messages.find(msg => msg.fromId === participantDid);
        
        return {
          did: participantDid,
          name: participantMessage?.fromName || 'Unknown',
        };
      });
      
      // Count unread messages
      const unreadCount = messages.filter(msg => 
        msg.fromId !== did && !msg.read
      ).length;
      
      // Get earliest and latest message dates
      const createdAt = new Date(Math.min(...messages.map(
        msg => new Date(msg.timestamp).getTime()
      ))).toISOString();
      
      const updatedAt = new Date(Math.max(...messages.map(
        msg => new Date(msg.timestamp).getTime()
      ))).toISOString();
      
      // Get group name
      let name = record.groupName || '';
      
      if (!name) {
        // If no group name, use the other participant's name
        const otherParticipant = participants.find(p => p.did !== did);
        name = otherParticipant 
          ? `Chat with ${otherParticipant.name}` 
          : `Group #${groupId.substring(0, 8)}`;
      }
      
      // Create group object
      chatGroups.push({
        id: groupId,
        name,
        participants,
        lastMessage,
        unreadCount,
        createdAt,
        updatedAt
      });
    }
    
    // Sort by last message date (newest first)
    return chatGroups.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  } catch (error) {
    console.error('Failed to get chat groups:', error);
    throw error;
  }
}

/**
 * Helper to get current user DID
 */
async function getCurrentUserDid(): Promise<string | null> {
  try {
    // Try to get DID from veridaClient
    if (veridaClient.isConnected()) {
      return veridaClient.getDid();
    }
    
    // If not connected, try to connect
    await veridaClient.connect();
    return veridaClient.getDid();
  } catch (error) {
    console.error('Error getting current user DID:', error);
    return null;
  }
}

/**
 * Create a new chat group/conversation
 * @param participants - Array of participant DIDs and names
 * @param groupName - Optional name for the group
 * @returns Promise<string> - The ID of the created group
 */
export async function createChatGroup(
  participants: { did: string; name: string }[],
  groupName?: string
): Promise<string> {
  try {
    // Need current user DID
    const did = await getCurrentUserDid();
    if (!did) {
      throw new Error('User not authenticated');
    }
    
    // Need at least two participants
    if (participants.length < 2) {
      throw new Error('Chat requires at least two participants');
    }
    
    // Make sure current user is included in participants
    const currentUserIncluded = participants.some(p => p.did === did);
    if (!currentUserIncluded) {
      // Get current user's profile for name
      let userName = 'Me';
      try {
        const profile = await ProfileRestService.getProfile(did);
        if (profile) {
          userName = profile.displayName || 'Me';
        }
      } catch (profileError) {
        console.warn('Failed to get user profile:', profileError);
      }
      
      participants.push({
        did,
        name: userName
      });
    }
    
    // For direct messages (2 participants), use createChatGroupId
    let groupId;
    if (participants.length === 2) {
      try {
        groupId = createChatGroupId(participants[0].did, participants[1].did);
      } catch (idError) {
        console.error('Failed to create consistent group ID:', idError);
        // Fallback to old format if error
        groupId = `chat-${did}-${Date.now()}`;
      }
    } else {
      // For group chats, use format: chat:group:<timestamp>:<random>
      groupId = `chat:group:${Date.now()}:${Math.random().toString(36).substring(2, 10)}`;
    }
    
    // Generate a default group name if not provided
    let defaultGroupName;
    if (participants.length > 2) {
      defaultGroupName = `Group with ${participants.length} people`;
    } else {
      // For direct messages, use createChatGroupName
      const otherParticipant = participants.find(p => p.did !== did);
      defaultGroupName = createChatGroupName(
        did,
        participants.find(p => p.did === did)?.name || 'Me',
        otherParticipant?.did || '',
        otherParticipant?.name
      );
    }
    
    // Create an initial system message to establish the group
    const messageId = `system-${Date.now()}`;
    const messageEntry: MessageEntry = {
      id: messageId,
      text: 'Chat conversation created',
      fromId: did,
      fromName: participants.find(p => p.did === did)?.name,
      timestamp: new Date().toISOString()
    };
    
    // Create group record with message dictionary
    const groupRecord: ChatMessage = {
      name: 'Chat created',
      groupId,
      groupName: groupName || defaultGroupName,
      type: 'send',
      messageText: serializeMessageDict({ [messageId]: messageEntry }),
      isMessageDict: true,
      fromId: did,
      fromName: participants.find(p => p.did === did)?.name,
      sentAt: new Date().toISOString(),
      schema: CHAT_MESSAGE_SCHEMA,
      sourceApplication: 'DecentralMatch Dating App',
      sourceId: `system-${Date.now()}`
    };
    
    // Save the system message to establish the group
    await saveMessage(groupRecord);
    
    return groupId;
  } catch (error) {
    console.error('Failed to create chat group:', error);
    throw error;
  }
}

/**
 * Mark messages as read
 * @param groupId - ID of the chat group
 * @param messageIds - Array of message IDs to mark as read
 * @returns Promise<boolean> - True if successful
 */
export async function markMessagesAsRead(groupId: string, messageIds: string[]): Promise<boolean> {
  try {
    // Find group record
    const groupRecord = await findGroupRecord(groupId);
    
    if (!groupRecord || typeof groupRecord.messageText === 'string') {
      console.warn('Group record not found or in legacy format');
      return false;
    }
    
    // Update read status in message dictionary
    let updated = false;
    let updatedMessages: Record<string, MessageEntry> = {};

    if (typeof groupRecord.messageText === 'string' && groupRecord.isMessageDict) {
      updatedMessages = deserializeMessageDict(groupRecord.messageText);
    } else if (typeof groupRecord.messageText === 'string') {
      console.warn('Group record not in dictionary format');
      return false;
    }
    
    for (const messageId of messageIds) {
      if (updatedMessages[messageId]) {
        updatedMessages[messageId] = {
          ...updatedMessages[messageId],
          read: true
        };
        updated = true;
      }
    }
    
    if (!updated) {
      console.log('No messages found to mark as read');
      return false;
    }
    
    // Update the record
    const updatedRecord = {
      ...groupRecord,
      messageText: typeof groupRecord.messageText === 'string' ? groupRecord.messageText : serializeMessageDict(updatedMessages),
      isMessageDict: typeof groupRecord.messageText === 'string' ? false : true
    };
    
    // Create endpoint URL
    const endpoint = `${API_BASE_URL}/api/rest/v1/ds/${ENCODED_SCHEMA}/${groupRecord._id}`;
    
    // Make API call
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        record: updatedRecord
      })
    });
    
    if (!response.ok) {
      console.warn(`Failed to mark messages as read: ${response.status}`);
      return false;
    }
    
    console.log('Messages marked as read successfully');
    return true;
  } catch (error) {
    console.error('Failed to mark messages as read:', error);
    return false;
  }
}

/**
 * Convert the app's message format to Verida message entry format
 */
export function convertToMessageEntry(
  message: {
    id: string;
    content: string;
    sender: string;
    timestamp: string;
    isAI?: boolean;
  },
  fromId: string,
  fromName: string
): MessageEntry {
  return {
    id: message.id,
    text: message.content,
    fromId,
    fromName,
    timestamp: message.timestamp
  };
}

/**
 * Convert Verida message entry format to app's message format
 */
export function convertFromMessageEntry(
  entry: MessageEntry,
  currentUserDid: string
): {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  isAI?: boolean;
} {
  return {
    id: entry.id,
    content: entry.text,
    sender: entry.fromId === currentUserDid ? 'user' : 'other',
    timestamp: entry.timestamp,
    isAI: entry.fromId.startsWith('ai-') || false
  };
}

/**
 * Create a chat group ID
 * This generates a consistent ID for a chat between two users
 * @param did1 - DID of the first user
 * @param did2 - DID of the second user
 * @returns The chat group ID
 */
export function createChatGroupId(did1: string, did2: string): string {
  if (!did1 || !did2) {
    throw new Error('Both DIDs must be provided');
  }
  
  if (did1 === did2) {
    throw new Error('Cannot create a chat group with the same DID');
  }
  
  // Validate DIDs
  if (!did1.startsWith('did:') || !did2.startsWith('did:')) {
    throw new Error('DIDs must start with "did:" prefix');
  }
  
  // Sort DIDs to ensure consistent ID regardless of order
  const sortedDids = [did1, did2].sort();
  
  // Create group ID in format: chat:group:did1:did2
  return `chat:group:${sortedDids[0]}:${sortedDids[1]}`;
}

/**
 * Create a chat group name
 * @param currentUserDid - DID of the current user
 * @param currentUserName - Name of the current user
 * @param otherUserDid - DID of the other user
 * @param otherUserName - Name of the other user (optional)
 * @returns The chat group name
 */
export function createChatGroupName(
  currentUserDid: string,
  currentUserName: string,
  otherUserDid: string,
  otherUserName?: string
): string {
  if (!otherUserName) {
    // Try to extract a short name from the DID if no name provided
    const didParts = otherUserDid.split(':');
    const lastPart = didParts[didParts.length - 1];
    const shortDid = lastPart.substring(0, 8) + '...';
    otherUserName = `User ${shortDid}`;
  }
  
  return `Chat with ${otherUserName}`;
}

/**
 * COMPATIBILITY FUNCTION: Convert the app's message format to Verida schema format
 * @deprecated Use convertToMessageEntry instead
 */
export function convertToVeridaMessage(
  message: {
    id: string;
    content: string;
    sender: string;
    timestamp: string;
    isAI?: boolean;
  },
  groupId: string,
  fromId: string,
  fromName: string
): ChatMessage {
  return {
    name: 'Chat message',
    groupId,
    type: message.sender === 'user' ? 'send' : 'receive',
    messageText: message.content,
    fromId,
    fromName,
    sentAt: message.timestamp,
    schema: CHAT_MESSAGE_SCHEMA,
    sourceApplication: 'DecentralMatch Dating App',
    sourceId: message.id
  };
}

/**
 * COMPATIBILITY FUNCTION: Convert Verida message format to app's message format
 * @deprecated Use convertFromMessageEntry instead
 */
export function convertFromVeridaMessage(
  message: ChatMessage | MessageEntry,
  currentUserDid: string
): {
  id: string;
  content: string;
  sender: string;
  senderName?: string;
  timestamp: string;
  isAI?: boolean;
} {
  // Handle MessageEntry format
  if ('text' in message && 'timestamp' in message) {
    const entry = message as MessageEntry;
    return {
      id: entry.id,
      content: entry.text,
      sender: entry.fromId === currentUserDid ? 'user' : 'other',
      senderName: entry.fromName || (entry.fromId === currentUserDid ? 'Me' : undefined),
      timestamp: entry.timestamp,
      isAI: entry.fromId.startsWith('ai-') || false
    };
  }
  
  // Handle old ChatMessage format
  const chatMessage = message as ChatMessage;
  return {
    id: chatMessage._id || chatMessage.sourceId || `msg-${Date.now()}`,
    content: typeof chatMessage.messageText === 'string' ? chatMessage.messageText : 'Message',
    sender: chatMessage.fromId === currentUserDid ? 'user' : 'other',
    senderName: chatMessage.fromName || (chatMessage.fromId === currentUserDid ? 'Me' : undefined),
    timestamp: chatMessage.sentAt,
    isAI: chatMessage.fromId.startsWith('ai-') || false
  };
}

/**
 * Helper to serialize message dictionary to JSON string
 */
function serializeMessageDict(messages: Record<string, MessageEntry>): string {
  return JSON.stringify(messages);
}

/**
 * Helper to deserialize JSON string to message dictionary
 */
function deserializeMessageDict(jsonString: string): Record<string, MessageEntry> {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Failed to parse message dictionary:', error);
    return {};
  }
}
