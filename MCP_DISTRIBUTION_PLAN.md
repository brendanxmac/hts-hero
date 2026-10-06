# Platform Distribution + MCP Tool Design

Research date: 2026-10-06. Items marked **[U]** could not be confirmed from a primary source. Classification is out of scope here: every tool takes a known HTS code.

---

## Part 1 — The channels as of October 2026

### The context that matters most

- **US tariff rules keep changing, and that helps us.** SCOTUS struck down the IEEPA tariffs on Feb 20. Section 122's 10% global tariff ran Feb 24 – Jul 24. Section 301 "forced-labor" duties of 10–12.5% on 60 countries started Jul 23 and are being challenged in court. Section 232 was revised again on Apr 2 and Jun 1. The IEEPA refund process (CAPE) opened phase 3 today. De minimis has been suspended since Aug 2025, and its statutory repeal takes effect Jul 1, 2027. Generic LLM answers are stale. A time-aware stacking engine that cites its sources is the thing we can win on.
  - **Action item:** confirm that `tariffs/engine-v2` covers the Jul 23 Section 301 forced-labor headings and the Section 122 expiry.
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
- Once a catalog exists, plan limits come up naturally in the web app and in email. The AI client only ever says "you're tracking 10 of 10 products on your plan. Manage at htshero.com/account" (an informational link, allowed on ChatGPT).

### Three tiers of access

| | Anonymous (no auth) | Free account (OAuth, lazy) | Paid (Tracker Starter/Pro) |
|---|---|---|---|
| Calculate duty for one product | ✅ generous (rate-limited per client and IP, not per week) | ✅ | ✅ |
| Answer engine questions (steel %, exclusions…) | ✅ | ✅ | ✅ |
| Compare origins | up to 3 named countries | ✅ all ~198 origins, ranked | ✅ |
| Rate history | last 90 days | all verified revisions | ✅ |
| Recent tariff changes feed | ✅ | ✅ filtered to *my* products | ✅ |
| Track a product and get email alerts | — (triggers sign-in) | up to free-tier limit | per plan |
| List my tracked products and their changes | — | ✅ | ✅ |
| Batch calculation (many lines) | — | small cap | per plan |

Beat Gateway Lines on generosity: no email wall for single calculations. Anonymous calls cost almost nothing because the engine is pure TypeScript and results are cacheable.

### Links back to the app

Every result includes `links` that the model or widget can show. They are informational and deep, never to pricing:
- `full_breakdown_url`: `/duty-calculator?code=&country=&value=&units=&date=&mode=&pref=&answers=` (format from `calculatorUrl`, `components/duty-calculator/lib/estimate.ts:83`)
- `analysis_url`: `/tariff-tracker?product=<digits>-<ISO2>`. **Gap:** the product view's Duty/Analysis/Entries sub-tab is React state only (`ProductView.tsx:55`). Add a `&view=analysis` param so links can land on Analysis.
- `hts_page_url`: `/hts/<dotted code>`. Also helps SEO.
- All links carry `utm_source=<client>&utm_medium=mcp&utm_campaign=<tool>` so Mixpanel can attribute signups.

---

## Part 3 — MCP tool design

### Server shape
- **Endpoint:** `https://htshero.com/api/mcp`. Stateless Streamable HTTP, a Next.js route handler on Vercel. Check that `/.well-known/*` routes are served and not swallowed by `middleware.ts`.
- **Server name:** `hts-hero`. Registry namespace: `com.htshero/tariff-calculator`.
- **Auth:** lazy. Public tools work with no token. Account tools return **HTTP 401 + `WWW-Authenticate`** pointing at Protected Resource Metadata (not `200 isError`). ChatGPT also needs `securitySchemes` per tool and `_meta["mcp/www_authenticate"]`.
  - OAuth 2.1 + PKCE S256, with **CIMD** client registration (DCR is deprecated and causes client sprawl).
  - Claude redirect: `https://claude.ai/api/mcp/auth_callback`. Discovery and token endpoints must respond in under 10 s. Claude only reads the first `authorization_servers` entry.
  - **Decision needed:** use Supabase Auth's OAuth 2.1 server, or put an MCP-ready auth provider in front of Supabase users. Check CIMD support before choosing **[U]**.
