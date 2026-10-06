# Platform Distribution + MCP Tool Design

Research date: 2026-10-06. Items marked **[U]** could not be confirmed from a primary source. Classification is out of scope here: every tool takes a known HTS code.

---

## Part 1 — The channels as of October 2026

### The context that matters most

- **US tariff rules keep changing, and that helps us.** SCOTUS struck down the IEEPA tariffs on Feb 20. Section 122's 10% global tariff ran Feb 24 – Jul 24 (expired Jul 24). Section 301 "forced-labor" duties of 10–12.5% on 60 countries started Jul 24 and are being challenged in court. Section 232 was revised again on Apr 2 and Jun 1. The IEEPA refund process (CAPE) opened phase 3 today. De minimis has been suspended since Aug 2025, and its statutory repeal takes effect Jul 1, 2027. Generic LLM answers are stale. A time-aware stacking engine that cites its sources is the thing we can win on.
  - **Action item:** confirm that `tariffs/engine-v2` covers the Jul 24 Section 301 forced-labor headings and the Section 122 expiry on Jul 24.
- **Competitors are already in the AI directories.**
  - **Gateway Lines Tariff Calculator MCP** (launched Aug 6): approved in ChatGPT, works in Claude, Gemini and Cursor. It does 301/232 stacking and change tracking. Its free tier is 10 requests/week behind an email signup.
  - Also live: ustariffrates.com (MCP plus the DutyCalc Shopify app), tariffmonitor-mcp, Opsloft, Global Trade Alert, and Avalara (classification).
  - We would not be first, but the bar is low: low free limits, gated behind email.
- **MCP is now one standard across platforms.** The 2026-07-28 spec is final and stateless (no session IDs). The **MCP Apps** UI extension (`ui://` resources) is final. It renders in Claude (web, desktop, mobile), ChatGPT, M365 Copilot, VS Code Copilot, Cursor and Goose. **One server plus one UI bundle covers every AI channel.**

### Channel scorecard

