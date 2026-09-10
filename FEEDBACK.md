# Integration feedback — ETHOnline 2026

Written while building [Proof of Heart](README.md) against World ID Selfie Check, World AgentKit /
AgentBook, and Hedera x402. Recorded as it happened rather than reconstructed afterwards.

**Context that shapes this feedback:** the integration was written from documentation only, without
running the SDKs (no Node on the build machine — see README limitations). That makes it an unusually
sharp test of whether the *docs alone* are sufficient to integrate correctly. Where I had to guess,
that is a documentation gap by definition, and those are the findings below.

Node became available later, and the flow was then run end to end against real credentials. Two of
the findings below — the AgentBook CLI's broken npx install, and the Orb verification requirement —
come from that run rather than from reading, and are marked as such. Everything else stands as
originally written.

---

## World ID — Selfie Check

### Blocking: the credential's own page has no technical reference

`docs.world.org/world-id/credentials/11` is the canonical page for Selfie Check. It gives the
credential id (11), the issuer (Tools for Humanity), Beta status, and a 90-day validity window —
all useful. It then says "Use IDKit to integrate Selfie Check into your application" and links on.

What it does **not** contain, and what I needed:

- the exact credential/preset identifier to request Selfie Check specifically
- the shape of the proof payload it returns
- the server-side verification endpoint
- any code sample

Every other credential integration presumably has the same problem. A credential page should be
self-sufficient: id, request snippet, response shape, verification call. Right now integrating
credential 11 requires reading three pages and still guessing one value.

### Blocking: the preset string for Selfie Check is not published anywhere

The IDKit reference documents `preset` with the example `orbLegacy()`. There is no list of presets,
and no statement of which preset selects Selfie Check. `docs.world.org/world-id/sandbox/testing-selfie-check`
addresses this by saying to contact a World point of contact.

For a hackathon that is a hard stop. There is no contact to reach on a Saturday, and the value is
not guessable from the credential id.

**What I did instead**, which I think is actually a better pattern and might be worth documenting as
the recommended one: I made the preset configurable and had the *server* assert the credential that
was actually issued, by checking `issuer_schema_id === 11` on the returned proof
(`app/api/world/verify/route.ts:160`). This fails closed — a misconfigured preset, or a client that
requested a weaker credential, is rejected rather than quietly admitted with a lesser guarantee.
Trusting the request would have been the naive reading of the docs.

**Ask:** publish the preset identifier on each credential page, and document
`issuer_schema_id`-checking as the server-side requirement it should be.

### Blocking for self-serve: Selfie Check must be enabled by a human

> "Selfie Check (Beta) must be enabled for your app before you can test it."

Combined with the missing preset string, this means Selfie Check cannot be integrated end to end by
a developer who only has Developer Portal access. For a prize track that asks people to build with
Selfie Check during a fixed-length online hackathon, a self-serve toggle — even one rate-limited to
sandbox apps — would change what is possible to ship.

### Confusing: `@worldcoin/idkit` and `@worldcoin/idkit-core` are presented as alternatives, but you need both

The install section reads as a choice:

> The React integration uses `@worldcoin/idkit` while the core JavaScript SDK requires
> `@worldcoin/idkit-core`.

So a React developer installs `@worldcoin/idkit` and stops. But `rp_context` must be signed with
`signRequest()` from `@worldcoin/idkit-core/signing`, which means a React app needs **both** — one
for the client widget, one for the server route. Nothing on the install page says so, and you only
discover it when you reach the RP-context section.

**Ask:** state on the install page that server-side signing requires `@worldcoin/idkit-core`
regardless of framework.

### Good, and unusually good: nullifier storage guidance

> Store the returned nullifier as `NUMERIC(78, 0)` … maintain a unique constraint on
> `(nullifier, action)`.

This is the most useful sentence in the World docs. It is specific, it is the correct schema, and
crucially it tells you *where the security property actually lives* — the Developer Portal validates
the proof, your backend enforces uniqueness. Most identity docs stop at "verify the proof" and leave
developers thinking that alone prevents duplicates. It does not, and this says so.

Two small additions would help:

- Say what to do without Postgres. I had to normalise hex to a decimal string by hand
  (`app/lib/identity/nullifier-registry.ts`) to avoid treating `0x0a…` and `10…` as different
  people. That normalisation step is a real footgun and is not mentioned.
