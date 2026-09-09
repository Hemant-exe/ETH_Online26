// The import and initialization is executed only on the client side
// Do not use this file directly in components, use verida-client-wrapper.tsx instead
import { Client } from '@verida/client-ts';
import { VaultAccount } from '@verida/account-web-vault';
import { VERIDA_NETWORK, CONTEXT_NAME, LOGO_URL, RPC_CONFIG } from './verida-config';

// Constants - using values from the central config

/**
 * VeridaClient class to handle Verida authentication and context management
 */
export class VeridaClient {
  private static instance: VeridaClient;
  private client: Client | null = null;
  private account: VaultAccount | null = null;
  private context: any = null;
  private did: string | null = null;

  private constructor() {}

  /**
   * Get singleton instance of VeridaClient
   */
  public static getInstance(): VeridaClient {
    if (!VeridaClient.instance) {
      VeridaClient.instance = new VeridaClient();
    }
    return VeridaClient.instance;
  }

  /**
   * Initialize the Verida client
   * @returns {Promise<void>}
   */
  public async init(): Promise<void> {
    // Use any type to bypass type checking for configuration
    // This avoids issues with mismatched types in the Verida SDK
    const clientConfig: any = {
      didClientConfig: {
        network: VERIDA_NETWORK,
        // Configuring RPC according to Verida docs at https://developers.verida.network/protocol/client-sdk/configuration
        rpcConfig: RPC_CONFIG
      }
    };

    // Initialize Verida client
    this.client = new Client(clientConfig);

    // Initialize account with any type to bypass type checking
    const accountConfig: any = {
      request: {
        logoUrl: LOGO_URL,
        // Specify the required datastore permissions for standard schemas
        permissions: {
          // For profile data using social-post schema
          'datastore/social-post': {
            read: true,
            write: true
          },
          // For photos using file schema
          'datastore/file': {
            read: true,
            write: true
          },
          // For preferences using social-following schema
          'datastore/social-following': {
            read: true,
            write: true
          }
        }
      }
    };
    
    this.account = new VaultAccount(accountConfig);
  }

  /**
   * Connect to Verida network and open application context
   * @returns {Promise<boolean>} - True if connection was successful
   */
  public async connect(): Promise<boolean> {
    if (!this.client || !this.account) {
      await this.init();
    }

    try {
      // Connect the account to the client
      await this.client!.connect(this.account!);
      
      // Open application context with forceCreate set to true
      this.context = await this.client!.openContext(CONTEXT_NAME, true);
      
      // Get user DID
      this.did = await this.account!.did();
      
      return true;
    } catch (error) {
      console.error('Failed to connect to Verida network:', error);
      return false;
    }
  }

  /**
   * Disconnect from Verida network
   */
  public disconnect(): void {
    this.client = null;
    this.account = null;
    this.context = null;
    this.did = null;
  }

  /**
   * Check if user is connected
   * @returns {boolean}
   */
  public isConnected(): boolean {
    return this.did !== null && this.context !== null;
  }

  /**
   * Get user's DID
   * @returns {string|null}
   */
  public getDid(): string | null {
    return this.did;
  }

  /**
   * Open a database in the application context
   * @param {string} dbName - Database name
   * @returns {Promise<any>} - Database instance
   */
  public async openDatabase(dbName: string): Promise<any> {
    if (!this.isConnected() || !this.context) {
      throw new Error('Not connected to Verida network');
    }
    
    try {
      // Try to open the database
      return await this.context.openDatabase(dbName);
    } catch (error) {
      console.error(`Error opening database ${dbName}:`, error);
      
      // If the error indicates context doesn't exist, try reconnecting with force create
      const errorMsg = error instanceof Error ? error.message : String(error);
      if (errorMsg.includes("Storage context doesn't exist")) {
        console.log("Storage context doesn't exist. Reconnecting with force create.");
        
        // Disconnect and reconnect
        this.disconnect();
        await this.init();
        await this.client!.connect(this.account!);
        
        // Force create the context
        this.context = await this.client!.openContext(CONTEXT_NAME, true);
        this.did = await this.account!.did();
        
        // Try opening database again
        return await this.context.openDatabase(dbName);
      }
      
      // If it's not a context issue, rethrow the error
      throw error;
    }
  }

  /**
   * Save data to a database
   * @param {string} dbName - Database name
   * @param {any} data - Data to save
   * @returns {Promise<any>} - Saved record
   */
  public async saveData(dbName: string, data: any): Promise<any> {
    const db = await this.openDatabase(dbName);
    return await db.save(data);
  }

  /**
   * Get data from a database
   * @param {string} dbName - Database name
   * @param {any} options - Query options
   * @returns {Promise<any[]>} - Array of records
   */
  public async getData(dbName: string, options?: any): Promise<any[]> {
    const db = await this.openDatabase(dbName);
    return await db.getMany(options);
  }

  /**
   * Get user account
   * @returns {VaultAccount|null}
   */
  public getAccount(): VaultAccount | null {
    return this.account;
  }

  /**
   * Get client instance
   * @returns {Client|null}
   */
  public getClient(): Client | null {
    return this.client;
  }

  /**
   * Get context instance
   * @returns {any|null}
   */
  public getContext(): any | null {
    return this.context;
  }
}

// Export a singleton instance
export const veridaClient = VeridaClient.getInstance(); 