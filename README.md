# VeraLove - Decentralized Dating Platform

A modern dating application built with decentralized identity and encrypted data storage using Verida protocol.

## Features

- **Decentralized Identity (DID)**: Users control their identity using Verida's DID solution and Cheqd's blockchain verification
- **Encrypted Data Storage**: All profile data is stored in user-owned encrypted databases
- **Self-Sovereign Profile**: Users own their dating profile data
- **Privacy-First**: Share only what you want with who you want
- **Dual Blockchain Integration**: Support for both Verida and Cheqd blockchain technologies
- **Decentralized Chat**: Secure, private messaging stored on Verida blockchain
- **AI Twin Creation**: Build a blockchain-stored AI representation of yourself
- **Verifiable Credentials**: Identity verification through Cheqd's verifiable credentials
- **NFT Profile Minting**: Transform your profile into an NFT on the Unichain Sepolia blockchain

## Technologies

- Next.js 14
- Verida Protocol (Client SDK, Account Web Vault)
- Cheqd Protocol (DID creation and verification)
- Unichain Sepolia (NFT minting)
- React
- TypeScript
- Tailwind CSS
- Shadcn UI components

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Git
- Leap wallet extension (for NFT minting)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/hiten1010/Dating-Blockchain.git
   cd Dating-Blockchain
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with the following content:
   ```
   NEXT_PUBLIC_VERIDA_NETWORK=testnet
   NEXT_PUBLIC_CONTEXT_NAME="VeraLove Dating Application"
   NEXT_PUBLIC_LOGO_URL="https://your-logo-url.com/logo.png"
   NEXT_PUBLIC_CHEQD_API_KEY="your-cheqd-api-key"
   NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0x968Cd0A56cAc23332c846957064A99Eabbdc464E
   NEXT_PUBLIC_UNICHAIN_RPC_URL=https://sepolia.unichain.org
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Verida and Cheqd Integration Details

This application uses Verida for decentralized data storage and Cheqd for identity verification:

1. **Verida Client Setup**: 
   - `app/lib/verida-client.ts` contains the client configuration
   - Uses the `@verida/client-ts` and `@verida/account-web-vault` packages

2. **Cheqd Integration**:
   - `app/lib/cheqd-service.ts` contains the Cheqd client configuration
   - Provides functions for creating keypairs, DIDs, and updating DID documents

3. **Key Components**:
   - `OnboardingFlow`: Handles user onboarding and dual wallet connection
   - `ProfileCreationFlow`: Manages user profile creation using Verida and Cheqd
   - `ProfileService`: Service for storing and retrieving profile data

4. **Database Structure**:
   - `dating_profile`: Stores basic profile information
   - `dating_preferences`: Stores user preferences
   - `dating_photos`: Stores profile photos
   - `dating_matches`: Stores match information
   - `dating_messages`: Stores messages between users
   - `favourite`: Stores AI Twin data using Verida's Favourite schema

## Usage

### User Authentication

1. Users connect to the application by connecting both their Verida and Cheqd wallets
2. The Verida wallet is connected by scanning a QR code with the Verida mobile app
3. The Cheqd wallet is created and connected through the Cheqd API
4. Once both wallets are connected, DIDs are established for the user
5. The user's DIDs are used to create and access their encrypted databases and verify their identity

### Profile Management

1. Basic profile data is stored in the user's Verida profile database
2. Identity verification is handled through Cheqd's verifiable credentials
3. Photos are stored separately in the photos database
4. All data is encrypted and only accessible by the user or those they grant permission to

## NFT Profile System

The NFT functionality allows users to mint their profiles as NFTs on the Unichain Sepolia blockchain, providing an immutable and verifiable representation of their dating profile.

### NFT Smart Contract

The NFT functionality uses a custom ProfileNFT contract (`ProfileNFT.sol`) deployed on the Unichain Sepolia blockchain at address `0x968Cd0A56cAc23332c846957064A99Eabbdc464E`. This is an ERC-721 NFT contract with additional functionality:

```solidity
// Key contract functions
function createProfile(string memory tokenURI) public returns (uint256) {
    require(!hasProfile(msg.sender), "Already minted");
    // Mint logic...
}

function updateProfile(uint256 tokenId, string memory newTokenURI) public {
    require(ownerOf(tokenId) == msg.sender, "Not owner");
    // Update logic...
}

