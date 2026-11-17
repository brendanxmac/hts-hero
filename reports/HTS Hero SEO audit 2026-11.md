# HTS Hero SEO audit — November 2026

Data: Search Console exports from 2026-11-16 (last 3 months, through Nov 13) in `seo-data/Nov16/`, and Mixpanel for the last 30 days. This follows `HTS Hero SEO and AI search plan.md`, `HTS Hero SEO and AI search big bets.md` and `HTS Hero page data for SEO and AI search.md` (all Oct 26).

Rules this report follows: every recommendation cites its data, "no data either way" is said plainly, and changes to ranking pages are additive only.

## Summary

1. **Most of the growth comes from the country calculator pages, not `/hts`.** `/duty-calculator/{country}` brings in about 53% of clicks (98 a day) at an average position of ~4.5 with 2–4% CTR. `/hts` impressions have been roughly flat since mid-October.
2. **Search clicks are up about 28x since early October.** Average clicks went from ~7 a day (week of Oct 5) to ~186 a day (Nov 9–13). Impressions are ~10.8k a day. CTR went from 0.4% to 1.7%, mostly because the calculator pages took a bigger share of clicks.
3. **AI Overviews now show us about as often as half of web search does:** ~19k AI-feature impressions a week. Calculator pages are 38% of them, `/hts` 37% and program hubs 10%.
4. **Program hubs work:** 15 pages shipped Oct 26 and already bring in 110 clicks a week. Section 338 Canada has a 6.2% CTR.
5. **Bing traffic is flat at ~200 users a week, while Google grew from 66 to 844 a week** (Mixpanel). Bing Webmaster Tools is already set up (correction, 2026-11-16).
6. **Google has found 21.4k pages but indexed only 9.2k,** and the indexed count hasn't grown since Oct 20. 17.8k pages are "Discovered – currently not indexed".
7. **Search traffic barely converts:** 2,043 Google visitors led to 22 Sign Up CTA clicks and 6 sign-ups started (0.3%).
8. ~~About 82% of Mixpanel "visitors" are bots.~~ Correction: bots have been filtered since about Nov 2. The 30-day window used here reached back before the filter. Real traffic is ~4.3k users a week (Nov 9 week).

## 1. What drove the growth

Weekly clicks / impressions by page group. The Nov 9 week is 5 days (GSC data stops at Nov 13).

| Week | All | /hts | /duty-calculator | /tariffs (hubs) | /tariff-updates | /compare | /blog |
|---|---|---|---|---|---|---|---|
| Sep 28 | 2 / 50 | 0 / 0 | 0 / 0 | 0 / 6 | 0 / 0 | 0 / 0 | 0 / 0 |
| Oct 5 | 47 / 8.1k | 38 / 8.1k | 2 / 144 | 0 / 8 | 0 / 0 | 0 / 14 | 0 / 58 |
| Oct 12 | 59 / 11.9k | 39 / 12.0k | 5 / 184 | 0 | 0 | 0 / 141 | 1 / 87 |
| Oct 19 | 194 / 26.7k | 95 / 21.7k | 71 / 3.1k | 0 | 10 / 1.6k | 0 / 142 | 0 / 43 |
| Oct 26 | 491 / 52.5k | 155 / 33.8k | 237 / 9.4k | 39 / 4.2k | 34 / 5.0k | 5 / 488 | 1 / 49 |
| Nov 2 | 820 / 61.3k | 212 / 35.1k | 435 / 16.8k | 113 / 6.6k | 28 / 3.2k | 5 / 323 | 1 / 43 |
| Nov 9 (5 days) | 929 / 53.9k | 272 / 29.2k | 491 / 17.0k | 110 / 5.5k | 39 / 2.4k | 0 / 257 | 1 / 49 |

How this lines up with what shipped:

- **Oct 5–6: mass indexing.** Googlebot jumped from ~30 requests a day to 7.7k a day, and indexed pages went from 1.3k to 8.0k. `/hts` impressions started here.
- **Country calculator pages** (built Oct 6, expanded to 30 on Oct 10) started ranking the week of Oct 19 and grew every week after. This group is the main driver of the click growth.
- **Program hubs** (shipped Oct 26) reached ~110 clicks a week within a week.
- **`/hts`** clicks per day keep rising (~54 a day now vs ~5 in October) because CTR is improving. Impressions have stayed at ~5–6k a day since late October.

