# Phase 1 — Legacy dependency inventory

Source: `migration/inventory.txt` — 1002 matches for
`verida|cheqd|veralove|did:vda|did:cheqd|@verida/` across `*.ts *.tsx *.js *.json *.md`,
excluding `node_modules` and `package-lock.json`. 74 files.

Every hit is classified into exactly one bucket:

| Bucket | Meaning | Files | Action |
|---|---|---|---|
| **A** | Storage call sites | 6 | New internals, signatures preserved |
| **B** | Identity call sites | 9 | Rewired to World ID |
| **C** | Inference call sites | 4 | Rewired to x402 endpoint |
| **D** | Cosmetic (copy, comments, names) | 51 | Mechanical rename pass |
| **E** | Dead (imported by nothing) | 4 | Delete outright |

---

## The real dependency hub

The plan assumes `verida-client-wrapper.tsx` is the integration point. It is not — it is a
6-line re-export. The actual hub is **`app/lib/clientside-verida.tsx`, imported by 15
components**. It is the single highest-leverage file in the migration.

Two API surfaces must survive the swap or ~25 components break:

**1. The `veridaClient` singleton** (`app/lib/verida-client.ts:216`)

```
init(): Promise<void>              connect(): Promise<boolean>
disconnect(): void                 isConnected(): boolean
getDid(): string | null            openDatabase(dbName): Promise<any>
saveData(dbName, data): Promise<any>   getData(dbName, options?): Promise<any[]>
getAccount() / getClient() / getContext()
```

Only 7 of these are actually called from components: `init`, `connect`, `disconnect`,
`isConnected`, `getDid`, `getClient`, `openDatabase`. `saveData`/`getData`/`getAccount`/
`getContext` are called only from within `app/lib/`.

**2. The React hooks** (`app/lib/clientside-verida.tsx`)

`useVeridaClient()` · `useProfileService()` · `useProfileRestService()` ·
`useProfileChanges()` · `VeridaAuthButton`

### Rename map applied in Phase 7

| Legacy | Replacement |
|---|---|
| `app/lib/clientside-verida.tsx` | `app/lib/account/hooks.tsx` |
| `app/lib/verida-client-wrapper.tsx` | `app/lib/account/session.ts` |
| `veridaClient` | `accountSession` |
| `useVeridaClient` | `useAccountSession` |
| `VeridaAuthButton` | `WorldVerifyButton` |
| `getDid()` | `getAccountId()` (`getDid` kept as a deprecated alias through Phase 6) |

---

## Bucket A — Storage call sites

| File | Hits | Disposition |
|---|---|---|
| `app/lib/profile-service.ts` | 51 | Rewrite internals onto `StorageAdapter`. Keep all 6 `ProfileService` statics: `saveProfile`, `getProfile`, `saveProfilePhoto`, `getProfilePhotos`, `savePreferences`, `getPreferences` |
| `app/lib/verida-ai-twin-service.ts` | 35 | → `app/lib/twin-profile-service.ts`. Keep `saveAiTwin`, `getUserAiTwin`, `getUserAiTwins`, `formatAiTwinData` |
| `app/lib/chat-message-service.ts` | 18 | Rewrite internals. Keep 11 exports incl. `saveMessage`, `getMessages`, `getChatGroups`, `createChatGroup`, `markMessagesAsRead` |
| `app/lib/profile-rest-service.ts` | 11 | Thin REST wrapper over the same data → collapse onto `storage`, keep `ProfileRestService` object shape |
| `app/lib/verida-client.ts` | 22 | → `app/lib/account/session.ts`, same 7 public methods |
| `app/lib/clientside-verida.tsx` | 27 | → `app/lib/account/hooks.tsx`, same hook names (renamed per map above) |

Collection names are preserved exactly so existing shape assumptions hold:

```
dating_profile  dating_preferences  dating_photos
dating_matches  dating_messages     favourite  social_chat_message
```

> **Plan correction.** The plan's `CollectionName` union has six members and omits
> `social_chat_message`, which `DB_NAMES.CHAT_MESSAGES` uses as a database distinct from
> `dating_messages`. Seven members are required. The plan also renames `favourite` →
> `twin_profile`; the physical key stays `favourite` to avoid a data migration, with
> `twin_profile` as the logical alias.

## Bucket B — Identity call sites