function burnProfile(uint256 tokenId) public {
    require(ownerOf(tokenId) == msg.sender, "Not owner");
    // Burn logic...
}
```

### NFT Minting Process

The NFT minting functionality is exposed through the mint-nft-step.tsx component in the profile creation flow:

```typescript
// Example usage
import { nftService } from "@/app/services/nft-service";
import { profileMetadataService } from "@/app/services/profile-metadata-service";

// Generate and store metadata
const metadata = profileMetadataService.generateMetadata(profileData, didId);
const tokenURI = await profileMetadataService.storeMetadata(metadata);

// Mint the NFT
const { tokenId, txHash } = await nftService.createProfile(tokenURI);

// Store NFT data in localStorage
localStorage.setItem("nftData", JSON.stringify({
  tokenId,
  transactionHash: txHash,
  contractAddress: nftService.getContractAddress(),
  mintDate: new Date().toISOString(),
  lastUpdated: new Date().toISOString(),
  explorerUrl: `https://sepolia.uniscan.xyz/tx/${txHash}`,
  chainId: "1301",
  chainName: "Unichain Sepolia"
}));
```

### Cheqd and NFT Integration

When a profile NFT is minted, the following occurs:

1. **User's Cheqd DID document is updated** to include:
   - NFT transaction details
   - Token ID reference
   - Verida DID link for encrypted data access
   - Contract address and chain information

2. **DID Document Structure** includes multiple service endpoints:

```json
"service": [
  {
    "id": "did:cheqd:testnet:abcd1234#service-1",
    "type": "LinkedDomains",
    "serviceEndpoint": ["https://example.com"]
  },
  {
    "id": "did:cheqd:testnet:abcd1234#nft-profile",
    "type": "ProfileNFT",
    "serviceEndpoint": [{
      "uri": "https://sepolia.uniscan.xyz/tx/0x52178bef007c0224e5a65261f507d18a3db923280a618b13b1c4dff793060f8b",
      "tokenId": "4152",
      "contractAddress": "0x968Cd0A56cAc23332c846957064A99Eabbdc464E",
      "chainId": "1301",
      "chainName": "Unichain Sepolia",
      "transactionHash": "0x52178bef007c0224e5a65261f507d18a3db923280a618b13b1c4dff793060f8b"
    }]
  },
  {
    "id": "did:cheqd:testnet:abcd1234#verida-identity",
    "type": "VeridaDID",
    "serviceEndpoint": ["did:vda:mainnet:0x8bf89E3eA0751d3B827EF2EBD2fa4685d1F8C7f2"]
  }
]
```

### NFT Metadata Structure

```javascript
{
  name: "VeraLove Profile - {DisplayName}",
  description: "Verified dating profile on VeraLove",
  image: "ipfs://hash-of-profile-image",
  attributes: [
    { trait_type: "Display Name", value: "User's display name" },
    { trait_type: "Verida DID", value: "did:verida:user-did" },
    { trait_type: "Cheqd DID", value: "did:cheqd:testnet:user-did" },
    { trait_type: "Interest Count", value: 5 },
    { trait_type: "Photo Count", value: 3 },
    { trait_type: "Creation Date", value: "2023-05-01" }
  ],
  external_url: "https://app.veralove.com/profile/{DID}"
}
```

### NFT Minting Process Flow

1. **Preparation**:
   - User connects both Leap wallet (for blockchain transactions) and Cheqd wallet (for DID)
   - Profile data is collected and stored encrypted via Verida protocol
   - Metadata is prepared for the NFT

2. **Minting**:
   - The NFT contract verifies the user doesn't already have a profile NFT 
   - NFT is minted with a URI pointing to the encrypted profile data
   - Transaction hash and token ID are recorded

3. **DID Update**:
   - Cheqd DID document is updated to include NFT information
   - Verida DID reference is added for encrypted data access
   - The updated document is signed and submitted to the Cheqd network

4. **Storage**:
   - Transaction details are saved in localStorage for app reference
   - Profile display shows verification from blockchain

### Security and Privacy

This dual-system architecture provides:

- **Public verification** - Anyone can verify profile ownership via the blockchain
- **Privacy protection** - Only the user controls access to their private data
- **Identity portability** - The DID can be used across multiple services
- **Revocable access** - User can revoke access to their encrypted data at any time
- **Cryptographic security** - All transactions and DID updates are cryptographically signed

The combination of blockchain NFTs and DIDs creates a robust identity framework:

1. **Blockchain layer** provides:
   - Immutable ownership records
   - Public verification
   - Transparent transaction history

2. **DID layer** provides:
   - Identity management
   - Service endpoint discovery
   - Credential verification

3. **Verida layer** provides:
   - Encrypted data storage
   - User-controlled access
   - Cross-application data portability

### Error Handling

The smart contract prevents a single address from minting multiple NFTs. If a user attempts to mint when they already have an NFT, the transaction will fail with:

```
Error: execution reverted: Already minted
```

In this case, the application should:
1. Check if user already has an NFT before attempting to mint
2. If already minted, load existing NFT details instead
3. Allow profile updates without requiring a new NFT

### Implementation Files

Key files in the implementation:
- `app/lib/cheqd-service.ts` - Cheqd DID management
- `app/services/nft-service.ts` - NFT contract interaction
- `app/profile/components/steps/mint-nft-step.tsx` - NFT minting UI
- `app/user/components/nft-details.tsx` - NFT display UI
- `app/user/components/off-chain-data.tsx` - Verida data display
- `app/user/components/did-settings.tsx` - DID management UI
- `utils/nft-check.ts` - NFT ownership verification utilities

## Cheqd Integration Architecture

The Cheqd integration provides robust identity verification and credential management through blockchain technology.

### Core Components

#### Cheqd Service

* **`cheqd-service.ts`** - Core service that manages Cheqd API interactions:
  * Creating keypairs for users
  * Creating DIDs on the Cheqd blockchain
  * Converting keys between formats (hex to base58)
  * Updating DID documents with services and verification methods

### Cheqd Wallet Flow

The Cheqd wallet connection process follows these steps:

1. **Keypair Creation**
   - Creates a cryptographic keypair using Ed25519 algorithm
   - Stores the keypair securely for future reference

2. **DID Creation**
   - Uses the keypair to create a DID on the Cheqd testnet
   - Format: `did:cheqd:testnet:{uuid}`
   - Stores the DID in localStorage for persistent sessions

3. **DID Document Update**
   - Updates the DID document with verification methods
   - Adds service endpoints for future credential verification
   - Converts public keys to the required format (base58)

### Dual Wallet Authentication

The application requires both Verida and Cheqd wallets to be connected:

1. **Verida Wallet** - Provides encrypted data storage and messaging
2. **Cheqd Wallet** - Provides identity verification and credential management

Only when both wallets are connected can the user proceed with profile creation.

### Technical Implementation

#### Cheqd API Integration

The application integrates with the Cheqd Studio API for DID operations:

```typescript
// Creating a keypair
const keypair = await createKeypair();