- **Every response** includes `as_of` (entry date used), `hts_revision`, `engine_revision` (the verified revision used), `disclaimer`, and `links`.
- **Annotations:** every tool has a `title`, `readOnlyHint`, `destructiveHint` and `openWorldHint: false` (closed HTS dataset). Both directories reject wrong values.
- **Descriptions:** start "Use this when…", say when *not* to use the tool, give parameter examples, no promotional language, no pricing.

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
  entry_date?: string         // YYYY-MM-DD, default today; past dates allowed back to the earliest verified revision
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
             rate_pct, basis_usd, amount_usd, reason, source }],
  fees: [{ name: "MPF"|"HMF", amount_usd }],
  available_trade_programs: [{ symbol, name, would_change_rate_pct }],
  questions: [{ id, prompt, type, affects: ["9903.81.91"], answered }],  // the model asks the user, then calls again with `answers`
  warnings: string[],
  as_of, hts_revision, engine_revision, disclaimer,
  links: { full_breakdown_url, analysis_url, hts_page_url }
}
```
UI: `ui://hts-hero/duty-card`, a stacked bar of layers, the total, any open questions, and **2 actions maximum** (a Claude limit): **"Open full breakdown"** (link) and **"Track changes"** (calls `track_product`, which triggers sign-in).

Why it's conversational: the engine's `questions` (for example steel content %, exclusion confirmations) are a back-and-forth the model handles naturally. A static calculator can't do that.

#### 2. `compare_origins` — public (limited) / account (all)
> Use this when the user asks which country is cheapest to import a product from, or how duty differs between countries of origin, for a known HTS code.

Input: `{ hts_code, countries?: string[] /* max 3 anonymous */, all_origins?: boolean /* account */, customs_value_usd?, transport_mode?, entry_date?, answers? }`
Output: a ranked list `[{ country, effective_rate_pct, duty_usd, best_trade_program?, rate_with_program_pct?, tier }]`, plus `cheapest`, `most_expensive` and `links.analysis_url`. If the user is anonymous and `all_origins: true`, the tool returns 401, which starts lazy sign-in.
Reuses `originRates()` (`components/tariff-tracker/product/analysis/analysis.ts:35` on `3b7bb7a`).

#### 3. `get_duty_history` — public (90 days) / account (full)
> Use this when the user asks how the tariff on a product has changed over time, or what it was on a past date.

Input: `{ hts_code, country_of_origin, from?, to?, customs_value_usd?, answers? }`
Output: segments `[{ from, to, revision, effective_rate_pct, changed_layers: [{ code, change: "added"|"removed"|"rate_changed", before_pct, after_pct }] }]`. Wraps `calculateHistory` (`tariffs/engine-v2/history.ts:101`).

#### 4. `get_hts_code` — public, read-only
> Use this when the user gives an HTS code and wants its description, base duty rates (general, special, column 2) or parent headings. Do not use it to search by product description.

Output: `{ hts_code, description, indent_path: [{ code, description }], base_rates: { general, special, other }, special_programs: [...], chapter_99_measures_that_may_apply: [{ code, name }], links.hts_page_url }`. Wraps `getHtsElementByCode` and `getHtsElementParentsServer` (`libs/hts-server.ts:72,79`).

#### 5. `get_recent_tariff_changes` — public / account-personalized
> Use this when the user asks what has changed in US tariffs recently, or whether a recent HTS revision affects them.

Input: `{ since?: string, limit?: number /* ≤20 */, only_my_products?: boolean /* account */ }`
Output: entries from `tariff_changelog` (`libs/supabase/tariff-changelog.ts:37`, published only). With `only_my_products`, it includes the tracked products each entry affects and their rate change. That "what changed for *me*" view is a strong reason to stay signed in.

#### 6. `track_product` — account, write (not destructive)
> Use this when the user wants to monitor a product's tariff and be notified when it changes, or save it to their HTS Hero catalog.

