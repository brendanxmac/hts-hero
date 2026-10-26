# SEO, AEO and GEO big bets: what would really move results

_Researched 2026-10-26. This follows on from `reports/HTS Hero SEO and AI search plan.md` (crawl fix, Chapter 99 basics, titles)._

## Contents

- [How I researched it](#how-i-researched-it)
- [The short version](#the-short-version)
- [Bet 1: Program hubs with complete, current code lists](#bet-1-program-hubs-with-complete-current-code-lists)
- [Bet 2: Deep Chapter 99 pages for all ~400 modeled headings](#bet-2-deep-chapter-99-pages-for-all-400-modeled-headings)
- [Bet 3: AD/CVD order pages, plus company-rate pages](#bet-3-adcvd-order-pages-plus-company-rate-pages)
- [Bet 4: IEEPA refund timeline by country](#bet-4-ieepa-refund-timeline-by-country)
- [Bet 5: Get distributed into AI tools](#bet-5-get-distributed-into-ai-tools)
- [Bet 6: CROSS ruling pages ("HTS code for product X")](#bet-6-cross-ruling-pages-hts-code-for-product-x)
- [Bet 7: Code × origin pages (revisit, your call)](#bet-7-code--origin-pages-revisit-your-call)
- [Supporting work](#supporting-work-small-but-compounding)
- [Skip or defer](#skip-or-defer)
- [How we'll know it's working](#how-well-know-its-working)
- [Suggested sequence](#suggested-sequence)
- [Decisions for you](#decisions-for-you)
- [Sources](#sources)

---

## How I researched it

I ran four lines of research.

1. **Live AI answers.** Perplexity and Google (AI Overview plus organic results), asked in the browser:
   - 3926.90.99 from China
   - What 9903.01.25 is
   - The Section 232 derivatives code list
   - Steel nails from Vietnam AD/CVD
2. **Search demand.** About 200 Google Autocomplete calls across 50+ tariff topics, with alphabet expansion. Autocomplete shows that people search for something, not how many do.
3. **Competitor architecture.** Sitemaps and page types for 15+ sites: Tandom, TariffLens, Tariffs API, Gateway Lines, Wove, Borderless, Unisco, HTSHub, Flexport and others.
4. **Authority and AI distribution.** Vendor studies on citation sources, tariff comparison lists, MCP registries, and data niches nobody owns.

Our own inputs:

- The GSC export (to Oct 20) and the GSC AI-features report.
- The engine data in `tariffs/engine-v2/data`:
  - 399 headings
  - ~25 programs
  - 54 versioned code lists, each with its source and effective date

---

## The short version

We hold the most valuable thing in this space: a **current, sourced, versioned model of every Chapter 99 program and the codes it covers**. Search and AI answers show that nobody publishes this well.

- Perplexity's answer to "which HTS codes are covered by the Section 232 derivatives tariff" says they **"do not use one compact standalone list of HTS codes"**. It cites only Federal Register, CBP and Congressional Research Service PDFs.
- Google's results for "section 232 derivatives hts code list":
  - law-firm alerts, PDFs, and a Reddit thread titled **"Where to find list of HTS codes subject to SECTION 232?"**
  - an AI Overview quoting an August 2025 fact, although the program was rebuilt in April 2026.
- Autocomplete shows real demand for exactly these lists. Typed searches include:
  - "section 232 derivatives hts list"
  - "section 232 tariffs list excel"
  - "section 232 copper hts list"
  - "section 338 tariff code list"
  - "section 301 list 3 hts codes"
- Competitors' program pages are thin. Tariffs API's /section-232 lists no codes; TariffLens' /programs/122 shows zero codes.

Meanwhile, **Google's AI Overview already treats us as the source** for code questions. For "hts 3926.90.99 tariff from china", it names HTS Hero first and repeats our duty breakdown line for line. Perplexity cites others: Wove, Gateway Lines, Flexport, HTSHub. So our pages are trusted where we're indexed. The work is to cover the questions we don't answer yet, and to get into the other engines.

**The big bets, ranked:**

| # | Bet | Why it's big | Evidence | Effort |
|---|---|---|---|---|
| 1 | **Program hubs with complete code lists** (Section 232 by program/annex, 301 Lists 1–4A + exclusions, 301 forced labor by country, 338 Canada, 122, IEEPA) + CSV/Excel | Fills a gap AI engines admit to; most linkable asset we could make | **Strong**: autocomplete, Perplexity + Google answers, thin competitor pages | 4–6 days |
| 2 | **Deep Chapter 99 pages** for all ~400 modeled headings | 41% of our code-query impressions; competitors run 3,400–3,800 such pages | **Strong**: our GSC + competitor traction | 2 days |
| 3 | **AD/CVD order pages** (+ company-rate pages) | Answers fall back to gov PDFs and hedge on current rates; Tandom ranks with this exact format | **Strong** (competitor proof) | 3–4 days |
| 4 | **IEEPA refund timeline by country** (which rate applied, when) feeding the audit funnel | Very current, deep demand; calculators are crowded but the rate history isn't | **Moderate–strong** | 2 days |
| 5 | **AI distribution**: turn the MCP on, publish it to the registries, apply to the ChatGPT Apps and Claude Connectors directories | ~17 tariff MCP servers are in the official registry, we're not; Gateway Lines and Tandom are | **Moderate** (no proof listings drive traffic; cheap) | 1–2 days |
| 6 | **CROSS ruling pages** with "the code today" and today's duty | The biggest SERP share for "hts code for [product]" queries, but a large build | **Moderate–strong**, but a big effort and quality risk | 1–2 weeks |
| 7 | **Code × origin pages** (top codes × top origins) | Perplexity cites Gateway Lines' "from China" pages; AI follow-up searches are code + program + country | **Moderate**; you rejected this before, so it's a decision for you | 3 days |

Plus the smaller fixes from the first report (product names, titles, Bing/IndexNow) and off-site work (section 5 below).

---

## Bet 1: Program hubs with complete, current code lists

**What to build:** one hub per program, e.g.:

- `/tariffs/section-232/steel-aluminum-derivatives`
- `/tariffs/section-232/copper`
- `/tariffs/section-232/auto-parts`
- `/tariffs/section-232/timber-lumber-furniture`
- `/tariffs/section-232/trucks-buses`
- `/tariffs/section-301/china` (Lists 1, 2, 3, 4A + exclusions)
- `/tariffs/section-301/forced-labor` (rate by country)
- `/tariffs/section-338/canada`
- `/tariffs/section-122` (Feb 24–Jul 23, 2026, history)
- `/tariffs/ieepa` (history and refunds, see Bet 4)

The current `/tariffs/*` pages are retired and noindexed, so the path is free. Alternatively use `/programs/*`.

**What each hub has:**

1. **A direct answer at the top.** What the program is, the rate(s), where it stands today, the effective date and the latest change. Written in our plain-English style, with the legal source linked.
2. **The complete covered-code table**, searchable and filterable:
   - code, description, list or annex, Chapter 99 heading, rate, effective date, and country caps or exceptions (UK, EU, Japan)
   - every code links to its `/hts` page, and every heading to its `/hts/9903…` page
   - this is the core of the page, built from `lists.generated.json` and the heading scopes
3. **Download as CSV / Excel.** People type "excel" and "pdf" after these queries, and a download invites links and citations.
4. **Change log:**
   - each version of the list from the engine (`versions[]` with effective date and source)
   - "added 407 codes on Aug 18, 2025", "rebuilt into Annexes I-A/I-B/II/III on Apr 6, 2026"
   - links to the related `/tariff-updates` pages
5. **Stacking notes:** how it combines with other programs, e.g. 232 content-value rules or 301 + 232. Engine-driven where possible.
6. **A "Watch these codes" call to action** into the Tracker. The alert promise fits naturally here.
7. **FAQ** answering the real follow-ups:
   - "Is X covered?"
   - "What's the melt-and-pour rule?"
   - "Does USMCA exempt it?"
   - "When did it start?"

**Why it should win:**

- **Demand.** Section 232 was the deepest autocomplete cluster we saw:
  - derivatives, copper, lumber, furniture/cabinets, trucks, auto parts, semiconductors, pharma, drones
  - "duty rates", "effective date", "value of steel content", "melt and pour", "exclusions", "usmca exemption"
  - investigation-stage topics (robotics, critical minerals, wind turbines) already show interest
- **Weak results.**
  - What ranks is mostly copies of government PDFs, including forwarder copies like gw-world.com's `Updated_steelHTSlist_081525.pdf` and foreign customs pages, plus law-firm alerts.
  - Most predate the April 2026 overhaul, the Feb 2026 IEEPA ruling and the July 2026 Section 301 forced-labor action.
  - For copper there is no list page at all.
- **AI engines say no list exists.** Perplexity said so outright, and Google's AI Overview is out of date.
- **Competitors don't list the codes:**
  - Tariffs API's `/section-232` and `/section-301` are short overviews with no codes.
  - TariffLens' `/programs/*` show zeros.
  - Gateway Lines has topic pages without tables.
- **Citation research favors it.** The GEO paper found that adding statistics (+33%) and citing sources (+28%) raise how often a page is cited. A complete, dated, sourced table is the extreme case. Ahrefs found AI answers favor fresher pages, and we update when the HTS does.
- **Internal links.** About 10,000+ code links point into our `/hts` pages from pages that should earn links themselves.

**Accuracy is the moat.** Competitors get these wrong:

- TariffLens labels 9903.88.15 "List 3".
- Tariffs API's 9903.88.15 title says +7.5% while its rate box says 12.5%.
- Credlix shows a wrong general rate.

AI answers already copy our wording (Google repeated our "Section 301 – Forced Labor" line), so every program name and label has to be exactly right.

**Watch out for:**

- Lists that depend on scope text, not only on codes (e.g. 232 derivatives "of steel"). Say "may apply; the scope's description decides", in line with our rules.
- Keep "rates" in %, never $.

---

## Bet 2: Deep Chapter 99 pages for all ~400 modeled headings

This is in the first report, but competitor data makes it bigger.

**The evidence:**

- Tandom has 3,389 Chapter 99 pages, Tariffs API 3,805, and Unisco has them in 10 languages.
- They took 4 of 9 results for "9903.81 list", and they appear for 9903.88.15 and 9903.01.25.
- 9903 queries are **41% of our code-query impressions**, and our 9903 pages say almost nothing.

**Model it on the best of them (Tandom), plus what only we have:**

- The program name, rate, status, start and end dates, and countries.
- The **base codes it applies to.** Link to the Bet 1 hub when it's a list.
- Exceptions and companion headings, linked.
- The Federal Register, proclamation or CSMS source.
- History from the engine's versions.
- **Refund status** for IEEPA and Section 122 headings, in "may qualify" wording.

**Example: Perplexity's answer to "What is 9903.01.25 and is it still in effect?"**

- It answered well, but cited GHY, law firms, the White House annex and CRS.
- It also cited **tarifflens.ai/hts/9903.01.25**, which proves a third-party code page can earn a citation here.

The page needs the paragraph that answers it in its first lines:

> 9903.01.25 was the IEEPA reciprocal baseline (10%) … ended for entries on or after Feb 24, 2026.

---

## Bet 3: AD/CVD order pages, plus company-rate pages

**Evidence:**

- **Perplexity**, "Is there an antidumping duty on steel nails from Vietnam and what is the rate?":
  - cites only Federal Register, USITC, govinfo and ACCESS PDFs from 2015–2021
  - then hedges that the current rate "may differ if Commerce has issued later administrative-review results"
  - a page with the order's current status, latest review and rates is what that answer lacks
- **Tandom's footprint** (compliance.tandom.ai):
  - 1,235 order pages, 407 company-rate pages, 762 ITC investigation pages, 9,670 CSMS message pages
  - it owned **9 of 9** results for "CSMS antidumping liquidation instructions 2026"
  - its order page titles follow the pattern "{Product} from {Country} AD cash deposit rate | Case A-570-894"
- **Search demand** includes "ad/cvd case search", "active ad cvd cases", "ad/cvd rates" and "aluminum extrusions antidumping scope".

**What to build:**

- `/adcvd/{case}-{product}-{country}` for the ~909 live cases with codes:
  - status, dates, "Rates Commerce Set" as a range plus the all-others rate
  - scope text, HTS codes (two-way links), a timeline to the `/tariff-updates/adcvd-*` events, and sources
  - "Check whether this case covers your import" → the free-account check
- **A product hub** (`/adcvd/steel-nails`) listing every country's case.
- **Company-rate pages**, phase 2: one per company × case, e.g. "Canfor Corporation – softwood lumber CVD rate". This is long-tail demand nobody but Tandom serves. Only build it if our rates per company are reliable.
- **Skip CSMS message pages.** Tandom owns them, and our CSMS feed only holds 25 items.

**Decision needed from you:** this makes case rates public to signed-out visitors (case-level facts, not a check of their import). I think it fits the Oct 22 rule, and Tandom shows the same publicly.

---

## Bet 4: IEEPA refund timeline by country

**Demand.** This was the deepest cluster outside Section 232. Typed searches include:

- "ieepa refund phase 3", "cape ieepa phase 3", "ieepa refund ace portal"
- "ieepa refund calculator", "ieepa refund interest calculation", "ieepa refund liquidation date"
- "ieepa refund protest", "ieepa refund deadline"
- "ieepa tariff start and end date", "section 122 tariff refunds"

**What ranks:**

- Calculators: Flexport, Reform HQ, Unisco, Alliance CHB, ustariffrates.
- Broker and law-firm posts.
- The calculator space is crowded. **What's missing is the factual "which IEEPA rate applied to my country on my entry date" history.** We have it as 78 versioned IEEPA reciprocal headings plus the fentanyl headings, with dates.

**What to build:**

- `/tariffs/ieepa`: a timeline table by country, showing each 9903.01/9903.02 heading with its rate and start/end dates.
- A CAPE phase and deadline explainer, using `REFUNDS.md` facts. The open legal points are marked unverified there; check them before publishing.
- A "Could you be owed?" call to action into `/tariff-audit`, with "may qualify" wording and "your broker files".

This is the most direct route from SEO to revenue: refund seekers are importers with entries, which is your ideal customer.

---

## Bet 5: Get distributed into AI tools

**Evidence:**

- The official MCP registry, checked live today, lists about **17 distinct tariff MCP servers**:
  - Gateway Lines, tariffmonitor, tariffschart, opsloft tariff-resolver, usitc-tariffs and others
  - Tandom, Tariffs API and ustariffrates also run MCPs
  - we have one built (`/api/mcp`), switched off
- Submissions to the ChatGPT Apps directory and Anthropic's Claude Connectors directory are open and reviewed. I found no tariff app confirmed in either, but I couldn't browse them.
- **There's no proof that listings drive traffic.** Measure with UTMs.

**Do:**

1. Turn the MCP on, after checking `/api/mcp` and its OAuth paths are in the Vercel Bypass rule.
2. Publish it to the official registry, Glama, Smithery, PulseMCP and mcp.so.
3. Submit to Claude Connectors and ChatGPT Apps.
4. Differentiate on what the others lack: AD/CVD matching, note-accurate Chapter 99 stacking, and dated history.

**Comparison lists: about an hour of emails.**

- **GingerControl's "best import duty calculators"** ranks HTS Hero #5 of 10. It says "free for 20 a month or $14.99 unlimited", which is wrong. Ask for a correction: free unlimited calculator, AD/CVD check, Tracker.
- **TariffLens' /compare** lists about 23 tools and not us. Ask to be added.
- **ustariffrates.com/best** is unchecked; it blocks bots.
- **G2 / Capterra:** free profiles. Low cost; no evidence either way.

Why lists matter: Ahrefs found branded web mentions correlate with AI Overview brand visibility (ρ≈0.66, 75k brands) more strongly than backlinks do. It's correlation and vendor research, but every study points the same way.

---

## Bet 6: CROSS ruling pages ("HTS code for product X")

**Evidence:**

- Ruling pages took **6 of 10** results for "HTS code for yoga mats" (open-gov.usebase, TariffLens, Wove), plus about half of a thermal-paper search. That's from the agent's search proxy, not live Google.
- TariffLens has about 85k ruling pages; CustomsMobile mirrors about 218k; Borderless has 375 curated ones with plain-English summaries and a weekly digest.
- Product queries ("hts code for stickers", "wire harness", "printed circuit board assembly") are deep long-tail.

**Our edge:**

- We show rulings on code pages but fetch them live from CBP's API.
- A ruling page could add what the mirrors don't:
  - **"the code today"**: the ruling's code mapped through HTS renumbering, using our concordance
  - **today's duty by origin**, from the engine
  - a link to the classification assistant

**Why it's ranked 6th:**

- It's a big ingestion and summarization job: CROSS is public, but there are 200k+ rulings.
- Mass AI summaries risk thin, low-quality pages.

**Pilot:** ingest only the rulings already shown on our top ~1,000 impression code pages. Summarize those, then measure. Expand only if they get indexed and earn impressions.

---

## Bet 7: Code × origin pages (revisit, your call)

**You rejected these on Oct 6** (duplicate/doorway risk). New evidence since then:

- Perplexity's answer for 3926.90.99 from China cited **Gateway Lines' `/examples/other-plastic-articles-3926-90-99-89-from-china`**.
- TariffLens runs about 16k `/hts/{code}/from/{country}` pages and appears in results.
- Our own GSC shows the follow-up searches AI tools run behind the scenes:
  - `"4202.21.6000" section 301 tariff status`
  - `"6405.20.90" section 301 tariff china`

  Those are code + program + country, which is exactly what an origin page answers.

**The risk is real.** Thin variants of the same page get filtered out.

**If you want to test it:**

- Only for the top ~200 codes by impressions × the 5–6 origins whose duty actually differs (China, Vietnam, Mexico, Canada, India, EU).
- Each page shows: the stacked lines with their 9903 numbers, programs checked and not applied (and why), the history of that origin's rate, and a comparison with other origins.
- Noindex any pair where the duty equals the general rate, so no near-duplicates.

I'd do this **after** Bets 1–3, because the program hubs and 9903 pages make these origin pages much richer.

---

## Supporting work (small but compounding)

From the first report, still valid:

- **Fix product names** in `htsProductName`, e.g. "Made of round wire" and "headings…". These sentences are quoted verbatim by AI Overviews.
- **Show the 9903 number on each line of the estimate breakdown**, linked to its page.
- **Add alternate code formats** (3926909989 / 3926.90.9989).
- **Test the rate in titles.**
- **Bing Webmaster Tools + IndexNow** on publish. Perplexity and ChatGPT cite outside Google's index, and we're absent there.

New:

- **`llms-full.txt`:** cheap, and competitors have it. There's no evidence it matters, so do it only alongside other work.
- **Dataset schema on downloadable lists** (Bet 1) and on `countries.csv`. Hygiene only: Ahrefs' controlled test found no citation lift from schema.
- **A weekly "What changed in US tariffs" digest**, from `/tariff-updates` plus engine changes. Post to LinkedIn and as a newsletter; Reddit only once mods approve (r/ImportTariffs requires it).
- **Publish the program lists and a Chapter 99 change log as open data** on GitHub, Kaggle and Hugging Face (CC-BY, attribution to htshero.com).
  - No one publishes a dated Chapter 99 change log; the USITC item count excludes Chapter 99.
  - The authority payoff is speculative, but it costs about an hour once Bet 1 exists.

---

## Skip or defer

- **Translated pages** (Unisco ranks with 10 languages): defer. Our customers are US importers.
- **Product-name pages without rulings** (Wove's ~97k): high classification-error risk, about 300 unique words each.
- **Glossary pages:** cheap, low impact. Later.
- **CSMS message archive:** Tandom owns it, and our feed is limited.
- **Big media and generic "tariff news" head terms:** spam and major outlets dominate.
- **Investing more in llms.txt or schema as levers:** no evidence they work.

---

## How we'll know it's working

1. **GSC, every 2 weeks, by URL segment:**
   - `/tariffs/*` hubs, `/hts/9903*`, `/adcvd/*`, `/tariff-updates/*`
   - impressions, position, CTR, plus the Generative AI features report for the same segments
2. **A fixed set of 25 AI prompts**, checked monthly in Perplexity, ChatGPT (search on) and Google, noting whether HTS Hero is cited:

   | Topic | Prompts |
   |---|---|
   | Code from origin | 5 |
   | 9903 | 5 |
   | Program list | 5 |
   | AD/CVD | 5 |
   | Refund | 5 |

   I can set this up as a monthly scheduled task that writes a small table.
3. **Mixpanel:** sign-ups whose first page is a hub, 9903, AD/CVD or refund page. Filter bots first, per the Business Pulse caveat.

---

## Suggested sequence

| Weeks | Work |
|---|---|
| 1–2 | Bet 2 (9903 pages) + product-name fix + 9903 links in breakdown. Same data layer as Bet 1, so start here. |
| 2–3 | Bet 1, starting with Section 232 metals/derivatives, Section 301 China lists, 301 forced labor and 338 Canada, then the rest. CSV downloads. |
| 3 | Bet 4 (IEEPA timeline + refund explainer), reusing the Bet 1 template. |
| 3–4 | Bet 3 (AD/CVD order pages). |
| Anytime, ~1 day | Bet 5 off-site: list corrections, MCP on + registries, Bing/IndexNow. |
| After 4–6 weeks of data | Decide on Bet 6 pilot and Bet 7 test. |

---

## Decisions for you

1. **Hub URL scheme:** `/tariffs/section-232/...` (reuses the retired path) or `/programs/...`?
2. **Public AD/CVD case rates for signed-out visitors** (Bet 3)?
3. **Turn the MCP on** and list it publicly (Bet 5)?
4. **Reopen code × origin pages** as a limited test (Bet 7)?
5. **Who sends the list-correction emails:** you, or should I draft them?

---

## Sources

Earlier report: `reports/HTS Hero SEO and AI search plan.md`.

**Live AI-answer checks (2026-10-26):**
- Perplexity: 3926.90.99 China; 9903.01.25; Section 232 derivatives list; steel nails Vietnam
- Google: "hts 3926.90.99 tariff from china"; "section 232 derivatives hts code list"

**Competitors:**
- Tandom: https://tariffs.tandom.ai, https://compliance.tandom.ai/adcvd-catalog/orders/A-570-894
- TariffLens: https://www.tarifflens.ai/compare, https://www.tarifflens.ai/hts/9903.01.25
- Gateway Lines: https://tariff.gatewaylines.com/examples/other-plastic-articles-3926-90-99-89-from-china
- Wove: https://tariffs.wove.com/us/tariff/3926.90.99
- Tariffs API: https://tariffsapi.com
- Borderless: https://borderless.us/rulings

**Lists and directories:**
- GingerControl list: https://gingercontrol.com/blog/best-import-duty-calculators
- MCP registry: https://registry.modelcontextprotocol.io/v0/servers?search=tariff
- Claude Connectors: https://support.claude.com/en/articles/12922490-remote-mcp-server-submission-guide
- ChatGPT Apps: https://venturebeat.com/technology/openai-now-accepting-chatgpt-app-submissions-from-third-party-devs-launches

**Studies:**
- GEO paper: https://arxiv.org/abs/2311.09735
- Ahrefs, brand mentions vs. AI Overviews: https://ahrefs.com/blog/ai-overview-brand-correlation/
- Ahrefs, schema test: https://ahrefs.com/blog/schema-ai-citations/
- Ahrefs, freshness: https://ahrefs.com/blog/do-ai-assistants-prefer-to-cite-fresh-content/
- Profound, citation patterns: https://www.tryprofound.com/blog/ai-platform-citation-patterns
- Semrush, most-cited domains: https://www.semrush.com/blog/most-cited-domains-ai/

**Autocomplete raw data (scratchpad):** `/private/tmp/claude-501/-Users-brendanmclaughlin-Projects-HTS-Hero-hts-hero/320d90e0-1124-4c2b-be0a-79028a3f682d/scratchpad/autocomplete/raw.jsonl`