// Creating a DID
const didResponse = await createDid(keypair.publicKeyHex);

// Converting hex key to base58
const base58Key = hexToBase58(keypair.publicKeyHex);

// Updating a DID document
const updatedDid = await updateDid(didResponse.did, keypair.publicKeyHex);
```

#### Wallet Connection UI

The onboarding process has been updated to require both wallets:

1. Users see both wallet options in the connection screen
2. Each wallet shows its connection status independently
3. The "Continue" button is only enabled when both wallets are connected
4. Wallet addresses are stored in localStorage for persistent sessions

#### Data Flow

1. User connects both Verida and Cheqd wallets
2. Cheqd DID is created and stored
3. Verida DID is created and stored
4. Both DIDs are used throughout the application for different purposes:
   - Verida DID for data storage and encryption
   - Cheqd DID for identity verification and credentials

### Benefits of Dual Blockchain Approach

1. **Enhanced Security** - Two independent blockchain technologies provide additional security
2. **Specialized Functionality** - Each blockchain offers specialized features:
   - Verida: Encrypted data storage and messaging
   - Cheqd: Identity verification and credential management
3. **Future Interoperability** - Foundation for cross-chain functionality and expanded features

## Profile System Architecture

The profile system provides users with complete ownership and control over their dating profile data through a decentralized architecture.

### Core Components

#### Client Infrastructure

* **`verida-client.ts`** - Core singleton client that manages Verida SDK initialization, connection, and context management
* **`verida-client-wrapper.tsx`** - Client-side wrapper for the Verida client to handle client/server rendering
* **`clientside-verida.tsx`** - React hooks for accessing Verida services in components

#### Data Services

* **`profile-service.ts`** - Manages profile data storage and retrieval using the Verida SDK directly
* **`profile-rest-service.ts`** - REST API service for profile operations using standard Verida schemas
* **`verida-schema-mapping.ts`** - Maps app data models to standard Verida schemas
* **`verida-token-utils.ts`** - Utilities for verifying and managing API tokens

### Profile Creation Flow

The profile creation process follows a multi-step workflow:

1. **DID Creation** (`create-did-step.tsx`)
   - Creates a decentralized identity on the Verida network
   - Establishes the foundation for user data ownership

2. **Basic Information** (`basic-info-step.tsx`)
   - Collects and stores essential profile information
   - Data is saved in encrypted Verida databases

3. **Photo Management** (`photos-step.tsx`)
   - Enables uploading and managing profile photos
   - Photos are stored securely in Verida storage

4. **Preferences & Interests** (`preferences-step.tsx`)
   - Captures user interests and relationship goals
   - Facilitates better matching algorithms

5. **NFT Minting** (`mint-nft-step.tsx`)
   - Transforms the user profile into an NFT
   - Provides on-chain verification of profile authenticity

6. **Completion** (`success-step.tsx`)
   - Confirms successful profile creation and NFT minting
   - Links to next steps in the application

### Wallet Integration

* **`connect-wallet-step.tsx`** - Handles wallet connection for blockchain interaction
* **`verification-step.tsx`** - Verifies user identity

### Database Schema

#### Profile Data (`social_post` schema)

The profile data utilizes Verida's standard `social_post` schema:

```javascript
{
  // Standard schema fields
  schema: "https://common.schemas.verida.io/social/post/v0.1.0/schema.json",
  name: "User's display name",
  content: "User's bio",
  uri: "dating:profile:{DID}",
  type: "status",
  
  // Custom metadata fields
  metadata: {
    profileType: "dating",
    age: "25",
    location: "New York",
    interests: ["Music", "Travel", "Art"],
    relationshipGoals: "long-term",
    primaryPhotoIndex: 0
  }
}
```

#### Photos Data (`file` schema)

Profile photos use Verida's standard `file` schema:

```javascript
{
  // Standard schema fields
  schema: "https://common.schemas.verida.io/file/v0.1.0/schema.json",
  name: "Profile Photo 1",
  extension: "jpg",
  mimeType: "image/jpeg",
  size: 102400,
  uri: "photo_url_or_data",
  
  // Custom metadata fields
  metadata: {
    profileType: "dating",
    description: "My primary photo",
    isPrivate: false,
    order: 0,
    did: "user:did"
  }
}
```

#### Preferences Data (`social_following` schema)

Dating preferences use Verida's standard `social_following` schema:

```javascript
{
  // Standard schema fields
  schema: "https://common.schemas.verida.io/social/following/v0.1.0/schema.json",
  name: "Dating Preferences",
  uri: "dating:preferences:{DID}",
  followedTimestamp: "2023-05-25T10:30:00Z",
  
  // Custom metadata fields
  metadata: {
    profileType: "dating",
    ageRange: { min: 18, max: 50 },
    locationPreference: "worldwide",
    distanceRange: 50,
    lookingFor: ["friendship", "relationship"],
    dealBreakers: ["smoking"]
  }
}
```

### NFT Profile Minting

The NFT minting process:

1. **Data Preparation** - Formats profile data and metadata for on-chain representation
2. **On-Chain Storage** - Public metadata is stored on-chain
3. **Off-Chain References** - Private data remains in Verida with secure references
4. **Blockchain Transaction** - NFT is minted on the Cheqd protocol using the user's Cheqd DID
5. **Ownership Assignment** - NFT is assigned to the user's wallet address
6. **Credential Verification** - Cheqd verifiable credentials are used to verify the profile authenticity

#### NFT Metadata Structure

```javascript
{
  name: "VeraLove Profile - {DisplayName}",
  description: "Verified dating profile on VeraLove",
  image: "ipfs://hash-of-profile-image",
  attributes: [
    { trait_type: "Display Name", value: "User's display name" },
    { trait_type: "Verida DID", value: "did:verida:user-did" },
    { trait_type: "Cheqd DID", value: "did:cheqd:testnet:user-did" },
    { trait_type: "Interest Count", value: 5 },
    { trait_type: "Photo Count", value: 3 },
    { trait_type: "Creation Date", value: "2023-05-01" }
  ],
  external_url: "https://app.veralove.com/profile/{DID}"
}
```

### Data Privacy and Security

* All sensitive profile data is encrypted using Verida's encryption protocol
* Users explicitly control which data is public vs. private
* Public data available on-chain includes only basic discovery information
* Private data (specific preferences, photos, etc.) remains securely stored in Verida databases
* Access to private data requires explicit user permission

### Technical Flow

1. User creates DIDs through both Verida and Cheqd protocols
2. Verida DID is used for data storage and encryption
3. Cheqd DID is used for identity verification and credentials
4. Profile data is stored in schema-compliant format in Verida databases
5. Data is mapped between app models and standard Verida schemas
6. When minting an NFT, public metadata is prepared for on-chain storage
7. The NFT links to the Verida-stored private data via secure references
8. Cheqd verifiable credentials are attached to the profile for verification
9. User maintains full control of profile data and can revoke access at any time

## Chat System Database Architecture

The chat functionality uses Verida's decentralized data storage to ensure user privacy and data sovereignty. All chat messages are stored in encrypted blockchain databases.

### Schema Structure

The chat system utilizes the Verida social chat message schema:
`https://common.schemas.verida.io/social/chat/message/v0.1.0/schema.json`

