# Cheqd NFT Creation Guide

This document explains how the platform integrates Cheqd decentralized identity with NFT profiles on Unichain Sepolia blockchain.

## Table of Contents

- [Overview](#overview)
- [Technical Components](#technical-components)
  - [Smart Contract](#smart-contract)
  - [Cheqd Integration](#cheqd-integration)
  - [DID Document Structure](#did-document-structure)
- [NFT Minting Process](#nft-minting-process)
  - [Preparation](#preparation)
  - [Minting](#minting)
  - [DID Update](#did-update)
  - [Storage](#storage)
- [Error Handling](#error-handling)
- [Security and Privacy](#security-and-privacy)
- [Implementation Files](#implementation-files)
- [Advanced Features](#advanced-features)
- [Troubleshooting](#troubleshooting)
- [Future Roadmap](#future-roadmap)

## Overview

The Dating Blockchain platform creates a secure digital identity solution by:
1. Linking Cheqd DIDs with NFT profiles
2. Storing sensitive data off-chain via Verida protocol
3. Recording ownership and verification on-chain via NFT minting
4. Creating a verifiable connection between different identity systems

This architecture provides both security and privacy, allowing users to control their data while maintaining verifiable credentials.

## Technical Components

### Smart Contract

The Profile NFT contract is deployed at `0x968Cd0A56cAc23332c846957064A99Eabbdc464E` on Unichain Sepolia and provides:

- One profile NFT per wallet address
- Profile metadata linked to Verida storage
- Ownership verification and transfer capabilities
- Immutable record of profile creation and updates

The contract implements the ERC-721 standard with custom extensions for profile management.

### Cheqd Integration 

When a profile NFT is minted, the following occurs:

1. User's Cheqd DID document is updated to include:
   - NFT transaction details
   - Token ID reference
   - Verida DID link for encrypted data access
   - Contract address and chain information

2. The integration uses Cheqd's DID Document Update API to add service endpoints that reference:
   - The blockchain transaction details
   - The Verida DID for encrypted data access
   - Verification methods for identity proofing

### DID Document Structure

The DID document includes multiple service endpoints:

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

## NFT Minting Process

### Preparation

1. **Wallet Connection**:
   - User connects both Leap wallet (for blockchain transactions) and Cheqd wallet (for DID)
   - Profile data is collected and stored encrypted via Verida protocol
   - Metadata is prepared for the NFT

2. **Data Organization**:
   - Public data is prepared for on-chain reference
   - Private data is encrypted and stored in Verida
   - DID references are collected for linking identities

### Minting

1. **NFT Creation**:
   - The NFT contract verifies the user doesn't already have a profile NFT 
   - NFT is minted with a URI pointing to the encrypted profile data
   - Transaction hash and token ID are recorded

2. **Transaction Verification**:
   - The system monitors the transaction status
   - Once confirmed, it retrieves the token ID and transaction details
   - This information is used to update the DID document

### DID Update

1. **Cheqd DID document is updated** to include NFT information:
   - The system retrieves the user's Cheqd DID document
   - It adds the NFT information as a service endpoint
   - It adds the Verida DID reference for encrypted data access
   - The updated document is signed and submitted to the Cheqd network

2. **Verification**:
   - The system verifies the DID document was successfully updated
   - It checks that all required information is present and correct
   - It confirms the cryptographic links between DIDs and the NFT

### Storage

1. **Transaction details** are saved in localStorage for app reference:
   ```javascript
   // Example localStorage structure
   {
     "nftData": {
       "tokenId": "4152",
       "contractAddress": "0x968Cd0A56cAc23332c846957064A99Eabbdc464E",
       "transactionHash": "0x52178bef007c0224e5a65261f507d18a3db923280a618b13b1c4dff793060f8b",
       "mintDate": "2023-09-10T11:20:00Z",
       "lastUpdated": "2023-09-10T11:20:00Z",
       "explorerUrl": "https://sepolia.uniscan.xyz/tx/0x52178bef007c0224e5a65261f507d18a3db923280a618b13b1c4dff793060f8b",
       "chainId": "1301",
       "chainName": "Unichain Sepolia"
     },
     "veridaDID": "did:vda:mainnet:0x8bf89E3eA0751d3B827EF2EBD2fa4685d1F8C7f2",
     "cheqdWalletAddress": "did:cheqd:testnet:abcd1234"
   }
   ```

2. **Profile display** shows verification from blockchain:
   - NFT ownership is displayed in the user interface
   - Verification status is shown to other users
   - Links to blockchain explorers provide transparency

## Error Handling

The smart contract prevents a single address from minting multiple NFTs. If a user attempts to mint when they already have an NFT, the transaction will fail with:

```
Error: execution reverted: Already minted
```

In this case, the application should:
1. Check if user already has an NFT before attempting to mint
2. If already minted, load existing NFT details instead
3. Allow profile updates without requiring a new NFT

Additional error handling includes:

- **DID update failure**: If the Cheqd DID update fails, the system retries or provides manual update options
- **Transaction timeout**: For slow or failed transactions, the system provides status updates and retry options
- **Wallet connection issues**: Clear error messages guide users through wallet connection problems

## Security and Privacy

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

## Implementation Files

Key files in the implementation:
- `app/lib/cheqd-service.ts` - Cheqd DID management
- `app/services/nft-service.ts` - NFT contract interaction
- `app/profile/components/steps/mint-nft-step.tsx` - NFT minting UI
- `app/user/components/nft-details.tsx` - NFT display UI
- `app/user/components/off-chain-data.tsx` - Verida data display
- `app/user/components/did-settings.tsx` - DID management UI
- `utils/nft-check.ts` - NFT ownership verification utilities

## Advanced Features

The integration between Cheqd and NFT profiles enables several advanced features:

1. **Verifiable Credentials**:
   - The platform can issue credentials attesting to profile verification
   - These credentials are linked to the user's Cheqd DID
   - They can be verified by other services without revealing private data

2. **Cross-chain Verification**:
   - The architecture supports verification across different blockchains
   - The DID document can reference NFTs on multiple chains
   - This enables interoperability with various blockchain ecosystems

3. **Selective Disclosure**:
   - Users can choose which profile information to share
   - Zero-knowledge proofs can verify claims without revealing data
   - This enhances privacy while maintaining trust

4. **Decentralized Reputation**:
   - User reputation can be built and verified on-chain
   - Feedback and interactions create a verifiable history
   - This helps build trust in the dating platform

## Troubleshooting

If you encounter errors during minting:

1. **"Already minted"** - This wallet address already has an NFT profile
   - Solution: Check if the wallet has an NFT before attempting to mint
   - Use the `hasProfile()` method from the NFT service
   - If you need a new profile, you must first burn the existing one

2. **DID update failure** - Cheqd DID document wasn't updated
   - Solution: The minting process will continue, but you may need to manually update the DID document
   - Check that your Cheqd wallet is properly connected
   - Verify that you have the correct permissions to update the DID

3. **Transaction timeout** - Blockchain transaction took too long
   - Solution: Check the transaction on the explorer or try again with higher gas
   - Monitor the transaction status in the blockchain explorer
   - If the transaction fails, the UI will provide options to retry

4. **Wallet connection issues** - Unable to connect wallets
   - Solution: Ensure you have the correct wallet extensions installed
   - Check that you're on the correct network (Unichain Sepolia)
   - Follow the wallet connection guide in the application

## Future Roadmap

The integration between Cheqd and NFT profiles will be enhanced with:

1. **Advanced Verification**:
   - Zero-knowledge proofs for privacy-preserving verification
   - Biometric authentication options
   - Multi-factor authentication using DIDs

2. **Governance Framework**:
   - DAO-based governance for platform rules
   - Community-driven trust scoring
   - Decentralized dispute resolution

3. **Interoperability**:
   - Support for additional DID methods
   - Integration with more blockchain networks
   - Compatibility with emerging identity standards

4. **Enhanced Privacy**:
   - Improved encryption mechanisms
   - Private transactions for NFT minting
   - Selective disclosure protocols 