| File | Hits | Disposition |
|---|---|---|
| `app/onboarding/components/steps/connect-wallet-step.tsx` | **58** | Heaviest file. Strip dual Verida-Vault + Leap/Cheqd flow, keep EVM connect for the NFT |
| `app/lib/cheqd-service.ts` | 29 | **Delete.** `createKeypair`, `createDid`, `updateDid`, `updateDidWithNFT`, `setupCheqdWallet`, `hexToBase58` all die with it |
| `app/profile/components/steps/create-did-step.tsx` | 24 | → `verify-human-step.tsx` (Selfie Check) |
| `app/user/components/off-chain-data.tsx` | 39 | Repoint at local storage |
| `app/user/components/did-settings.tsx` | 15 | → `identity-settings.tsx` |
| `app/lib/verida-config.ts` | 15 | **Delete.** Holds two live committed secrets — see MIGRATION-LOG.md |
| `app/lib/verida-token-utils.ts` | 4 | **Delete** (bucket E overlap: zero importers) |
| `app/onboarding/components/steps/create-did-step.tsx` | 2 | → Selfie Check |
| `app/onboarding/components/steps/{verification,verify-identity}-step.tsx` | 3 | Show verified-human status from the nullifier |

> **Plan correction.** The plan lists one `create-did-step.tsx` under
> `app/onboarding/components/`. There are in fact **two**, both one level deeper under
> `steps/` — and the `app/profile/` copy (24 hits) is the substantive one the plan misses.
> The plan's paths for `connect-wallet-step.tsx`, `verification-step.tsx` and
> `mint-nft-step.tsx` are likewise all missing the `steps/` segment.

## Bucket C — Inference call sites

| File | Hits | Disposition |
|---|---|---|
| `app/lib/verida-llm-service.ts` | 3 | **Delete.** Currently proxies AWS Bedrock `LLAMA3_70B` via `api.verida.ai`. Replaced by `app/lib/twin-inference-service.ts` |
| `app/lib/ai-twin-chat-service.ts` | 1 | Repoint `generateAiTwinChatResponse` at the x402 client |
| `app/lib/prompts/ai-twin-service.ts` | 1 | Swap import only; prompt templates reused as-is |
| `app/chat-with-twin/page.tsx` | 5 | Add per-message HBAR cost meter |

## Bucket D — Cosmetic (51 files)

Product-name and copy changes only, no behaviour. Handled in one mechanical pass in
Phase 7. Largest: `README.md` (138), `PROFILE-README.md` (28), `CHEQD-NFT-CREATION.md`
(34, deleted), `NFT-MINTING.md` (14, scrubbed), `app/profile/components/steps/basic-info-step.tsx`
(34), `app/chats/components/conversation-panel.tsx` (31),
`app/profile/components/steps/mint-nft-step.tsx` (23),
`app/create-twin/components/ai-twin-creation-form.tsx` (20),
`app/chats/components/chat-interface.tsx` (21),
`app/onboarding/components/steps/success-step.tsx` (15),
`app/user/components/nft-details.tsx` (13), `app/components/dating-navbar.tsx` (11),
`app/services/profile-metadata-service.ts` (10, also emits the new anchor fields),
plus `components/landing/*` and assorted 1–9 hit files.

`abi/ProfileNFT.json` (2 hits) — the on-chain ABI. Hits are in a `did` parameter name.
**Do not touch**; the deployed contract's ABI must continue to match.

## Bucket E — Dead (zero importers)

| File | Hits | Note |
|---|---|---|
| `app/lib/verida-token-utils.ts` | 4 | No importers |
| `app/components/verida-auth-example.tsx` | 7 | Demo scaffold |
| `app/lib/testapi.ts` | 17 | Imported only by `app/components/TestVeridaAPI.tsx`, itself unreferenced |
| `app/components/{TestVeridaAPI,test-verida-api}.tsx` | 11 | Test scaffolds; `app/test/page.tsx` and `app/api-test/page.tsx` are dev-only routes |

All delete outright. `app/test/`, `app/api-test/` and `app/chat-test-page/` are dev
scratch routes and go with them.

---

## Dependency removal

`package.json`: `@verida/client-ts`, `@verida/account-web-vault`, `@verida/types`,
`@types/bs58`, `bs58` (bs58 exists only for Cheqd's `hexToBase58`).

Also review `patches/` and `patch-script.sh` — the `postinstall` hook patches Verida
transitive deps and will break once they are gone.