| Channel | State | Reach for our buyer | Upsell allowed? | Effort | Verdict |
|---|---|---|---|---|---|
| **Claude Connectors Directory** | Open to any paid account since ~Sep 25. Automated scan gives a "Community" listing; Anthropic may escalate to "Verified" on its own call. No fee. | Medium–high. **Suggested Connectors**: Claude offers one-click install in chat when a listing fits the task, ranked by usage. Connectors work on all plans (Free can add only 1 custom connector). | **Yes, within limits.** Links out are allowed; your own domains can be allow-listed so link opens skip the confirm prompt. No ads and no promotional text in tool descriptions. Requiring a paid plan seems acceptable, since the form asks what accounts or plans users need **[U]**. | Low once the server exists | **#1** |
| **ChatGPT Plugin Directory** (apps were renamed plugins on Jul 9; one directory shared with Codex) | Open since Dec 2025. Needs a verified developer. Median ~11 days to approval, with outliers of 6–11 weeks. | Large user base, but **observed traffic is thin**. Bloomberg (Mar 2026): apps are hard to find, with little traffic. Developers report 0–5 tool calls/day. The model weights *past usage*, which favors incumbents. | **No.** No digital subscriptions "directly or indirectly (e.g. freemium upsells)". No showing plans, promoting upgrades, or linking to checkout. Existing subscribers *may* sign in and use their plan. You may say a feature isn't on the user's plan and link to an **informational** page. | Same server, plus an OpenAI review checklist (Figma screenshots, demo video on desktop, iOS and Android, test account, dark mode, CSP domains) | **#2.** Brand and acquisition only. Never sell in it. |
| Official MCP Registry plus aggregators (Smithery, Glama, PulseMCP, mcp.so) | Registry is still "preview". Namespace verified by DNS (`com.htshero/...`). | Close to zero consumers. Developers, backlinks, and other clients that sync from the registry. | n/a | Hours | **Do it.** Cheap. |
| Microsoft 365 Copilot / Copilot Studio | MCP connectors GA (Apr 2026); M365 Copilot renders MCP Apps. | Enterprise trade teams, but admins must enable it. | Org-controlled | Low (same server) | Later, for enterprise deals |
| Gemini, Perplexity, Mistral | Accept custom MCP URLs. Third-party directories are curated, with no open submission **[U]**. | Low unless invited | — | — | Watch |
| **Google Sheets add-on / Excel add-in** | Custom functions like `=HTSHERO_DUTY(...)`. Sheets needs only non-restricted scopes, so no CASA audit. AppSource certification takes ~1–2 weeks. | Brokers and procurement live in spreadsheets. Weak store discovery, but **high intent to pay** for bulk work. | Yes. Billing is ours. | Medium. Needs the public API. | **#3.** Strongest *paid* bridge. |
| **Shopify App Store** | Embedded app required. **Must bill through Shopify** (0% share up to $1M lifetime, then 15%). Review takes 8–10 business days, often 30+. Sidekick extensions opened Jun 17, but no cross-sells inside Sidekick. | Many SMB importers. Variants already store HS code and country of origin, so catalog exposure works without classification. Shopify's own duties tools cover the **checkout / outbound** side, not importer margin. Competitors (DutyCalc, TariffShield, SkuWatch, Duty Diligence) have **0 reviews**. | Only through Shopify Billing. Linking out to a separate web app for core features is discouraged. | High | **#4**, once Tracker accounts and catalogs live server-side. Ship it as "Tariff exposure scan", its own product. |
| Chrome extension (Alibaba, Amazon overlay) | Allowed with narrow host permissions and disclosure. | Sourcing stage. Crowded (Tariff Lens, AliTariffs…). **Needs HTS codes inferred from product titles, i.e. classification.** | Yes | Low–medium | Defer. Depends on classification. |
| Zapier / n8n / Make | Zapier listing needs 10 templates and 50 active users. n8n requires verified nodes published from GitHub Actions. | Retention for API customers, not top-of-funnel | Yes | Medium | After the public API exists |
| Amazon SP-API Appstore | The SP-API fee was cancelled May 12. Security review still applies. Unclear whether the seller's HTS code is exposed **[U]**. | Good fit, poor channel | — | High | Skip |

### Risks across all channels

1. **Traffic may be small.** The research found no evidence of large listing traffic on either AI directory. Treat the first build as a cheap experiment, track every call server-side, and set a 60-day review point.
2. **The model may answer from memory.** Once it answers from memory, that conversation is lost to us. Tool descriptions are tuned by testing (see the golden-prompt set below), not by stuffing keywords.
3. **Platform policy changes quickly.** In the last 10 months: apps became plugins, Instant Checkout was pulled, and the submission format changed. Anthropic's position on upsells is unwritten. **Mitigation:** one funnel policy that is compliant everywhere (Part 2). Never put pricing in a tool result or the widget.
4. **Liability.** A confidently wrong number gets quoted back to us. Every result should carry the revision, effective date, a citation per provision, and a disclaimer.
5. **Data churn.** Litigation can flip a rate overnight. The engine's verified-revision cadence becomes a public promise.
6. **Analytics are minimal.** ChatGPT gives developers almost nothing, so build our own logging.

---

## Part 2 — Funnel strategy

**The rule:** the conversion we aim for *inside* an AI client is a **free HTS Hero account with a tracked product**, never a purchase. The selling happens later in channels we own: email alerts, the Tariff Tracker web app, and catalog-size limits. This works on ChatGPT, where we can't upsell, and on Claude, where we probably can. We maintain one policy, not per-platform branches.

Why this fits the product:
- Tracker pricing is per **HTS×country pair** (`TRACKER_TIERS`). The `track_product` tool directly fills the unit we charge for.
- **Change alerts** are the natural reason to sign in: "Tell me when this changes" can't be answered from memory and needs an email.
- Once a catalog exists, plan limits come up naturally in the web app and in email. When limits exist, the AI client only ever says something like "you're tracking 10 of 10 products on your plan. Manage at htshero.com/tariff-tracker" (an informational link, allowed on ChatGPT).