## 2. Page-group scorecard (last 3 months)

| Group | Clicks | Impressions | CTR | Avg position | AI-feature impressions |
|---|---|---|---|---|---|
| `/duty-calculator/*` | 1,241 | 46.4k | 2.7% | ~4.5 | 19.5k |
| `/hts/*` (not Ch. 99) | 629 | 87.4k | 0.7% | ~5.5 | 18.9k |
| `/hts/99*` (9903) | 182 | 13.4k | 1.4% | ~5.2 | 4.9k |
| `/tariffs/*` hubs | 264 | 16.4k | 1.6% | ~5.2 | 5.3k |
| `/tariff-updates/*` | 111 | 10.2k | 1.1% | ~6.5 | 0.9k |
| `/chapter/*` | 21 | 3.1k | 0.7% | — | 0.7k |
| `/compare/*` | 10 | 1.3k | 0.7% | 6.7–17 | 0.2k |
| `/blog/*` | 4 | 0.3k | 1.4% | 5–11 | 0.06k |

`/hts` broken down by code length (from the 1,000 pages GSC lists):

| Page type | Pages | Clicks | Impressions | CTR |
|---|---|---|---|---|
| 10-digit statistical | 433 | 325 | 29.2k | **1.11%** |
| 9903 (Ch. 99) | 67 | 182 | 13.7k | **1.33%** |
| 8-digit | 189 | 173 | 32.5k | 0.53% |
| 6-digit subheading | 185 | 85 | 18.0k | 0.47% |
| 4-digit heading | 126 | 46 | 14.4k | 0.32% |

## 3. What's working

**Country calculator pages.** 27 of 30 rank at positions 4–6 with 2–4% CTR. They answer queries like "import fees from israel to usa", "tariffs from turkey to usa" and "italy to us tariff". China (7.0k impressions), Italy (3.7k) and Canada (3.8k) lead. These pages are also the most-cited group in AI Overviews.

**9903 pages.** 9903 queries make up 20 of the top 30 queries by impression (for example 9903.05.86, .05.39, .03.01, .05.93 and .03.14). The 9903 pages have the best CTR of any `/hts` page type. This supports big bet #2 (deep 9903 pages).

**Program hubs.** Ranked by clicks:

| Hub | Clicks | Impressions | CTR |
|---|---|---|---|
| Section 338 Canada | 68 | 1.1k | 6.2% |
| Section 232 steel/aluminum/copper | 39 | 3.8k | 1.0% |
| Section 301 forced labor | 38 | 2.0k | 1.9% |
| Section 232 autos | 33 | 1.9k | 1.7% |

Section 232 steel/aluminum/copper is also the 5th most-cited page in AI Overviews (1.4k). This confirms big bet #1.

**AD/CVD tariff-update pages.** They get 3–7% CTR on small volume. For example, oil country tubular goods is at 7.1% and linear hydraulic cylinders at 6.3%. That's light support for big bet #3 (AD/CVD order pages).

## 4. Problems and gaps

**4.1 Pages found but not indexed.** Of 30.6k known URLs, 9.2k are indexed. 17.8k are "Discovered – currently not indexed" and 1.2k are "Crawled – currently not indexed". The indexed count has been flat since Oct 20: 9,320, then 9,275, then 9,197. The sitemap lists 27.9k `/hts` URLs, about 20k of them 10-digit. 10-digit pages have twice the CTR of 8-digit pages, so getting more of them indexed is likely where the most new `/hts` traffic would come from.
- *Missing data:* the summary export doesn't say which URLs are unindexed. See "Exports still needed".

**4.2 Japan, Chile and Colombia calculator pages have zero impressions.** All three are in the live sitemap and use the same template and canonical setup as the other 27, which all rank. Japan is a top-5 source of US imports. Nothing in the code explains it, so the next step is URL Inspection in Search Console.

**4.3 Search visitors barely sign up.** Mixpanel, last 30 days:

| Source | Unique visitors | Sign Up CTA clicked | Sign Up started |
|---|---|---|---|
| Google | 2,043 | 22 (1.1%) | 6 (0.3%) |
| Bing | 895 | 3 | 2 |

