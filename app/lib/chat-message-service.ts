'use client';

import { accountSession } from './account/session';
import { ProfileRepository } from './profile-repository';
import { COLLECTIONS, newId, storage, type Stored } from './storage';

/**
 * Human-to-human chat persistence.
 *
 * One row per message.
 *
 * The previous implementation packed an entire conversation into a single
 * record, serialising a `{ messageId: MessageEntry }` dictionary into one
 * string field, because the remote store charged per record and enforced a
 * record cap. That constraint is gone, and with it the read-modify-write cycle
 * that made two people sending at once lose a message. Rows are independent
 * now, so concurrent sends simply both land.
 *
 * The `isMessageDict` flag on `ChatMessage` is retained but always false;
 * components branch on it and reading a legacy packed record still works.
 */

/** A single message, the canonical internal shape. */
export interface MessageEntry {
  id: string;
  text: string;
  html?: string;
  fromId: string;
  fromName?: string;
  timestamp: string;
  read?: boolean;
}

/** A stored message row. Mirrors the shape components already expect. */
export interface ChatMessage {
  name: string;
  groupId: string;
  groupName?: string;
  type: 'send' | 'receive';
  messageText: string;
  messageHTML?: string;
  fromId: string;
  fromHandle?: string;
  fromName?: string;
  sentAt: string;

  _id?: string;
  _rev?: string;
  schema?: string;
  sourceApplication?: string;
  sourceId?: string;

  /** True only for legacy records whose `messageText` holds a packed dictionary. */
  isMessageDict?: boolean;

  /** Whether the recipient has read this message. */
  read?: boolean;

  /**
   * AgentBook id of the sending agent, when a twin sent this message.
   *
   * Absent for human messages. Present and verified for twin messages — an
   * unresolvable agent id means the message is rejected before it is stored,
   * which is what stops an unbacked bot from posing as someone's twin.
   */
  agentId?: string;
}

export interface ChatGroup {
  id: string;
  name: string;
  participants: {
    did: string;
    name: string;
    avatar?: string;
  }[];
  lastMessage?: ChatMessage;
  unreadCount?: number;
  createdAt: string;
  updatedAt: string;
}

const SOURCE_APPLICATION = 'Proof of Heart';

async function currentAccountId(): Promise<string | null> {
  if (!accountSession.isConnected()) {
    await accountSession.connect();
  }
  return accountSession.getAccountId();
}

/**
 * Expands a legacy packed record into individual entries.
 *
 * Kept so conversations written by earlier builds still render.
 */
function unpackLegacyRecord(record: ChatMessage): MessageEntry[] {
  if (!record.isMessageDict || typeof record.messageText !== 'string') return [];
  try {
    const dictionary = JSON.parse(record.messageText) as Record<string, MessageEntry>;
    return Object.values(dictionary);
  } catch (error) {
    console.error('Failed to parse legacy packed conversation record:', error);
    return [];
  }
}

/** Every stored row for a conversation. */
async function rowsForGroup(groupId: string): Promise<Stored<ChatMessage>[]> {
  return await storage.list<Stored<ChatMessage>>(COLLECTIONS.CHAT_MESSAGES, { groupId });
}

/**
 * Persists one message.
 *
 * Validates the same four required fields as before and fills the same
 * defaults, so callers need no changes.
 */
export async function saveMessage(message: Partial<ChatMessage>): Promise<ChatMessage> {
  if (!message.groupId || !message.type || !message.messageText || !message.fromId) {
    throw new Error('groupId, type, messageText and fromId are all required');
  }

  const record: ChatMessage = {
    name: message.name || 'Chat message',
    groupId: message.groupId,
    groupName: message.groupName,
    type: message.type,
    messageText: message.messageText,
    messageHTML: message.messageHTML,
    fromId: message.fromId,
    fromHandle: message.fromHandle,
    fromName: message.fromName,
    sentAt: message.sentAt || new Date().toISOString(),
    sourceApplication: message.sourceApplication || SOURCE_APPLICATION,
    sourceId: message.sourceId || newId('msg'),
    isMessageDict: false,
    read: message.read ?? false,
    agentId: message.agentId,
  };

  const id = record.sourceId as string;
  await storage.put(COLLECTIONS.CHAT_MESSAGES, id, record);

  return { ...record, _id: id };
}

/**
 * Reads a conversation, oldest first.
 *
 * `groupName` is accepted for signature compatibility; it was previously used
 * to disambiguate between duplicate conversation records, which no longer
 * exist now that messages are stored individually.
 */
