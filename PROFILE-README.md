# DecentralMatch Profile System

## Decentralized Profile Creation and NFT Minting

This document details the profile creation and NFT minting functionality of the DecentralMatch dating application, which uses Verida protocol for decentralized identity and data storage.

## Architecture Overview

The profile system provides users with complete ownership and control over their dating profile data through:

1. **Decentralized Identity (DID)** - User-owned identity anchored on the blockchain
2. **Encrypted Data Storage** - Profile information stored in user-controlled encrypted databases
3. **Self-Sovereign Profiles** - Users fully own their profile data
4. **NFT Representation** - Profiles can be minted as NFTs on the Cheqd protocol

## Core Components

### Client Infrastructure

* **`verida-client.ts`** - Core singleton client that manages Verida SDK initialization, connection, and context management
* **`verida-client-wrapper.tsx`** - Client-side wrapper for the Verida client to handle client/server rendering
* **`clientside-verida.tsx`** - React hooks for accessing Verida services in components

### Data Services

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

## Database Schema

### Profile Data (`social_post` schema)

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

### Photos Data (`file` schema)

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

### Preferences Data (`social_following` schema)

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

## NFT Profile Minting

The NFT minting process:

1. **Data Preparation** - Formats profile data and metadata for on-chain representation
2. **On-Chain Storage** - Public metadata is stored on-chain
3. **Off-Chain References** - Private data remains in Verida with secure references
4. **Blockchain Transaction** - NFT is minted on the Cheqd protocol
5. **Ownership Assignment** - NFT is assigned to the user's wallet address

### NFT Metadata Structure

```javascript
{
  name: "DecentralMatch Profile - {DisplayName}",
  description: "Verified dating profile on DecentralMatch",
  image: "ipfs://hash-of-profile-image",
  attributes: [
    { trait_type: "Display Name", value: "User's display name" },
    { trait_type: "DID", value: "did:verida:user-did" },
    { trait_type: "Interest Count", value: 5 },
    { trait_type: "Photo Count", value: 3 },
    { trait_type: "Creation Date", value: "2023-05-01" }
  ],
  external_url: "https://app.decentralmatch.com/profile/{DID}"
}
```

## Data Privacy and Security

* All sensitive profile data is encrypted using Verida's encryption protocol
* Users explicitly control which data is public vs. private
* Public data available on-chain includes only basic discovery information
* Private data (specific preferences, photos, etc.) remains securely stored in Verida databases
* Access to private data requires explicit user permission

## Technical Flow

1. User creates a DID through Verida protocol
2. Profile data is stored in schema-compliant format in Verida databases
3. Data is mapped between app models and standard Verida schemas
4. When minting an NFT, public metadata is prepared for on-chain storage
5. The NFT links to the Verida-stored private data via secure references
6. User maintains full control of profile data and can revoke access at any time

## Implementation Notes

* The system utilizes Verida standard schemas to ensure interoperability 
* REST API services provide consistent access across platforms
* SDK fallback ensures reliability in case of API issues
* All blockchain operations require explicit user consent 