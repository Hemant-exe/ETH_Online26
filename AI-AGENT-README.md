# AI Dating Assistant - Technical Documentation

## Overview

The AI Dating Assistant is an advanced feature of our blockchain-based dating application that helps users navigate conversations with potential matches. It uses AI to generate personalized responses based on the user's profile, conversation history, and communication preferences.

## Features

### 1. AI Twin Chat

- **Personalized Responses**: The AI twin responds based on the user's profile information, including personality traits, interests, and communication style.
- **Context-Aware Conversations**: Maintains conversation context by analyzing message history.
- **Multiple Response Types**: Supports various types of responses including normal replies, suggestions, conversation starters, and flirty messages.

### 2. AI Mode

- **Auto-Response**: When enabled, the AI automatically responds to messages on behalf of the user.
- **Visual Countdown**: Shows a countdown timer before auto-sending messages.
- **Suggestion Generation**: Provides contextually relevant message suggestions even in manual mode.
- **Self-Response Prevention**: Intelligent logic to prevent the AI from responding to its own messages.

### 3. User Experience

- **Loading Animations**: Heart-themed loading animations during initialization and data fetching.
- **Message Truncation**: Long messages are automatically truncated with "Read more" option.
- **Visual Feedback**: Clear indicators when AI mode is active and when messages are being typed.
- **Blockchain Integration**: All messages are saved to the Verida blockchain for security and ownership.

## Technical Architecture

### Core Components

1. **AI Twin Chat Service** (`app/lib/ai-twin-chat-service.ts`)
   - Handles generating AI responses using LLM API
   - Processes different prompt types (suggestion, response, starter, flirty)
   - Formats user profile data for the AI model

2. **Conversation Panel** (`app/chats/components/conversation-panel.tsx`)
   - Manages the chat UI and interaction logic
   - Handles AI mode toggle and auto-send functionality
   - Implements message truncation for long content

3. **Chat With Twin Page** (`app/chat-with-twin/page.tsx`)
   - Dedicated page for interacting with your AI twin
   - Implements countdown timer and auto-send functionality

4. **Verida Integration** (`app/lib/verida-ai-twin-service.ts`)
   - Fetches user's AI twin data from the blockchain
   - Stores conversation history securely

### Prompt Types

The system supports several specialized prompt types:

- **suggestion**: Generates message suggestions based on conversation context
- **response**: Creates personalized responses to user messages
- **starter**: Crafts conversation starters for new matches
- **flirty**: Generates flirtatious responses when appropriate
- **auto**: Specialized prompt for automatic responses in AI mode


### Configuration

The AI behavior can be customized in the following files:

- **Prompt Templates**: `app/lib/prompts/chat-suggestions-prompts.ts`
- **AI Twin Prompts**: `app/lib/prompts/ai-twin-prompts.ts`
- **Response Formatting**: `app/lib/ai-twin-chat-service.ts`

## Usage Guide

### Creating an AI Twin

1. Navigate to the "Create Twin" page
2. Fill out the profile information including personality traits, interests, and communication style
3. Submit to create your AI twin on the blockchain

### Using AI Mode in Conversations

1. Open a conversation with a match
2. Toggle the "AI Mode" switch in the top-right corner
3. The AI will automatically suggest and send messages based on your profile
4. You can disable AI Mode at any time to return to manual messaging

### Customizing AI Behavior

The AI behavior can be customized through your profile settings:

- **AI Proactiveness**: Controls how proactive the AI is in conversations (0-100%)
- **AI Response Style**: Sets the tone of AI responses (casual, formal, flirty, etc.)
- **AI Personality**: Defines the overall personality of your AI twin
- **Confidential Topics**: Specifies topics the AI should avoid discussing

## Security and Privacy

- All conversations are stored securely on the Verida blockchain
- User profile data is encrypted and only accessible to authorized parties
- The AI twin only has access to information explicitly shared in the user's profile

## Technical Limitations

- The AI may occasionally generate responses that don't perfectly match the user's communication style
- Response generation may take longer during peak usage times
- Very complex conversation contexts may result in less accurate responses

## Future Enhancements

- Emotion detection to better respond to the emotional context of conversations
- Multi-language support for international users
- Voice message transcription and generation
- Image recognition for context-aware responses to shared photos