Google visitors clicked locked-feature CTAs 85 times, four times as often as the sign-up CTA. That suggests the interest is in the locked features rather than the sign-up box. Tariff Digest sign-ups, the only sign-up route since Nov 6, don't appear as a Mixpanel event, so they can't be measured here.

**4.4 Mixpanel is mostly bots.** 43.7k of 53.5k unique "visitors" in the last 30 days are "direct". Of those, 42.8k are Chrome and only 32 are Safari. Real direct traffic would include plenty of Safari and Edge. The same "visitors" load the calculator 30k times and view results 20k times. This breaks conversion metrics and Business Pulse, and probably adds Vercel cost. It's not an SEO problem, but it hides SEO results.

**4.5 Query data is mostly hidden.** Listed queries account for only 210 of 2,594 clicks (8%). Google hides the rest as anonymised queries. The Pages tables for the whole site, `/hts` and AI features all hit the 1,000-row export cap. The UI exports can't support query-level work like finding pages near page one or pages competing for the same query.

**4.6 Compare pages and blog are weak.** `/compare/best-us-tariff-calculators` is at position 17 (1,056 impressions, 9 clicks). The head term "tariff calculator" is at position 22.8. Blog revision posts get almost nothing. There's no evidence yet that more posts would help.

**4.7 Weak spots in hubs and headings.** Section 301 China is at position 4.9 but 0.64% CTR. IEEPA is at 0.45% CTR. Heading pages are at 0.32% CTR. Titles stay locked by the "never hurt SEO" rule, so the only safe move here is a separate, measured title test.

## 5. Opportunities, ranked

