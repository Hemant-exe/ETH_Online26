import { nftService } from '@/app/services/nft-service';
import { ethers } from 'ethers';

export interface ExistingNFTResult {
  hasNFT: boolean;
  tokenId: string;
  error?: string;
}

/**
 * Checks if a wallet address already has a profile NFT
 * 
 * @returns Object containing whether user has NFT, token ID if they do, and any error
 */
export async function checkExistingNFT(): Promise<ExistingNFTResult> {
  try {
    // Get the wallet provider
    const provider = await nftService.getProvider();
    if (!provider) {
      return {
        hasNFT: false,
        tokenId: '',
        error: "Cannot connect to wallet provider"
      };
    }

    // Get the current wallet address
    const signer = provider.getSigner();
    const walletAddress = await signer.getAddress();

    // Check if this address already has a profile NFT
    const hasProfile = await nftService.hasProfile(walletAddress);

    if (hasProfile) {
      // Get the token ID
      const tokenId = await nftService.getProfileTokenId(walletAddress);
      return {
        hasNFT: true,
        tokenId
      };
    }

    return {
      hasNFT: false,
      tokenId: ''
    };
  } catch (error) {
    console.error("Error checking for existing NFT:", error);
    return {
      hasNFT: false,
      tokenId: '',
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}

/**
 * Loads existing NFT data from localStorage or from the blockchain
 * 
 * @returns The NFT data or null if not found
 */
export async function loadExistingNFTData(): Promise<any | null> {
  // First check localStorage
  const storedNFTData = localStorage.getItem("nftData");
  if (storedNFTData) {
    try {
      return JSON.parse(storedNFTData);
    } catch (e) {
      console.error("Error parsing stored NFT data:", e);
    }
  }

  // If not in localStorage, try checking on-chain
  const existingNFT = await checkExistingNFT();
  if (existingNFT.hasNFT && existingNFT.tokenId) {
    // Create a minimum NFT data object
    const nftData = {
      tokenId: existingNFT.tokenId,
      contractAddress: nftService.getContractAddress(),
      transactionHash: "unknown", // We don't have this without scanning blockchain events
      mintDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      chainId: "1301",
      chainName: "Unichain Sepolia",
    };
    
    // Store for future use
    localStorage.setItem("nftData", JSON.stringify(nftData));
    return nftData;
  }

  return null;
} 