import 'server-only';

import { createHash } from 'node:crypto';

import {
  HCS_RECEIPT_TOPIC_ID,
  getHederaClient,
  hashscanTopicUrl,
  hashscanTransactionUrl,
} from './client';

/**
 * Payment audit trail on the Hedera Consensus Service.
 *
 * Every paid inference publishes a receipt to a single HCS topic. That topic
 * is the audit trail: an append-only, timestamped, publicly readable log of
 * who paid what for which request, independent of this app's own database.
 *
 * Why it matters for a dating product specifically — a user is being charged,
 * per message, for conversations their AI twin holds while they are not
 * watching. "Trust our server logs" is not an acceptable answer to "why was I
 * billed for 8 calls?". The topic lets them check for themselves.
 */

export interface PaymentReceipt {
  /** Hedera account that paid. */
  payer: string;
  /** AgentBook id of the agent that made the call. */
  agentId: string;
  /** Price actually charged, in HBAR. */
  priceHbar: string;
  timestamp: string;
  /**
   * Hash of the request body.
   *
   * The prompt itself is private — it is somebody's dating conversation — so
   * the receipt commits to it without publishing it. Anyone can verify a
   * given request produced a given receipt; nobody can read the request from
   * the topic.
   */
  requestHash: string;
  /** Tokens billed, so the metered price is checkable. */
  promptTokens?: number;
  completionTokens?: number;
  /** Screening session this call belonged to, when applicable. */
  sessionId?: string;
}

export interface PublishedReceipt extends PaymentReceipt {
  /** HCS sequence number, or null if the publish did not land. */
  sequenceNumber: string | null;
  transactionId: string | null;
  topicId: string;
  hashscanUrl: string | null;
  topicUrl: string;
  /** False when the receipt could not be published on-chain. */
  onChain: boolean;
}

/** SHA-256 of a request body, hex. */
export function hashRequest(payload: unknown): string {
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

/**
 * Publishes a receipt to the HCS topic.
 *
 * Never throws. A failed publish is reported as `onChain: false` rather than
 * propagated, because the caller has already taken the user's money and
 * produced their completion — failing the response at that point would charge
 * them and give them nothing.
 */
export async function publishReceipt(receipt: PaymentReceipt): Promise<PublishedReceipt> {
  const base: PublishedReceipt = {
    ...receipt,
    sequenceNumber: null,
    transactionId: null,
    topicId: HCS_RECEIPT_TOPIC_ID,
    hashscanUrl: null,
    topicUrl: hashscanTopicUrl(),
    onChain: false,
  };

  if (!HCS_RECEIPT_TOPIC_ID) {
    console.warn('[hcs] NEXT_PUBLIC_HCS_RECEIPT_TOPIC_ID unset; receipt not published');
    return base;
  }

  const client = await getHederaClient();
  if (!client) return base;

  try {
    const { TopicMessageSubmitTransaction } = await import('@hiero-ledger/sdk');

    const submission = await new TopicMessageSubmitTransaction({
      topicId: HCS_RECEIPT_TOPIC_ID,
      message: JSON.stringify(receipt),
    }).execute(client);

    const txReceipt = await submission.getReceipt(client);
    const transactionId = submission.transactionId?.toString() ?? null;

    return {
      ...base,
      sequenceNumber: txReceipt.topicSequenceNumber?.toString() ?? null,
      transactionId,
      hashscanUrl: transactionId ? hashscanTransactionUrl(transactionId) : null,
      onChain: true,
    };
  } catch (error) {
    console.error('[hcs] failed to publish receipt', error);
    return base;
  } finally {
    // The Hedera client holds gRPC connections; a route handler that opens one
    // per request will exhaust them without this.
    try {
      client.close();
    } catch {
      /* already closed */
    }
  }
}
