import bs58 from 'bs58';
import { CHEQD_API_KEY, CHEQD_API_BASE_URL, CHEQD_NETWORK } from './verida-config';

/**
 * Interface for the keypair response
 */
export interface CheqdKeypairResponse {
  kid: string;
  kms: string;
  type: string;
  publicKeyHex: string;
  meta: {
    algorithms: string[];
  };
  publicKeyAlias: null;
  createdAt: string;
  updatedAt: string;
  customer: {
    customerId: string;
    name: string;
    email: string;
    description: null;
    createdAt: string;
    updatedAt: string;
    paymentProviderId: string;
  };
}

/**
 * Interface for the DID creation response
 */
export interface CheqdDidResponse {
  did: string;
  keys: Array<{
    kid: string;
    kms: string;
    type: string;
    publicKeyHex: string;
    meta: {
      algorithms: string[];
    };
    controller: string;
  }>;
  services: any[];
  provider: string;
  controllerKeyRefs: string[];
  controllerKeys: Array<{
    kid: string;
    kms: string;
    type: string;
    publicKeyHex: string;
    meta: {
      algorithms: string[];
    };
    controller: string;
  }>;
  controllerKeyId: string;
}

/**
 * Interface for the DID update response
 */
export interface CheqdDidUpdateResponse {
  did: string;
  keys: Array<{
    kid: string;
    kms: string;
    type: string;
    publicKeyHex: string;
    meta: {
      algorithms: string[];
    };
    controller: string;
  }>;
  services: Array<{
    id: string;
    type: string;
    serviceEndpoint: string[];
  }>;
  provider: string;
  controllerKeyId: string;
  controllerKeyRefs: string[];
  controllerKeys: Array<{
    kid: string;
    kms: string;
    type: string;
    publicKeyHex: string;
    meta: {
      algorithms: string[];
    };
    controller: string;
  }>;
}

/**
 * Create a keypair for the user
 * @param type The type of key to create (defaults to Ed25519)
 * @returns The created keypair
 */
