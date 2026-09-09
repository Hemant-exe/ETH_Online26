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

/**
 * Checks if user has an NFT profile and redirects to the appropriate page
 * 
 * @returns Promise that resolves to true if user has NFT, false otherwise
 */
export async function checkNFTAndRedirect(): Promise<boolean> {
  try {
    // First check if we already have NFT data in localStorage
    const storedNFTData = localStorage.getItem("nftData");
    if (storedNFTData) {
      // User has NFT data, redirect to user page
      window.location.href = "/user";
      return true;
    }
    
    // If not in localStorage, check on-chain
    const existingNFT = await checkExistingNFT();
    if (existingNFT.hasNFT) {
      // User has NFT, redirect to user page
      window.location.href = "/user";
      return true;
    } else {
      // User doesn't have NFT, redirect to onboarding
      window.location.href = "/onboarding";
      return false;
    }
  } catch (error) {
    console.error("Error checking NFT status:", error);
    // On error, default to onboarding
    window.location.href = "/onboarding";
    return false;
  }
} 