Input: `{ hts_code, country_of_origin, customs_value_usd?, quantity?, transport_mode?, trade_program?, answers?, alerts?: boolean /* default true */ }`
Output: `{ tracked: true, product_key: "8471300100-CN", current_effective_rate_pct, alerts: "email", catalog: { used, limit }, links.analysis_url }`.
At the plan limit it returns `isError` with **neutral text**: "Your HTS Hero plan tracks up to N products (N in use). Manage your catalog at https://htshero.com/tariff-tracker." No price, no "upgrade". This is the paywall, and it is compliant on both platforms.

#### 7. `list_tracked_products` — account, read-only
> Use this when the user asks about the products they track on HTS Hero, their current duty rates, or which ones changed.

Output: `[{ product_key, hts_code, country, description, current_effective_rate_pct, rate_when_added_pct, last_change: { date, summary } }]`, plus `catalog: { used, limit }`.

#### 8. `untrack_product` — account, `destructiveHint: true`
Removes one product. Needed for a complete, reviewable surface, since both directories reject catch-all read/write tools.

#### Later (paid): `calculate_duty_batch`
Up to N lines `{hts_code, country, value}` in one call. This is for brokers pasting a commercial invoice into chat. The cap depends on the plan, and the same endpoint becomes the public API behind the Sheets and Excel add-ins.

### Golden prompts (run before submitting, and after any description change)
Should call a tool:
- "What's the duty on 8471.30.0100 from China?"
- "Is it cheaper to import 6110.20.2079 from Vietnam or Bangladesh?"
- "What was the tariff on aluminum framing 7610.10.0010 from Canada in March?"
- "Watch this one for me and tell me if it changes."
- "What changed in tariffs this month?"

Should **not** call a tool: "What is a tariff?", "Explain Section 301 history", "Classify my product."

Track precision and recall per client (Claude, ChatGPT) in a small script.

---

## Part 4 — What the codebase needs first

| Gap | Why | Where |
|---|---|---|
| **Server-side duty service** | One function: code + inputs → result + links. Combines `getHtsElementByCode` → `findTariffElement` → `buildEstimateInput` → `calculate`. `calculatorUrl` uses `window`, so it needs a server-side URL builder. | new `libs/duty/` |
| **Merge tracker branch / move analysis to a shared lib** | `originRates`, `originHistory` and catalog types live only on WIP commit `3b7bb7a` | `components/tariff-tracker/product/analysis/*` |
| **Server-side catalog** | The catalog is localStorage only (`catalogStore.ts`). `track_product` needs a Supabase `tracked_products` table, synced with localStorage on sign-in. | Supabase plus `catalogStore` |
| **Alert pipeline** | When a new verified revision changes a tracked product's rate, email the user (cron and Resend already exist). This is the main conversion engine. | `app/api/cron`, `emails/` |
| **Plan enforcement** | `TRACKER_TIERS` exists but isn't enforced. Add a server-side entitlement check for catalog size and batch size. | `libs/supabase/purchase.ts`, webhook |
| **OAuth authorization server** | Lazy auth for account tools (decision above) | — |
| **Rate limiting + caching** | None exist today. Rate-limit per client, IP and user. Cache results keyed on code, country, inputs and engine revision. | middleware or KV |
| **Revision consistency** | HTS lines come from the newest Supabase `hts_revisions` row, while the engine uses the verified list. Both must be returned, and a mismatch flagged. | `libs/supabase/hts-revision.ts`, `tariffs/engine-v2/revisions.ts` |
| **Server-side analytics** | `trackEventServer` per tool call: client name and version, tool, anonymous or authed, result status | `libs/mixpanel-server.ts` |
| **`/tariff-tracker` `view` param** | So links can open a product's Analysis tab directly | `ProductView.tsx` |
| **Engine coverage check** | Section 301 forced-labor headings (Jul 23), Section 122 expiry, current 232 | `tariffs/engine-v2/data/headings/` |

### Suggested rollout
1. **v0 (public tools only):** tools 1–5 and the duty card UI. Submit to the Claude directory and the MCP Registry, and list on the aggregators. Then measure for 2–4 weeks.
2. **v1 (accounts):** OAuth, server-side catalog, tools 6–8, change-alert emails. Submit to ChatGPT with a reviewer test account.
3. **v2 (paid):** plan enforcement and batch, then the public API, then the Sheets and Excel add-ins.
4. **Revisit Shopify** once v1 catalogs are live server-side.