export const createKeypair = async (type: string = 'Ed25519'): Promise<CheqdKeypairResponse> => {
  try {
    const response = await fetch(`${CHEQD_API_BASE_URL}/key/create?type=${type}`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'x-api-key': CHEQD_API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to create keypair: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating keypair:', error);
    throw error;
  }
};

/**
 * Create a DID for the user
 * @param publicKeyHex The public key hex from the keypair
 * @returns The created DID
 */
export const createDid = async (publicKeyHex: string): Promise<CheqdDidResponse> => {
  try {
    const response = await fetch(`${CHEQD_API_BASE_URL}/did/create`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'x-api-key': CHEQD_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        network: CHEQD_NETWORK,
        identifierFormatType: 'uuid',
        options: {
          key: publicKeyHex,
          verificationMethodType: 'Ed25519VerificationKey2018'
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to create DID: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating DID:', error);
    throw error;
  }
};

/**
 * Convert hex key to base58
 * @param hexKey The hex key to convert
 * @returns The base58 encoded key
 */
export const hexToBase58 = (hexKey: string): string => {
  // Convert hex string to buffer
  const buffer = Buffer.from(hexKey, 'hex');
  // Create a Uint8Array from the buffer
  const uint8Array = new Uint8Array(buffer);
  // Encode the Uint8Array to base58
  return bs58.encode(uint8Array);
};

/**
 * Update a DID document
 * @param did The DID to update
 * @param publicKeyHex The public key hex
 * @returns The updated DID document
 */
export const updateDid = async (did: string, publicKeyHex: string): Promise<CheqdDidUpdateResponse> => {
  try {
    // Convert hex key to base58
    const publicKeyBase58 = hexToBase58(publicKeyHex);
    
    const response = await fetch(`${CHEQD_API_BASE_URL}/did/update`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'x-api-key': CHEQD_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        network: CHEQD_NETWORK,
        identifierFormatType: 'uuid',
        did: did,
        didDocument: {
          '@context': [
            'https://www.w3.org/ns/did/v1'
          ],
          id: did,
          controller: [
            did
          ],
          verificationMethod: [
            {
              id: `${did}#key-1`,
              type: 'Ed25519VerificationKey2018',
              controller: did,
              publicKeyBase58: publicKeyBase58
            }
          ],
          authentication: [
            `${did}#key-1`
          ],
          service: [
            {
              id: `${did}#service-1`,
              type: 'LinkedDomains',
              serviceEndpoint: [
                'https://example.com'
              ]
            }
          ]
        },
        options: {
          key: publicKeyBase58,
          verificationMethodType: 'Ed25519VerificationKey2018'
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to update DID: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating DID:', error);
    throw error;
  }
};

/**
 * Update a DID document with NFT information
 * @param did The DID to update
 * @param publicKeyHex The public key hex
 * @param nftData The NFT data to add to the DID document
 * @param veridaDID Optional Verida DID to include in the DID document
 * @returns The updated DID document
 */
export const updateDidWithNFT = async (
  did: string, 
  publicKeyHex: string, 
  nftData: {
    tokenId: string;
    transactionHash: string;
    contractAddress: string;
    chainId: string;
    chainName: string;
  },
  veridaDID?: string
): Promise<CheqdDidUpdateResponse> => {
  try {
    // Convert hex key to base58
    const publicKeyBase58 = hexToBase58(publicKeyHex);
    
    // Prepare services array
    const services = [
      {
        id: `${did}#service-1`,
        type: 'LinkedDomains',
        serviceEndpoint: [
          'https://example.com'
        ]
      },
      {
        id: `${did}#nft-profile`,
        type: 'ProfileNFT',
        serviceEndpoint: [
          {
            uri: `https://sepolia.uniscan.xyz/tx/${nftData.transactionHash}`,
            tokenId: nftData.tokenId,
            contractAddress: nftData.contractAddress,
            chainId: nftData.chainId,
            chainName: nftData.chainName,
            transactionHash: nftData.transactionHash
          }
        ]
      }
    ];
    
    // Add Verida DID if provided
    if (veridaDID) {
      services.push({
        id: `${did}#verida-identity`,
        type: 'VeridaDID',
        serviceEndpoint: [veridaDID]
      });
    }

    const response = await fetch(`${CHEQD_API_BASE_URL}/did/update`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'x-api-key': CHEQD_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        network: CHEQD_NETWORK,
        identifierFormatType: 'uuid',
        did: did,
        didDocument: {
          '@context': [
            'https://www.w3.org/ns/did/v1',
            'https://w3id.org/security/suites/ed25519-2020/v1'
          ],
          id: did,
          controller: [
            did
          ],
          verificationMethod: [
            {
              id: `${did}#key-1`,
              type: 'Ed25519VerificationKey2018',
              controller: did,
              publicKeyBase58: publicKeyBase58
            }
          ],
          authentication: [
            `${did}#key-1`
          ],
          service: services
        },
        options: {
          key: publicKeyBase58,
          verificationMethodType: 'Ed25519VerificationKey2018'
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to update DID with NFT: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating DID with NFT:', error);
    throw error;
  }
};

/**
 * Complete Cheqd wallet setup process
 * Creates a keypair, creates a DID, and updates the DID document
 * @returns The completed wallet setup information
 */
export const setupCheqdWallet = async () => {
  try {
    // Step 1: Create keypair
    const keypair = await createKeypair();
    console.log('Keypair created:', keypair);
    
    // Step 2: Create DID
    const didResponse = await createDid(keypair.publicKeyHex);
    console.log('DID created:', didResponse);
    
    // Step 3: Update DID document
    const updatedDid = await updateDid(didResponse.did, keypair.publicKeyHex);
    console.log('DID updated:', updatedDid);
    
    return {
      keypair,
      did: didResponse,
      updatedDid
    };
  } catch (error) {
    console.error('Error setting up Cheqd wallet:', error);
    throw error;
  }
}; 