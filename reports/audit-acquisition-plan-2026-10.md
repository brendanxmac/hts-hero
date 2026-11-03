# Become the self-serve duty audit, then buy traffic: acquisition plan for Tariff Audits

_Researched 2026-10-30. Builds on the five October reports in `reports/` (growth strategy, the two SEO/GEO reports, page data, refund brokerage limits). Inputs: GSC exports in `seo-data/` (3 months to 2026-10-23), Mixpanel prod (project 3768432, read only), a code read of `/duty-audits` and the Tracker's entry audit, live Google results and Google Ads Transparency checks (2026-10-30, from a Bangkok IP with `gl=us&hl=en`), and web research. Tags: **[V]** checked against a cited source or our own data; **[E]** estimate; **[S]** speculative, needs proof before scaling._

---

## Executive summary

**The demand isn't the bottleneck yet. The product's front door is.** Six findings drive everything below.

1. **The audit page gets almost no traffic, and no audit has ever been recorded in prod.** `/tariff-audit` had **3 unique viewers in 30 days** (Mixpanel). It isn't among the top 1,000 pages in GSC for the 3 months to Oct 23. `Tariff Audit Requested` and `Tariff Tracker Entry Audited` are defined in `libs/mixpanel.ts` but **don't appear in the project's event list at all**: they have never fired in prod. Over 60 days: 17 sign-ups, 5 accounts that added products, 1 trial started [V].
2. **It already ranks where it counts.** On Oct 30, `htshero.com/tariff-audit` was the **3rd organic result** for "tariff audit software find overpaid duty", next to KlearNow, Caspian, GingerControl, Gaia, Tarifflo and Allied CHB [V, live SERP]. The page's definition sentence is being used as the snippet. The `/tariff-audit → /duty-audits` 301 is in `next.config.js`. Keep it, and don't reword the H1/title/definition (never-hurt-SEO rule).
3. **Audit-intent search volume is small and fragmented.** "tariff refund" is 480/mo at $9.52 CPC. "tariff audit", "customs audit", "post summary correction" and "ieepa refund" aren't tracked at all by seodata.dev (Google Ads API data), which usually means they're low volume [V/E]. The big refund queries ("ieepa tariff refund") are owned by CBP, UPS, FedEx, DHL, law firms and Big 4/accounting firms [V]. **So SEO for "audit" head terms alone won't fill the funnel.** The traffic we already get (HTS code pages, 9903 heading pages, program hubs, ~1,800 real search visitors/month) has to pass intent to audits, and timing hooks have to do the rest.
4. **Competitors pull data straight from ACE; we ask users to type entries in by hand.** Caspian ("connect your ACE portal", 5+ years of history), Tarifflo (pulls from ACE with a 5106/POA), Gaia ("import paid entries straight from your ACE data") and every IEEPA calculator take an ES-003 file [V]. Our entry audit is keyed line by line, and ES-003/7501 upload is "coming soon" (`Upload7501Card.tsx`). **No paid traffic should go to the audit until a file upload produces a free summary in under a minute.**
5. **Our verified window decides which hooks we can honestly sell.** Verified rates start **Nov 17, 2025** (`revisions.ts`). That covers only the last ~3 of IEEPA's ~12.5 months (Feb 1, 2025–Feb 23, 2026). It covers **all** of Section 122 (Feb 24–Jul 24, 2026) and every 2026 stacking rule. So the angles we can fully serve today are **Section 122 charged where it shouldn't stack (e.g. Section 232 articles)**, **all-in cap stacking errors (EU/Japan/Korea 15% caps)**, **old rate paid after a change**, and **missed USMCA/trade-program claims**. IEEPA-only ads and pages wait for the backfill.
6. **A $1k/mo, 2-month-payback paid test only works with a bigger first purchase.** At $6–10 per click and realistic conversion, CAC is about $200–650 [E] against Audits Starter/Growth at $49/$79. Paid search can pay back within 2 months if it sells a **one-time, flat-fee historical audit** (prior report: ~$499) or Pro/Scale plans. Otherwise treat the first $1k as paid learning, not ROI.

**What to do, in order:**

| # | Move | Why | Evidence | Effort |
|---|---|---|---|---|
| 1 | **ES-003/7501 file upload → free instant summary** ("N lines may be overpaid, up to $X, across these causes"), details and report behind a paid plan | Matches what every competitor and free calculator does; the only hook that converts cold traffic | Strong (competitor pattern, our zero-audit funnel) | 1–2 wks |
| 2 | **Buy-first checkout for Audits**, plus a **one-time historical audit** at a flat price | No way to pay today; the one-time offer is what makes paid ROI possible | Strong (code), pricing [E] | 3–5 days |
| 3 | **Fix tracking and copy truth** (events, conversion tags, bot cohort, page copy that says upload is live, stale `llms.txt`) | Can't judge ads without it; ad destination must match the product | Strong (Mixpanel, code) | 1–2 days |
| 4 | **Pass intent from pages we already rank on** (additive modules on 9903 pages, IEEPA/122 hubs, a test set of HTS pages) | That's where the ~1,800 real monthly search visitors land | Strong for 9903 (GSC: "cbp hts 9903.01.25 correction"), moderate for HTS pages | 3–5 days |
| 5 | **Four problem pages we can uniquely serve** (Section 122 on 232 goods, stacking-cap errors, retroactive corrections, recovery-route and deadline explainer with a date tool) plus a public **sample audit report** | Competitors rank with guides and case studies; our engine produces the evidence | Moderate (competitor proof), volume unknown | 1–2 wks |
| 6 | **One citable data asset**: the "Rate-Change Lag" / overcharge-exposure dataset from the engine | AI engines cite original stats; we have no customer audit data to benchmark yet | Moderate (GEO research), [S] for pickup | 3–4 days |
| 7 | **Paid test (weeks 6–10): Microsoft + Google Search, ~$1k** into the free check, exact/phrase only | Bing sends more of our real search traffic than Google | Moderate; CPCs from Google Ads API | Ongoing |
| 8 | **Warm list, Weekly Tariff Brief, LinkedIn founder posts, one broker co-hosted webinar** | Cheapest customers; the Google SERP for IEEPA shows LinkedIn posts directly | Moderate | Ongoing |

---

## 1. Where we stand (evidence)

### Traffic and funnel (Mixpanel, prod) [V]

