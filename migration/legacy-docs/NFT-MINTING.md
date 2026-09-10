# NFT Profile Minting

This guide explains how to use the NFT minting functionality in the DecentralMatch dating app, which allows users to mint their profiles as NFTs on the Unichain Sepolia blockchain.

## Table of Contents

- [Overview](#overview)
- [Technical Implementation](#technical-implementation)
  - [Smart Contract](#smart-contract)
  - [Frontend Services](#frontend-services)
  - [User Flow](#user-flow)
- [Installation and Setup](#installation-and-setup)
  - [Prerequisites](#prerequisites)
  - [Contract Deployment](#contract-deployment)
  - [Environment Configuration](#environment-configuration)
- [Usage](#usage)
  - [Minting Process](#minting-process)
  - [Updating Profiles](#updating-profiles)
  - [Viewing NFT Details](#viewing-nft-details)
- [Troubleshooting](#troubleshooting)
- [Security Considerations](#security-considerations)
- [Future Enhancements](#future-enhancements)
- [Related Documentation](#related-documentation)

## Overview

The NFT minting functionality allows users to:
- Create a tamper-proof representation of their profile on the blockchain
- Link their Verida DID (`did:vda:mainnet:0x8bf89E3eA0751d3B827EF2EBD2fa4685d1F8C7f2`) with their on-chain identity
- Control ownership and access to their profile data
- Establish verifiable credentials for dating platform identity

This approach combines the benefits of blockchain immutability with the privacy of off-chain data storage, creating a secure and user-controlled dating profile system.

## Technical Implementation

### Smart Contract

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

function hasProfile(address user) public view returns (bool) {
    // Check if user has profile...
}

function getUserProfileId(address user) public view returns (uint256) {
    // Get user's profile token ID...
}
```

### Frontend Services

The following services handle interaction with the blockchain:

1. **NFT Service** (`app/services/nft-service.ts`)
   - Handles all contract interactions using ethers.js
   - Takes care of transaction management, errors, and event parsing
   - Provides methods for checking existing NFTs, minting, and updating
   
   ```typescript
   // Example of key methods
   async createProfile(tokenURI: string): Promise<{ tokenId: string, txHash: string }>
   async updateProfile(tokenId: string, newTokenURI: string): Promise<string>
   async hasProfile(address: string): Promise<boolean>
   async getProfileTokenId(address: string): Promise<string>
   ```
   
2. **Metadata Service** (`app/services/profile-metadata-service.ts`)
   - Generates proper metadata for the NFT
   - Stores profile data in Verida and generates a URI
   - Handles encryption and access control for sensitive data

3. **Wallet Integration** (`utils/wallet.ts`)
   - Handles wallet connection with Leap wallet
   - Manages chain switching to Unichain Sepolia
   - Provides utility functions for address formatting and transaction signing

4. **NFT Check Utilities** (`utils/nft-check.ts`)
   - Provides functions to check if a user already has an NFT
   - Loads existing NFT data from localStorage or blockchain
   - Handles redirection based on NFT ownership status

### User Flow

1. **Profile Creation**:
   - User fills out profile information (basic info, photos, preferences)
   - Information is stored encrypted in Verida storage
   - User connects their Leap wallet for blockchain transactions

2. **NFT Minting**:
   - In the final step, user reviews their profile and mints it as an NFT
   - The system generates metadata and stores it in Verida
   - The NFT is minted on the Unichain Sepolia blockchain
   - Transaction details are stored in localStorage for future reference

3. **Profile Management**:
   - User can view their NFT details in the user dashboard
   - They can update their profile information, which updates the NFT metadata
   - Changes are tracked on-chain for verification purposes

4. **Identity Verification**:
   - The NFT serves as proof of profile ownership
   - Other users can verify the authenticity of the profile
   - The system prevents duplicate profiles from the same wallet address

## Installation and Setup

### Prerequisites

- Node.js v16+ and npm/yarn
- Leap wallet extension installed in your browser
- ETH in your wallet for gas fees on Unichain Sepolia
- Access to Verida and Cheqd networks

### Contract Deployment

Before using the NFT functionality, deploy the contract:

1. Clone the repository and install dependencies:
   ```bash
   git clone https://github.com/hiten1010/Dating-Blockchain.git
   cd Dating-Blockchain
   npm install
   ```

2. Create a `.env` file with your private key:
   ```
   PRIVATE_KEY=your_wallet_private_key
   UNICHAIN_RPC_URL=https://sepolia.unichain.org
   ```

3. Run the deployment script:
   ```bash
   npx hardhat run scripts/deploy-profile-nft.js --network unichainSepolia
   ```

4. Update the contract address in `app/services/nft-service.ts`:
   ```typescript
   const PROFILE_NFT_CONTRACT_ADDRESS = "your_deployed_contract_address";
   ```

### Environment Configuration

Configure the application to work with the deployed contract:

1. Set up the required environment variables in `.env.local`:
   ```
   NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0x968Cd0A56cAc23332c846957064A99Eabbdc464E
   NEXT_PUBLIC_UNICHAIN_RPC_URL=https://sepolia.unichain.org
   NEXT_PUBLIC_VERIDA_CONTEXT=DecentralMatch Dating Application
   ```

2. Configure the Verida client in `app/lib/verida-client.ts`

3. Set up the Cheqd integration in `app/lib/cheqd-service.ts`

## Usage

### Minting Process

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

### Updating Profiles

When a user updates their profile, the NFT metadata should be updated as well:

```typescript
// Get the user's token ID
const tokenId = await nftService.getProfileTokenId(walletAddress);

// Generate updated metadata
const updatedMetadata = profileMetadataService.generateMetadata(newProfileData, didId);
const newTokenURI = await profileMetadataService.storeMetadata(updatedMetadata);

// Update the NFT
const txHash = await nftService.updateProfile(tokenId, newTokenURI);

// Update localStorage
const nftData = JSON.parse(localStorage.getItem("nftData") || "{}");
localStorage.setItem("nftData", JSON.stringify({
  ...nftData,
  lastUpdated: new Date().toISOString(),
  transactionHash: txHash
}));
```

### Viewing NFT Details

Users can view their NFT details in the user dashboard:

```typescript
// In nft-details.tsx
useEffect(() => {
  // Try to get NFT data from localStorage
  const storedNFTData = localStorage.getItem("nftData");
  if (storedNFTData) {
    try {
      setNftData(JSON.parse(storedNFTData));
    } catch (e) {
      console.error("Error parsing stored NFT data:", e);
    }
  } else {
    // If not in localStorage, try to fetch from blockchain
    const fetchNFTData = async () => {
      try {
        const provider = await nftService.getProvider();
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        
        const hasNFT = await nftService.hasProfile(address);
        if (hasNFT) {
          const tokenId = await nftService.getProfileTokenId(address);
          // Create minimal NFT data
          const newNftData = {
            tokenId,
            contractAddress: nftService.getContractAddress(),
            // Other fields...
          };
          setNftData(newNftData);
        }
      } catch (error) {
        console.error("Error fetching NFT data:", error);
      }
    };
    
    fetchNFTData();
  }
}, []);
```

## Troubleshooting

Common issues:

1. **Wallet Connection Error**: 
   - Make sure you have Leap wallet installed and have created an account for Unichain Sepolia.
   - Check that you're on the correct network (Chain ID: 1301).
   - Try refreshing the page or reconnecting the wallet.

2. **Transaction Error**: 
   - Ensure you have enough ETH for gas fees on Unichain Sepolia.
   - Check the transaction status on the block explorer.
   - If a transaction is pending for too long, you may need to increase gas fees.

3. **"Already minted" Error**:
   - This occurs when a wallet address already has a profile NFT.
   - Use the `hasProfile()` method to check before attempting to mint.
   - If you need to create a new profile, you must first burn the existing one.

4. **Metadata Storage Issues**:
   - Ensure your Verida client is properly connected and authenticated.
   - Check that the profile data is properly formatted.
   - Verify that the tokenURI is correctly generated and accessible.

## Security Considerations

1. **Private Data Protection**:
   - Sensitive profile data is stored encrypted in Verida.
   - Only the tokenURI reference is stored on-chain.
   - Access control is managed through Verida's encryption mechanisms.

2. **NFT Ownership**:
   - Only the owner of the NFT can update or burn their profile.
   - Transfers are restricted to prevent profile theft.

3. **Identity Verification**:
   - The NFT is linked to the user's Verida DID and Cheqd DID.
   - This creates a verifiable connection between on-chain and off-chain identities.

## Future Enhancements

- **IPFS Integration**: Store profile metadata on IPFS for greater decentralization
- **Enhanced Verification**: Implement more robust verification mechanisms using zero-knowledge proofs
- **Profile Recovery**: Add mechanisms for profile recovery in case of lost wallet access
- **Multi-chain Support**: Extend functionality to other EVM-compatible chains
- **DAO Governance**: Implement community governance for platform features and rules
- **Reputation System**: Add on-chain reputation scoring for trustworthiness
- **Subscription Model**: Implement token-gated premium features using NFT attributes

## Related Documentation

- [CHEQD-NFT-CREATION.md](./CHEQD-NFT-CREATION.md) - Details on Cheqd DID integration
- [Verida Documentation](https://docs.verida.io/) - Information on Verida protocol
- [ERC-721 Standard](https://eips.ethereum.org/EIPS/eip-721) - NFT standard specification
- [Leap Wallet Documentation](https://docs.leapwallet.io/) - Wallet integration guide 