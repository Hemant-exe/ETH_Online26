# Migration Plan — ETHOnline 2026

**Repo:** `Dating-Blockchain` (product: VeraLove)
**Goal:** Remove all Verida + Cheqd dependencies from the codebase, replace them with Hedera x402 payments and World ID (Selfie Check + AgentKit), and ship a working demo before the submission deadline.
**Deadline:** Sunday 13 September 2026, 12:00 pm EDT (9:30 pm IST). Target internal cutoff: **6:00 pm IST Sunday.**

---

## 0. Rules for the agent — read before touching anything

These are non-negotiable. Violating any of them costs more time than it saves.

1. **Never delete a file before its replacement passes `npm run build`.** Stub first, verify, then delete.
2. **Do not rewrite git history.** ETHGlobal's Continuity Track judging requires a visible diff between pre-existing work and new work. Rewriting history looks like concealment and is the fastest way to be disqualified.
3. **Commit at the end of every phase**, with the phase number in the message (e.g. `phase-3: replace Cheqd DID with World ID human anchor`). Never squash. Single-commit repos on the final day are explicitly penalised.
4. **Do not invent SDK call signatures.** Where this plan says "consult docs," fetch the linked documentation and follow it. If a documented API differs from what's described here, the docs win — note the discrepancy in `FEEDBACK.md`.
5. **Preserve every public method signature** on `profile-service.ts`, `chat-message-service.ts`, and `verida-ai-twin-service.ts` when swapping their internals. Callers across ~25 components must not change.
6. **Scope discipline.** Do not refactor styling, upgrade Next.js, fix unrelated lint errors, or reorganise directories. Every phase below is on a five-day budget.
7. **If a phase overruns its time box by more than 50%, stop and report** rather than continuing. Phases 6 and 7 are cuttable; phases 1–5 are not.

---

## 1. Target architecture

| Concern | Before (remove) | After (build) |
|---|---|---|
| Profile / chat / twin storage | Verida encrypted DBs (`@verida/client-ts`) | `StorageAdapter` interface, IndexedDB implementation, identical DB names |
| Human identity | Cheqd DID + verifiable credentials | World ID Selfie Check → `nullifier_hash` as the human anchor |
| Agent identity | *(none)* | World AgentKit, registered in AgentBook; optional HCS-14 UAID on Hedera |
| Twin inference | Verida LLM API (`verida-llm-service.ts`) | Own x402-gated inference endpoint on Hedera, metered per call in HBAR |
| Payments | *(none)* | x402 via Blocky402 facilitator on Hedera testnet |
| Audit trail | *(none)* | HCS topic recording every paid inference receipt |
| Profile NFT | ERC-721 on Unichain Sepolia, DID doc updated on Cheqd | Same contract; metadata points at World nullifier + AgentBook agent ID |

### The headline feature — "twin-to-twin screening date"

Two users' AI twins hold a short conversation and produce a compatibility report before the humans are connected. Each turn of that conversation is a paid x402 call against the Hedera-hosted inference endpoint. Both twins must be registered in AgentBook as human-backed agents. Selfie Check gates signup.

This single feature satisfies all three prize tracks. Build toward it; everything else is supporting work.

---

## 2. Reference documentation

Fetch these before writing integration code. Do not work from memory.

**Hedera / x402**
- x402 protocol — https://github.com/x402-foundation/x402
- Blocky402 facilitator — https://blocky402.com/
- Pay-per-request inference PoC — https://github.com/hedera-dev/x402-inference-pay-per-request-poc
- Hedera Agent Kit (JS) — https://github.com/hashgraph/hedera-agent-kit-js
- Hedera docs — https://docs.hedera.com/
- Hedera + x402 background — https://hedera.com/blog/hedera-and-the-x402-payment-standard/

**World**
- AgentKit integration — https://docs.world.org/agents/agent-kit/integrate
- AgentBook registration — https://docs.world.org/agents/agent-kit/integrate#step-2-register-the-agent-in-agentbook
- AgentKit repo — https://github.com/worldcoin/agentkit
- Selfie Check credential — https://docs.world.org/world-id/credentials/11
- Selfie Check sandbox testing — https://docs.world.org/world-id/sandbox/testing-selfie-check
- Sandbox access — https://docs.world.org/world-id/sandbox/sandbox-access
- Developer Portal — https://developer.world.org

---

## 3. Phase 0 — Baseline and go/no-go (target: 2 hours, Tuesday night)