### Access: capabilities first, no limits yet

**Decision (2026-10-06):** build the capabilities now and define and enforce plan limits later. The only line drawn today is **identity, not price**. A tool needs sign-in only when it reads or writes *the user's own* data. The tool contracts below already return `catalog: { used, limit }` with `limit: null`, so adding limits later needs no tool changes.

| | Anonymous (no auth) | Signed in (OAuth, lazy) |
|---|---|---|
| Calculate duty for one product, answer engine questions | ✅ | ✅ |
| Compare origins (named countries or all ~198) | ✅ | ✅ |
| Duty history (every verified revision, including backfilled ones) | ✅ | ✅ |
| Recent tariff changes feed | ✅ | ✅, plus filtering to *my* products |
| Track a product and get email alerts | — (triggers sign-in) | ✅ |
| List or remove my tracked products | — | ✅ |
| Batch calculation | ✅ | ✅ |

The only throttling is abuse protection: a rate limit per IP and per OAuth client. This also beats Gateway Lines on generosity, since it has an email wall at 10 requests/week. Anonymous calls cost almost nothing because the engine is pure TypeScript and results are cacheable.

### Links back to the app

Every result includes `links` that the model or widget can show. They are informational and deep, never to pricing:
- `full_breakdown_url`: `/duty-calculator?code=&country=&value=&units=&date=&mode=&pref=&answers=` (format from `calculatorUrl`, `components/duty-calculator/lib/estimate.ts:83`)
- `analysis_url`: `/tariff-tracker?product=<digits>-<ISO2>`. **Gap:** the product view's Duty/Analysis/Entries sub-tab is React state only (`ProductView.tsx:55`). Add a `&view=analysis` param so links can land on Analysis.
- `hts_page_url`: `/hts/<dotted code>`. Also helps SEO.
- All links carry `utm_source=<client>&utm_medium=mcp&utm_campaign=<tool>` so Mixpanel can attribute signups.

---

## Part 3 — MCP tool design

### Server shape
- **Endpoint:** `https://htshero.com/api/mcp`. Stateless Streamable HTTP, served from a Next.js route handler on Vercel. Make sure `/.well-known/*` routes are served and not swallowed by `middleware.ts`.
- **Server name:** `hts-hero`. Registry namespace: `com.htshero/tariff-calculator`.
- **Auth:** lazy, using the Supabase OAuth 2.1 server (see "Auth provider" below).
  - Public tools work without a token.
  - Account tools return **HTTP 401 + `WWW-Authenticate`** that points at Protected Resource Metadata. Do not return `200 isError`.
  - ChatGPT also needs `securitySchemes` on each tool and `_meta["mcp/www_authenticate"]`.
- **Every response** includes:
  - `as_of`: the entry date used
  - `rates_revision`: the HTS revision whose base rates were used
  - `rules_revision`: the verified revision whose Chapter 99 rules were used
  - `verified: boolean`
  - `disclaimer`
  - `links`
- **Annotations:** every tool has a `title`, `readOnlyHint`, `destructiveHint` and `openWorldHint: false` (the HTS is a closed dataset). Both directories reject wrong values.
- **Descriptions:** start with "Use this when…", say when *not* to use the tool, give parameter examples. No promotional language and no pricing.

### Auth provider — recommendation: **Supabase Auth's OAuth 2.1 server**

HTS Hero already runs on Supabase Auth. Turning on its OAuth server makes Supabase the authorization server for MCP clients:
- The MCP access token is a Supabase JWT whose `sub` is the same `auth.users` id the web app uses.
- So these all work unchanged:
  - `identifyUserServer(sub)` in Mixpanel, which gives one identity across the web app, Claude and ChatGPT
  - the `purchases` table, and later plan checks
  - RLS on a `tracked_products` table
  - the Tracker reading the same catalog

