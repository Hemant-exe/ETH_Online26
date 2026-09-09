/**
 * Verida and Cheqd Configuration
 * 
 * Central configuration file for Verida and Cheqd related settings.
 * Contains common constants used across multiple services.
 */

// Environment-based Verida network configuration
export const VERIDA_NETWORK = process.env.NEXT_PUBLIC_VERIDA_NETWORK === 'mainnet' ? 'mainnet' : 'testnet';
export const CONTEXT_NAME = process.env.NEXT_PUBLIC_CONTEXT_NAME || "VeraLove Dating Application";
export const LOGO_URL = process.env.NEXT_PUBLIC_LOGO_URL || "https://assets.verida.io/verida_login_request_logo_170x170.png"; 

// API configuration for Verida
export const API_BASE_URL = 'https://api.verida.ai';

// Authentication token for Verida REST API calls
// TODO: In production, this should be fetched securely or managed via a proper auth system
export const AUTH_TOKEN = '58d16670-2dee-11f0-b8ca-5b198f1a59d7pduhzxgYXXdVHL5liF0coKxSTCZMXAUidn63_UnddHHLwm+I';

// Cheqd API configuration
export const CHEQD_API_BASE_URL = 'https://studio-api.cheqd.net';
export const CHEQD_API_KEY = process.env.NEXT_PUBLIC_CHEQD_API_KEY || 'caas_d820009bd8e32abe6b7a7226bb26a75333f54a47d0e7a5ccbe73fe22f8384960fe53820079e8f705db610e0d7cae6c515e02c9715e217e1d14c528e21354dd3c';
export const CHEQD_NETWORK = 'testnet';

// Database and collection names
export const DB_NAMES = {
  PROFILE: 'dating_profile',
  PREFERENCES: 'dating_preferences',
  PHOTOS: 'dating_photos',
  MATCHES: 'dating_matches',
  MESSAGES: 'dating_messages',
  AI_TWIN: 'favourite',
  CHAT_MESSAGES: 'social_chat_message'
};

// RPC configuration for different networks
export const RPC_CONFIG = {
  testnet: {
    matticNetwork: "https://polygon-amoy.infura.io/v3/ba150cd6064d40b597979b2592ad08a4",
    web3Provider: "https://polygon-amoy.infura.io/v3/ba150cd6064d40b597979b2592ad08a4"
  },
  mainnet: {
    matticNetwork: "https://polygon-rpc.com",
    web3Provider: "https://polygon-mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161" // Public Infura endpoint
  }
};

// Application info
export const APP_INFO = {
  name: "VeraLove",
  version: "1.0.0",
  sourceApplication: "VeraLove Dating App"
}; 