/**
 * Creates the HCS topic that payment receipts are published to.
 *
 * Run once during setup:
 *
 *   npm run hedera:create-topic
 *
 * Then copy the printed topic id into NEXT_PUBLIC_HCS_RECEIPT_TOPIC_ID.
 *
 * The topic is created with a submit key so only this app's operator can
 * append receipts — otherwise anyone could write fake payment records into the
 * audit trail, which would make it worthless as evidence. Reads stay public.
 */

import { readFileSync } from 'node:fs';

import { Client, PrivateKey, AccountId, TopicCreateTransaction } from '@hiero-ledger/sdk';

/** Minimal .env.local reader, so the script needs no extra dependency. */
function loadEnv(path = '.env.local') {
  try {
    for (const line of readFileSync(path, 'utf8').split('\n')) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!match) continue;
      const [, key, rawValue] = match;
      if (process.env[key]) continue;
      process.env[key] = rawValue.replace(/^["']|["']$/g, '');
    }
  } catch {
    // No .env.local is fine if the variables are already exported.
  }
}

function parseKey(raw) {
  const key = raw.trim();
  if (key.startsWith('0x') || key.length === 64) {
    try {
      return PrivateKey.fromStringECDSA(key);
    } catch {
      /* fall through */
    }
  }
  try {
    return PrivateKey.fromStringED25519(key);
  } catch {
    return PrivateKey.fromString(key);
  }
}

async function main() {
  loadEnv();

  const operatorId = process.env.HEDERA_OPERATOR_ID;
  const operatorKey = process.env.HEDERA_OPERATOR_KEY;
  const network = process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet';

  if (!operatorId || !operatorKey) {
    console.error(
      'HEDERA_OPERATOR_ID and HEDERA_OPERATOR_KEY must be set.\n' +
        'Create a testnet account at https://portal.hedera.com and add them to .env.local.',
    );
    process.exit(1);
  }

  const client = network === 'mainnet' ? Client.forMainnet() : Client.forTestnet();
  const key = parseKey(operatorKey);
  client.setOperator(AccountId.fromString(operatorId), key);

  console.log(`Creating receipt topic on Hedera ${network}…`);

  try {
    const submission = await new TopicCreateTransaction()
      .setTopicMemo('Proof of Heart — twin inference payment receipts')
      .setSubmitKey(key.publicKey)
      .execute(client);

    const receipt = await submission.getReceipt(client);
    const topicId = receipt.topicId.toString();

    console.log('\nTopic created.\n');
    console.log(`  Topic ID:  ${topicId}`);
    console.log(`  HashScan:  https://hashscan.io/${network}/topic/${topicId}\n`);
    console.log('Add this to .env.local:\n');
    console.log(`  NEXT_PUBLIC_HCS_RECEIPT_TOPIC_ID=${topicId}\n`);
  } catch (error) {
    console.error('Failed to create topic:', error);
    process.exit(1);
  } finally {
    client.close();
  }
}

main();