**This phase decides whether the whole plan is viable. Do not skip it.**

```bash
git checkout -b ethonline-2026
node -v                      # must be 18+
npm install
npm run dev
```

Then:

1. Open the app. Click through onboarding, profile creation, explore, chats, create-twin.
2. Record in `MIGRATION-LOG.md`, for each flow: **works / broken / blocked on expired credential**.
3. Run `npm run build` and record whether it passes on a clean checkout.

**Go/no-go gate.** If the app does not compile and serve at least the profile and twin-creation screens, stop and report. A half-revived legacy app is worse than a small new build with two days left.

Expected breakage, and how to handle it:
- Verida `AUTH_TOKEN` expired → expected, phase 2 removes it entirely. Not a blocker.
- `CHEQD_API_KEY` invalid → expected, phase 3 removes it. Not a blocker.
- Next.js 14 fails to build under the installed Node → **this is a blocker**, report immediately.

Commit: `phase-0: baseline audit on clean checkout`

---

## 4. Phase 1 — Inventory, no deletions (target: 45 minutes)

Produce a complete map before removing anything.

```bash
grep -rniE "verida|cheqd|veralove|did:vda|did:cheqd|@verida/" \
  --include="*.ts" --include="*.tsx" --include="*.js" --include="*.json" \
  --include="*.md" --include="*.env*" . \
  | grep -v node_modules > migration/inventory.txt

wc -l migration/inventory.txt
```

Write `migration/inventory.md` classifying every hit into exactly one bucket:

- **A — Storage call sites.** Read/write of profile, preferences, photos, matches, messages, twin data.
- **B — Identity call sites.** DID creation, wallet connection, credential verification.
- **C — Inference call sites.** Twin response generation.
- **D — Cosmetic.** Names in strings, comments, UI copy, docs, env var names.
- **E — Dead.** Imported but never called.

Known files, from the project structure — verify each still exists:

```
app/lib/verida-config.ts              app/lib/verida-client.ts
app/lib/verida-client-wrapper.tsx     app/lib/clientside-verida.tsx
app/lib/verida-schema-mapping.ts      app/lib/verida-token-utils.ts
app/lib/verida-ai-twin-service.ts     app/lib/verida-llm-service.ts
app/lib/cheqd-service.ts              app/lib/profile-service.ts
app/lib/profile-rest-service.ts       app/lib/chat-message-service.ts
app/lib/ai-twin-chat-service.ts
app/services/nft-service.ts           app/services/profile-metadata-service.ts
app/onboarding/components/connect-wallet-step.tsx
app/onboarding/components/create-did-step.tsx
app/onboarding/components/verification-step.tsx
app/user/components/did-settings.tsx
app/user/components/off-chain-data.tsx
app/profile/components/mint-nft-step.tsx
CHEQD-NFT-CREATION.md                 NFT-MINTING.md
```

Commit: `phase-1: inventory of legacy sponsor dependencies`

---

## 5. Phase 2 — Storage abstraction (target: 4 hours, Wednesday)

Replace Verida storage without changing a single caller.

**Create `app/lib/storage/types.ts`:**

```ts
export type CollectionName =
  | "dating_profile"
  | "dating_preferences"
  | "dating_photos"
  | "dating_matches"
  | "dating_messages"
  | "twin_profile";        // was "favourite" under the old schema

export interface StorageAdapter {
  get<T>(collection: CollectionName, id: string): Promise<T | null>;
  list<T>(collection: CollectionName, filter?: Record<string, unknown>): Promise<T[]>;
  put<T>(collection: CollectionName, id: string, value: T): Promise<void>;
  delete(collection: CollectionName, id: string): Promise<void>;
}
```

**Create `app/lib/storage/local-adapter.ts`** — IndexedDB implementation (use `idb`, add it as a dependency). Keep collection names identical so existing shape assumptions hold. Fall back to `localStorage` if IndexedDB is unavailable.

**Create `app/lib/storage/index.ts`** exporting a singleton `storage: StorageAdapter`.

**Then rewrite the internals only** of:
- `app/lib/profile-service.ts`
- `app/lib/profile-rest-service.ts` → collapse into `profile-service.ts` if it is a thin wrapper; otherwise point it at `storage`
- `app/lib/chat-message-service.ts`
- `app/lib/verida-ai-twin-service.ts` → **rename file to `app/lib/twin-profile-service.ts`**, keep every exported symbol name

