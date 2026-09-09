'use client';

import { accountSession } from './account/session';
import { COLLECTIONS, findOne, storage, upsert, type Stored } from './storage';

/**
 * AI twin profile persistence.
 *
 * A twin is the user's self-description — life story, personality, values,
 * conversational habits — that the inference endpoint conditions on when the
 * twin speaks on their behalf. It is the richest single record in the app.
 *
 * The nested `metadata` shape is preserved verbatim from the previous schema.
 * Roughly a dozen form steps read and write these exact paths, and the
 * screening prompts are built from them, so the structure is treated as fixed.
 */

/** Twin records live under this URI scheme when no explicit URI is supplied. */
const TWIN_URI_PREFIX = 'twin';

async function requireAccountId(): Promise<string> {
  if (!accountSession.isConnected()) {
    await accountSession.connect();
  }

  const accountId = accountSession.getAccountId();
  if (!accountId) {
    throw new Error('No active account session. Complete onboarding first.');
  }
  return accountId;
}

/**
 * Creates or updates the current user's twin.
 *
 * One twin per account: the write is an upsert keyed on the account id, so
 * revisiting the creation flow edits the existing twin rather than stacking
 * duplicates (which the previous REST path did whenever its lookup raced).
 */
export async function saveAiTwin(twinData: any): Promise<any> {
  if (!twinData.name || !twinData.favouriteType || !twinData.contentType || !twinData.uri) {
    throw new Error('name, favouriteType, contentType and uri are all required');
  }

  const did = await requireAccountId();
  const record = {
    ...twinData,
    did,
    insertedAt: twinData.insertedAt || new Date().toISOString(),
  };

  const id = await upsert(
    COLLECTIONS.TWIN_PROFILE,
    { did },
    record as Record<string, unknown>,
    TWIN_URI_PREFIX,
  );

  return { ...record, _id: id };
}

/**
 * Returns the current user's twin as form data, or null.
 *
 * The form data shape is flat; the stored shape is nested. `mapTwinDataToFormData`
 * bridges them.
 */
export async function getUserAiTwin(): Promise<any> {
  const did = await requireAccountId();
  const record = await findOne<Record<string, any>>(COLLECTIONS.TWIN_PROFILE, { did });
  return record ? mapTwinDataToFormData(record) : null;
}

/** Every twin record belonging to the current user, raw. */
export async function getUserAiTwins(): Promise<any[]> {
  const did = await requireAccountId();
  return await storage.list<Stored<Record<string, any>>>(COLLECTIONS.TWIN_PROFILE, { did });
}

/**
 * Records the AgentBook agent id for the current user's twin.
 *
 * Written once the twin is registered as a human-backed agent. Every
 * twin-to-twin message is later checked against this id, so it is stored on
 * the twin rather than held in component state.
 */
export async function attachAgentId(agentId: string): Promise<void> {
  const did = await requireAccountId();
  const record = await findOne<Record<string, any>>(COLLECTIONS.TWIN_PROFILE, { did });
  if (!record) {
    throw new Error('Create a twin before registering it as an agent');
  }

  await storage.put(COLLECTIONS.TWIN_PROFILE, record._id, {
    ...record,
    agentId,
    agentRegisteredAt: new Date().toISOString(),
  });
}

/** The agent id for an account's twin, or null if it is not registered. */
export async function getTwinAgentId(did?: string): Promise<string | null> {
  const accountId = did ?? (await requireAccountId());
  const record = await findOne<Record<string, any>>(COLLECTIONS.TWIN_PROFILE, { did: accountId });
  return record?.agentId ?? null;
}

/**
 * Flattens a stored twin record into the creation form's field layout.
 *
 * Deliberately total: a missing metadata section yields empty fields rather
 * than throwing, because a twin saved by an earlier build may predate a
 * section the form now shows.
 */
