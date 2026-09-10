# Proof of Heart

**Dating where every profile is provably human, and your AI twin screens the date before you do.**

Built for [ETHOnline 2026](https://ethglobal.com/events/ethonline2026) · Continuity Track

---

## The problem

Online dating has an authenticity problem that no amount of moderation fixes. The FTC put
reported romance-scam losses in the billions, and the mechanism is always the same: one person
operates many fake profiles, cheaply. Platforms respond with photo checks and phone verification,
which raise the cost of a fake profile without ever capping how many one person can hold. Generative
AI has made this worse in both directions — a scammer's profile photos and chat are now free to
produce, and honest users increasingly can't tell whether they are talking to a person, a bot, or a
person using a bot. Proof of Heart attacks the structural version of the problem: **one verified
human can hold exactly one profile**, enforced server-side by a World ID nullifier, and every AI
twin that speaks on someone's behalf must resolve through AgentBook to a verified human — with each
of its utterances a metered, auditable payment on Hedera, so operating twins at spam scale costs real
money.

---

## Before this hackathon / built during ETHOnline 2026

This is a Continuity Track submission, and this section says plainly what existed before the
event and what did not.

**Pre-event baseline:** the [`pre-ethonline`](../../tree/pre-ethonline) branch holds the codebase
exactly as it stood before ETHOnline 2026, as a single baseline commit dated 2025-05-19 (tagged
[`pre-ethonline-final`](../../releases/tag/pre-ethonline-final)). The original commit-by-commit
history from Apr–May 2025 is preserved on
[`archive/full-history`](../../tree/archive/full-history).

**Diff:** [`pre-ethonline..master`](../../compare/pre-ethonline..master) is every line written
during ETHOnline 2026. `master` itself carries only ETHOnline-dated commits; the baseline is on its
own branch rather than in `master`'s ancestry, so use the two-dot form above to compare them.

| Pre-existing (built Apr–May 2025) | Built during ETHOnline 2026 |
|---|---|
| Next.js 14 app shell, routing, ~40 Radix + Tailwind components, landing page, onboarding / profile / explore / chat / twin-creation screens | — |
| Twin profile schema (life story, personality, values, communication) and its prompt builders | Reused unchanged, now driving paid twin-to-twin negotiation |
| `ProfileNFT` ERC-721 on Unichain Sepolia (`0x968Cd0…c464E`) | Metadata reworked to publish the World nullifier and AgentBook agent id instead of opaque identifier strings |
| Storage via a third-party encrypted-database vendor | **`StorageAdapter`** + IndexedDB implementation, localStorage / in-memory fallbacks |
| Identity via third-party DIDs and verifiable credentials | **World ID Selfie Check** as the human anchor, verified server-side, one nullifier = one profile |
| Twin inference via a vendor-hosted LLM proxy | **Own x402-gated inference endpoint on Hedera**, metered per call in HBAR |
| *(none)* | **World AgentKit / AgentBook** — twins registered as human-backed agents, enforced on every call |
| *(none)* | **Hedera x402 payments** settled through the Blocky402 facilitator |
| *(none)* | **HCS audit topic** carrying a receipt for every paid inference |
| *(none)* | **Twin-to-twin screening date** — the headline feature |
| An arithmetic captcha as the bot check; two mandatory wallet connections before Explore | Selfie Check replaces the captcha; browsing needs no wallet at all |

Also removed during the event: 6 dead modules with zero importers, 3 dev-only routes, a duplicate
`app/components/landing/` tree, a vendor font `postinstall` patch, 4 webpack rules and 6
devDependencies that existed only to work around it, and two live credentials that had been
hardcoded and committed. The pre-existing docs are preserved under
[`migration/legacy-docs/`](migration/legacy-docs/); the audit that drove all of this is
[`MIGRATION-LOG.md`](MIGRATION-LOG.md) and [`migration/inventory.md`](migration/inventory.md).

---

## Architecture

```
                    ┌──────────────────────────────────────────┐
  SIGNUP            │  World ID Selfie Check (credential 11)   │
                    └───────────────────┬──────────────────────┘
                                        │ proof payload (unchanged)
                    ┌───────────────────▼──────────────────────┐
                    │  POST /api/world/verify        SERVER    │
                    │  1. verify at developer.world.org        │
                    │  2. assert issuer_schema_id === 11       │
                    │  3. claimNullifier() — atomic, unique    │
                    └───────────────────┬──────────────────────┘
                                        │ nullifierHash = human anchor
                                        ▼
                            accountId = f(anchor)          ← one human, one account
                                        │
            ┌───────────────────────────┴───────────────────────────┐
            ▼                                                       ▼
  ┌──────────────────┐                              ┌───────────────────────────┐
  │ StorageAdapter   │  profile, photos, prefs,     │  POST /api/agent/register │
  │ IndexedDB (local)│  chats, twin — never leaves  │  ensureAgent(anchor)      │
  └──────────────────┘  the browser                 │  → AgentBook registration │
                                                     └────────────┬──────────────┘
                                                                  │ agentId
  SCREENING                                                       ▼
  ┌──────────────────────────────────────────────────────────────────────────────┐
  │  POST /api/screening  →  runScreeningDate(agentA, agentB, turns)             │
  │                                                                              │
  │  ① resolveAgent(A) and resolveAgent(B) via AgentBook                         │
  │     ✗ not human-backed → abort BEFORE any payment                            │
  │                                                                              │
  │  ② for each turn (alternating — A2A-style negotiation):                      │
  │        │                                                                     │
  │        ├─► POST /api/twin/infer ──────────────────────────────┐              │
  │        │      ✓ AgentBook human-backing check (again)         │              │
  │        │      ✓ quoteInference() — metered from THIS request  │              │
  │        │      ↓                                               │              │
  │        │   402 Payment Required  ── PAYMENT-REQUIRED header ──┤              │
  │        │      ↓                                               │              │
  │        │   sign Hedera transfer (agent's key, server-side)    │              │
  │        │      ↓  PAYMENT-SIGNATURE                            │              │
  │        │   Blocky402 facilitator: /verify → co-sign → submit  │              │
  │        │      ↓                                               │              │
  │        │   run inference (Claude) ─► publish HCS receipt ─────┘              │
  │        │                              {payer, agentId, priceHbar,            │
  │        │                               requestHash, tokens}                  │
  │        ▼                                                                     │
  │  ③ final paid call: compatibility analysis → score + friction points         │
  └───────────────────────────────┬──────────────────────────────────────────────┘
                                  ▼
              /screening/[matchId] — score, transcript, per-turn HBAR,
                                    HashScan links, human-backed badges
                                  │
                                  ▼  score ≥ threshold
                            direct human chat unlocks
```

Three properties are load-bearing, and each is enforced in a place the browser cannot reach:

- **Proof verification is server-side.** A client that could assert its own verification would make
  the uniqueness guarantee decorative.
- **Human-backing is checked before money moves.** Otherwise an unbacked bot could burn a real
  user's HBAR by getting itself invited to a screening.
- **The screening verdict is stored server-side.** It gates who may message whom, so a user must not
  be able to edit their own compatibility score.

---

## Sponsor integrations

### Hedera — AI & Agentic Payments

| What | Where |
|---|---|
| x402-gated inference endpoint | [`app/api/twin/infer/route.ts`](app/api/twin/infer/route.ts) — gate at `:157–166` |
| Resource server + Hedera `exact` scheme | [`app/lib/x402/resource-server.ts:43–51`](app/lib/x402/resource-server.ts#L43) |
| Facilitator (Blocky402, `hedera:testnet`) | [`app/lib/x402/resource-server.ts:26`](app/lib/x402/resource-server.ts#L26) |
| Paying client — 402 → sign → retry → settle | [`app/lib/x402/pay-client.ts:43–60`](app/lib/x402/pay-client.ts#L43), settlement read at `:100` |
| **Metered** pricing (not flat) | [`app/lib/x402/pricing.ts:57`](app/lib/x402/pricing.ts#L57) — `base + prompt tokens + requested output tokens` |
| HCS receipt publishing | [`app/lib/hedera/hcs-receipts.ts:73–110`](app/lib/hedera/hcs-receipts.ts#L73) |
| Request commitment (hash, not plaintext) | [`app/lib/hedera/hcs-receipts.ts:61`](app/lib/hedera/hcs-receipts.ts#L61) |
| Topic setup | [`scripts/create-hcs-topic.mjs`](scripts/create-hcs-topic.mjs) — `npm run hedera:create-topic` |
| Multi-agent negotiation + settlement | [`app/lib/twin-negotiation-service.ts:143`](app/lib/twin-negotiation-service.ts#L143) |

Pricing is metered rather than flat because a four-turn screening over two long twin profiles costs
materially more to serve than a one-line reply, and charging both the same either overcharges the
cheap call or subsidises the expensive one. The quote is computed from the actual request body
*before* the 402 challenge is issued, so the challenge carries that exact amount. Receipts commit to
a SHA-256 of the request rather than its text — the prompt is somebody's dating conversation.

**Topic ID and HashScan links:** filled in at `NEXT_PUBLIC_HCS_RECEIPT_TOPIC_ID` after running the
setup script. Every settled turn also renders its own HashScan link in the screening report.

### World — Selfie Check

| What | Where |
|---|---|
| Server-side proof verification | [`app/api/world/verify/route.ts:124`](app/api/world/verify/route.ts#L124) |
| Credential assertion — `issuer_schema_id === 11` | [`app/api/world/verify/route.ts:160`](app/api/world/verify/route.ts#L160) |
| One nullifier = one profile (atomic claim) | [`app/lib/identity/nullifier-registry.ts:102–140`](app/lib/identity/nullifier-registry.ts#L102) |
| Duplicate rejection surfaced to the user | [`app/api/world/verify/route.ts:195`](app/api/world/verify/route.ts#L195) |
| RP context signing (server-only key) | [`app/api/world/context/route.ts:57–66`](app/api/world/context/route.ts#L57) |
| IDKit widget + sandbox path | [`app/components/identity/selfie-check-panel.tsx`](app/components/identity/selfie-check-panel.tsx) |
| Human anchor on the account | [`app/lib/account/session.ts`](app/lib/account/session.ts) — `attachHumanAnchor` |

Selfie Check is used as a **risk and abuse-prevention signal**, not a badge:

- One nullifier holds exactly one active profile — a second signup with the same face is refused
  with `409 NULLIFIER_ALREADY_CLAIMED`. This is the anti-catfishing demo.
- Unverified profiles remain visible in Explore but are **flagged and ranked below** verified ones
  ([`app/lib/profile-repository.ts`](app/lib/profile-repository.ts) — `searchProfiles`), rather than
  hidden. Concealing them would remove the incentive to verify.
- Verified users can filter Explore to verified-only (`verifiedOnly` in `ProfileSearchCriteria`).
- **Only verified humans can run a twin screening**, because the counterpart's twin refuses to talk
  to an agent with no human behind it.

The server asserts the *issued* credential id rather than trusting what the client requested — a
client that asked for a weaker credential fails closed instead of being quietly admitted.

### World — AgentKit / AgentBook

| What | Where |
|---|---|
| AgentBook verifier | [`app/lib/identity/agent-book.ts:55`](app/lib/identity/agent-book.ts#L55) — `createAgentBookVerifier()` |
| Agent resolution + human-backing | [`app/lib/identity/agent-book.ts:73`](app/lib/identity/agent-book.ts#L73) |
| AgentBook registration | [`app/lib/identity/agent-book.ts:123`](app/lib/identity/agent-book.ts#L123), route at [`app/api/agent/register/route.ts`](app/api/agent/register/route.ts) |
| Agent-bound fetch (`agentkit.fetch`) | [`app/lib/identity/agent-book.ts:159–170`](app/lib/identity/agent-book.ts#L159) |
| One agent per verified human | [`app/lib/identity/agent-registry.ts`](app/lib/identity/agent-registry.ts) — `ensureAgent`, keyed on the nullifier |
| **Enforcement point** — inference | [`app/api/twin/infer/route.ts:66–78`](app/api/twin/infer/route.ts#L66) |
| **Enforcement point** — screening | [`app/lib/twin-negotiation-service.ts:160`](app/lib/twin-negotiation-service.ts#L160) |
| Badge in UI | [`app/screening/[matchId]/page.tsx`](app/screening/%5BmatchId%5D/page.tsx), [`app/user/components/identity-settings.tsx`](app/user/components/identity-settings.tsx) |

Agent keys are held server-side, deliberately: a twin must be able to take its turn in a screening
while its owner's tab is closed, and an agent key in client code could be lifted and used to
impersonate that twin. Agents are keyed on the human anchor, so one verification cannot be used to
run several "human-backed" twins.

`agentkit.fetch()` is a natural fit here — it attempts AgentKit verification first and falls back to
a standard x402 flow, which is exactly the shape needed to reach a Hedera-settled paid endpoint with
the agent's signature travelling along.

---

## Running it locally

```bash
node -v            # 18+
npm install
cp .env.example .env.local
npm run dev        # http://localhost:3000
```

**The app runs with `.env.local` entirely blank.** Every integration degrades to a clearly labelled
sandbox path, so you can click the whole flow before obtaining credentials — it simply cannot make
real proofs or real payments, and says so in the UI rather than pretending otherwise.

To make it real:

```bash
# 1. Hedera testnet account at https://portal.hedera.com, fund from the faucet.
#    Set HEDERA_OPERATOR_ID / HEDERA_OPERATOR_KEY, then:
npm run hedera:create-topic          # prints NEXT_PUBLIC_HCS_RECEIPT_TOPIC_ID

# 2. Set X402_PAY_TO_ACCOUNT (receiver) and HEDERA_AGENT_* (payer).

# 3. World app at https://developer.world.org — request Sandbox access and ask
#    your World contact to enable Selfie Check (credential 11) for the app.
#    Set NEXT_PUBLIC_WORLD_APP_ID, NEXT_PUBLIC_WORLD_RP_ID, WORLD_RP_SIGNING_KEY.

# 4. Register the twin agent in AgentBook (interactive, needs World App):
npm run agent:register -- <agent-address>    # address shown in Identity settings

# 5. Set LLM_API_KEY for real twin responses.
```

Full variable reference with per-key notes: [`.env.example`](.env.example).

### Demo path

1. `/onboarding` → skip the wallet → **Verify You're Human** (Selfie Check, or a sandbox seed).
2. Try verifying a *second* account with the same face or seed → refused, one human one profile.
3. `/create-twin` → fill in the twin → it auto-registers in AgentBook as human-backed.
4. `/explore` → **Screen with my twin** → pick a counterpart, choose turn count, watch the HBAR
   estimate.
5. `/screening/[matchId]` → score, transcript, per-turn HBAR, HashScan link per settled payment.
6. Clear the threshold → direct chat unlocks in `/chats`.

Server-side demo state (nullifier claims, agent keys, screening reports) lives under `.data/` and is
gitignored. Delete it to reset the demo.

---

## Known limitations

Stated honestly; none of these are hidden in the demo.

- **Nothing here has been compiled or run.** Node.js was not installed on the machine this was
  written on, so `npm install`, `npm run build` and `npm run dev` were never executed. Every
  integration follows fetched documentation rather than a green build, and the deletions in the
  migration are marked `UNVERIFIED-BY-BUILD` in [`MIGRATION-LOG.md`](MIGRATION-LOG.md). Expect to
  fix type and import errors on first build. This is the single biggest caveat on the submission.
- **Server-side state is JSON files, not a database.** The nullifier registry, agent registry and
  screening reports are files under `.data/`, serialised through an in-process promise chain. That
  is single-process only. A real deployment needs a unique index on `(nullifier, action)` — which is
  what World's docs recommend — and a KMS for agent keys.
- **Agent keys are stored in plaintext** in `.data/agents.json`. Acceptable for a testnet demo, not
  for anything else.
- **Twin profiles are posted to the screening route** by the client, because profiles live in the
  browser. The server holds agent identity and payment keys, not user content — so a screening
  trusts the initiator for the *content* of both twins while still enforcing identity and payment
  independently.
- **Token counts in the price quote are estimated** at ~4 characters per token, because the price
  must be known before the model runs. Deliberately biased to over-estimate; the quote is never
  revised upward after the fact.
- **The Selfie Check credential preset string is not documented** by World, so it is configurable
  (`NEXT_PUBLIC_WORLD_CREDENTIAL_PRESET`) and the server validates `issuer_schema_id` instead. See
  [`FEEDBACK.md`](FEEDBACK.md).
- **AgentBook registration may fall back to local.** The documented registration path is an
  interactive CLI; the programmatic path is attempted and, if unavailable, the agent is marked
  `registeredInAgentBook: false` and the UI says "Registered locally" rather than claiming a
  registration that did not happen.
- **Explore still renders mock profiles** from `data/mock-profiles`. The screening panel works
  against real registered twins; the browse feed was left on fixtures.
- **`abi/ProfileNFT.json` retains a `veridaURI` parameter name.** It describes the already-deployed
  contract and was deliberately not renamed — the ABI must keep matching the bytecode on chain.
- **Profile NFT stays on Unichain Sepolia** rather than moving to Hedera. Migrating a deployed
  contract was on the cut list and was cut.

## Feedback for sponsors

[`FEEDBACK.md`](FEEDBACK.md) — documentation gaps, Developer Portal navigation, Sandbox behaviour,
and the specific places integration was harder than it needed to be.