export async function getMessages(
  groupId: string,
  groupName?: string,
  options: {
    limit?: number;
    offset?: number;
    fromDate?: Date;
    toDate?: Date;
  } = {},
): Promise<MessageEntry[]> {
  const rows = await rowsForGroup(groupId);

  const entries: MessageEntry[] = [];
  for (const row of rows) {
    if (row.isMessageDict) {
      entries.push(...unpackLegacyRecord(row));
      continue;
    }
    entries.push({
      id: row.sourceId || row._id,
      text: row.messageText,
      html: row.messageHTML,
      fromId: row.fromId,
      fromName: row.fromName,
      timestamp: row.sentAt,
      read: row.read,
    });
  }

  let filtered = entries;
  if (options.fromDate || options.toDate) {
    filtered = filtered.filter((entry) => {
      const at = new Date(entry.timestamp).getTime();
      if (options.fromDate && at < options.fromDate.getTime()) return false;
      if (options.toDate && at > options.toDate.getTime()) return false;
      return true;
    });
  }

  filtered.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const offset = options.offset ?? 0;
  const limit = options.limit ?? filtered.length;
  return filtered.slice(offset, offset + limit);
}

/**
 * Lists the current user's conversations, most recently active first.
 *
 * Groups are derived from the message rows plus any group records created
 * ahead of the first message, so a freshly created empty conversation still
 * appears in the list.
 */
export async function getChatGroups(): Promise<ChatGroup[]> {
  const accountId = await currentAccountId();
  if (!accountId) return [];

  const groupRecords = await storage.list<Stored<ChatGroup>>(COLLECTIONS.MATCHES);
  const byId = new Map<string, ChatGroup>();

  for (const record of groupRecords) {
    if (!record.participants?.some((participant) => participant.did === accountId)) continue;
    byId.set(record.id, { ...record, unreadCount: 0 });
  }

  const allMessages = await storage.list<Stored<ChatMessage>>(COLLECTIONS.CHAT_MESSAGES);

  for (const row of allMessages) {
    // A conversation the user is not part of should not surface just because
    // its rows share the store.
    if (!row.groupId.includes(accountId) && !byId.has(row.groupId)) continue;

    let group = byId.get(row.groupId);
    if (!group) {
      group = {
        id: row.groupId,
        name: row.groupName || 'Conversation',
        participants: [],
        createdAt: row.sentAt,
        updatedAt: row.sentAt,
        unreadCount: 0,
      };
      byId.set(row.groupId, group);
    }

    const isNewer = !group.lastMessage || row.sentAt > group.lastMessage.sentAt;
    if (isNewer) {
      group.lastMessage = row;
      group.updatedAt = row.sentAt;
      if (row.groupName) group.name = row.groupName;
    }

    if (row.fromId !== accountId && !row.read) {
      group.unreadCount = (group.unreadCount ?? 0) + 1;
    }
  }

  const groups = [...byId.values()];

  // Fill in display names for participants we can resolve locally.
  await Promise.all(
    groups.map(async (group) => {
      if (group.participants.length > 0) return;
      const dids = group.id.replace('chat:group:', '').split(':').filter(Boolean);
      group.participants = await Promise.all(
        dids.map(async (did) => {
          const profile = await ProfileRepository.getProfile(did);
          return {
            did,
            name: profile?.displayName || (did === accountId ? 'Me' : shortLabelFor(did)),
          };
        }),
      );
    }),
  );

  groups.sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''));
  return groups;
}

/**
 * Creates a conversation between participants.
 *
 * Returns the group id, which is deterministic for a two-person chat so the
 * same pair always reuses one conversation.
 */
export async function createChatGroup(
  participants: { did: string; name: string }[],
  groupName?: string,
): Promise<string> {
  const accountId = await currentAccountId();
  if (!accountId) {
    throw new Error('No active account session');
  }

  if (participants.length < 2) {
    throw new Error('A conversation needs at least two participants');
  }

  const roster = participants.some((participant) => participant.did === accountId)
    ? participants
    : [
        ...participants,
        {
          did: accountId,
          name: (await ProfileRepository.getProfile(accountId))?.displayName || 'Me',
        },
      ];

  const others = roster.filter((participant) => participant.did !== accountId);
  const id =
    roster.length === 2 && others[0]
      ? createChatGroupId(accountId, others[0].did)
      : `chat:group:${newId('multi')}`;

  const now = new Date().toISOString();
  const name =
    groupName ||
    (others.length === 1
      ? createChatGroupName(accountId, 'Me', others[0].did, others[0].name)
      : `Group with ${others.map((participant) => participant.name).join(', ')}`);

  const existing = await storage.get<ChatGroup>(COLLECTIONS.MATCHES, id);
  await storage.put(COLLECTIONS.MATCHES, id, {
    id,
    name,
    participants: roster,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  } satisfies ChatGroup);

  return id;
}