Delete once build passes: `verida-config.ts`, `verida-client.ts`, `verida-client-wrapper.tsx`, `clientside-verida.tsx`, `verida-schema-mapping.ts`, `verida-token-utils.ts`.

Remove from `package.json`: `@verida/client-ts`, `@verida/account-web-vault`. Run `npm install` after.

**Gate:** `npm run build` passes. Profile creation and twin creation both round-trip data after a page refresh.

Commit: `phase-2: replace Verida storage with local StorageAdapter`

---

## 6. Phase 3 — World ID Selfie Check as the human anchor (target: 4 hours, Wednesday/Thursday)

Replaces Cheqd DID + verifiable credentials.

1. Register the app in the World Developer Portal. Request Sandbox access (required by both World prizes).
2. Add `@worldcoin/idkit`. **Consult the Selfie Check credential docs for the exact credential type and verification level** — do not guess.
3. Create `app/lib/identity/world-id-service.ts`:
   - `startSelfieCheck()` — launches the IDKit flow
   - `verifyProof(proof)` — server-side verification via the Developer Portal verify endpoint. **Verification must be server-side.** Client-only verification is trivially spoofable and judges will check.
   - Returns `{ nullifierHash, verifiedAt, credentialType }`
4. Create `app/api/world/verify/route.ts` — the server verification handler.
5. Store `nullifierHash` in `dating_profile` as `humanAnchor`. This is the uniqueness key: one nullifier, one profile.

**Rewire these components:**
- `app/onboarding/components/connect-wallet-step.tsx` → drop the dual Verida/Cheqd wallet flow, keep only the EVM wallet connect needed for the NFT
- `app/onboarding/components/create-did-step.tsx` → rename to `verify-human-step.tsx`, replace DID creation with Selfie Check
- `app/onboarding/components/verification-step.tsx` → show verified-human status from the nullifier
- `app/user/components/did-settings.tsx` → rename to `identity-settings.tsx`, show human-verification status and agent registration status

**Product surface — do this, it is what the prize rewards.** Selfie Check must act as a *risk and abuse-prevention signal*, not a decorative badge:
- Unverified profiles are visible in Explore but flagged and rate-limited
- One nullifier can hold exactly one active profile (this is the anti-catfishing demo)
- Verified users may filter Explore to verified-only

Delete `app/lib/cheqd-service.ts` and `CHEQD-NFT-CREATION.md` once the build passes.

**Start `FEEDBACK.md` now, in this phase.** Both World prizes require a feedback document covering docs quality, Developer Portal navigation, and Sandbox App states/errors/edge cases. Write it as you hit friction. Reconstructing it on Sunday produces a worthless document and it is a scored deliverable.

Commit: `phase-3: replace Cheqd DID with World ID Selfie Check human anchor`

---

## 7. Phase 4 — AgentKit + AgentBook for the AI Twin (target: 4 hours, Thursday)

1. Add AgentKit per the integration guide.
2. Create `app/lib/identity/agent-identity-service.ts`:
   - `registerTwinAsAgent(nullifierHash, twinProfile)` → registers in AgentBook, returns an agent ID
   - `resolveAgent(agentId)` → returns the agent record plus its human-backing status
   - Persist `agentId` on the twin record
3. Register the twin at the end of the create-twin flow (`app/create-twin/page.tsx`).
4. Surface an "agent backed by verified human" badge in `app/user/components/profile-snapshot.tsx` and in chat.
5. **Every twin-to-twin message must carry the sender's agent ID and be rejected if the agent does not resolve to a human-backed identity.** This enforcement is the demo.

**Stretch, only if time permits:** mirror the agent identity on Hedera as an HCS-14 UAID or ERC-8004 record. Hedera awards bonus points for on-chain agent identity. Skip without hesitation if behind schedule.

Commit: `phase-4: register AI twins as human-backed agents via AgentKit/AgentBook`

---

## 8. Phase 5 — x402-gated inference on Hedera (target: 5 hours, Friday)

**This is the core Hedera qualification requirement. It must work end to end or the Hedera submission is invalid.**

Replaces `app/lib/verida-llm-service.ts`.