### Database Collections

1. **Chat Messages Database (`social_chat_message`)**
   - Primary storage for all chat messages
   - Messages are encrypted end-to-end
   - Indexed by conversation groupId for efficient retrieval

### Chat System Implementation

The chat system is implemented through several key components working together:

1. **`app/chats/page.tsx`**:
   - Main page component for the chat functionality
   - Sets up the animated background and layout
   - Renders the ChatInterface component within the page structure
   - Manages global styles for chat animations

2. **`app/chats/components/chat-interface.tsx`**:
   - Core component that orchestrates the entire chat experience
   - Manages state for conversations, selected chats, and loading states
   - Handles loading chat groups from Verida blockchain
   - Implements methods for loading messages for specific conversations
   - Prevents duplicate API calls using reference caching
   - Formats blockchain data for display in the UI
   - Manages responsive layout for mobile and desktop views

3. **`app/chats/components/chat-list.tsx`**:
   - Displays the list of conversations from the blockchain
   - Handles conversation selection
   - Formats the last message and timestamp for each conversation
   - Shows blockchain verification status with the Shield icon
   - Displays AI twin indicators for messages from AI twins
   - Implements search functionality for filtering conversations

4. **`app/chats/components/conversation-panel.tsx`**:
   - Displays individual conversation thread with messages
   - Manages message input and sending
   - Sends messages to Verida blockchain with proper group identification
   - Implements AI mode toggle for enabling AI twin responses
   - Generates AI suggestions for messages
   - Formats incoming and outgoing messages
   - Handles message animations and typing indicators

