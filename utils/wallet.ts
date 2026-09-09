/**
 * EVM wallet connection.
 *
 * The wallet has exactly one job in this app: hold the profile NFT on Unichain
 * Sepolia. It is not an identity — being human is proven by World ID's Selfie
 * Check, and paying for inference is settled on Hedera. Keeping those three
 * concerns separate is deliberate: a user can be a verified human with no
 * wallet at all and still use everything except minting.
 *
 * Any EIP-1193 provider works. The previous implementation bound specifically
 * to the Leap extension (a Cosmos wallet, chosen because the old identity
 * stack was Cosmos-based); that restriction is gone, so MetaMask, Rabby, Leap
 * and anything else injecting `window.ethereum` are all accepted.
 */

interface RequestParams {
  method: string;
  params?: unknown[];
}

interface SwitchChainError extends Error {
  code: number;
}

export interface EthereumProvider {
  request: (args: RequestParams) => Promise<unknown>;
  on?: (event: string, handler: (...args: any[]) => void) => void;
  removeListener?: (event: string, handler: (...args: any[]) => void) => void;
  isLeap?: boolean;
  isMetaMask?: boolean;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
    leap?: {
      ethereum?: EthereumProvider;
    };
  }
}

/** Chain the profile NFT contract is deployed on. */
export const UNICHAIN_SEPOLIA_CHAIN_ID = '1301';

export const UNICHAIN_SEPOLIA = {
  // EIP-3085 requires a non-padded hex chain id: '0x515', never '0x0515'.
  hexChainId: '0x515',
  params: {
    chainId: '0x515',
    chainName: 'Unichain Sepolia',
    nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
    rpcUrls: [process.env.NEXT_PUBLIC_UNICHAIN_RPC_URL || 'https://sepolia.unichain.org'],
    blockExplorerUrls: ['https://sepolia.uniscan.xyz'],
  },
};

const STORED_ADDRESS_KEY = 'walletAddress';

/**
 * Returns an injected EVM provider, or null.
 *
 * `window.leap.ethereum` is checked first only because Leap injects there
 * *as well as* on `window.ethereum`, and preferring the namespaced handle
 * avoids ambiguity when several extensions are installed.
 */
export const getEvmProvider = (): EthereumProvider | null => {
  if (typeof window === 'undefined') return null;
  return window.leap?.ethereum ?? window.ethereum ?? null;
};

/** Whether any EVM wallet is available to connect. */
export const isWalletAvailable = (): boolean => getEvmProvider() !== null;

/**
 * Connects a wallet and ensures it is on Unichain Sepolia.
 *
 * Returns the connected address.
 */
export const connectWallet = async (): Promise<string> => {
  const provider = getEvmProvider();
  if (!provider) {
    throw new Error('No EVM wallet found. Install MetaMask, Rabby or Leap and reload.');
  }

  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: UNICHAIN_SEPOLIA.hexChainId }],
    });
  } catch (error) {
    const switchError = error as SwitchChainError;

    // 4902 means the wallet has never heard of this chain, so add it and let
    // the add call itself select it. Any other code is a real failure.
    if (switchError.code === 4902) {
      await provider.request({
        method: 'wallet_addEthereumChain',
        params: [UNICHAIN_SEPOLIA.params],
      });
    } else {
      throw switchError;
    }
  }

  const accounts = (await provider.request({ method: 'eth_requestAccounts' })) as string[];
  if (!accounts?.length) {
    throw new Error('Wallet returned no accounts. Create or unlock an account and try again.');
  }

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORED_ADDRESS_KEY, accounts[0]);
  }

  return accounts[0];
};

/**
 * Forgets the connected wallet.
 *
 * EIP-1193 has no "disconnect" — a dapp cannot revoke its own permission — so
 * this clears local state and notifies listeners. The wallet extension still
 * considers the site connected until the user revokes it there.
 */
export const disconnectWallet = async (): Promise<void> => {
  if (typeof window === 'undefined') return;

  const previous = window.localStorage.getItem(STORED_ADDRESS_KEY);
  window.localStorage.removeItem(STORED_ADDRESS_KEY);

  window.dispatchEvent(
    new StorageEvent('storage', {
      key: STORED_ADDRESS_KEY,
      oldValue: previous,
      newValue: null,
    }),
  );
};

/** The last connected address, if the user has connected before. */
export const getStoredAddress = (): string | null => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(STORED_ADDRESS_KEY);
};

/** Shortens an address for display, e.g. `0x1234…abcd`. */
export const formatAddress = (
  address: string,
  prefixLength: number = 6,
  suffixLength: number = 4,
): string => {
  if (!address) return '';
  if (address.length <= prefixLength + suffixLength) return address;
  return `${address.slice(0, prefixLength)}…${address.slice(-suffixLength)}`;
};