| # | Change | Evidence | Effort | Risk to current rankings |
|---|---|---|---|---|
| 1 | **Find out why Japan, Chile and Colombia aren't indexed** (URL Inspection, request indexing) | The other 27 pages average ~45 clicks each over 3 months; Japan is a top-5 import source | Minutes | None |
| 2 | **Set up Bing Webmaster Tools and IndexNow,** and submit the sitemap | Bing sends 470 `/hts` visitors vs Google's 546 (Mixpanel, 30d); no Bing verification or IndexNow found in the repo. Bing also powers Copilot and ChatGPT search | Small | None (additive) |
| 3 | **More program hubs,** for programs whose 9903 codes draw impressions but have no hub | Hubs went from 0 to 110 clicks a week in two weeks; 9903 queries lead the query list (9903.74.x, 9903.79.02, 9903.76.x, 9903.82.09 sit at positions 7–10). Which programs those headings belong to needs checking against the engine | Medium | None (new pages) |
| 4 | **Deep 9903 pages** (big bet #2) | 9903 pages have the highest `/hts` CTR; many get 150–340 impressions with 0–1 clicks at positions 5–7 | Medium | Additive only; test on a set of headings first |
| 5 | **Get 10-digit pages indexed:** stronger internal links from 8-digit pages to their 10-digit children, and a sitemap split by type so the index rate per type is visible | 10-digit CTR is 2x 8-digit; 17.8k discovered but not indexed. Which kinds of pages are unindexed is still unknown | Small–medium | Low (links are additive) |
| 6 | **Improve sign-ups from the calculator country pages** | They get 53% of clicks but sign-up rates are ~0.3%. Needs the Tariff Digest event in Mixpanel and bot filtering first | Medium | None if no ranking content changes |
| 7 | **AD/CVD order pages** (big bet #3) | AD/CVD update pages get 3–7% CTR; volume is small | Large | None (new pages) |
| 8 | Title test on Section 301 China / IEEPA hubs or headings | Low CTR at good positions. Unproven, and titles are locked, so only as a separate test on a small set of pages | Small | Medium; must be measured |
| — | Compare pages, blog, more country pages | **No data either way.** Queries mention almost only countries we already cover | — | — |

## 6. Duty History test (chapters 73/94 vs 84/61)

The test can't be read yet. Two things are missing:
- **Daily data per chapter.** The `/hts` export combines all chapters, and the 3-month totals mix before and after the change.
- **Time.** It went live around Nov 4, which is about 9 days of GSC data. The plan was to measure at 3–4 weeks.

Export the two regex exports listed below after Nov 25 and I'll compare before and after.

For reference only (3-month totals, before and after mixed): chapter 73 has 1.1% CTR, 94 has 0.54%, 84 has 0.83% and 61 has 0.24%.

## 7. Other checks

- **Crawl health is fine:** 99.5% of crawl requests return 200 and 0.13% return 5xx (up from 0.04% on Oct 26). Response time averages 220–300 ms. Googlebot crawls in bursts of 7–10k a day after each rebuild.
- **Robots:** 2,094 parameter URLs are blocked, as intended. About 12 `/duty-calculator?code=…&country=…` URLs still get impressions at positions 20–56, and 33 are "Indexed, though blocked by robots.txt". These are harmless; keep the block.
- **152 "Duplicate without user-selected canonical" pages.** Which URLs these are isn't in the export.

## Exports still needed

1. Search Console → Pages → open **"Discovered – currently not indexed"** → Export (example URLs). Do the same for **"Crawled – currently not indexed"** and **"Duplicate without user-selected canonical"**.
2. URL Inspection for `https://htshero.com/duty-calculator/japan` (a screenshot or the coverage text is enough).
3. **After Nov 25:** Performance → Last 3 months → Page regex `/hts/(73|94)`, then again with `/hts/(84|61)`, for the Duty History test.
4. Optional but recommended: Search Console API access (a service account with read access), so a script can pull every page and query without the 1,000-row cap.

## Decisions for you

1. Set up Bing Webmaster Tools and IndexNow? (Opportunity #2.)
2. Which comes first: more hubs (#3) or deep 9903 pages (#4)?
3. Fix Mixpanel bot traffic and add a Tariff Digest sign-up event before any conversion work?
4. Set up the Search Console API for future audits?

---

# Part 2 — What will drive more traffic to the calculator and alerts (2026-11-16)

Sources:
- Mixpanel, Nov 3–15 (after the bot filter).
- Three web research passes covering head-term competitors, country expansion, and alert-intent queries plus AI citations.

Limits of the research: the web search tool doesn't reproduce Google's actual rankings, so "who shows up" isn't the same as rank position. Perplexity blocked automated fetches, so AI answers couldn't be observed directly. No search-volume data was available.

## What the funnel says (Mixpanel, Nov 3–15)

| Step | Google | Bing |
|---|---|---|
| `/hts` code page → calculator result | 385 → 66 (17%) | 299 → 37 (12%) |
| Calculator loaded → result | 862 → 417 (48%) | 67 → 43 (64%) |
| Result → Sign Up CTA | 417 → 7 (1.7%) | 43 → 0 |
| Sign Up CTA → Sign Up started | 7 → 1 | — |

- Visitors arriving from other HTS Hero pages load the calculator 817 times but get a result only 11% of the time, against 48% from Google. That's worth a UX check.
- Only 1.7% of people who get a result click the sign-up CTA. This confirms the offer is the problem, not traffic.

## A. More traffic to the calculator

**A1. Fix Japan, Chile and Colombia.** These have zero impressions even though they're in the sitemap and use the same template as the rest. Run URL Inspection, then request indexing.
- Evidence: the other 27 country pages average ~45 clicks each over 3 months, and Japan is a top-5 import source.
- Effort: minutes.

**A2. A test batch of 10 more country pages.** Our 30 pages are exactly the top 30 US import sources (Census 2025), so these would be ranks 31 onward. Candidates, in order of evidence:

| Country | Import rank |
|---|---|
| Cambodia | 32 |
| Sweden | 31 |
| Poland | 33 |
| Costa Rica | 34 |
| Bangladesh | 39 |
| Denmark | 35 |
| Hungary | 36 |
| Saudi Arabia | 38 |
| Dominican Republic | 45 |
| Hong Kong | 54 |

- Evidence for:
  - calcmytariff.com/country/{x} and dripcapital.com/en-us/tariff/{x} both have a dedicated page for each of these and show up for "tariffs from {country} to us".
  - Each country has its own tariff news story: the Section 301 forced-labor tiers from Jul 24, CAFTA-DR, Greenland threats, and Hong Kong's China-origin question.
  - Flexport, SimplyDuty and Zonos don't have these pages.
- Evidence missing: no search-volume data. Our own Search Console data can't show demand for pages we don't have yet. The only signal so far is Saudi Arabia at 17 impressions.
- Measure the batch for 3–4 weeks before adding more.
- Hong Kong needs a correct origin treatment from the engine before it ships.

**A3. Additive changes to `/duty-calculator` (the main page).** Each of these was seen on competitors that rank:
- A "Free — no sign-up needed" line near the form (amzprep, tariffsapi). The sign-up hook belongs on the result ("watch this code"), not on the gate.
- A dated "latest change" fact in the hero (davemanuel shows "12.5% Section 301 … as of Nov 15").
- "Popular calculations" example links (tariffsapi).
- BreadcrumbList schema (tariffsapi).
- Internal links from the 30 country pages and `/compare/best-us-tariff-calculators` to `/duty-calculator`, anchored "US tariff calculator".

Our content already matches the pages that rank (title, FAQ schema, a guide of about 2,000 words, revision date), so the head-term gap is mostly about authority. A realistic target is top 10 for "us tariff calculator" (now 10.9) and "tariff calculator free" (now 9.2). Bare "tariff calculator" (22.8) is held by NerdWallet and Flexport and probably needs earned links.

**A4. Earned links (lower confidence).** The pages that rank for head terms are cited by press or have strong brands. Options are a "cite this page" block on the calculator and country pages (davemanuel does this) and outreach or a launch story. This is a guess on what works; there's no proof yet.

**Skip:** "tariff simulator" (mostly policy and economics tools), plus "duty calculator" and "import duty calculator" (global results: UK, India and so on).

## B. More traffic to alerts

Competitors don't get alert sign-ups from an "alerts" landing page. TariffLens, Tandom, tariffsapi, TariffsChart and pagecrawl all get them from **code pages, program pages and dated change feeds, each carrying a "follow this code" / "alert me" CTA**. Our `/tariff-alerts` gets almost no impressions, which fits that pattern.

**B1. An "Email me when this rate changes" CTA** on 9903 pages, program hubs, calculator results and country pages.
- This is additive: it doesn't touch ranking content.
- It's where our clicks already land, and it's the main sign-up hook.
- It needs the new offer (a free plan with a few alerted imports) to work. Do it together with the offer change.

**B2. A Section 301 exclusions tracker.** All 178 exclusions by HTS code, the 9903.88.69/.70 headings, the Jan 9, 2027 deadline, extension history, and "alert me if it's extended or lapses".
- Evidence: greatlakescustomslaw ("HTS Codes, Deadline, Extension History"), ghy, Shapiro and tandom pages show up for "section 301 exclusions extended". The deadline comes back every few months.
- We already model the Jan 9, 2027 extension in the engine.

**B3. A dated change log: "Every US tariff change in 2026", with weekly pages,** built from `/tariff-updates`.
- Evidence: tariff-check.pages.dev, the CH Robinson timeline and others show up. Results for "latest tariff changes this week" were stale (newest from Sept 2026), so a fresh feed has an opening.

**B4. Alert explainer and comparison posts** ("Tariff alerts by HTS code", "Tariff alert services compared"). GingerControl's four posts show up for alert-intent queries. Our blog has underperformed so far, so this is low priority.

**Skip:** "tariff tracker" (think tanks and law firms with high authority) and "new tariffs today" (news only).

## C. AI search

- AI Overviews show our pages about 19k times a week (Search Console), with calculator pages first.
- For other answer engines we have no direct observation.
- In the search tool's own answers, country tool sites (calcmytariff, ustariffrates) got cited for "Italy tariff", and Wove and TariffLens for 9903.01.24.
- Tandom publishes an `llms-full.txt`. There's no evidence that it helps.
- The more pages per country and per program we have, the more of these questions we can be cited for. That's another reason for A2 and B2/B3.

## Recommended order

| # | Step | Why first |
|---|---|---|
| 1 | A1 Japan, Chile, Colombia | Minutes; proven page type |
| 2 | A2 10-country batch, measured | Our best format, competitor proof |
| 3 | A3 additive `/duty-calculator` changes | Small; aims at top 10 on two head terms |
| 4 | B2 Section 301 exclusions tracker | Recurring deadline demand; data already in the engine |
| 5 | B3 Dated change log | Results are stale; fed by `/tariff-updates` |
| 6 | Offer change + B1 "email me when this changes" CTA | Turns the traffic above into sign-ups |
| 7 | A4 links, B4 posts | Lower confidence |