### Message Data Structure

Chat messages are stored with the following fields:

```typescript
{
  name: string;           // Required name for the message record
  groupId: string;        // Unique conversation/group ID
  groupName: string;      // Name of the conversation/group
  type: 'send' | 'receive'; // Message direction
  messageText: string;    // Plain text message or JSON string of message dictionary
  messageHTML?: string;   // Optional HTML formatted message
  fromId: string;         // Sender's DID (decentralized identifier)
  fromHandle?: string;    // Optional sender's handle
  fromName?: string;      // Optional sender's display name
  sentAt: string;         // ISO timestamp
  isMessageDict?: boolean; // Indicates if messageText contains serialized messages
}
```

## AI Twin System Architecture

The AI Twin functionality allows users to create a digital representation of themselves stored securely on the Verida blockchain. This twin can interact with other users when the original user is offline, enhancing the dating experience.

### Schema Structure

The AI Twin system utilizes the Verida Favourite schema:
`https://common.schemas.verida.io/favourite/v0.1.0/schema.json`

### Database Collections

1. **AI Twin Database (`favourite`)**
   - Stores AI Twin personality data
   - Encrypted using Verida's protocols
   - Linked to the user's DID for authentication

### AI Twin Data Structure

AI Twin data is stored using the Verida Favourite schema with extensive metadata:

