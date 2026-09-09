import { ethers } from "ethers";
import ProfileNFTABI from "@/abi/ProfileNFT.json";
import { getLeapProvider } from "@/utils/wallet";

// Contract address on Unichain Sepolia
// This is the official deployed contract address
const PROFILE_NFT_CONTRACT_ADDRESS = "0x968Cd0A56cAc23332c846957064A99Eabbdc464E";

export interface ProfileNFTService {
  createProfile(tokenURI: string): Promise<{ tokenId: string, txHash: string }>;
  updateProfile(tokenId: string, tokenURI: string): Promise<{ txHash: string }>;
  burnProfile(tokenId: string): Promise<{ txHash: string }>;
  hasProfile(address: string): Promise<boolean>;
  getProfileTokenId(address: string): Promise<string>;
  getProfileURI(tokenId: string): Promise<string>;
  getContractAddress(): string;
  getProvider(): ethers.providers.Web3Provider | null;
}

export class Web3ProfileNFTService implements ProfileNFTService {
  private contract: ethers.Contract | null = null;
  private provider: ethers.providers.Web3Provider | null = null;
  private signer: ethers.Signer | null = null;
  
  constructor() {
    this.initialize();
  }
  
  private async initialize() {
    try {
      // Get the provider from Leap wallet
      const ethereumProvider = getLeapProvider();
      
      if (!ethereumProvider) {
        throw new Error("No Ethereum provider available");
      }
      
      // Create ethers provider using the Leap provider
      this.provider = new ethers.providers.Web3Provider(ethereumProvider as any);
      
      // Get the signer (account)
      this.signer = this.provider.getSigner();
      
      // Create contract instance
      this.contract = new ethers.Contract(
        PROFILE_NFT_CONTRACT_ADDRESS,
        ProfileNFTABI.abi,
        this.signer
      );
      
      console.log("NFT Service initialized successfully");
    } catch (error) {
      console.error("Error initializing NFT service:", error);
      throw error;
    }
  }
  
  /**
   * Get the contract address
   * @returns The NFT contract address
   */
  getContractAddress(): string {
    return PROFILE_NFT_CONTRACT_ADDRESS;
  }
  
  /**
   * Create a new profile NFT
   * @param tokenURI - IPFS or Verida URI pointing to profile metadata
   */
  async createProfile(tokenURI: string): Promise<{ tokenId: string, txHash: string }> {
    try {
      if (!this.contract) await this.initialize();
      
      console.log("Creating profile with URI:", tokenURI);
      
      // Call the createProfile function from the smart contract
      const tx = await this.contract!.createProfile(tokenURI);
      
      // Wait for transaction to be mined
      console.log("Waiting for transaction to be mined...");
      const receipt = await tx.wait();
      
      // Find the ProfileCreated event in the transaction logs
      const profileCreatedEvent = receipt.events?.find(
        (event: any) => event.event === "ProfileCreated"
      );
      
      if (!profileCreatedEvent) {
        throw new Error("ProfileCreated event not found in transaction logs");
      }
      
      // Extract tokenId from the event
      const tokenId = profileCreatedEvent.args.tokenId.toString();
      
      return {
        tokenId,
        txHash: receipt.transactionHash
      };
    } catch (error) {
      console.error("Error creating profile NFT:", error);
      throw error;
    }
  }
  
  /**
   * Update an existing profile NFT
   * @param tokenId - ID of the profile NFT to update
   * @param tokenURI - New IPFS or Verida URI pointing to updated profile metadata
   */
  async updateProfile(tokenId: string, tokenURI: string): Promise<{ txHash: string }> {
    try {
      if (!this.contract) await this.initialize();
      
      // Call the updateProfile function from the smart contract
      const tx = await this.contract!.updateProfile(tokenId, tokenURI);
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      
      return {
        txHash: receipt.transactionHash
      };
    } catch (error) {
      console.error("Error updating profile NFT:", error);
      throw error;
    }
  }
  
  /**
   * Burn (delete) a profile NFT
   * @param tokenId - ID of the profile NFT to burn
   */
  async burnProfile(tokenId: string): Promise<{ txHash: string }> {
    try {
      if (!this.contract) await this.initialize();
      
      // Call the burnProfile function from the smart contract
      const tx = await this.contract!.burnProfile(tokenId);
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      
      return {
        txHash: receipt.transactionHash
      };
    } catch (error) {
      console.error("Error burning profile NFT:", error);
      throw error;
    }
  }
  
  /**
   * Check if an address already has a profile NFT
   * @param address - Ethereum address to check
   */
  async hasProfile(address: string): Promise<boolean> {
    try {
      if (!this.contract) await this.initialize();
      
      // Call the hasProfile function from the smart contract
      return await this.contract!.hasProfile(address);
    } catch (error) {
      console.error("Error checking if address has profile:", error);
      throw error;
    }
  }
  
  /**
   * Get the token ID of a profile NFT owned by an address
   * @param address - Ethereum address to check
   */
  async getProfileTokenId(address: string): Promise<string> {
    try {
      if (!this.contract) await this.initialize();
      
      // Call the UserProfileId function from the smart contract
      const tokenId = await this.contract!.UserProfileId(address);
      return tokenId.toString();
    } catch (error) {
      console.error("Error getting profile token ID:", error);
      throw error;
    }
  }
  
  /**
   * Get the tokenURI of a profile NFT
   * @param tokenId - ID of the profile NFT
   */
  async getProfileURI(tokenId: string): Promise<string> {
    try {
      if (!this.contract) await this.initialize();
      
      // Call the tokenURI function from the smart contract
      return await this.contract!.tokenURI(tokenId);
    } catch (error) {
      console.error("Error getting profile URI:", error);
      throw error;
    }
  }
  
  /**
   * Get the provider
   * @returns The Web3Provider if available
   */
  getProvider(): ethers.providers.Web3Provider | null {
    return this.provider;
  }
}

// Singleton instance of the NFT service
export const nftService = new Web3ProfileNFTService(); 