1. Create a Hedera testnet account, fund it from the faucet. Add operator credentials to `.env.local`.
2. Create an HCS topic for payment receipts; store the topic ID in env.
3. **Server — `app/api/twin/infer/route.ts`:**
   - Gate the route with x402 middleware, settled through the Blocky402 facilitator on Hedera
   - Price per call in HBAR, read from `TWIN_INFERENCE_PRICE_HBAR`
   - On successful payment: call the LLM provider, return the completion
   - On success: publish `{ payer, agentId, priceHbar, timestamp, requestHash }` to the HCS topic
   - Return `402` with a valid payment challenge when unpaid
4. **Client — `app/lib/twin-inference-service.ts`** (replaces `verida-llm-service.ts`): an x402-aware client that receives the 402 challenge, settles, and retries. Consult the pay-per-request PoC repo for the settlement pattern.
5. Rewire `app/lib/ai-twin-chat-service.ts` and `app/chat-with-twin/page.tsx` to route through it.
6. Show a live per-message cost and running HBAR spend in the chat UI. Judges need to *see* the meter.

**Gate — this is the hard requirement:** a real paid request completes end to end against Hedera testnet, and its receipt is visible on HashScan. Capture the transaction link the moment it works; you need it in the video.

Delete `app/lib/verida-llm-service.ts`.

Commit: `phase-5: x402-gated twin inference on Hedera with HCS receipts`

---

## 9. Phase 6 — Twin-to-twin screening date (target: 6 hours, Saturday)

The headline feature. Everything before this was plumbing.

1. Create `app/lib/twin-negotiation-service.ts`:
   - `runScreeningDate(agentIdA, agentIdB, turns = 4)`
   - Both agents must resolve as human-backed via AgentKit, or throw before spending anything
   - Alternate turns; each turn is a paid x402 call
   - Produce `{ compatibilityScore, sharedInterests, frictionPoints, transcript, totalCostHbar, hcsMessageIds }`
2. Add `app/api/screening/route.ts` to orchestrate server-side.
3. Add a "Screen with my twin" action in `app/explore/page.tsx`.
4. Build `app/screening/[matchId]/page.tsx` — the report view: score, transcript, total HBAR spent, HashScan links, both agents' human-backed badges.
5. Only after a screening passes a threshold does direct human chat unlock in `app/chats/`.

**Bonus alignment, cheap to add:** frame the alternating turns as A2A-style negotiation and say so in the README. Hedera awards extra points for multi-agent negotiation and settlement.

Commit: `phase-6: twin-to-twin paid screening date with compatibility report`

---

## 10. Phase 7 — Purge and verify (target: 1.5 hours, Saturday night)

```bash
grep -rniE "verida|cheqd|did:vda|did:cheqd|@verida/" \
  --include="*.ts" --include="*.tsx" --include="*.js" --include="*.json" \
  . | grep -v node_modules | grep -v migration/
```

**This must return zero results outside `migration/` and `README.md`.**

Checklist:
- [ ] `package.json` and `package-lock.json` contain no `@verida/*`
- [ ] `.env.local` and `.env.example` contain no `VERIDA_*` or `CHEQD_*`
- [ ] `CHEQD-NFT-CREATION.md` deleted; `NFT-MINTING.md` scrubbed of DID-document references
- [ ] No filename contains `verida` or `cheqd`
- [ ] `app/services/profile-metadata-service.ts` emits the World nullifier and agent ID instead of a Cheqd DID
- [ ] `npm run build` passes clean

**Product rename (optional).** "VeraLove" echoes "Verida." If renaming, do it in one mechanical pass across UI strings, `package.json` name, and metadata — nothing else. Skip if behind schedule; the name is not scored.

**Important — do not scrub the README of history.** Continuity judging requires you to state plainly what existed before the event and what you built during it. Code should be free of dead dependencies; the *narrative* must be honest about the prior stack. Concealing it is the one thing that gets a Continuity submission thrown out.

Commit: `phase-7: purge legacy sponsor references from codebase`

---

## 11. Phase 8 — Submission artifacts (target: 4 hours, Sunday morning)

Treat this as the highest-value phase. Partner judging is asynchronous — nobody will ask you a clarifying question.

**`README.md`** must contain, in this order:
1. One-paragraph problem statement (romance scams, bot profiles, undisclosed AI in dating)
2. **"Before this hackathon" / "Built during ETHOnline 2026"** — an explicit two-column split, with a commit range or diff link
3. Architecture diagram or a clear ASCII flow
4. Per-sponsor integration section, each with **direct file paths and line numbers**:
   - Hedera — x402 endpoint, facilitator settlement, HCS topic ID, HashScan links
   - World Selfie Check — where the credential gates behaviour, server-side verification path
   - World AgentKit — AgentBook registration, human-backing enforcement point