```typescript
{
  // Core Favourite schema fields
  name: string;               // Twin's name (usually the user's name)
  favouriteType: string;      // Set to "recommendation" 
  contentType: string;        // Set to "document"
  uri: string;                // Unique identifier for the twin
  schema: string;             // The Favourite schema URL
  description: string;        // Brief bio
  
  // AI Twin metadata
  metadata: {
    profileType: "ai-twin",   // Identifies this as an AI twin
    personalDetails: {        // Basic information
      age: string;
      location: string;
      occupation: string;
    },
    lifeStory: {              // Biographical information
      childhood: string;
      significantEvents: string[];
      achievements: string[];
      challenges: string[];
      lifePhilosophy: string;
    },
    personality: {            // Personality traits
      personalityTraits: string[];
      communicationStyle: string;
      humorStyle: string;
      emotionalResponses: Array<{ situation: string; response: string }>;
      decisionMakingStyle: string;
    },
    interests: {              // Interests and preferences
      interests: string[];
      hobbies: string[];
      expertise: string[];
      specificLikes: string[];
      specificDislikes: string[];
    },
    relationships: {          // Relationship preferences
      relationshipGoals: string;
      dealBreakers: string[];
      lookingFor: string[];
      pastRelationships: string;
      attachmentStyle: string;
    },
    values: {                 // Personal values
      coreValues: string[];
      beliefs: string[];
      politicalViews: string;
      spirituality: string;
    },
    communication: {          // Communication style
      conversationTopics: string[];
      avoidTopics: string[];
      communicationPatterns: string[];
      typicalPhrases: string[];
    },
    aiBehavior: {             // AI behavior configuration
      aiResponseStyle: string;
      aiProactiveness: number;
      aiPersonality: string;
      aiConfidentiality: string[];
    }
  }
}
```

### AI Twin Creation Process

1. **Data Collection**:
   - User fills out an extensive form capturing personality traits, preferences, communication style, etc.
   - The multi-step form collects data across 8 categories: Personal Details, Life Story, Personality, Interests, Relationships, Values, Communication, and AI Behavior

2. **Data Storage**:
   - Data is formatted according to the Verida Favourite schema
   - The twin is stored in the user's encrypted Verida database
   - The twin is linked to the user's DID for authentication

3. **Twin Updating**:
   - Existing twins can be loaded and modified
   - Updates preserve the original record ID to avoid duplication

4. **Real-time Preview**:
   - Users can preview how their AI twin will respond to messages
   - Interactive chat simulation shows personality and communication style

### AI Twin Usage Flow

1. **Twin Creation/Updating**:
   - User creates or updates their AI twin through the multi-step form
   - All data is preserved in the Verida blockchain for future access

2. **Twin Integration with Chat**:
   - When enabled, the AI twin can respond on behalf of the user in chat conversations
   - The AI twin uses the stored personality data to generate authentic responses

3. **Privacy Controls**:
   - Users can specify confidential information that the twin should never share
   - Proactiveness levels control how often the twin initiates conversations

### Implementation Details

Key files for the AI Twin system:

- `app/lib/verida-ai-twin-service.ts`: Core service for AI twin operations with Verida blockchain
- `app/lib/clientside-verida.tsx`: Client-side wrapper for Verida functions with React hooks
- `app/create-twin/page.tsx`: Main page component for AI twin creation
- `app/create-twin/components/ai-twin-creation-form.tsx`: Multi-step form for capturing twin data
- `app/create-twin/components/ai-twin-preview.tsx`: Interactive preview of the AI twin's behavior

## Development

### Project Structure