export function mapTwinDataToFormData(twinData: any): any {
  if (!twinData) return null;

  const formData: any = {
    name: twinData.name || '',
    favouriteType: twinData.favouriteType || 'recommendation',
    contentType: twinData.contentType || 'document',
    uri: twinData.uri || '',
    bio: twinData.description || '',
  };

  // Carried through so a subsequent save updates this record in place.
  if (twinData._id) formData._id = twinData._id;
  if (twinData._rev) formData._rev = twinData._rev;
  if (twinData.did) formData.did = twinData.did;
  if (twinData.insertedAt) formData.insertedAt = twinData.insertedAt;
  if (twinData.sourceId) formData.sourceId = twinData.sourceId;
  if (twinData.agentId) formData.agentId = twinData.agentId;

  const metadata = twinData.metadata;
  if (!metadata) return formData;

  const { personalDetails, lifeStory, personality, interests, relationships, values, communication, aiBehavior } =
    metadata;

  if (personalDetails) {
    formData.age = personalDetails.age || '';
    formData.location = personalDetails.location || '';
    formData.occupation = personalDetails.occupation || '';
  }

  if (lifeStory) {
    formData.childhood = lifeStory.childhood || '';
    formData.significantEvents = lifeStory.significantEvents || [];
    formData.achievements = lifeStory.achievements || [];
    formData.challenges = lifeStory.challenges || [];
    formData.lifePhilosophy = lifeStory.lifePhilosophy || '';
  }

  if (personality) {
    formData.personalityTraits = personality.personalityTraits || [];
    formData.communicationStyle = personality.communicationStyle || '';
    formData.humorStyle = personality.humorStyle || '';
    formData.emotionalResponses = personality.emotionalResponses || [];
    formData.decisionMakingStyle = personality.decisionMakingStyle || '';
  }

  if (interests) {
    formData.interests = interests.interests || [];
    formData.hobbies = interests.hobbies || [];
    formData.expertise = interests.expertise || [];
    formData.specificLikes = interests.specificLikes || [];
    formData.specificDislikes = interests.specificDislikes || [];
  }

  if (relationships) {
    formData.relationshipGoals = relationships.relationshipGoals || '';
    formData.dealBreakers = relationships.dealBreakers || [];
    formData.lookingFor = relationships.lookingFor || [];
    formData.pastRelationships = relationships.pastRelationships || '';
    formData.attachmentStyle = relationships.attachmentStyle || '';
  }

  if (values) {
    formData.coreValues = values.coreValues || [];
    formData.beliefs = values.beliefs || [];
    formData.politicalViews = values.politicalViews || '';
    formData.spirituality = values.spirituality || '';
  }

  if (communication) {
    formData.conversationTopics = communication.conversationTopics || [];
    formData.avoidTopics = communication.avoidTopics || [];
    formData.communicationPatterns = communication.communicationPatterns || [];
    formData.typicalPhrases = communication.typicalPhrases || [];
  }

  if (aiBehavior) {
    formData.aiResponseStyle = aiBehavior.aiResponseStyle || '';
    formData.aiProactiveness = aiBehavior.aiProactiveness ?? 50;
    formData.aiPersonality = aiBehavior.aiPersonality || '';
    formData.aiConfidentiality = aiBehavior.aiConfidentiality || [];
  }

  return formData;
}

/**
 * Nests the creation form's flat fields into the stored twin shape.
 *
 * The inverse of `mapTwinDataToFormData`.
 */
export function formatAiTwinData(formData: any): any {
  const record: any = {
    name: formData.name || 'AI Twin Profile',
    favouriteType: formData.favouriteType || 'recommendation',
    contentType: formData.contentType || 'document',
    // Reuse the existing URI when there is one, so an edit updates the same
    // record instead of minting a second twin.
    uri: formData.uri || `dating:${TWIN_URI_PREFIX}:${Date.now()}`,

    description: formData.bio || '',

    metadata: {
      profileType: 'ai-twin',
      personalDetails: {
        age: formData.age,
        location: formData.location,
        occupation: formData.occupation,
      },
      lifeStory: {
        childhood: formData.childhood,
        significantEvents: formData.significantEvents,
        achievements: formData.achievements,
        challenges: formData.challenges,
        lifePhilosophy: formData.lifePhilosophy,
      },
      personality: {
        personalityTraits: formData.personalityTraits,
        communicationStyle: formData.communicationStyle,
        humorStyle: formData.humorStyle,
        emotionalResponses: formData.emotionalResponses,
        decisionMakingStyle: formData.decisionMakingStyle,
      },
      interests: {
        interests: formData.interests,
        hobbies: formData.hobbies,
        expertise: formData.expertise,
        specificLikes: formData.specificLikes,
        specificDislikes: formData.specificDislikes,
      },
      relationships: {
        relationshipGoals: formData.relationshipGoals,
        dealBreakers: formData.dealBreakers,
        lookingFor: formData.lookingFor,
        pastRelationships: formData.pastRelationships,
        attachmentStyle: formData.attachmentStyle,
      },
      values: {
        coreValues: formData.coreValues,
        beliefs: formData.beliefs,
        politicalViews: formData.politicalViews,
        spirituality: formData.spirituality,
      },
      communication: {
        conversationTopics: formData.conversationTopics,
        avoidTopics: formData.avoidTopics,
        communicationPatterns: formData.communicationPatterns,
        typicalPhrases: formData.typicalPhrases,
      },
      aiBehavior: {
        aiResponseStyle: formData.aiResponseStyle,
        aiProactiveness: formData.aiProactiveness,
        aiPersonality: formData.aiPersonality,
        aiConfidentiality: formData.aiConfidentiality,
      },
    },

    insertedAt: formData.insertedAt || new Date().toISOString(),
    sourceApplication: 'Proof of Heart — Twin Creator',
    sourceId: formData.sourceId || `${TWIN_URI_PREFIX}:${Date.now()}`,
  };

  if (formData._id) record._id = formData._id;
  if (formData._rev) record._rev = formData._rev;
  if (formData.agentId) record.agentId = formData.agentId;

  return formData.did ? { ...record, did: formData.did } : record;
}
