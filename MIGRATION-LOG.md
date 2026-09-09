# Migration Log — Proof of Heart (ETHOnline 2026)

Running record of the migration from the pre-existing stack (Verida + Cheqd) to the
ETHOnline 2026 sponsor stack (Hedera x402 + World ID Selfie Check + World AgentKit).

---

## Phase 0 — Baseline audit

**Date:** 2026-09-09
**Branch:** `master` (working directly; no `ethonline-2026` branch cut, see note)

### Toolchain

| Check | Result |
|---|---|
| `node -v` | **NOT INSTALLED** — no `node`, `npm`, `npx`, `nvm`, `fnm`, `volta` or `nodejs` dpkg package anywhere on the host |
| `npm install` | Could not run |
| `npm run build` | Could not run |
| `npm run dev` | Could not run |

**This is the condition the plan flags as a Phase 0 blocker.** It was reported to the
project owner, who elected to install Node separately and have implementation proceed in
parallel. Consequently:

- The runtime audit below is a **static** audit (source reading + dependency graph), not a
  click-through of a running app. It is labelled as such and must not be read as a
  verified runtime result.
- The plan's rule 1 ("never delete a file before its replacement passes `npm run build`")
  is honoured in its **spirit**: no legacy file is deleted until a complete replacement
  exists and every importer has been repointed. But no build has actually gated a
  deletion. Every deletion in this migration is therefore marked `UNVERIFIED-BY-BUILD`.

### Static flow audit

Assessed by tracing each screen's imports to the external services they depend on.

| Flow | Entry point | Verdict | Reason |
|---|---|---|---|
| Landing | `app/page.tsx` | **works** | Presentational; 9 legacy refs are UI copy only |
| Onboarding — welcome / agreements | `app/onboarding/components/steps/{welcome,agreements}-step.tsx` | **works** | No network dependency |
| Onboarding — connect wallet | `app/onboarding/components/steps/connect-wallet-step.tsx` | **blocked** | Dual Verida Vault + Leap/Cheqd wallet flow; 58 legacy refs, the heaviest single file |
| Onboarding — create DID | `app/onboarding/components/steps/create-did-step.tsx` | **blocked on expired credential** | Calls `studio-api.cheqd.net` with a hardcoded API key |
| Onboarding — verification | `app/onboarding/components/steps/verification-step.tsx` | **blocked** | Reads Cheqd credential state |
| Profile creation | `app/profile/components/steps/*` | **blocked on expired credential** | All writes route through Verida REST with a hardcoded `AUTH_TOKEN` |
| Profile NFT mint | `app/profile/components/steps/mint-nft-step.tsx` | **partially works** | ERC-721 mint on Unichain Sepolia is independent; the post-mint Cheqd DID-document update fails |
| Explore | `app/explore/page.tsx` | **works (mock data)** | Reads from `data/`, not Verida |
| Chats | `app/chats/components/*` | **blocked on expired credential** | `chat-message-service.ts` → Verida REST |
| Create twin | `app/create-twin/page.tsx` | **blocked on expired credential** | `verida-ai-twin-service.ts` → Verida REST |
| Chat with twin | `app/chat-with-twin/page.tsx` | **blocked on expired credential** | `verida-llm-service.ts` → Verida LLM API (Bedrock LLAMA3_70B proxy) |
| User settings | `app/user/components/*` | **blocked** | `did-settings.tsx`, `off-chain-data.tsx` read Verida/Cheqd state |

**Go/no-go verdict: GO.** Every blocked flow is blocked on exactly the two dependencies
this migration removes. No flow is blocked on a reason outside the migration's scope, and
the UI layer (~40 components, all Radix + Tailwind) is intact and independent of both
vendors. The blast radius is confined to `app/lib/` and `app/services/`.

### Security finding — act on this independently of the migration

`app/lib/verida-config.ts` contains two **live, hardcoded, committed** credentials:

- line 19 — Verida `AUTH_TOKEN`
- line 24 — Cheqd `CHEQD_API_KEY` (as a `NEXT_PUBLIC_*` default, so it also shipped to the browser)

Both are in public git history and cannot be removed by deleting the file. **Revoke both
at the provider.** They belong to services being dropped, so revocation costs nothing.

### Deviations from the plan, and why

1. **No `ethonline-2026` branch.** Work is on `master` at the owner's direction, to keep
   the commit trail linear and legible for Continuity judging.
2. **Plan file paths were stale.** The plan lists `app/onboarding/components/connect-wallet-step.tsx`
   and `app/profile/components/mint-nft-step.tsx`; the real files are one level deeper, under
   `steps/`. There is also a **second** `create-did-step.tsx` the plan misses entirely
   (`app/profile/components/steps/create-did-step.tsx`, 24 refs) and a
   `verify-identity-step.tsx`. Corrected paths are in `migration/inventory.md`.
3. **`CollectionName` needs a seventh member.** The plan's union omits
   `social_chat_message`, which `DB_NAMES.CHAT_MESSAGES` uses as a distinct database from
   `dating_messages`. Both are retained.

---

## Phase 1 — Inventory

`migration/inventory.txt` — 1002 raw matches (excluding `node_modules` and `package-lock.json`).
`migration/inventory.md` — full A/B/C/D/E classification.

Headline counts: 6 files are pure-legacy and get deleted outright; 4 service files keep
their public signatures and get new internals; ~30 components need only identifier and
copy changes.
