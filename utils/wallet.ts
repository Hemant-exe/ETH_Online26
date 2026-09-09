// Types for Ethereum provider request
interface RequestParams {
  method: string;
  params?: unknown[];
}

interface SwitchChainError extends Error {
  code: number;
}

// Add a type for the Ethereum provider
interface EthereumProvider {
  request: (args: RequestParams) => Promise<unknown>;
  isLeap?: boolean;
  isMetaMask?: boolean;
}

// Define types for the Leap wallet
declare global {
  interface Window {
    leap: {
      enable: (chainId: string) => Promise<string[]>;
      disconnect: (chainId: string) => Promise<void>;
      getOfflineSigner: (chainId: string) => unknown;
      experimentalSuggestChain?: (chainInfo: ChainInfo) => Promise<void>;
      ethereum?: {
        request: (args: RequestParams) => Promise<unknown>;
        isLeap?: boolean;
      };
    };
    ethereum?: {
      request: (args: RequestParams) => Promise<unknown>;
      isLeap?: boolean;
    };
  }
}

// Chain info interface
interface ChainInfo {
  chainId: string;
  chainName: string;
  rpc: string;
  rest: string;
  bip44: {
    coinType: number;
  };
  bech32Config: {
    bech32PrefixAccAddr: string;
    bech32PrefixAccPub: string;
    bech32PrefixValAddr: string;
    bech32PrefixValPub: string;
    bech32PrefixConsAddr: string;
    bech32PrefixConsPub: string;
  };
  currencies: Currency[];
  feeCurrencies: Currency[];
  stakeCurrency: Currency;
  coinType: number;
  gasPriceStep: {
    low: number;
    average: number;
    high: number;
  };
}

interface Currency {
  coinDenom: string;
  coinMinimalDenom: string;
  coinDecimals: number;
}

// Chain ID for Cosmos
export const COSMOS_CHAIN_ID = "cosmoshub-4";

// Chain info for Unichain Sepolia
export const UNICHAIN_SEPOLIA_CHAIN_ID = "1301";

// This is the correct format required by EIP-3085
// Use '0x515' instead of '0x0515' to avoid the padding issue
export const UNICHAIN_SEPOLIA = {
  // The proper hexadecimal representation without padding
  hexChainId: '0x515',
  params: {
    chainId: '0x515', // Must be a 0x-prefixed, non-padded, non-zero hexadecimal string
    chainName: 'Unichain Sepolia',
    nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://sepolia.unichain.org'],
    blockExplorerUrls: ['https://sepolia.uniscan.xyz'],
  },
};

// Define chain info for Cosmos - only needed if using experimentalSuggestChain
export const COSMOS_CHAIN_INFO = {
  chainId: COSMOS_CHAIN_ID,
  chainName: "Cosmos Hub",
  rpc: "https://rpc.cosmos.network",
  rest: "https://rest.cosmos.network",
  bip44: {
    coinType: 118,
  },
  bech32Config: {
    bech32PrefixAccAddr: "cosmos",
    bech32PrefixAccPub: "cosmospub",
    bech32PrefixValAddr: "cosmosvaloper",
    bech32PrefixValPub: "cosmosvaloperpub",
    bech32PrefixConsAddr: "cosmosvalcons",
    bech32PrefixConsPub: "cosmosvalconspub",
  },
  currencies: [
    {
      coinDenom: "ATOM",
      coinMinimalDenom: "uatom",
      coinDecimals: 6,
    },
  ],
  feeCurrencies: [
    {
      coinDenom: "ATOM",
      coinMinimalDenom: "uatom",
      coinDecimals: 6,
    },
  ],
  stakeCurrency: {
    coinDenom: "ATOM",
    coinMinimalDenom: "uatom",
    coinDecimals: 6,
  },
  coinType: 118,
  gasPriceStep: {
    low: 0.01,
    average: 0.025,
    high: 0.04,
  },
};

/**
 * Check if the Leap wallet extension is installed
 */
export const isLeapWalletInstalled = (): boolean => {
  return window.leap !== undefined;
};

/**
 * Get the Leap wallet Ethereum provider, not any other wallet
 */
export const getLeapProvider = (): EthereumProvider | null => {
  // First try window.leap.ethereum which is specific to Leap
  if (window.leap?.ethereum) {
    console.log("Using window.leap.ethereum provider");
    return window.leap.ethereum;
  }
  
  // As fallback, check if window.ethereum is from Leap (avoid MetaMask)
  if (window.ethereum && (window.ethereum.isLeap === true)) {
    console.log("Using window.ethereum provider from Leap");
    return window.ethereum;
  }
  
  console.log("No Leap wallet provider found");
  return null;
};