/** Marks the given messages read. */
export async function markMessagesAsRead(
  groupId: string,
  messageIds: string[],
): Promise<boolean> {
  const rows = await rowsForGroup(groupId);
  const wanted = new Set(messageIds);
  let changed = false;

  for (const row of rows) {
    const id = row.sourceId || row._id;
    if (!wanted.has(id) || row.read) continue;
    await storage.put(COLLECTIONS.CHAT_MESSAGES, row._id, { ...row, read: true });
    changed = true;
  }

  return changed;
}

/* ------------------------------------------------------------------ */
/* Format conversion                                                   */
/* ------------------------------------------------------------------ */

export function convertToMessageEntry(
  message: {
    id: string;
    content: string;
    sender: string;
    timestamp: string;
    isAI?: boolean;
  },
  fromId: string,
  fromName: string,
): MessageEntry {
  return {
    id: message.id,
    text: message.content,
    fromId,
    fromName,
    timestamp: message.timestamp,
  };
}

export function convertFromMessageEntry(
  entry: MessageEntry,
  currentUserDid: string,
): {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  isAI?: boolean;
} {
  return {
    id: entry.id,
    content: entry.text,
    sender: entry.fromId === currentUserDid ? 'user' : 'other',
    timestamp: entry.timestamp,
    isAI: isAgentSender(entry.fromId),
  };
}

/** Builds a storable row from the shape the chat UI holds in state. */
export function convertToStoredMessage(
  message: {
    id: string;
    content: string;
    sender: string;
    timestamp: string;
    isAI?: boolean;
  },
  groupId: string,
  fromId: string,
  fromName: string,
): ChatMessage {
  return {
    name: 'Chat message',
    groupId,
    type: message.sender === 'user' ? 'send' : 'receive',
    messageText: message.content,
    fromId,
    fromName,
    sentAt: message.timestamp,
    sourceApplication: SOURCE_APPLICATION,
    sourceId: message.id,
  };
}

/** Projects a stored row (or entry) into the shape the chat UI renders. */
export function convertFromStoredMessage(
  message: ChatMessage | MessageEntry,
  currentUserDid: string,
): {
  id: string;
  content: string;
  sender: string;
  senderName?: string;
  timestamp: string;
  isAI?: boolean;
} {
  if ('text' in message && 'timestamp' in message) {
    const entry = message as MessageEntry;
    return {
      id: entry.id,
      content: entry.text,
      sender: entry.fromId === currentUserDid ? 'user' : 'other',
      senderName: entry.fromName || (entry.fromId === currentUserDid ? 'Me' : undefined),
      timestamp: entry.timestamp,
      isAI: isAgentSender(entry.fromId),
    };
  }

  const row = message as ChatMessage;
  return {
    id: row._id || row.sourceId || newId('msg'),
    content: typeof row.messageText === 'string' ? row.messageText : 'Message',
    sender: row.fromId === currentUserDid ? 'user' : 'other',
    senderName: row.fromName || (row.fromId === currentUserDid ? 'Me' : undefined),
    timestamp: row.sentAt,
    isAI: isAgentSender(row.fromId) || Boolean(row.agentId),
  };
}

/* ------------------------------------------------------------------ */
/* Identifiers                                                         */
/* ------------------------------------------------------------------ */

/**
 * Deterministic conversation id for a pair of accounts.
 *
 * Sorted so both participants compute the same id regardless of who opens the
 * chat.
 *
 * The previous implementation additionally required both ids to start with
 * `did:`. Account keys are no longer DIDs, so that check would now reject
 * every real pair; it is replaced with a non-empty check.
 */
export function createChatGroupId(did1: string, did2: string): string {
  if (!did1 || !did2) {
    throw new Error('Both account ids must be provided');
  }

  if (did1 === did2) {
    throw new Error('Cannot create a conversation with a single account');
  }

  const sorted = [did1, did2].sort();
  return `chat:group:${sorted[0]}:${sorted[1]}`;
}

export function createChatGroupName(
  currentUserDid: string,
  currentUserName: string,
  otherUserDid: string,
  otherUserName?: string,
): string {
  return `Chat with ${otherUserName || shortLabelFor(otherUserDid)}`;
}

/** Human-readable stand-in for an account with no profile name yet. */
function shortLabelFor(accountId: string): string {
  const parts = accountId.split(/[:_]/);
  const tail = parts[parts.length - 1] ?? accountId;
  return `User ${tail.substring(0, 8)}…`;
}

/** Whether a sender id belongs to an AI twin rather than a person. */
function isAgentSender(fromId: string): boolean {
  return fromId.startsWith('ai-') || fromId.startsWith('agent:');
}
