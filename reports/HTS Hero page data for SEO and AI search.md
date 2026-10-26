# What data to add to /hts and /duty-calculator pages

_Researched 2026-10-26. This report adds to `HTS Hero SEO and AI search plan.md` and `… big bets.md` and doesn't repeat them. Already covered there:_
- _the crawl fix_
- _9903 page summaries_
- _product-name and title fixes_
- _alternate code formats_
- _9903 numbers in the estimate_
- _program hubs, AD/CVD pages, the IEEPA timeline and CROSS ruling pages_

_Sources:_
- _GSC exports in `seo-data/` (to ~Oct 20)_
- _live Census API calls_
- _the current page code_
- _two research passes: competitor pages, and studies on what AI search cites_

_Every change here is additive, per our "never hurt SEO" rule: nothing on the page is removed, hidden or reworded._

---

## 1. Summary

| # | Add | Pages | Evidence | Effort |
|---|---|---|---|---|
| 1 | **Duty actually collected** (Census): effective rate by country and month, plus unit value | /hts, /duty-calculator/{country} | Unique: no competitor shows it. Fits Google's "unique, non-commodity" guidance and the freshness studies. No study proves original data gets cited. | Medium |
| 2 | **Every Chapter 99 measure that touches the code**, with status (in force / ended), dates and countries | /hts | GSC: 8 "{code} section 301 tariff status/china" queries at pos 3–8. Tandom, the strongest non-thin ranker, has this table. | Low–medium |
| 3 | **"Products classified here"** from CBP rulings | /hts | Our 3 product-named example pages (/c/…) got 552 impressions + 79 AI-feature impressions, about 14× an average /hts page. Product queries in GSC. gaiadynamics ranks #2 with a product page. | Low |
| 4 | **"How this line differs from its neighbours"** (the split between sibling lines) | /hts (8/10-digit) | GSC: 7 "4202.21.6000 … composition" queries plus "walking shoes … composition". gaiadynamics and camtomx carry "pitfalls" blocks. | Medium |
| 5 | **Named special programs** (AU → Australia FTA) with "if rules of origin are met" | /hts | Tandom has it. No GSC demand (FTA/origin queries: 4 impressions). Cheap fact coverage. | Low |
| 6 | **HTS revision in the visible date** ("HTS 2026 Revision 21, updated Oct 24") | /hts, calculator | Freshness studies (below). htshub and tariffsapi show it. We already show "Updated {date}". | Very low |
| 7 | **Calculator pages: China-wide effective rate, worked examples, stacking order, de minimis** | /duty-calculator, /duty-calculator/china | /china is our #2 AI-cited page (pos 7.4, 3.1% CTR). Head calculator terms sit at pos 35–55, which is probably authority, not content (see 4.7). | Low–medium |

**Skip:**
- PGA requirements (the data needs the $500 CBP extract, per the Oct 17 research)
- EU/UK/CA equivalent codes (not our ICP; no GSC demand)
- "Report an error" forms and JSON downloads (trust signals, not SEO levers)
- more schema
- longer pages

---

## 2. What the research says works

This is the evidence each idea is judged against. Strength is noted for each.