```
app/
├── lib/
│   ├── verida-config.ts          # Centralized Verida configuration and tokens
│   ├── verida-client.ts          # Verida client configuration
│   ├── verida-client-wrapper.tsx  # Client-side wrapper for Verida client
│   ├── clientside-verida.tsx     # React hooks for Verida integration
│   ├── verida-schema-mapping.ts  # Maps app data to Verida schemas
│   ├── verida-token-utils.ts     # Utilities for managing API tokens
│   ├── profile-service.ts        # Service for profile data using SDK
│   ├── profile-rest-service.ts   # REST API service for profile operations
│   ├── verida-ai-twin-service.ts # AI Twin service for Verida blockchain
│   ├── chat-message-service.ts   # Chat service for blockchain messages
│   ├── cheqd-service.ts          # Cheqd service for DID operations
│   ├── ai-twin-chat-service.ts   # AI twin chat response generation service
│   ├── verida-llm-service.ts     # Verida LLM API integration service
│   └── prompts/                  # AI prompt templates
│       ├── ai-twin-prompts.ts    # AI twin personality prompts
│       └── chat-suggestions-prompts.ts # Chat suggestion prompts
├── services/
│   ├── nft-service.ts            # NFT contract interaction service
│   └── profile-metadata-service.ts # Metadata generation for NFTs
├── onboarding/                   # Onboarding flow components
│   └── components/               # Onboarding step components
│       ├── connect-wallet-step.tsx # Wallet connection step (Verida & Cheqd)
│       ├── create-did-step.tsx   # DID creation step
│       ├── verification-step.tsx # User verification step
│       └── success-step.tsx      # Onboarding completion step
├── profile/                      # Profile creation components
│   └── components/               # Profile creation step components
│       ├── basic-info-step.tsx   # Basic profile info collection
│       ├── photos-step.tsx       # Photo upload and management
│       ├── preferences-step.tsx  # Interests and preferences collection
│       ├── mint-nft-step.tsx     # NFT minting functionality
│       └── success-step.tsx      # Profile creation completion
├── user/                         # User profile components
│   └── components/               # User profile components
│       ├── profile-snapshot.tsx  # Profile overview display
│       ├── nft-details.tsx       # NFT profile details display
│       ├── did-settings.tsx      # DID management settings
│       ├── off-chain-data.tsx    # Off-chain data management
│       └── edit-profile-modal.tsx # Profile editing functionality
├── chats/                        # Chat interface components
│   ├── page.tsx                  # Main chat page
│   └── components/               # Chat UI components
│       ├── chat-interface.tsx    # Main chat orchestrator
│       ├── chat-list.tsx         # Conversation list
│       └── conversation-panel.tsx # Individual conversation view with AI mode
├── chat-with-twin/               # AI Twin chat interface
│   └── page.tsx                  # Dedicated page for chatting with your AI twin
├── explore/                      # Match discovery components
│   └── page.tsx                  # Main explore/discovery page
├── components/                   # Shared UI components
│   ├── ui/                       # UI component library
│   │   └── heart-loader.tsx      # Heart-themed loading animation
│   └── dating-navbar.tsx         # Main navigation component
└── create-twin/                  # AI Twin creation components
    ├── page.tsx                  # Main AI Twin creation page
    └── components/               # AI Twin creation components
        ├── ai-twin-creation-form.tsx  # Multi-step form for AI Twin creation
        └── ai-twin-preview.tsx        # Interactive AI Twin preview
```

### Centralized Configuration System

The application uses a centralized configuration system to manage Verida, Cheqd, and NFT-related settings:

1. **Configuration Files**: 
   - `app/lib/verida-config.ts` contains all Verida-related settings
   - `app/lib/cheqd-service.ts` contains Cheqd API configuration
   - `app/services/nft-service.ts` contains NFT contract configuration

2. **Key Configuration Parameters**:
   - `AUTH_TOKEN`: Authentication token for Verida REST API access
   - `API_BASE_URL`: Base URL for Verida API endpoints
   - `VERIDA_NETWORK`: Network setting ('testnet' or 'mainnet')
   - `DB_NAMES`: Object containing all database collection names
   - `APP_INFO`: Application metadata and versioning
   - `CHEQD_API_KEY`: Authentication token for Cheqd API access
   - `CHEQD_API_BASE_URL`: Base URL for Cheqd API endpoints
   - `NFT_CONTRACT_ADDRESS`: Address of the deployed NFT contract
   - `UNICHAIN_RPC_URL`: RPC URL for the Unichain Sepolia network

## Resources

- [Verida Documentation](https://developers.verida.network/protocol/client-sdk)
- [Verida Client SDK](https://developers.verida.network/protocol/client-sdk/how-it-works)
- [Verida Authentication](https://developers.verida.network/protocol/client-sdk/authentication)
- [Cheqd Documentation](https://docs.cheqd.io/)
- [NFT-MINTING.md](./NFT-MINTING.md) - Detailed guide on NFT profile minting
- [CHEQD-NFT-CREATION.md](./CHEQD-NFT-CREATION.md) - Details on Cheqd DID integration