/**
 * Connect to the Leap wallet - specifically for Unichain Sepolia
 * @returns {Promise<string>} The connected wallet address
 */
export const connectLeap = async (): Promise<string> => {
  try {
    if (!isLeapWalletInstalled()) {
      throw new Error("Leap wallet not installed");
    }
    
    console.log("Attempting to connect to Unichain Sepolia via Leap wallet");
    console.log("Chain ID (decimal):", UNICHAIN_SEPOLIA_CHAIN_ID);
    console.log("Chain ID (hex):", UNICHAIN_SEPOLIA.hexChainId);
    
    // Get the Leap-specific provider
    const provider = getLeapProvider();
    
    if (!provider) {
      throw new Error("No Leap wallet Ethereum provider found. Make sure Leap wallet is installed and enabled.");
    }
    
    try {
      // First try to switch chains
      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: UNICHAIN_SEPOLIA.hexChainId }]
        });
        console.log("Switched to Unichain Sepolia chain");
      } catch (error) {
        // Cast to the error type we defined earlier
        const switchError = error as SwitchChainError;
        
        // If the chain doesn't exist, add it
        if (switchError.code === 4902) {
          console.log("Chain not found in wallet, adding it now");
          console.log("Adding with params:", JSON.stringify(UNICHAIN_SEPOLIA.params));
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [UNICHAIN_SEPOLIA.params]
          });
          console.log("Added Unichain Sepolia to wallet");
        } else {
          console.warn("Error switching chains:", switchError);
          console.warn("Error message:", switchError.message);
          console.warn("Error code:", switchError.code);
          // If it's not a 4902 error, rethrow it
          throw switchError;
        }
      }
      
      // Request accounts
      console.log("Requesting accounts for Unichain Sepolia from Leap wallet");
      const accounts = await provider.request({ method: 'eth_requestAccounts' }) as string[];
      
      if (accounts && accounts.length > 0) {
        console.log("Connected via Leap wallet:", accounts[0]);
        return accounts[0];
      } else {
        throw new Error("No accounts returned from Leap wallet. Please make sure you've created an account for Unichain Sepolia.");
      }
    } catch (evmError) {
      console.warn("Leap wallet EVM connection failed:", evmError);
      throw evmError;
    }
  } catch (error) {
    console.error("Error connecting to Leap wallet:", error);
    throw error;
  }
};

/**
 * Disconnect from the Leap wallet
 */
export const disconnectLeap = async (): Promise<void> => {
  try {
    if (!isLeapWalletInstalled()) {
      throw new Error("Leap wallet not installed");
    }
    
    // Leap doesn't support wallet_disconnectSite method
    // Instead, we'll clear local storage
    // This is a client-side disconnect that doesn't affect the wallet's connection state
    // but effectively disconnects the user from the app
    
    console.log("Disconnecting Leap wallet (client-side)");
    
    // Clear stored address from localStorage only
    localStorage.removeItem("walletAddress");
    
    // Optionally try the standard Leap disconnect method (may not work for EVM chains)
    try {
      if (window.leap && window.leap.disconnect) {
        await window.leap.disconnect(UNICHAIN_SEPOLIA_CHAIN_ID);
        console.log(`Attempted disconnect from chain ${UNICHAIN_SEPOLIA_CHAIN_ID}`);
      }
    } catch (disconnectError) {
      console.warn("Standard Leap disconnect method failed (expected for EVM chains):", disconnectError);
      // This is expected to fail for EVM chains, so we don't rethrow
    }
    
    // Dispatch storage event to notify other components
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'walletAddress',
      oldValue: localStorage.getItem('walletAddress'),
      newValue: null
    }));
    
    console.log("Wallet disconnected (client-side)");
  } catch (error) {
    console.error("Error during wallet disconnect:", error);
    // Don't throw the error, as we want the UI to update regardless
  }
};

/**
 * Format an address to display a shortened version
 * @param {string} address - The full wallet address
 * @param {number} prefixLength - Number of characters to show at the beginning
 * @param {number} suffixLength - Number of characters to show at the end
 * @returns {string} Formatted address (e.g., "cosmos1abc...xyz")
 */
export const formatAddress = (
  address: string,
  prefixLength: number = 6,
  suffixLength: number = 4
): string => {
  if (!address) return "";
  
  if (address.length <= prefixLength + suffixLength) {
    return address;
  }
  
  return `${address.slice(0, prefixLength)}...${address.slice(-suffixLength)}`;
};

export const WALLETCONNECT_METHODS = [
  "eth_sendTransaction",
  "personal_sign",
  "eth_signTypedData",
  "eth_sign"
]

export const WALLETCONNECT_EVENTS = ["accountsChanged", "chainChanged"]
