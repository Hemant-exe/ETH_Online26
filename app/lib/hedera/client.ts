import 'server-only';

/**
 * Hedera network configuration and operator client.
 *
 * Server-only. The operator key can create topics and submit messages, so it
 * must never be bundled for the browser — hence the `server-only` import,
 * which turns an accidental client import into a build error rather than a
 * leaked key.
 */

export const HEDERA_NETWORK = (process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet') as
  | 'testnet'
  | 'mainnet';

/** x402 network identifier. Distinct from Hedera's own network name. */
export const X402_NETWORK = `hedera:${HEDERA_NETWORK}` as const;

export const HCS_RECEIPT_TOPIC_ID = process.env.NEXT_PUBLIC_HCS_RECEIPT_TOPIC_ID || '';

/** Whether operator credentials are present. */
export function isHederaConfigured(): boolean {
  return Boolean(process.env.HEDERA_OPERATOR_ID && process.env.HEDERA_OPERATOR_KEY);
}

/**
 * Builds an operator-authenticated Hedera client.
 *
 * Returns null when unconfigured, so callers degrade to skipping on-chain
 * writes instead of failing the user's request. A paid inference that
 * succeeded should not 500 because the audit topic was unreachable.
 */
export async function getHederaClient() {
  if (!isHederaConfigured()) return null;

  try {
    const { Client, PrivateKey, AccountId } = await import('@hiero-ledger/sdk');

    const client =
      HEDERA_NETWORK === 'mainnet' ? Client.forMainnet() : Client.forTestnet();

    client.setOperator(
      AccountId.fromString(process.env.HEDERA_OPERATOR_ID as string),
      // Accepts both ECDSA (0x-prefixed) and ED25519 operator keys, because
      // the Hedera portal hands out either depending on how the account was
      // created and getting this wrong is an opaque signature failure.
      parseOperatorKey(PrivateKey, process.env.HEDERA_OPERATOR_KEY as string),
    );

    return client;
  } catch (error) {
    console.error('[hedera] failed to build client', error);
    return null;
  }
}

function parseOperatorKey(PrivateKey: any, raw: string) {
  const key = raw.trim();
  if (key.startsWith('0x') || key.length === 64) {
    try {
      return PrivateKey.fromStringECDSA(key);
    } catch {
      /* fall through to ED25519 */
    }
  }
  try {
    return PrivateKey.fromStringED25519(key);
  } catch {
    // Last resort: the SDK's format-sniffing parser.
    return PrivateKey.fromString(key);
  }
}

/** HashScan link for a transaction, so receipts are one click from the UI. */
export function hashscanTransactionUrl(transactionId: string): string {
  return `https://hashscan.io/${HEDERA_NETWORK}/transaction/${encodeURIComponent(transactionId)}`;
}

/** HashScan link for the receipt topic. */
export function hashscanTopicUrl(topicId: string = HCS_RECEIPT_TOPIC_ID): string {
  return `https://hashscan.io/${HEDERA_NETWORK}/topic/${encodeURIComponent(topicId)}`;
}