1. **Ranking position decides most AI citations. On-page wording tweaks barely help.** Strong evidence.
   - *C-SEO Bench* (NeurIPS 2025, controlled): most "write for AI" rewrites had about zero effect, and the engine's initial ranking dominated. [arxiv 2506.11097](https://arxiv.org/abs/2506.11097)
   - Indig/AirOps (Apr 2026, 815k query–page pairs): retrieval position 0 was cited 58% of the time, position 10 only 14%. [SEJ](https://www.searchenginejournal.com/shorter-focused-content-wins-in-chatgpt/571857/)
   - → Data additions matter when they make the page **the best result for more queries**, not when they rephrase what's there.
2. **Covering the facts the answer uses.** Correlation, vendor study.
   - Surfer (Sep 2026, 57k URLs): cited pages covered 31% of the AI Overview's key facts, uncited pages 24%. [surfer.ai](https://surfer.ai/blog/do-pages-with-more-key-facts-get-cited-in-ai-overviews)
   - Discrete, checkable facts are what gets lifted: rates, dates, legal references, statuses.
3. **Freshness.** One controlled study plus three large correlation studies.
   - Controlled: adding a newer date to a passage moved LLM rerankers' choices. [arxiv 2509.11353](https://arxiv.org/abs/2509.11353)
   - Seer (Jul 2026): 75% of cited pages had been *updated* within a year. [Seer](https://www.seerinteractive.com/insights/study-content-recencys-impact-on-ai-visibility-in-2026)
   - SE Ranking (Dec 2025, 2.3M pages): pages updated within 2 months averaged 5.0 AI Mode citations, vs 3.9 for older ones. [SE Ranking](https://seranking.com/blog/how-to-optimize-for-ai-mode/)
   - Ahrefs (17M citations): AI-cited URLs were 25.7% fresher than organic results, except in AI Overviews. [Ahrefs](https://ahrefs.com/blog/do-ai-assistants-prefer-to-cite-fresh-content/)
   - → Data that **really changes every month** is the most defensible freshness signal there is.
4. **Unique, non-commodity content.** Official statement.
   - Google, May 2025. [Google](https://developers.google.com/search/blog/2025/05/succeeding-in-ai-search)
   - Google's scaled-content policy targets template pages "without adding value". [Spam policies](https://developers.google.com/search/docs/essentials/spam-policies)
   - With ~20k template pages, data that differs per code is also our protection.
5. **Answer first, and headings that match the question.** Correlation.
   - 44% of ChatGPT citations come from the first 30% of the page. [SEL](https://searchengineland.com/chatgpt-citations-content-study-469483)
   - Headings closely matching the query: 41% cited, vs 30% for poor matches (AirOps).
6. **Claims without evidence:**
   - "Schema lifts AI citations": an Ahrefs controlled test found no lift.
   - "Tables get cited 2.5× more": vendor figure, no method published.
   - "Longer pages win": studies disagree; focused pages did better in AirOps.
   - "Original data earns citations": no independent study. The argument holds through #2 and #4 but isn't measured.
   - llms.txt: Google says it's not needed.
   - No public study covers tariff or other data-lookup sites. Our own test chapters will be the best evidence we get.

---

## 3. Competitors (what ranks for bare-code queries)

Order is from a search tool, not Google, so treat positions as rough.

| Site | What it ranks with |
|---|---|
| **credlix.com** | Huge, thin coverage. Wins on scale and domain, not content. |
| **tariffs.tandom.ai** | The richest page that ranks. Its Chapter 99 table has **Active/Expired status and a countries column** (13 rows on 7317.00.55). Special-program decoder, stat strip, guide cards. |
| **Wove, tarifflens** | Own the "{code} from china" queries. |
| **gaiadynamics.ai** | A product page ("HS code for t-shirt") with a code table across headings, a duty range and 5 classification pitfalls. Ranked #2 for a 6109.10.00 query. |
| **htshub** | Visible revision stamp ("2026 HTS Revision 21"). Explains textile category numbers. |
| **tariffsapi** | "Synced {time}" stamp, a report-error form, a JSON snippet. |

**No page fetched showed:** import trends, unit values, effective/collected duty, top importers, or broker-reviewed credentials. Our existing Census "Top origins" section is already ahead of everyone.

**Calculator pages:**
- The strongest found is amzprep.com:
  - an 8-layer stacking table
  - 5 worked examples
  - FY2027 MPF min and max
  - de minimis
  - a "why your quoted rate differs" section
  - a 12-question FAQ and an "updated" banner
- tariffsapi adds a transport mode (HMF), preset example links and a "Synced 9 hours ago" stamp.
- "us import duty calculator" and "tariff calculator" are led by NerdWallet, Expeditors, Flexport and spam. That points to domain authority more than content.

---

## 4. The recommendations

### 4.1 Duty actually collected (Census): the strongest new data we can add

**What it is.** The Census import API we already call (`scripts/sync-hts-imports.ts` pulls only `GEN_VAL_YR`) also returns, per 10-digit code × country × **month**:
- `CAL_DUT` (duty calculated on entries)
- `DUT_VAL` (dutiable value)
- `CON_QY1` and `UNIT_QY1` (quantity and unit)
- `RP` (rate provision: how goods entered, e.g. duty-free under a program)

**Checked live today:**

| | 2024 | 2025 | Jan 2026 | Aug 2026 |
|---|---|---|---|---|
| 3926.90.99.89 from China, duty collected ÷ value | 11.7% | 33.5% | 30.2% | 23.1% |
| All imports from China, collected ÷ value (Aug of each year) | 11.2% | 39.7% | — | 22.8% |

- 3926.90.99.89 from China averaged **$0.19 per unit** in 2025: $2.36B over 12.6B units ("NO" = number).
- Data runs to **August 2026** and updates monthly. That gives a real reason to update about 20k pages every month.

**Why it should help:**
- No competitor shows it.
- It's a discrete, quotable fact: "US importers paid an effective 23.1% on 3926.90.99.89 from China in August 2026 (Census)". That is the kind of fact AI answers lift (2.2).
- It changes every month (2.3).
- It makes each page differ from a template (2.4).
- It also answers a question our listed-rate estimate can't: "what are importers really paying?" That suits our audit/savings pitch.

**What to show:**
- A small "Duty actually collected" panel in the Top Origins section: effective % by country for the latest 12 months, with a monthly sparkline.
- One answer sentence near the top: "In {month}, US importers paid an effective X% on this code from {country}, per Census."
- Unit value per country (for example "$0.19 per unit from China vs $0.31 from Vietnam").
- Later: the share entering duty-free under USMCA or an FTA, from `RP`.
  - The RP code meanings need checking against Census's code list before we publish anything. I haven't verified them.
- Keep it in % per our rules. Import values are already shown in $.

**Caveats:**
- Census "calculated duty" is an estimate from entry data, not CBP collections. Label it as Census's figure.
- It already seems to include Chapter 99 duties: 3926.90.99.89 jumps to 59% in May 2025.
- Small cells are suppressed or noisy. Show the figure only above a value threshold (e.g. $1M per month).
- Refunds aren't in it.

**Also on /duty-calculator/{country}:** the country-wide monthly effective rate. "Goods from China paid an effective 22.8% in August 2026, down from 39.7% a year earlier." /china is our #2 AI-cited page, and "how much is customs from china to us" and "what is the import tax from china to usa" are in our GSC queries (pos 26–28).

**Test plan:** ship to the test chapters only, measure in GSC for 3–4 weeks, then widen.

### 4.2 Every Chapter 99 measure on the code, with status

- **Evidence:**
  - GSC has "4202.21.6000" section 301 tariff status / china / tariff (pos 3–3.5), "6405.20.90" section 301 china ×4 (pos 6–8), "6403.99.60" section 301 tariff china, and "is 9903.01.24 ieepa".
  - People ask whether a measure applies to *this code* and whether it's still on.
  - Tandom ranks with exactly this table.
- **What we have:** the estimate shows the 9903 lines in force for one country. Ended measures and other countries' lines aren't on the page.
- **Add:** a table with one row per 9903 heading whose scope includes the code:
  - program name (exact label)
  - rate
  - countries
  - in force / ended, with dates
  - link to the 9903 page

  Include ended IEEPA lines, which also feeds the refund story. The engine already has scope and dates (`tariffs/engine-v2/data/headings`).
- Add an FAQ: "Is {code} subject to Section 301?" The answer names the list and the 9903 number.

### 4.3 "Products classified here", from CBP rulings

- **Evidence:**
  - The 3 homepage example pages (/c/…, "Vacuum Flask HS Code…") got **552 web impressions and 79 AI-feature impressions** from 3 URLs.
  - Product queries in GSC: "htsus earrings imitation jewelry 10-digit code" (21 impr, pos 6), "vacuum flask hs code", "hs code brake pads", "hts code for screws", "hts 6116.93.05.00 ice hockey gloves".
  - gaiadynamics ranks with product pages.
- **Add:** a short server-rendered list near the top: "Products CBP has classified here: stainless steel vacuum flasks, insulated tumblers, …". Take it from the subjects of the rulings we already fetch server-side (`libs/cross-rulings-server.ts`), with each item linked to its ruling.
  - This puts real product words on code pages, where today only tariff wording appears.
  - It's CBP's classification, not ours, so it stays inside "find, flag, explain".
- This is the on-page version of Bet 6 (ruling pages). It's cheaper and tests the same demand.

### 4.4 How this line differs from its neighbours

- **Evidence:**
  - GSC has "4202.21.6000" leather handbag composition (7 variants, pos 8–9.5) and "walking shoes" hts 6403.99.6090 composition.
  - gaiadynamics ("5 pitfalls") and camtomx carry these blocks.
- **Add:** a generated sentence from the sibling lines' own text.
  - Example: "Within 4202.21, lines split by value: 4202.21.30 is valued not over $20 each; 4202.21.60 is over $20 each." Quote the relevant chapter-note rule where one exists (e.g. fiber-weight rules for textiles).
  - Deterministic text only. No AI-written classification advice, and no "you should classify as".
- Risk: getting this wrong is a classification error. Pilot it on a chapter with clean sibling splits (42, 64) first.

### 4.5 Named special programs

- **Today:** the Special column shows raw chips ("A", "AU", "BH", "S+") in `components/hts-code-page/BaseRates.tsx`.
- **Add:** name each program (AU → "Australia FTA") with one line: "Free if the goods meet that agreement's rules of origin."
- **Evidence is thin:** Tandom has it, and it adds facts, but almost nobody searches it. Do it because it's an hour's work.

### 4.6 Revision in the visible date

- "Updated Oct 24, 2026" → "Updated Oct 24, 2026 · HTS 2026 Revision {n}".
- Supported by the freshness research (2.3). Competitors do it.
- The date must reflect real changes. The monthly Census data in 4.1 gives it one.

### 4.7 Calculator pages

- **/duty-calculator/{country}:**
  - the country-wide effective rate (4.1)
  - the stacking order for that country (base → 301 → 232 → IEEPA, with 9903 numbers)
  - 3–5 worked examples in % for that country's top products
- **/duty-calculator:**
  - preset example links ("Plastic articles from China", …) that pre-fill the form
  - a de minimis section
  - a "why the rate you're charged can differ" section
  - MPF/HMF is already in the FAQ (FY2027 figures)
- **Honest expectation:**
  - The head terms ("tariff calculator", 24 impr, pos 37; "us import duty calculator free", pos 23; "tariff fee calculator", pos 43) are led by NerdWallet, Flexport and Expeditors. Per 2.1, the gap there is mostly authority (links, mentions), not missing content.
  - The country pages are where content can win; /china already does.
  - Today only /china shows up in GSC among the 30 country pages. The rest may simply be too new for the data, so check again in the next export.

---

## 5. What I'd do first

1. **4.2 + 4.6:** engine data we already have, low effort, and direct GSC queries.
2. **4.1 on the test chapters (73, 94):** extend `sync-hts-imports.ts` with `CAL_DUT`, `DUT_VAL`, `CON_QY1` and monthly series, then the panel and answer sentence. Add the country-wide figure to /duty-calculator/china.
3. **4.3**, then **4.5**.
4. **4.4** as a pilot on chapters 42 and 64.
5. Measure by URL segment in GSC and in the Generative AI report after 3–4 weeks. Compare test chapters with control chapters before widening.

## 6. Decisions for you

1. **Show "duty actually collected"?** It's Census's estimate and will sometimes differ from our listed-rate estimate. That difference is either a selling point ("you may be overpaying") or a source of confusion.
2. **Ended Chapter 99 measures on code pages:** show them all (refund angle), or only the last 12 months?
3. **Duty history:** a dated change log per code would fit the freshness evidence. But "Duty Over Time" is a Tracker feature, so is a public per-code log giving away a paid feature?