- Note explicitly that the same person re-verifying on a new device must be allowed to reclaim
  *their own* nullifier. A naive unique constraint locks legitimate users out of their own account
  after a reinstall. I handled it as same-nullifier-same-account → refresh, different account →
  reject, but the docs do not raise the case.

### Sandbox App: good state taxonomy, undocumented responses

The hot / cold / semi-cold framing is genuinely helpful and I have not seen another identity vendor
document test states that clearly. Naming the enrollment interleaving ("if not enrolled in Selfie
Check, World ID walks them through enrollment first, then match") saved me from assuming enrollment
was a precondition.

Gaps:

- **No documented response shape or error catalogue.** The page says what the user does, never what
  the app receives. I could not build error handling from it — I had to write defensively against
  unknown failure modes and guess at what a rejection looks like.
- **No test-user story.** For duplicate-rejection testing I need two identities on demand. The
  documented answer is a second physical device and a second real face. I ended up building a
  seed-based sandbox path of my own (`verifySandbox`, seed → deterministic nullifier) purely so the
  one-human-one-profile behaviour was demonstrable. A first-party equivalent — signed synthetic
  proofs for sandbox apps, with a controllable nullifier — would remove the single largest testing
  obstacle in this integration.
- **Distribution friction.** TestFlight or private Play links, not public store builds. For a remote
  online hackathon where judging is asynchronous, that is a meaningful barrier: I cannot ask a judge
  to join a TestFlight group to see the flow work.

### Edge case you document, which deserves a fix rather than a note

> On iOS, if the user taps "Sign in" instead of "Sign up" mid-flow, there's no path to add the
> invite code.

This is a dead end with no recovery, on the most common recovery path (reinstall). Worth an
in-app escape hatch rather than a documentation caveat.

---

## World AgentKit / AgentBook

AgentBook is the most interesting primitive I used this hackathon. "Is there a verified human behind
this agent?" is exactly the question an agent-mediated product needs answered, and having it
resolvable by a third party — rather than asserted by whoever operates the agent — is what made the
screening feature defensible instead of theatrical. The `agentkit.fetch()` design, where AgentKit
verification is attempted first and x402 payment is the fallback, is a genuinely elegant fit for
reaching a paid endpoint on another chain. I want to say that clearly before the criticism.

### Blocking: no documented programmatic registration path

Registration is documented only as an interactive CLI:

```
npx @worldcoin/agentkit-cli register <agent-address>
```

with three steps that include "prompting World App verification". That is fine for registering *my*
agent. It does not work for the shape almost every real application has: **registering an agent on
behalf of a user, during signup, from a server.** My app mints one agent per verified human at twin
creation; there is no terminal in that flow.

I attempted a programmatic path by probing for a `registerAgent` / `register` export
(`app/lib/identity/agent-book.ts:123`) and falling back to marking the agent locally unregistered.
That is a guess, and my UI has to say "Registered locally" instead of claiming an AgentBook
registration I cannot confirm — which weakens the exact property the feature exists to demonstrate.

**Ask:** document a server-side registration API, or state plainly that per-user agent registration
is out of scope for now so builders can design around it.

### Blocking for a remote hackathon: registration requires Orb verification

*Found by running the CLI, not by reading.*

The registration docs say the CLI "prompts World App verification", which reads as the same
verification any World App user can complete. It is not. Scanning the QR opens World App on a
**Verify with Orb** screen whose only two options are *I'm with an Orb* and *Find an Orb*. There is
no device-level path, and `agentkit register --help` exposes no verification-level flag — the only
options are `--auto` and `--manual`, both about relay submission.

So AgentBook registration requires a physical iris scan at an Orb. For an online hackathon that is
a hard stop for any participant who does not happen to live near one, and unlike the Selfie Check
enablement problem it cannot be unblocked by a World contact either.

The requirement itself is defensible — Orb uniqueness is *why* AgentBook's answer is worth
anything, and weakening it to device-level would make the registry much less meaningful. The problem
is purely that it is not stated. Nothing on the registration page says "you must be Orb-verified
before this command can succeed", so you discover it after installing the CLI, generating an agent
wallet, and scanning a QR.

The practical consequence for this app: every resolution returns `source: 'local'`
(`app/lib/identity/agent-book.ts:100–109`), so the human-backing claim is honest but not
independently checkable — the one property AgentBook exists to provide. Notably, the payment gate
keys on `humanBacked` rather than on AgentBook registration
(`app/api/twin/infer/route.ts:68`), so paid inference still works; the demo degrades in exactly one
dimension rather than breaking.

**Ask:** state the required verification level on the registration page, above the install command.
Two sentences would have saved the whole detour. Longer term, an Orb-less sandbox registry — clearly
marked as unverifiable, the way World's own sandbox apps are — would let remote hackathon
participants demonstrate the full round trip.

### Bug: `npx @worldcoin/agentkit-cli` cannot run at all

*Found by running the CLI, not by reading.*

The documented invocation fails immediately on a clean machine:

```
$ npx @worldcoin/agentkit-cli register 0x…
Need to install the following packages:
@worldcoin/agentkit-cli@0.2.0
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'react' imported from
  /home/…/.npm/_npx/8862a722702986de/node_modules/zustand/esm/index.mjs
```

`zustand` imports `react`, React is a peer dependency, and npx installs the CLI standalone — so
nothing satisfies it. A command-line tool has no business depending on React at all; it is presumably
reaching a browser-oriented store module. Node v24.21.0, npm 11.19.0.

Two things make this harder to work around than it looks:

- `npx -p react -p @worldcoin/agentkit-cli agentkit …` does **not** fix it. npx does not place the
  extra package in the sandbox `node_modules`, so the resolution failure is identical.
- The published bin is named `agentkit`, not `@worldcoin/agentkit-cli`, so the `-p` form needs a
  different name than the documented invocation — an easy second dead end.

What actually works is installing the CLI into a project that already has React, so `zustand`
resolves it by walking up the tree:

```
npm i -D @worldcoin/agentkit-cli
npx agentkit register 0x…
```

That is what this repo now does (`package.json`, `agent:register`). Once it loads, the CLI is good:
`agentkit status <address>` is a genuinely useful read-only check, and its output names the registry
contract and chain, which answered the Base-vs-World-Chain question below faster than the docs did.

Minor, same area: `agentkit --help` self-reports `agentkit@0.1.0` while the published package is
`0.2.0`.

**Ask:** drop React from the CLI's dependency graph, or bundle it. Until then the install line in
the docs does not work as written.

### Blocking: `createAgentBookVerifier()`'s return shape is undocumented

> `createAgentBookVerifier()` … resolves registered agents against World Chain's canonical
> deployment and returns their anonymous human identifier if verified.

The prose promises a human identifier. It does not give the method name, the field name, or the
not-found behaviour. I wrote `verifier.resolve(agentId)` and read
`record?.humanIdentifier ?? record?.human_identifier` — two guesses stacked on a third
(`app/lib/identity/agent-book.ts:73–95`).

This is the single value the entire feature depends on. It needs a documented type.

Same gap for `createAgentkitHooks({ agentBook, storage, mode })`: `mode` has one example
(`{ type: 'free-trial', uses: 3 }`) and no enumeration, and `storage` has no documented shape at all.

### Confusing: the example signer declares Base, but registration is on World Chain

The client-init sample uses:

```typescript
chainId: 'eip155:8453',   // Base
```

while the registration section says "By default, registration occurs on World Chain through the
hosted relay" (World Chain being `eip155:480`). So the sample signer and the registry are on
different chains, with no explanation of whether that is intentional, a typo, or a genuine
separation of signing identity from registry location.

I made it configurable (`WORLD_AGENT_CHAIN_ID`, defaulting to `eip155:480`) because I could not
determine the right answer. Please either fix the sample or add a sentence saying why they differ.

### Ask: document what an agent should do with the human identifier

AgentBook hands back an anonymous human identifier. It is not obvious — and matters a great deal —
whether that value is safe to display, log, store long-term, or use as a cross-application join key.
I treated it as sensitive and truncated it before returning it to the browser
(`app/api/agent/resolve/route.ts`), on the assumption that a stable per-human identifier is a
correlation risk even when anonymous. If that is wrong, or unnecessarily strict, say so; if it is
right, the docs should say it.

---

## Hedera x402

### Good: the pay-per-request PoC is the best artefact across all three integrations

[`hedera-dev/x402-inference-pay-per-request-poc`](https://github.com/hedera-dev/x402-inference-pay-per-request-poc)
gave me the facilitator URLs, the network identifiers, the exact env var names, the two-phase
challenge/settle sequence, and the SSE status-stage UX. I built the client and server halves from it
directly. Documentation that ships a working reference implementation with real account IDs and the
actual header names is worth more than any amount of prose.

Its one stated limitation is also the one I most wanted solved: pricing is flat at $0.001 per
request, "not dynamically metered by token count or model output length — a stated limitation by
design". Since the Hedera track explicitly asks for metered rather than flat pricing, the reference
implementation demonstrates the thing the prize criteria discourage. Extending the PoC with a
metered example would be high leverage.

### Friction: metered pricing is not an obvious fit for the middleware shape

`withX402(handler, config, server)` takes a route config with a static `price`. Metering requires
the price to depend on the request body, and it must be known *before* the 402 challenge is issued.

I solved it by reading the body from `request.clone()`, computing a quote, then constructing the
config and the wrapped handler per request (`app/api/twin/infer/route.ts:88–166`). It works and is,
I think, the right pattern — but I inferred it. The docs present the config as a static declaration,
so my first three readings suggested per-request pricing simply was not expressible.

**Ask:** document dynamic pricing explicitly, either as a `price` callback or by showing the
clone-quote-wrap pattern. For any LLM endpoint this is the default case, not an edge case.

### Friction: header naming has drifted and both spellings are in circulation

The current spec uses `PAYMENT-SIGNATURE` (request), `PAYMENT-REQUIRED` (402 response) and
`PAYMENT-RESPONSE` (settlement). Older material and several third-party integrations still describe
`X-PAYMENT` / `X-PAYMENT-RESPONSE`. When you are writing a client against docs rather than against a
running server, that ambiguity is expensive — there is no 400 to correct you.

**Ask:** a one-line "header names changed in v2" note wherever the older names still appear.

### Friction: Hedera-specific x402 details live in a place you would not look

`@x402/hedera` — `ExactHederaScheme`, `createClientHederaSigner`, the `hedera:testnet` network
string — is documented in the general **buyer quickstart** at `docs.x402.org`, not on Hedera's own
x402 pages (`docs.hedera.com/solutions/ai/x402`, the Hedera x402 blog post). I found it by accident
after `npmjs.com/package/@x402/hedera` returned 403 to a non-browser request.

**Ask:** cross-link the Hedera x402 pages to the buyer/seller quickstarts, and put the scheme
registration snippet (`server.register('hedera:*', new ExactHederaScheme())`) directly on Hedera's
x402 page. It is four lines and it is the thing every Hedera x402 builder needs first.

### Ask: document how the resource server learns the payer

I wanted the payer's Hedera account in my HCS receipt, since a receipt without a payer is not much
of a receipt. The PoC describes the payer as "determined from the signed transaction header", but
there is no documented server-side accessor. I fell back to recording the agent id and the payee
(`app/api/twin/infer/route.ts`), which is weaker than I wanted.

### Minor: `npmjs.com` blocks non-browser fetches

`npmjs.com/package/@x402/hedera` and `/@x402/fetch` both returned 403 to a programmatic fetch. Not
your issue, but it meant the npm README — usually the fastest route to exact export names — was
unavailable, and export names were the thing I most needed.

---

## Cross-cutting

**One suggestion for all three.** Nearly every blocking issue above is a missing *type or exact
string* — the preset identifier, the AgentBook record shape, the payer accessor — not missing prose.
All three projects document their concepts well and their exact values poorly. Publishing the
TypeScript types for every value that crosses an API boundary would have removed roughly every guess
in this document.

**The two hard stops were both unstated prerequisites, not missing types.** Selfie Check must be
enabled for your app by a World contact; AgentBook registration requires Orb verification. Both are
reasonable requirements. Neither appears where a developer meets it — at the top of the page holding
the code sample they are about to run — so both were discovered after building against them. For a
fixed-length online hackathon, a one-line "before you start, you need X" on each integration page
is worth more than any amount of reference material further down.

**What worked without friction, for balance:** the x402 two-phase flow was unambiguous once found;
World's separation of proof-verification (theirs) from uniqueness-enforcement (mine) is the right
division and clearly stated; the Hedera portal-to-faucet-to-topic path is short; and AgentBook's
core abstraction needed no explanation at all — I understood what to build with it immediately,
which is the highest compliment I can pay a primitive.