Why this fits:
- **Same login.** Users sign in with their existing HTS Hero login (email, Google, whatever is enabled today). There's no second user database to keep in sync.
- **Branded consent page.** It lives on htshero.com (e.g. `/oauth/consent`), so you own that page's analytics and copy.
- **Security.**
  - OAuth 2.1 with PKCE, short-lived JWTs and refresh-token rotation.
  - Tokens are verified against Supabase's JWKS.
  - Users can revoke an app, and so can you per client.
  - No new vendor holding user data.
- **Cost:** included in the Supabase plan.

The gap, and how to handle it:
- **No CIMD yet.** As of Oct 2026, Supabase reports `client_id_metadata_document_supported: false` (supabase/auth#2850, opened Oct 2).
- **What happens instead:** Claude and ChatGPT both fall back to **Dynamic Client Registration**. That works, but every new connection registers a new "Claude" client.
- **Mitigation:** a weekly cron that deletes DCR clients with no token activity in N days. Tag each Mixpanel event with the client's registered `client_name`, not its `client_id`.
- **When Supabase ships CIMD:** it's a dashboard toggle. Nothing changes in the MCP server.

**Fallback:** if DCR causes problems in directory review, or you later need enterprise SSO, put **WorkOS AuthKit "Standalone Connect"** in front.
- AuthKit becomes the authorization server and supports CIMD today. It sends the user to *your* login page (Supabase), then you call its completion API with the Supabase user id.
- Identity stays your Supabase id, but tokens are issued by WorkOS. That adds a vendor, and the MCP server has to map WorkOS tokens to Supabase ids.
- Not worth doing until it's needed.

Not recommended: Clerk, Auth0 or Stytch. Each would mean migrating users or running two identity systems, which breaks "track everything properly".

### Tools

#### 1. `calculate_import_duty` — public, read-only
> Use this when the user wants the US import duty or tariff cost for a product whose 10-digit HTS code they know, from a specific country of origin. Returns every applicable duty layer (base rate, Section 301, Section 232, other Chapter 99 measures) plus MPF/HMF fees. Do not use it to find an HTS code from a product description.

Input:
```ts
{
  hts_code: string            // "8471.30.0100" or "8471300100"
  country_of_origin: string   // ISO2, e.g. "CN"
  customs_value_usd?: number  // default 10000
  quantity?: number           // only needed when result.requires_quantity
  transport_mode?: "ocean"|"air"|"truck"|"rail"   // default ocean (HMF)
  entry_date?: string         // YYYY-MM-DD, default today; any date covered by verified revisions (grows as the backfill lands)
  trade_program?: string      // SPI symbol, e.g. "S" (USMCA)
  answers?: Record<string, boolean|number|string>  // ids from a previous result's `questions`
}
```
Output (`structuredContent`, mapped from `CalculationResult`, `tariffs/engine-v2/types.ts:260`):
```ts
{
  product: { hts_code, description, country, entry_date },
  totals: { duty_usd, fees_usd, landed_duty_usd, effective_rate_pct },
  layers: [{ code: "9903.88.15", name, program, status: "applies"|"excluded"|"notApplicable"|"needsAnswer",
             rate_pct, basis_usd, amount_usd, reason, source, learn_more_url }],  // learn_more_url → SEO pillar articles
  fees: [{ name: "MPF"|"HMF", amount_usd }],
  available_trade_programs: [{ symbol, name, would_change_rate_pct }],
  questions: [{ id, prompt, type, affects: ["9903.81.91"], answered }],  // the model asks the user, then calls again with `answers`
  warnings: string[],
  as_of, rates_revision, rules_revision, verified, disclaimer,
  links: { full_breakdown_url, analysis_url, hts_page_url, methodology_url }
}
```
UI: `ui://hts-hero/duty-card` shows a stacked bar of layers, the total and any open questions. It has **2 actions maximum** (a Claude limit):
- **"Open full breakdown"**: a link.
- **"Track changes"**: calls `track_product`, which triggers sign-in.

The engine's `questions` (e.g. steel content %, exclusion confirmations) make this conversational: the model asks the user and recalculates, which a static calculator can't do.

#### 2. `compare_origins` — public, read-only
> Use this when the user asks which country is cheapest to import a product from, or how duty differs between countries of origin, for a known HTS code.

Input: `{ hts_code, countries?: string[], all_origins?: boolean, customs_value_usd?, transport_mode?, entry_date?, answers? }`

Output:
- A ranked list: `[{ country, effective_rate_pct, duty_usd, best_trade_program?, rate_with_program_pct?, tier }]`
- `cheapest`, `most_expensive`, `links.analysis_url`

It reuses `originRates()` and `rateTiers()` from the Tracker's Analysis tab (`components/tariff-tracker/product/analysis/analysis.ts`).

UI: a ranked bar chart. Its link action goes to the Tracker product Analysis view, where the globe and flag swarm live. Those make a strong "see more in the app" moment.

#### 3. `get_duty_history` — public, read-only
> Use this when the user asks how the tariff on a product has changed over time, what it was on a past entry date, or how much a specific tariff measure added during a period.

Input: `{ hts_code, country_of_origin, from?, to?, customs_value_usd?, answers? }`

Output: segments `[{ from, to, rules_revision, rates_revision, effective_rate_pct, changed_layers: [{ code, change: "added"|"removed"|"rate_changed", before_pct, after_pct }] }]`, plus `coverage: { verified_from, verified_to }`.

It wraps `calculateHistory` (`tariffs/engine-v2/history.ts:101`) and the Tracker's `originHistory` / `changeEvents`.

**This tool grows with the backfill.** Today it covers Apr 2026 onward. Once revisions back to 2025 are verified, it answers "how much IEEPA / Section 122 did I pay on this entry?", which feeds the IEEPA refund demand (~$166B collected, CAPE phase 3 opened today). A dedicated `estimate_tariff_refund` tool could follow later.

#### 4. `get_hts_code` — public, read-only
> Use this when the user gives an HTS code and wants its description, base duty rates (general, special, column 2) or parent headings. Do not use it to search by product description.

Output: `{ hts_code, description, indent_path: [{ code, description }], base_rates: { general, special, other }, special_programs: [...], chapter_99_measures_that_may_apply: [{ code, name }], links.hts_page_url }`.

It wraps `getHtsElementByCode` and `getHtsElementParentsServer` (`libs/hts-server.ts:72,79`).

#### 5. `get_recent_tariff_changes` — public, personalized when signed in
> Use this when the user asks what has changed in US tariffs recently, or whether a recent HTS revision affects them.

Input: `{ since?: string, limit?: number /* ≤20 */, only_my_products?: boolean /* signed in */ }`

Output: entries from `tariff_changelog` (`libs/supabase/tariff-changelog.ts:37`, published entries only).
- With `only_my_products`, each entry also lists the tracked products it affects and their rate change.
- Each entry links to the SEO "Latest US Tariff Changes" article.

#### 6. `track_product` — signed in, write (not destructive)
> Use this when the user wants to monitor a product's tariff and be notified when it changes, or save it to their HTS Hero catalog.

Input: `{ hts_code, country_of_origin, customs_value_usd?, quantity?, transport_mode?, trade_program?, answers?, alerts?: boolean /* default true */ }`

Output: `{ tracked: true, product_key: "8471300100-CN", current_effective_rate_pct, alerts: "email", catalog: { used, limit: null }, links.analysis_url }`.

How it fits the Tracker:
- It writes the same shape the Tracker uses: a `CatalogItem` plus `Adjustments` keyed by `productKey`, in `components/tariff-tracker/adjustments.ts`.
- So a product added from Claude shows up in the Tracker with its value, mode and answers already filled in.
- When limits come later: return `isError` with neutral text ("Your HTS Hero plan tracks up to N products…", plus an informational link). This is allowed on both platforms.

#### 7. `list_tracked_products` — signed in, read-only
> Use this when the user asks about the products they track on HTS Hero, their current duty rates, or which ones changed.

Output: `[{ product_key, hts_code, country, description, current_effective_rate_pct, rate_when_added_pct, last_change: { date, summary } }]`, plus `catalog: { used, limit }`.

#### 8. `untrack_product` — signed in, `destructiveHint: true`
Removes one product. It's needed for a complete, reviewable tool set, since both directories reject catch-all read/write tools.

#### 9. `calculate_duty_batch` — public, read-only
Takes many lines (`{hts_code, country, value, quantity?}`) in one call, for brokers pasting a commercial invoice into chat.
- Output: totals for each line and for the whole batch.
- There is no limit for now beyond an abuse ceiling (e.g. 200 lines).
- The same service later backs the public API and the Sheets and Excel add-ins.

### Golden prompts (run before submitting, and after any description change)
Should call a tool:
- "What's the duty on 8471.30.0100 from China?"
- "Is it cheaper to import 6110.20.2079 from Vietnam or Bangladesh?"
- "What was the tariff on aluminum framing 7610.10.0010 from Canada in March?"
- "Watch this one for me and tell me if it changes."
- "What changed in tariffs this month?"
- "How much reciprocal tariff did I pay on 8517.62.0090 from Vietnam entered June 2025?" (after the backfill)

Should **not** call a tool: "What is a tariff?", "Explain Section 301 history", "Classify my product."

Track precision and recall per client (Claude, ChatGPT) in a small script.

---

## Part 4 — How the two sources of truth combine

Supabase holds the full HTS (chapters 1–97 lines with their base rates). The engine holds Chapter 99 and all the stacking rules. A calculation takes the base rate from the first and applies the second on top. They work together; they don't compete. That holds **for today's date**.

The one place to be careful is **past dates**, and the backfill makes that matter more:
- **History uses today's base rates.** `useTariffFinder` and `calculateHistory` take `baseRates` once, from the *latest* Supabase revision. Every historical date gets **today's base rates** with **that date's Chapter 99 rules**.
  - From Apr 2026 onward this is effectively right: base rates rarely change within a year.
- **The backfill crosses a Basic edition.** Going into 2025 means crossing the 2026 Basic edition (Jan 1), which renumbered codes (`discontinued-codes-2026.ts`) and can change column 1 rates.
- **The resulting risks:**
  - A 2025 entry of a code split in 2026 may not resolve at all.
  - A rate that changed in 2026 would be applied to 2025.
- **The fix:** give each history segment the base rates from the revision in effect on that date. Supabase already stores every revision as `<revision>.json.gz` (`get-hts-data?revision=<name>`), and the engine already knows `getRevisionForDate`. That is why every response returns both `rates_revision` and `rules_revision`.
- **Worth raising with the backfill work.** It probably belongs there rather than in the MCP server.

A smaller edge case: on the day USITC publishes a new revision, Supabase may have Rev N+1 before the engine has verified it. The calculator already flags unverified dates. The MCP output carries that as `verified: false` plus a warning, so the model can say so.

---

## Part 5 — Building on in-flight work

**Base branch.**
- The MCP server builds on the **Tariff Tracker**: the WIP commit `3b7bb7a` on `feature/pricing-calculator`. It is local only and not pushed.
- That commit and `feature/blog-and-compare` (the SEO work) both branch from `09c1c40`.
- Plan: cut `feature/mcp-server` from the latest tracker commit and merge `feature/blog-and-compare` into it, or rebase once those land on master.
- Do it in its own worktree so it doesn't disturb the SEO and backfill sessions, which share the `hts-hero-docs` worktree.

**Tracker (Tariff Tracker vision).** The MCP server is a second front end for the Tracker:
- Duty, comparison and history tools reuse its analysis libs.
- `track_product` writes its catalog.
- Every link lands inside `/tariff-tracker`.

Needed in the Tracker:
- Move the catalog from localStorage to a server-side Supabase store. Keep localStorage as an offline/anonymous cache and merge it on sign-in. This is already planned ("accounts/Supabase later").
- Add a `?view=analysis|duty|history` param on product links (today it's React state only, `ProductView.tsx:55`).
- Build the **Alerts** section. Today it's a "Soon" placeholder; MCP tracking makes it the core retention loop.

**SEO strategy (blog + /compare).**
- **Links:**
  - The `learn_more_url` on each layer points to the pillar articles (How US Tariffs Are Calculated, Stacking Rules).
  - `methodology_url` points to the calculation explainer.
  - `get_recent_tariff_changes` links to "Latest US Tariff Changes".
  - The MCP server sends AI-client traffic into the SEO content, which strengthens it.
- **/compare:**
  - "Available in Claude and ChatGPT" becomes a new HTS Hero fact. It goes in the one place HTS Hero's facts are recorded (`libs/compare/tools/`).
  - It neutralizes a Gateway Lines advantage on the "HTS Hero vs Gateway Lines" page.
  - When `track_product` and alerts ship, update the record's "alerts" claim, which that session flagged as not yet live.
- **AEO:** add `llms.txt` and an "Use HTS Hero in Claude / ChatGPT" page. That page is also the docs URL both directories require.

**Past-revision backfill.**
- History coverage (`coverage.verified_from`) grows automatically as revisions are verified backward. The tools need no change.
- Raise the per-date base rates fix from Part 4 with the backfill work.
- Once 2025 is covered: add refund/IEEPA golden prompts, and consider `estimate_tariff_refund`.

---

## Part 6 — What the codebase needs

| Gap | Why | Where |
|---|---|---|
| **Server-side duty service** | One function: code + inputs → result + links. It chains `getHtsElementByCode` → `findTariffElement` → `buildEstimateInput` → `calculate`. `calculatorUrl` uses `window`, so it needs a server-side URL builder. | new `libs/duty/` |
| **Tracker libs shared with the server** | `originRates`, `rateTiers`, `originHistory`, `changeEvents` and the catalog/adjustments types are plain TS. Make sure none of them import client-only code. | `components/tariff-tracker/**` → shared lib |
| **Server-side catalog** | A `tracked_products` table (user_id, product_key, adjustments, alerts, created_at) with RLS. `catalogStore` syncs with it on sign-in. | Supabase + `catalogStore.ts` |
| **Alert pipeline** | When a newly verified revision changes a tracked product's duty, email the user. The cron and Resend already exist. | `app/api/cron`, `emails/` |
| **OAuth** | Enable the Supabase OAuth 2.1 server and DCR. Add a consent page at `/oauth/consent`, protected-resource metadata, and a JWT check in `/api/mcp`. Add a DCR-cleanup cron. | Supabase dashboard, `app/oauth/`, `app/.well-known/` |
| **Rate limiting + caching** | Neither exists today. Add abuse limits per IP and per OAuth client. Cache results keyed on code, country, inputs, rates revision and rules revision. | middleware or KV |
| **Per-date base rates** | See Part 4. | `libs/hts-server.ts`, history |
| **Server-side analytics** | Call `trackEventServer` on every tool call with: client name, tool, anonymous or signed-in, status. Call `identifyUserServer(sub)` when signed in. Add UTM tags to all links. | `libs/mixpanel-server.ts` |
| **Engine coverage check** | Section 301 forced-labor (from Jul 24), Section 122 expiry (Jul 24), current 232 | `tariffs/engine-v2/data/headings/` |

### Suggested rollout
1. **v0 — public tools:** tools 1–5 and 9, plus the duty card and comparison UI. Submit to the Claude directory and the MCP Registry, and list on the aggregators. Add the docs page and `llms.txt`. Measure for 2–4 weeks.
2. **v1 — accounts:** Supabase OAuth, the server-side catalog, tools 6–8, and alert emails. Submit to ChatGPT with a reviewer test account.
3. **v2:** the public API, Sheets and Excel add-ins, and plan limits once they're defined.
4. **Revisit Shopify** once catalogs live server-side.
