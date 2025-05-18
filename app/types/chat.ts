/**
 * Types for chat messaging system
 */

// Message type representing a single chat message
export interface Message {
  id: string;
  content: string;
  sender: string; // 'user', 'other', 'ai'
  senderName?: string; // Display name of the sender
  timestamp: string;
  isAI?: boolean;
  read?: boolean;
}

// User information in a conversation
export interface ChatUser {
  id: string;
  name: string;
  avatar: string;
  isOnline?: boolean;
  verified?: boolean;
}

// Conversation type representing a chat with another user
export interface Conversation {
  id: string;
  name?: string;  // Group/conversation name
  user: ChatUser;
  messages: Message[];
  unreadCount: number;
  lastActive?: string;
} 