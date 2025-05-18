declare module 'bs58' {
  /**
   * Encode a buffer as a base58 string
   */
  export function encode(source: Buffer | Uint8Array): string;
  
  /**
   * Decode a base58 string into a buffer
   */
  export function decode(string: string): Buffer;
} 