| Metric | Value | Window |
|---|---|---|
| Unique viewers of `/tariff-audit` | **3** (San Jose, Khulna, Chicago) | 30 days |
| Unique viewers of any URL with "audit" | 45, of which 42 on the classification playbook; 44 of 45 `$direct` | 90 days |
| Sign Up | 17 users | 60 days |
| Tariff Tracker Products Added | 5 | 60 days |
| Tariff Tracker Trial Started | 1 | 60 days |
| HTS Code Watch Submitted / Tariff Updates Subscribed | 1 / 1 | 60 days |
| `Tariff Audit Requested`, `Tariff Tracker Entry Audited`, `Sign Up CTA Clicked` | **Never received** (not in the project's full event list) | all time |
| Real search referrers (initial referring domain) | Bing 967 (+30 cn.bing), Google 628, DuckDuckGo 82, Yahoo ~75 | 30 days |
| AI referrers | Gemini 18, Copilot 5, Claude 3, ChatGPT 0 visible | 30 days |
| `/duty-calculator` page viewers | 35,107 (bot-inflated, as the growth report found) | 30 days |

Two things to note:
- **Bing sends ~1.5× the real search visitors Google does.** This fits desktop B2B and Microsoft Edge default search in offices [E]. It changes the paid plan: Microsoft Ads should get a real share, not a token one.
- **No calculator → audit path can be measured today.** The only audit link from the calculator is `RefundCheckCard`, and no click event exists on it. I couldn't pull "which landing pages lead to audit interest" because the events that would show it have never fired. This is itself a finding (section 6).

### Search (GSC, 3 months to Oct 23) [V]

- 21,130 impressions and 212 clicks across the top 1,000 pages. `/tariff-audit` isn't in that list.
- Only two audit- or refund-flavored queries appear among 854: **"cbp hts 9903.01.25 correction"** (3 impressions, position 15) and "is 9903.01.24 ieepa". Small, but it shows exactly where correction intent shows up: **on 9903 heading pages.**
- AI-features report: 2,491 impressions, 93% desktop; top pages are HTS code pages and `/duty-calculator/china`. No audit page.
- **Live check, Oct 30:** "tariff audit software find overpaid duty" puts HTS Hero 3rd organically (old `/tariff-audit` URL, our DEFINITION sentence as snippet). Page 1 is all audit vendors: Caspian, KlearNow, GingerControl, CustomsGenius, Allied CHB, Gaia, Tarifflo, plus CBP's IEEPA page.
- **GSC gap:** the export ends Oct 23 and has no query→page pairing for the audit page. **Export a fresh Performance report filtered to page = `/tariff-audit` and `/duty-audits`, plus queries containing refund|audit|overpa|correction|protest|122|stacking**, before committing to the content in section 3. Every SEO recommendation below marked "needs GSC" waits on this.

### What the audit actually does today (code) [V]

- **Input:** the user tracks products (HTS code + origin), then keys in entries one line at a time: entry number, entry date, customs value, quantity, duty paid (`entries/entries.ts`, `AuditForm.tsx`). ES-003/7501 upload shows "Coming soon".
- **Check:** `auditEntry()` runs the engine at the entry date with the product's answers and claimed program, and returns owed, difference and verdict (overpaid / underpaid / correct within $1), plus rate paid % vs rate owed %.
- **Window:** verified revisions run from 2025 Rev 29 (**Nov 17, 2025**) through 2026 Rev 20.
- **Not modeled yet:** liquidation status, CAPE phase eligibility, and IEEPA as "assessed but now refundable" (`tariffs/engine-v2/REFUNDS.md`: "Not implemented").
- **Savings detection** (programs, exemptions, cheaper origins) is a separate Tracker feature bundled into Audits.
- **The sales page's example** (`libs/tariff-audit-example.ts`) is a real engine case: steel wire from China entered Mar 12, 2026, with Section 122 charged although Section 232 articles were exempt. That's the clearest proof of what we find, and it's exactly the Section 122 angle in this plan.

### Sales page and path to pay (code) [V]

- `/duty-audits` hero: "Find Overpaid Duty, in Seconds", a "Check your Imports" button → sign-up → `/onboarding` (3 questions) → Tracker tour → add products → Entries. **That's 5+ steps before any result**, with no free result shown before sign-up.
- **The plan cards say "no trial"**, but the app still runs the 14-day reverse trial, and the buttons open sign-up, not checkout (PRICING.md DRAFT: "not built"). The historical-audit button and plan row are commented out (2026-10-28).
- **Copy that overstates the product:**
  - `STEPS[0]` says "Upload or type in your ACE entry summary report (ES-003) or 7501 data".
  - `RecalcSection` says "Get Started in 30 Seconds" with a spreadsheet dropping in.
  - PRICING.md rule 9 says upload must be called "coming soon" until it's live. For ads this matters: Google's destination and misrepresentation policies judge the landing page against the ad.
- **`app/llms.txt/route.ts` is stale.** It describes the Tracker's 14-day trial and old per-import prices, and lists "Tariff audit" as an explainer with no price. Entity facts that AI engines read should match PRICING.md (Audits $49–$299, keep 100%, broker files).

---

## 2. Demand and intent map

**Sources:** seodata.dev (Google Ads API US monthly averages; pages return 404 when a keyword isn't in their set, which I read as "low or untracked", not zero), the growth report's figures, and live SERPs. All volumes are monthly US.

| Cluster | Example queries | Volume / CPC | Who ranks / cites | Winnable? | How fast |
|---|---|---|---|---|---|
| **Refund (generic)** | tariff refund, tariff refunds for businesses, tariff reimbursement | "tariff refund" 480 / **$9.52**; "tariff reimbursement" 30 / $7.93; "tariff refunds" 20 [V] | CBP, UPS, FedEx, DHL, Leyton, Baker Tilly, RSM, law firms, Freight Right [V] | Hard organically. Paid possible (low competition index 0.04) | Paid: weeks; organic: 6+ months [E] |
| **IEEPA refund** | ieepa refund calculator, ieepa refund phase 3, ieepa refund deadline, ieepa protest | "ieepa" 8,100, "ieepa tariffs" 3,600 (news intent, $0 CPC) [V]; long-tail deep in autocomplete (SEO big-bets report) | CBP, carriers, law firms; ~10 free calculators (Flexport, Wove, Unisco, Alliance CHB, GingerControl, ustariffrates, Item) [V] | Only after backfill to Feb 2025. Our edge is the **rate history by country and date**, not another calculator | 2–3 months after backfill [E] |
| **Section 122 refund / overcharge** | section 122 tariff refund, section 122 refund, section 122 section 232 exemption | Not in seodata (low) [E] | Law firms, broker blogs [E, needs SERP check] | **Yes: we cover 100% of the period**, and our engine shows the 232 overlap per code | 4–8 weeks [E] |
| **Stacking overcharges** | tariff stacking refund, EU 15% cap base rate, stacking overpayment | Untracked [E] | Greenworldwide ("CBP begins processing refunds for tariff stacking overpayments"), KlearNow's $1.7M case study (ranks #2 for audit software) [V] | Yes. Our stacking rules are note-accurate and `/blog/us-tariff-stacking-rules` exists | 4–8 weeks [E] |
| **Audit / software** | tariff audit software, customs duty audit, duty recovery audit, find overpaid duty | Untracked (low); "cbp tariffs" 880 / $25.72 as an adjacent signal [V] | Caspian, KlearNow, **HTS Hero (#3)**, GingerControl, CustomsGenius, Allied CHB, Gaia, Tarifflo [V] | **Already winning**: protect and deepen | Now |
| **Recovery routes** | post summary correction, PSC refund, customs protest 180 days, 1520(d) USMCA | Untracked [E] | GingerControl ("recover-overpaid-import-duties"), KlearNow, Peacock, USA Customs Clearance, Aprio [V] | Moderate. A **deadline date tool** is differentiated; articles alone aren't | 2–4 months [E] |
| **Classification audit** | hts classification audit, misclassification overpaid duty | Untracked [E] | Caspian runs ads: "Wrong HTS codes overpay duty quietly for years" [V] | Partly. We audit rates at a given code; we don't re-classify (Classify is separate) | Later; don't lead with it |
| **AD/CVD exposure** | adcvd case search, antidumping rate [product] [country] | Autocomplete depth (big-bets report) | Tandom, government PDFs | Yes, but it's an Alerts/free-check hook more than an audit buy | Already planned (Bet 3) |
| **Drawback** | duty drawback, drawback | "duty drawback" 1,900 / **$34.40**; "drawback" 9,900 / $13.80 [V] | Brokers, CBP, Dimerco, Wayfindr | **Skip.** Not our product, expensive, and drawback claims are broker work | n/a |
| **"Am I overpaying" (natural language)** | how do I know if I overpaid import duty | Untracked | Google returns CBP ACH refund, LinkedIn, UPS, DHL, drawback pages [V] | AEO target: a direct-answer page plus FAQ | 1–3 months [E] |

**What this means:** the audit buyer rarely searches "audit". They search the **event** (IEEPA, 122, a new 232 action), the **code** (9903.xx, an HTS line) or the **fix** (PSC, protest). We already get the code traffic, so the job is to route it.

**Unknowns to close (cheap):** open a Google Ads account and run Keyword Planner over the list in section 4 (free, gives volume ranges and top-of-page bid ranges), and do the same in Microsoft Ads. Mark everything above "untracked" until then.

---

## 3. SEO plan

Rules applied: additive only on ranking pages; test new patterns on a small set first; each item says what evidence supports it.

### 3a. Protect what ranks (do first, ~1 hour)

- Ship the `/tariff-audit → /duty-audits` 301 **in the same deploy** as the rename. Keep TITLE, the DEFINITION sentence, the FAQ text and the FAQPage schema byte-for-byte. Update the sitemap and every internal link (already done in the working tree: Footer, ToolsDropdown, MarketingHeader, hubs).
- After deploy, in GSC: inspect `/duty-audits`, request indexing, and watch "tariff audit software…" weekly. **If the position drops by more than 3 within 3 weeks, check the redirect chain and canonical first.**

### 3b. Pass intent from pages that already get traffic (additive)

| Where | What to add | Evidence | Test plan |
|---|---|---|---|
| **9903 heading pages for ended or refundable programs** (IEEPA 9903.01.x/9903.02.x, Section 122 headings) | They already have a "Refunds" card linking to `/duty-audits`. **Add:** the verified-window note ("we can check entries from Nov 17, 2025"), and a deep link that opens the free check pre-scoped to that heading (`/duty-audits?program=122#check`) | **GSC: "cbp hts 9903.01.25 correction"** + 9903 = 41% of code-query impressions (big-bets report) | All refundable headings at once (it's an extension of an existing card) |
| **IEEPA and Section 122 program hubs** | Same scoped link. On the 122 hub, a table of "codes where Section 122 shouldn't have stacked" (232 articles, from the engine) | Program-hub demand (big-bets Bet 1) | Ship and measure clicks |
| **HTS code pages** (`/hts/[code]`) | A small "Were your entries charged right?" box **below** the existing content: the code's last 2–3 rate changes and "entries filed within days after a change often still paid the old rate". Reuse `RefundCheckCard` logic from the calculator, then link to the free check | Calculator already does this; HTS pages are 939 of the top 1,000 pages by impressions | **Test on 20–30 HTS pages** with recent changes; compare CTR and position in GSC 3–4 weeks vs a matched control. Never move or reword existing blocks |
| **Duty calculator results** | Add a click event to `RefundCheckCard`'s CTA, and carry the code + origin into the free check | No data today | Measure first |
| **Blog** `/blog/us-tariff-stacking-rules` (top blog page by viewers, 7 in 30 days) | Add a closing "Check whether your entries were stacked right" CTA. Don't change the body | Small; low risk | Ship |

### 3c. New pages (build in this order)

All server-rendered, answer-first, FAQPage + `Dataset`/`HowTo` schema where it fits, a "find, flag, explain; your broker files" line, and "may / up to" wording throughout.

1. **Sample audit report (public)**, `/duty-audits/sample-report`, with a PDF download.
   - What: the engine's real steel-wire example plus 3–4 more engine cases (old rate after a change, cap stacking, missed USMCA), laid out exactly like the paid deliverable: line, entry date, paid vs owed, rate paid % → owed %, cause, source citation, and "route your broker may use (PSC before liquidation / protest within 180 days after)".
   - Why: KlearNow's case study ranks #2 for audit software [V]. Tarifflo shows sample flagged entries [V]. Gaia lists Excel reports [V]. A sample answers "what do I get?" for ads and AI answers alike.
   - Evidence: moderate (competitor proof). Effort: 2–3 days.
2. **Section 122 overcharges on Section 232 goods**, `/duty-audits/section-122-overcharges`.
   - What: what the exemption said, the codes it covers (from the engine), example % difference, how to check entries, the liquidation timing (entries from Feb 24, 2026 start liquidating around early Jan 2027 at the usual ~314 days [E]), and the separate question of whether the 122 surcharge itself is refunded (CIT May 7 ruling, stayed on appeal).
   - **Flag (HTS notes win):** cite the note text as the rule. Where a proclamation or CBP guidance disagrees, follow the note and say so.
   - Evidence: we cover 100% of the period; demand unproven (no seodata entry). [S] on volume, strong on product fit. Effort: 2 days.
3. **Tariff stacking overcharges** (EU/Japan/Korea all-in caps, 232 content rules, 122/232 overlap), `/duty-audits/stacking-overcharges`.
   - Evidence: KlearNow's $1.7M EU-cap case [V], Greenworldwide's page on CBP processing stacking refunds [V]. Effort: 2 days.
4. **Recovery routes and deadlines**, with a date tool: `/duty-audits/correction-deadlines`.
   - What: enter an entry date (and a liquidation date if known) and get the estimated PSC window, estimated liquidation, protest window, and the 1-year 1520(d) window for USMCA claims. Each line says "estimate, confirm with your broker". This is information, not filing.
   - Evidence: GingerControl ranks with long articles on the same topic [V]. Caspian and GingerControl contradict each other on PSC timing (300 vs 314 days) [V], so a careful, sourced tool is a real gap. Moderate. Effort: 2–3 days.
5. **Retroactive changes and corrections**, generated from engine data (CONTENT_TODO #3). Every retroactive exemption or correction we model (Rev 11's 9903.82.02, EO 14361's Brazil agriculture), with dates and which entries may have overpaid. Unique data. Evidence: moderate [S]. Effort: 2 days.
6. **IEEPA refund timeline by country** (big-bets Bet 4). **Wait for the backfill to Feb 2025.** Until then, IEEPA ads and pages would promise an audit we can't run for ~75% of the period.
7. **Comparison pages: "Contingency recovery vs flat-fee audit"** and "HTS Hero vs Tarifflo / Caspian / Gaia".
   - Our `/compare/*` pages earn impressions but rank 17–34 (GSC) [V]. **Speculative**: build one, measure, then decide.
   - Facts must be sourced: Tarifflo "typically works on contingency" [V]; Caspian's audit is free and it files PSCs/protests via its brokers [V]; GingerControl cites 20–30% as a market contingency range [V].

**Skip:** drawback pages (not our product, $34 CPC territory), generic "what is a customs audit" (CBP-audit meaning, wrong intent), and mass code × program audit pages (scaled-content risk).

### 3d. Schema and on-page

- `/duty-audits` already has Service + AggregateOffer + FAQPage + Breadcrumb. **Add** `Organization.sameAs` (LinkedIn, G2 when it exists), and keep `dateModified` tied to the verified revision.
- The sample report gets a `Dataset`-style description and `HowTo` for "how to check if you overpaid".
- Schema is hygiene, not a lever: Ahrefs found no citation lift (big-bets report).

---

## 4. AEO / GEO plan

**What gets cited** (prior research, confirmed today):
- **Original statistics and sourced tables.** The GEO paper found +33% citation lift from statistics and +28% from cited sources (big-bets report).
- **Fresh dated pages.**
- **Clear Q&A blocks.**
- **Brand mentions across third-party sites,** which correlate with AI Overview visibility more than links (Ahrefs ρ≈0.66).
- **Reddit and LinkedIn.** Today's Google SERP for "ieepa tariff refund" has a **"What people are saying" block of LinkedIn posts and Reddit threads** right after the organic results [V]. A founder post can appear there directly.

### Concrete moves

1. **Answer-first blocks on the audit pages.**
   - Each new page opens with a 40–60 word answer that can be quoted on its own, like the DEFINITION.
   - Example: "To check whether you overpaid US import duty, recalculate each entry line at the rates in force on its entry date and compare it with the duty paid on the 7501 or ES-003. Differences usually come from…"
2. **Entity consistency (1–2 hours).**
   - Rewrite the audit and Tracker lines in `llms.txt` to PRICING.md: Tariff Audits $49/$79/$149/$299 by products, keep 100%, broker files, verified from Nov 17, 2025.
   - Fix third-party listings with wrong prices (GingerControl roundups, per earlier reports).
   - One sentence used everywhere: *"HTS Hero is a self-serve tariff audit: it recalculates the duty on every entry line at the rates in force on its date and flags possible overpayments, for a flat monthly price. Your broker files; you keep 100%."*
3. **Citable asset A: the "Rate-Change Lag" dataset** (build from the engine, no customer data needed) [S on pickup, strong on uniqueness].
   - For every HTS × origin pair we model, over the verified window: how many times its total duty changed, the median days between changes, and the % change.
   - Add the share of top-imported codes that changed 3+ times since Nov 2025, plus a "Section 122 / 232 overlap" count (codes where 122 shouldn't have stacked).
   - Publish it as a page with a CSV, a monthly update, and a one-line stat for press ("X% of the most-searched HTS codes changed duty at least N times since Nov 2025").
   - Pitch it to trade press and LinkedIn. This is the audit-flavored version of the growth report's Tariff Index.
4. **Citable asset B, later: an anonymized audit benchmark.** "Of N entry lines audited, X% had a possible overpayment; median difference Y%."
   - **We can't build this today:** no audits are recorded in prod.
   - Start collecting at launch of the upload: aggregate-only, with an opt-in line in the terms. Publish once there are ≥2,000 lines from ≥25 accounts, so it isn't cherry-picked [E].
   - Until then, don't echo competitors' "1 in 8 entries overpaid" (Tarifflo) or "up to 10%" (Trava) as facts. They're vendor claims [V].
5. **Distribution where AI engines read.**
   - LinkedIn founder posts (below).
   - Genuine Reddit answers in r/FulfillmentByAmazon, r/ecommerce, r/smallbusiness and r/supplychain (read each subreddit's rules first; r/ImportTariffs needs mod approval).
   - Bing Webmaster Tools + IndexNow on publish. Copilot and ChatGPT search lean on Bing, and Bing is already our biggest real referrer.
6. **Monthly prompt panel** (from the big-bets report). Add 5 audit prompts:
   - "how do I check if I overpaid US import duty"
   - "tariff audit software for small importers"
   - "section 122 refund on steel products"
   - "PSC vs protest deadline"
   - "flat fee vs contingency tariff refund firm"

   Log who's cited in ChatGPT, Perplexity, Gemini and Google. **Note:** Perplexity now asks for sign-in before answering ("Sign up and repeat your request"), so I couldn't test it today [V]. Use a logged-in browser for the panel.

---

## 5. Paid acquisition

### 5a. Unit economics first [E]

| Assumption | Low | High |
|---|---|---|
| Blended CPC (Google/Microsoft, exact/phrase) | $4 | $10 (tariff refund $9.52 [V]; Google Search avg ~$4 per vendor benchmark [V]) |
| Click → completed free check (upload + summary) | 8% | 15% |
| Free check → paid (any plan or one-time audit) | 10% | 25% |
| Click → paid | 0.8% | 3.75% |
| **CAC** | **$107** | **$1,250** |
| Mid case ($7 CPC, 12%, 15%) | | **~$390** |

- **Subscriptions alone:** Audits Starter/Growth ($49/$79) return $98–$158 in 2 months, so the mid case doesn't pay back. Pro ($149) returns $298.
- **With a one-time historical audit at ~$499** (or the annual plan up front), one sale covers the mid-case CAC.
- **So:** sell the one-time audit (or annual) as the paid-traffic offer. Otherwise frame the first $1k as learning and judge it on cost per completed check.

### 5b. Channel order

1. **Microsoft Ads + Google Search (weeks 6–10, ~$1,000 total; ~40/60 split).**
   - Same keyword list, exact and phrase only. US only, desktop bid +20%, business hours.
   - Microsoft gets more than usual because Bing sends 1.5× Google's real referrals to us [V] and its CPCs usually run lower [E].
2. **Retargeting (from week 8, ≤$100/mo)** of visitors to `/duty-audits` and the problem pages, on Google Display/YouTube or Meta. Only once the audience passes ~1,000 real visitors; below that it won't serve [E].
3. **LinkedIn Ads: not yet.**
   - Benchmarks put CPC around $6.50 on average and $8–22 for tech audiences, and external landing pages convert ~1–3% vs ~10% for lead-gen forms [V, vendor benchmarks]. $1k buys ~100–150 clicks, too few to learn from.
   - Use LinkedIn organically now. Revisit with a $500 Document Ad (the sample report) once the free check converts.
4. **Reddit / Meta prospecting: no.** Consumer refund noise is high (FedEx/UPS refund threads, "tariff refund for individuals" [V]).

**What competitors do (Google Ads Transparency, US, all time) [V]:**
- **Caspian:** 14 ads. Search: "HTS Classification Service – Misclassification Fines… Wrong HTS codes overpay duty quietly for years." Display: "$500M+ in Claims Filed… See What Your Entries Are Worth."
- **Gaia Dynamics:** 7 ads.
- **GingerControl and Tarifflo:** **0 ads.** They rely on content.

So the auction is thin: few direct audit advertisers, and CPCs should sit near the Keyword Planner ranges. LinkedIn Ad Library wasn't checked (it needs a logged-in session).

### 5c. Keywords (start list; confirm volumes in Keyword Planner)

**Exact / phrase, ad group "Audit software"**
- [tariff audit] · [tariff audit software] · [customs duty audit] · [import duty audit] · "duty audit software" · "customs audit software" · "find overpaid duty" · "overpaid import duty" · "overpaid customs duty" · "duty overpayment" · "recover overpaid duties" · "duty recovery audit"

**"Stacking / 122" (our strongest product fit)**
- "section 122 refund" · "section 122 tariff refund" · "tariff stacking refund" · "tariff stacking error" · "section 232 section 122 exemption"

**"Recovery routes" (lower intent; small bids)**
- "post summary correction refund" · "customs protest refund" · "psc overpaid duty"

**"Alternatives" (test small)**
- "tarifflo" · "caspian trade audit" · "gaia dynamics tariff audit" · "tariff refund firm fee"

**Hold until the IEEPA backfill**
- "ieepa refund calculator" · "tariff refund calculator" · "ieepa refund" (otherwise the landing page must say "entries from Nov 17, 2025" up front, and it'll convert poorly)

**Negatives (account level)**
- **Consumer and personal:** personal, individual, consumer, stimulus, dividend, "rebate check", "$2000", irs, "tax return", amazon order, ebay, temu, shein, aliexpress, gift, package
- **Carriers:** fedex, ups, dhl, usps
- **Other countries' customs:** hmrc, c285, cbsa, canada, uk, australia, india, gst, vat
- **Jobs and education:** jobs, salary, course, certification, exam, "customs broker license"
- **Other:** lawsuit, class action, attorney (unless you test a legal angle), drawback, "what is" (informational), reddit, pdf, definition, accounting, "financial audit", "transfer pricing"

### 5d. Ad copy (Responsive Search Ads; every line respects the rules)

1. **Core**
   - H: Find Overpaid Import Duty | Every Entry Line, Rechecked | Keep 100% of What You Recover
   - D: We recalculate each entry at the rates in force on its date and flag lines you may have overpaid. Your broker files.
2. **Stacking / 122**
   - H: Paid Section 122 on Steel Goods? | Check Before Entries Liquidate | Flat Price, No Contingency Fee
   - D: Section 232 articles were exempt from Section 122. Upload your ES-003 and see which lines may be overcharged.
3. **Vs contingency**
   - H: Why Give Up 20–30% of a Refund? | Flat Monthly Audit From $49 | Your Broker Files, You Keep 100%
   - D: Recovery firms often keep 20–30% of what they find. HTS Hero flags possible overpayments for a flat price.
   - Source the range on the landing page (GingerControl market range [V]; our FAQ says 15–30%, so pick one figure and cite it).
4. **Proof / report**
   - H: See a Sample Duty Audit Report | Rate Paid % vs Rate Owed % | Sourced to the HTS Note
   - D: Each flag shows the reason, the % difference and the route your broker may use. Free summary before you pay.
5. **Speed**
   - H: Free Overpayment Check in a Minute | Upload Your ACE ES-003 | Possible Savings Flagged Instantly
   - D: See how many entry lines may be overpaid and by up to how much. Details and report on any plan.
   - **Only once upload is live.**

**Sitelinks:** Sample Report · Pricing · How It Works · 30-Day Money-Back. Keep the subscription guarantee away from "refund" headlines so the two aren't confused.

### 5e. Ad-policy risks

- **Government documents & official services** (Google tightened it from Oct 5, 2026). It covers the "direct acquisition" of specific government services, and lists "unclaimed tax rebates" [V]. Customs refunds aren't listed, but **ads that read like help claiming a government refund (e.g. "Claim your CAPE refund", "Get your IEEPA refund") invite review and the "Not a government website" treatment.**
  - **Mitigation:** sell the audit and the finding, never the claim. No "CAPE", "CBP", or "file" in ads. Choose "not in scope" if Google asks.
- **Misrepresentation / unreliable claims:** no "guaranteed", "get your money back", or "$X back". Always "may", "up to", "possible". The landing page must match the ad: no upload claims until upload ships.
- **Legal and brokerage:** never "we file", "we recover", or "on your behalf" (19 U.S.C. 1641; see `reports/Customs brokerage limits for refunds.md`). "Audit" wording is fine.
- **Rates:** in %, never points. Products, not imports.

### 5f. Landing page requirements (desktop-first, for paid traffic)

Above the fold on `/duty-audits` (or a lean `/duty-audits/check` variant for ads, `noindex`, so the ranking page stays untouched):

1. Headline that matches the ad group (e.g. "Find Section 122 Overcharges in Your Entries").
2. **The upload box itself**, not a button to sign-up. Drop the ES-003 (CSV/XLSX), or try the sample file.
3. Under it: "Free summary · No card · Processed in your browser" (only if true; UNIS and others make this claim [V]).
4. Right column: the sample result card (existing `EntryScanCard`) and "See the full sample report".
5. Trust strip:
   - "Rates verified for every HTS revision since Nov 17, 2025" (link the changelog)
   - "Every flag cites its HTS note"
   - "Your broker files; you keep 100%"
   - real customer logos or quotes **only if real**
6. After the summary: plan cards with a direct Stripe checkout, plus a "One-time historical audit — $X" option.
7. Email capture for "send me the summary" (works for people who aren't the importer of record, who can forward it).

### 5g. Conversion tracking

- **Events:** `Audit Check Started`, `Audit File Uploaded {rows, entries, date range}`, `Audit Summary Viewed {lines_flagged, total_possible_overpaid_band}`, `Audit Checkout Started {plan|one_time}`, `Audit Purchased {value}`, plus the existing `Sign Up CTA Clicked` and `Tariff Audit Requested` (deploy them).
- **Ad platforms:** Google Ads conversion tag + enhanced conversions, and Microsoft UET. Primary conversion = Summary Viewed; value conversion = Purchased.
- **UTMs** on everything. Add `landing_path` and `utm_*` to Sign Up (growth report leak #7).
- **Bot-filtered "real visitors" cohort** (growth report): still needed for any rate.

### 5h. $1k test plan with kill / scale rules

| Phase | Spend | Goal | Kill | Scale |
|---|---|---|---|---|
| Weeks 1–2 of ads | $400 (Microsoft 160 / Google 240) | ≥8 completed free checks | <3 checks after $400 → fix the landing page before spending more; pause ad groups with CTR <2% | — |
| Weeks 3–4 | $600 | ≥1 paid (plan or one-time) | Cost per completed check >$80 **and** 0 paid after $1,000 → stop paid; return to content and partners | Cost per check ≤$50 and ≥2 paid → raise the budget to $1.5k on winning ad groups |
| Ongoing | — | CAC ≤ 2 months of gross margin on what was bought | CAC >$400 on subscriptions only for 2 cycles → cut | CAC ≤$150 two weeks running → scale 30%/week |

---

## 6. Funnel gaps: the minimum before spending on ads

Ranked by how much each blocks paid traffic. The first five are must-haves.

| # | Gap | Evidence | Fix | Effort [E] |
|---|---|---|---|---|
| 1 | **No file ingestion**; entries are typed line by line | `Upload7501Card.tsx` "Coming soon"; competitors all ingest ACE data [V] | ES-003 CSV/XLSX parser (line-detail export) → entries → `auditEntry` per line; browser-side if feasible. 7501 PDF later | 1–2 weeks |
| 2 | **No free result before sign-up** | Hero → sign-up → onboarding → tour → products → entries | Free summary page: counts and "up to" total by cause; line detail and export on a plan | 3–4 days (after #1) |
| 3 | **No way to pay** | PRICING.md DRAFT "not built"; buttons open sign-up | Stripe checkout for the 4 Audits plans + a one-time historical audit product | 3–5 days |
| 4 | **No measurement** | Audit events never fired; no conversion tags | Section 5g | 1 day |
| 5 | **Copy promises upload / "30 seconds"**; "no trial" vs the app's trial | `copy.ts` STEPS, `RecalcSection`, PRICING.md rule 9 | Make the copy match what's live (or ship #1 first) | 1 hour |
| 6 | **Verified window not stated**; IEEPA links promise more than we can check | Hubs and 9903 pages link "Check your past entries"; IEEPA mostly before Nov 17, 2025 | Say "entries since Nov 17, 2025" next to every IEEPA CTA; push the backfill | 1 hour (+ backfill) |
| 7 | **Historical audit offer is hidden** | Commented out in `AuditHero` and `AuditPricing` | Bring it back as a fixed-price product (not "book a call") for ads | With #3 |
| 8 | **Thin trust** | No audit testimonials, case studies or named reviewer; competitors show licensed brokers and SOC badges [V] | Sample report, methodology page, changelog link; a broker partner's quote (if real) | 2 days |
| 9 | **Stale `llms.txt`** | Old Tracker trial and prices; audit with no price | Align with PRICING.md | 1 hour |

---

## 7. Go-to-market beyond search (ranked by customers per hour)

| Rank | Channel | Effort | Expected | Notes |
|---|---|---|---|---|
| 1 | **Warm accounts + Weekly Tariff Brief**: "We now audit your entries" plus the Section 122 / stacking angle; personal note from you; offer to load their ES-003 | Low (1 day) | First 1–5 paying [E] | Existing classification customers already trust you |
| 2 | **LinkedIn founder posts**, 2/week: one "finding of the week" from the engine (code, date, rate paid % → owed %, why), one deadline or explainer | 2–3 h/week | Slow build; appears in Google's "What people are saying" [V] | Never a customer's real data without permission |
| 3 | **Forwarder/3PL partners** (partner plan from $299/mo; affiliate fee to non-brokers is fine) | Medium | 1–2 partner accounts in 90 days [E] | Never pay brokers or take per-filing money (19 CFR 111.36) |
| 4 | **Broker co-hosted webinar**: "Section 122 and stacking: check before your entries liquidate". The broker explains filing; you demo the audit | Medium (1 week prep) | 20–60 registrants, 2–5 checks [E] | Cleanly splits find/flag (you) from file (them) |
| 5 | **Reddit / Amazon Seller Forums answers** | 2–3 h/week | AI-citation seeding; few direct sign-ups | Link only when asked |
| 6 | **Data PR** on the Rate-Change Lag dataset | 4 h/month after build | Links and AI citations [S] | Trade press, Qwoted |
| 7 | **SBDC / trade-association sessions** | Hours each | High-trust small importers | From the distribution report |
| 8 | **Newsletter sponsorship** (ecommerce operator lists) | $500 | Kill if <5 completed checks | After the free check exists |

**Timing hooks:**
- **Oct 8, 2026:** CIT certified a mandatory class of importers who paid IEEPA duties Feb 1, 2025–Feb 19, 2026 (*Freestyle World v. United States*); no class-wide relief order yet; appeal expected [V]. Use it in the Brief now, with "may" wording.
- **Section 122 entries start liquidating around early Jan 2027** (Feb 24 + ~314 days [E]). PSC windows close as they do. This is the cleanest "check before" message we can fully serve.
- **Section 301 exclusions 9903.88.69/.70** run "through November 9, 2026" (engine notes) [V]. That's an Alerts hook, plus an audit hook if they're retroactively extended again.
- **Every new HTS revision** (~every 13 days) → "entries filed just after this change may have paid the old rate."
- **CAPE phase news** → IEEPA content, once the backfill lands.

---

## 8. 30 / 60 / 90-day roadmap

| When | Item | Effort [E] | Measure |
|---|---|---|---|
| **Days 1–7** | Deploy the rename + 301; GSC export for audit queries; fix the copy truth items (#5, #6, #9); deploy audit events + UTMs; bot cohort | 2 days | `/duty-audits` position for "tariff audit software…"; events arriving |
| | Warm-list email + Weekly Tariff Brief: audit launch + Oct 8 class certification note | 0.5 day | Replies, audits started |
| **Days 7–21** | ES-003 upload → free summary (gaps #1, #2) | 1–2 weeks | Uploads/week; % with ≥1 flag |
| | Additive 9903 / hub links with the verified-window note | 1 day | Clicks to `/duty-audits` from 9903 pages |
| **Days 21–30** | Stripe checkout: 4 plans + one-time historical audit | 3–5 days | Checkout starts, purchases |
| | Sample audit report page + PDF | 2–3 days | Views → checks |
| **Days 30–45** | Section 122 overcharges page; stacking overcharges page | 4 days | GSC impressions per page; checks started |
| | HTS-page "charged right?" box on 20–30 test pages | 2 days | CTR/position vs control; box clicks |
| | Keyword Planner pulls (Google + Microsoft); build campaigns, not live | 0.5 day | Volumes to replace [E] marks here |
| **Days 45–60** | Paid test phase 1 ($400) | 2 h/week | Cost per completed check |
| | Recovery-deadline tool page | 2–3 days | Tool uses → checks |
| | Rate-Change Lag dataset + CSV; LinkedIn cadence running | 3–4 days | Citations in the monthly prompt panel; links |
| **Days 60–90** | Paid phase 2 ($600) with kill/scale rules | — | CAC vs payback |
| | Broker co-hosted webinar | 1 week prep | Registrants → checks → paid |
| | Retroactive-changes page; IEEPA timeline once backfilled | 2–4 days | Impressions, checks |
| | Partner outreach to forwarder/3PL customers | Ongoing | Partner demos booked |

**North star:** completed free audit checks per week (upload + summary viewed) from real visitors. **Guardrails:** check → paid %, and CAC for paid sources.

**90-day targets [E]:** 40+ completed checks/month, 8+ paying Audits accounts or one-time audits, `/duty-audits` holding page 1 for "tariff audit software" and ranking for the 122/stacking pages, and cited by at least one AI engine on 2 of the 5 audit prompts.

---

## 9. How this changes or confirms earlier reports

| Earlier finding | Status | Why |
|---|---|---|
| Fix the funnel before paying for traffic (growth strategy) | **Confirmed, sharper.** The audit path has zero recorded audits; it needs upload + checkout, not just CTA fixes | Mixpanel event list |
| The overpayment check is the wedge | **Confirmed.** Competitors now use it hard (Caspian free audit, Allied CHB "free duty recovery audit", Tarifflo "Get started free") | Live SERP |
| IEEPA refund pages are the most direct SEO → revenue route (big-bets Bet 4) | **Changed: lead with Section 122 + stacking.** IEEPA waits on the backfill: we cover only Nov 17, 2025 onward | `revisions.ts` |
| $300 ads into the overpayment check | **Revised:** ~$1k, Microsoft-heavy, only after upload + checkout, selling a one-time audit for payback | Mixpanel referrers; CAC math |
| Flat-fee prior-entry audit (~$499) | **Confirmed and needed** for paid ROI. It's currently hidden on the page | Code |
| Reddit is a top AI-cited domain | **Confirmed, plus LinkedIn:** Google's IEEPA SERP shows LinkedIn and Reddit posts inline | Live SERP |
| Positioning "keep 100%, your broker files" | **Confirmed;** the only distinct counter to contingency firms that file for you (Caspian, Tarifflo) | Competitor pages |
| Competition | **Updated:** Caspian (ACE connect, files via brokers, runs ads), Tarifflo Audit (contingency, ACE pull), Gaia Tariff Audits (ACE import, free trial, ads), Trava (YC W25), KlearNow, CustomsGenius, Allied CHB, Deloitte Tariff Audit Agent | Sources below |

---

## 10. Questions for you

1. **One-time historical audit:** bring it back as a fixed-price checkout item? At what price ($499 for up to 12 months of entries?), and how much manual review per audit will you do?
2. **Free summary scope:** show "N lines, up to $X" free and keep line detail paid? Or show 1–2 example lines free?
3. **Browser-only processing** of uploaded ES-003 files: worth the extra build for the privacy claim, or server-side with a clear retention policy?
4. **Lead the ads and the first new pages with Section 122 / stacking** rather than IEEPA, until the backfill reaches Feb 2025?
5. **Aggregate audit data:** OK to add opt-in aggregate use to the terms so we can publish an audit benchmark later?
6. **Broker partner:** is there a broker you trust to co-host the webinar and be named as the "your broker files" example?

---

## Sources

**Our data:** Mixpanel prod project 3768432 (queries run 2026-10-30: audit-path viewers 30/90 days, top paths 30 days, referrers 30 days, funnel events 60 days, full event list); `seo-data/htshero.com-Performance-on-Search-2026-10-23/` (Queries.csv, Pages.csv), `seo-data/htshero.com-Performance-on-Search-Generative-AI-Features-2026-10-23/`; code: `app/duty-audits/page.tsx`, `components/tariff-audit/**`, `libs/tariff-audit-example.ts`, `app/api/audit-request/route.ts`, `components/tariff-tracker/entries/*`, `tariffs/engine-v2/revisions.ts`, `tariffs/engine-v2/REFUNDS.md`, `libs/signup-onboarding.ts`, `app/llms.txt/route.ts`, `next.config.js`, `PRICING.md`, `content/CONTENT_TODO.md`; earlier reports in `reports/`.

**Live checks (2026-10-30):** Google `tariff audit software find overpaid duty`, `ieepa tariff refund`, `tariff refund services for importers`, `how to find out if I overpaid import duty US` (gl=us, hl=en, from a Bangkok IP; ads did not render from that location). Google Ads Transparency Center, region US: meetcaspian.com (14 ads), gaiadynamics.ai (7), gingercontrol.com (0), tarifflo.com (0), freightright.com (30, freight ads). Perplexity required sign-in.

**Keyword data (seodata.dev, Google Ads API, US):**
- https://www.seodata.dev/keyword/tariff-refund (480, $9.52; cbp tariffs 880, $25.72; tariff reimbursement 30, $7.93)
- https://www.seodata.dev/keyword/tariff-refunds (20; section 301 tariff refund 20)
- https://www.seodata.dev/keyword/duty-drawback (1,900, $34.40; drawback 9,900, $13.80)
- Not found (404): /tariff-audit, /customs-audit, /post-summary-correction, /ieepa-refund, /ieepa-tariff-refund, /tariff-refund-calculator

**Competitors:**
- Caspian: https://www.meetcaspian.com/solutions/trade-audit
- Tarifflo Audit: https://www.tarifflo.com/platform/audit · 1-in-8 claim: https://aijourn.com/?p=538175 · https://yespress.io/tarifflo-yc-s26
- Gaia Dynamics: https://www.gaiadynamics.ai/product/tariff-audits · https://www.gaiadynamics.ai/blog/why-you-should-audit-your-tariffs-before-filing-ieepa-refunds
- Trava (YC W25): https://ycombinator.com/companies/trava
- KlearNow case study: https://klearnow.ai/case-studies/post-entry-audit-finds-1-7m-in-duty-overcharges-hidden-by-tariff-stacking/
- GingerControl: https://gingercontrol.com/blog/customs-duty-audit-guide · https://gingercontrol.com/blog/recover-overpaid-import-duties · https://gingercontrol.com/blog/tariff-audit-software-vs-duty-drawback · https://gingercontrol.com/blog/cape-vs-protest-vs-psc-decision
- CustomsGenius: https://www.customsgenius.com (article "What Software Helps an Importer Recover Overpaid…", Oct 6, 2026)
- Allied CHB: https://alliedchb.com/services/ · https://alliancechb.com/ieepa-refund-calculator/
- BorderAudit: https://www.g2.com/products/borderaudit/discuss
- Deloitte Tariff Audit Agent: https://www.peerspot.com/products/deloitte-tariff-audit-agent-reviews
- ustariffrates: https://ustariffrates.com/customs-brokers
- Refund firms and contingency: https://ayarlaw.com/tariff-refund-attorney · https://leyton.com/us/ieepa-customs-tariff-refund/ · https://www.bakertilly.com/insights/tariff-refunds-for-importers · https://www.freightright.com (Tariff refund recovery) · https://mccunewright.com/practice-areas/commercial-litigation/refer-clients-for-ieepa-tariff-refund-recovery/
- Free ES-003 calculators: https://www.unisco.com/ieepa-refund-calculator · https://wove.com/blog/ieepa-tariff-refund-calculator · https://ustariffrates.com/ieepa-refund-calculator · https://marketplace.item.com/ieepa-refund-calculator/
- Stacking refunds: https://www.greenworldwide.com/cbp-begins-processing-refunds-for-tariff-stacking-overpayments/

**Legal and timing:**
- CIT class certification: https://www.dwt.com/insights/2026/10/cit-certifies-ieepa-duty-refund-importer-class · https://www.steptoe.com/en/news-publications/global-trade-and-investment-law-blog/relief-in-sight-cit-certifies-class-for-ieepa-tariff-refunds-for-certain-importers.html · https://www.bdo.com/insights/tax/cit-certifies-importer-class-seeking-ieepa-duty-refunds-key-considerations-for-importers
- CAPE and protests: https://www.hklaw.com/en/insights/publications/2026/04/cape-has-arrived-navigating-the-next-phase-of-ieepa-duty-refunds · https://www.jdsupra.com/legalnews/ieepa-refunds-protesting-liquidated-1242228/ · https://www.cbp.gov/trade/programs-administration/trade-remedies/ieepa-duty-refunds
- Brokerage limits: `reports/Customs brokerage limits for refunds.md`; 19 CFR 111.36: https://www.law.cornell.edu/cfr/text/19/111.36

**Ads policy and benchmarks:**
- Google government documents & services policy: https://support.google.com/adspolicy/answer/13156083 · Oct 2026 update summary: https://www.relevantaudience.com/google-ads-en/google-ads-government-documents-services-policy-october-2026/
- LinkedIn CPC / conversion benchmarks: https://www.clickminded.com/linkedin-ads-benchmarks/ · https://www.seo-day.de/news/article/linkedin-ads-cpc-benchmarks-how-costs-compare-with-google?lang=en · https://dupple.com/learn/linkedin-ads-b2b-cost-2026