5. Local setup and env var reference
6. Known limitations, stated honestly

**`FEEDBACK.md`** — required by both World prizes. Cover: AgentKit docs and integration flow; Developer Portal navigation, search, product discovery, debugging; Sandbox App states, proof flows, test users, errors, edge cases; and specifically what was confusing, missing, broken, or hard to test. Specific beats polite.

**Demo video, 5 minutes maximum.** Hedera caps at five minutes; ETHGlobal's showcase prefers 2–4. Shot order:
1. (0:00) The problem, 20 seconds, no preamble
2. (0:20) Selfie Check at signup → verified badge → second signup with the same nullifier is rejected
3. (1:10) Twin registered in AgentBook as human-backed
4. (1:40) **Screening date running, with the HBAR meter ticking per turn** — this is the money shot
5. (3:00) HashScan showing the settled payments and the HCS receipt topic
6. (3:40) Compatibility report, human chat unlocking
7. (4:20) What is new versus what pre-existed, 20 seconds

**Submit the Uniswap-style feedback forms and the ETHGlobal submission by 6:00 pm IST.** The deadline is 9:30 pm IST; the buffer is not optional.

Commit: `phase-8: submission artifacts`

---

## 12. Cut list, in order

If Saturday night arrives and the build is not stable, cut in this exact order:

1. HCS-14 / ERC-8004 on-chain agent identity (phase 4 stretch)
2. Product rename (phase 7)
3. Migrating ProfileNFT to Hedera
4. Screening date reduced from 4 turns to 2
5. Compatibility report reduced to score + transcript only, no analysis
6. **Phase 6 entirely** — fall back to a single paid twin conversation. Two World prizes plus Hedera remain valid.

**Never cut:** server-side World proof verification, the one working end-to-end x402 payment, `FEEDBACK.md`, the demo video.

---

## 13. Acceptance criteria

Hedera — AI & Agentic Payments:
- [ ] Live x402-gated service on Hedera testnet, settled via Blocky402
- [ ] A platform/agent consuming it, with at least one real paid request completed end to end
- [ ] Public repo with README covering setup, architecture, and the payment flow
- [ ] Demo video ≤ 5 minutes showing the paid request executing
- [ ] Metered per-call pricing rather than a flat fee
- [ ] HCS audit trail of payments

World — Selfie Check:
- [ ] Selfie Check used meaningfully, as a risk/eligibility/abuse-prevention signal
- [ ] World ID Sandbox App used to test and demo remotely
- [ ] `FEEDBACK.md` covering all four required areas
- [ ] Working app demonstrated

World — AgentKit (Continuity):
- [ ] AgentKit used meaningfully
- [ ] Agents registered and resolved through AgentBook
- [ ] Sandbox App used for remote testing
- [ ] `FEEDBACK.md` present
- [ ] README clearly separates pre-existing from new work

ETHGlobal:
- [ ] **Continuity Track confirmed on the Hacker Dashboard** — verify this on day one
- [ ] Daily commits from the start of the event, never a single final-day commit
- [ ] Submitted well before 12:00 pm EDT Sunday 13 September

---

## 14. Environment variables

Remove:
```
NEXT_PUBLIC_VERIDA_NETWORK
NEXT_PUBLIC_CONTEXT_NAME
NEXT_PUBLIC_CHEQD_API_KEY
```

Add:
```
# World
NEXT_PUBLIC_WORLD_APP_ID=
NEXT_PUBLIC_WORLD_ACTION_ID=
WORLD_API_KEY=

# Hedera
NEXT_PUBLIC_HEDERA_NETWORK=testnet
HEDERA_OPERATOR_ID=
HEDERA_OPERATOR_KEY=
NEXT_PUBLIC_HCS_RECEIPT_TOPIC_ID=

# x402
X402_FACILITATOR_URL=
X402_PAY_TO_ACCOUNT=
TWIN_INFERENCE_PRICE_HBAR=

# LLM provider
LLM_API_KEY=
LLM_BASE_URL=
```

Keep:
```
NEXT_PUBLIC_LOGO_URL
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS
NEXT_PUBLIC_UNICHAIN_RPC_URL
```

Commit `.env.example` with every key present and all values blank.
