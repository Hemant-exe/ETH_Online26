import type { ProfileData } from "../profile/components/profile-creation-flow";

/**
 * NFT metadata generation for the profile token.
 *
 * The metadata's job is to make a minted profile independently checkable: a
 * third party holding only the token should be able to tell that a verified
 * unique human minted it, and which registered agent speaks for them.
 *
 * That is why `humanAnchor` and `agentId` are first-class fields rather than
 * attributes. They previously pointed at a Verida DID and an optional Cheqd
 * DID, neither of which asserted anything about the holder being a person.
 */
interface ProfileMetadata {
  name: string;
  description: string;
  /** Primary photo, used as the token image. */
  image: string;
  attributes: {
    trait_type: string;
    value: string | number;
  }[];

  /**
   * World ID nullifier of the minting human, or null if unverified.
   *
   * Publishing this is deliberate. The nullifier is anonymous by construction
   * and is already revealed in every proof, so it leaks nothing about who the
   * person is — but it does let anyone confirm the token was minted by a
   * Selfie-Check-verified human, and that no second token shares the anchor.
   */
  humanAnchor: string | null;

  /** AgentBook id of the holder's twin, if registered. */
  agentId?: string;

  /** Local account key this profile belongs to. */
  accountId: string;

  properties: {
    photos?: string[];
    interests?: string[];
    [key: string]: any;
  };
}

export interface ProfileMetadataContext {
  /** World ID nullifier, when the minting account is verified. */
  humanAnchor?: string | null;
  /** AgentBook agent id for the account's twin, when registered. */
  agentId?: string | null;
}

export class ProfileMetadataService {
  /**
   * Builds NFT metadata from the profile-creation flow's state.
   *
   * `context` carries the verification and agent facts, which live on the
   * session rather than in the form.
   */
  generateMetadata(
    profileData: ProfileData,
    accountId: string,
    context: ProfileMetadataContext = {},
  ): ProfileMetadata {
    const primaryPhoto = profileData.photos[profileData.primaryPhotoIndex] || "";

    const description =
      profileData.bio ||
      `${profileData.displayName}'s dating profile. ${profileData.age} years old from ${profileData.location}.`;

    const humanAnchor = context.humanAnchor ?? profileData.humanAnchor ?? null;

    const attributes: ProfileMetadata["attributes"] = [
      { trait_type: "Age", value: profileData.age || 0 },
      { trait_type: "Location", value: profileData.location || "Unknown" },
      { trait_type: "Relationship Goal", value: profileData.relationshipGoals || "Not specified" },
      // Surfaced as a trait so marketplaces and explorers show it without
      // needing to understand our custom fields.
      { trait_type: "Human Verified", value: humanAnchor ? "Yes" : "No" },
    ];

    if (profileData.interests && profileData.interests.length > 0) {
      attributes.push({ trait_type: "Interests", value: profileData.interests.length });
    }

    if (context.agentId) {
      attributes.push({ trait_type: "Agent Backed", value: "Yes" });
    }

    return {
      name: profileData.displayName || "Dating Profile",
      description,
      image: primaryPhoto,
      attributes,
      humanAnchor,
      ...(context.agentId ? { agentId: context.agentId } : {}),
      accountId,
      properties: {
        photos: profileData.photos,
        interests: profileData.interests,
      },
    };
  }

  /**
   * Produces the tokenURI for a metadata document.
   *
   * Metadata is inlined as a `data:` URI rather than uploaded. That keeps the
   * mint self-contained — no pinning service to keep paying for, and no
   * dangling gateway URL if one lapses — at the cost of a larger calldata
   * payload. For a profile card that is the right trade; photos are already
   * data URIs in this app.
   *
   * A production deployment would put this on IPFS and pin it.
   */
  async storeMetadata(metadata: ProfileMetadata): Promise<string> {
    const json = JSON.stringify(metadata);

    // btoa cannot handle multi-byte characters, which bios routinely contain
    // (accents, emoji). Encode to UTF-8 bytes first.
    const base64 =
      typeof Buffer !== "undefined"
        ? Buffer.from(json, "utf8").toString("base64")
        : btoa(String.fromCharCode(...new TextEncoder().encode(json)));

    return `data:application/json;base64,${base64}`;
  }
}

export const profileMetadataService = new ProfileMetadataService();
