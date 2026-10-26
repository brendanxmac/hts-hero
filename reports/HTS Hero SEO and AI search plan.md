# SEO, AEO and GEO: where HTS Hero stands and what to do next

_Researched 2026-10-26. Sources: GSC exports in `seo-data/` (web search and the new Generative AI features report, both last 3 months to ~Oct 20), the live site rendered in a browser, the code, and competitor pages and studies found by web search. Each recommendation says what evidence backs it and what doesn't._

---

## 1. Summary

1. **Check the Vercel checkpoint isn't blocking AI crawlers. Fix the sitemap 429s today.** Bot Protection went live on Oct 25–26. The child sitemaps and every page return the 429 "Security Checkpoint" to anything that isn't a browser or a verified bot. That includes Claude Code's own fetcher, tested today. Since Oct 8, Google's AI features have been citing our `/hts` pages, so this is the one change that could undo the gains.
2. **Chapter 99 pages are the biggest content gap.** 9903 codes are a tiny share of the schedule but bring in **41% of all code-query impressions**. Our 9903 pages never say which program the line belongs to, whether it's still in force, or what it covers. The engine already knows all of that for 399 headings.
3. **Fix how the `/hts` pages get clicked: names and titles.** Those pages rank around **position 7** but get only **0.3–0.7% of clicks**. Titles read "Made of round wire" or "Articles of plastics and articles of… ". The competitors that rank put the product and the rate in the title.
4. **Public AD/CVD order pages.** Tandom already ranks with one page per case, carrying the case number, the rate and the HTS list. Our case data is the same or better, but right now it's a one-line mention on the HTS pages.
5. **The news pages are built right. They need time, Bing and IndexNow, not a redesign.** They went live Oct 21, after our GSC data ends, so there's no data on them yet.

---

## 2. Where we stand (GSC)

| | Oct 4 export | Oct 23 export |
|---|---|---|
| Impressions, 3 months | 918 | **26,511** |
| Clicks, 3 months | 76 | 211 |
| Daily impressions (latest) | ~10 | **~3,100** (Oct 20) |
| `/hts` pages with impressions | 0 | **939+** (the export caps at 1,000 rows) |

**By section (Oct 23 export):**

| Section | Pages | Clicks | Impressions | Avg pos |
|---|---|---|---|---|
| /hts 8-digit | 190 | 28 | 4,878 | 6.7 |
| /hts 10-digit | 281 | 38 | 4,137 | 6.8 |
| /hts 6-digit | 196 | 8 | 3,566 | 8.1 |
| /hts 4-digit | 191 | 8 | 3,512 | 8.0 |
| /hts 9903 (Chapter 99) | 55 | 18 | 1,538 | 7.9 |
| /duty-calculator (+/china) | 2 | 18 | 588 | 9.3 |
| homepage (mostly brand) | 1 | 78 | 273 | 12.8 |

**Click-through rate on `/hts` pages by position:**

| Position | CTR |
|---|---|
| 1–3 | 33% (tiny sample) |
| 3–5 | 1.5% |
| 5–7 | 0.7% |
| 7–10 | 0.26% |

Those are low even for SERPs full of AI Overviews, which is why section 5 focuses on titles.

**Google AI features (AI Overviews / AI Mode): we're being cited.**
- 0 impressions until Oct 7.
- 282 on Oct 8, then 440+ a day by Oct 20.
- 2,479 or more in total, and the export is capped too.
- About 88% of them point to `/hts` pages. The top ones are 3926.90.99, /duty-calculator/china, 7308.90.95, 8205.59 and 9903.05.93.
- The query list also shows conversational follow-ups like "how about from china", "is that correct" and "coo is china". Those come from AI Mode sessions.

**Queries:**
- Code lookups: 542 queries, 1,707 impressions. Of those, 9903 queries are 117 queries and **697 impressions**.
- Calculator queries are still at positions 35–55.
- Non-brand clicks remain small.

---

## 3. Crawl access. Fix first.

**Evidence:**
- Every request to an `/hts` page returns **429 + "Vercel Security Checkpoint"**. I tested a browser user agent, GPTBot, ClaudeBot, plain curl and Claude Code's WebFetch.
- `sitemap.xml`, `robots.txt` and `llms.txt` return 200, because they're in the Bypass rule.
- **`sitemap-0.xml` to `sitemap-5.xml` all return 429**, and they hold every real URL. Only the index file is bypassed.
- On Vercel's verified-bot directory ([bots.fyi](https://bots.fyi)), these are all *listed as verified* and should pass: Googlebot, Bingbot, GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-User, Claude-SearchBot, PerplexityBot, Perplexity-User, DuckAssistBot, Applebot, MistralAI-User.
- I can't prove from outside that they really get through. Requests from my machine fail verification by design.

**Do:**
1. **Add `/sitemap-*.xml` to the "Trusted automated traffic" Bypass rule.** Five minutes; no downside.
2. In the **Vercel Firewall logs, filter by user agent** for Googlebot, Bingbot, OAI-SearchBot, ChatGPT-User, PerplexityBot, Perplexity-User, Claude-User and Claude-SearchBot. Confirm they're *allowed*, not *challenged*.
   - If any user-initiated fetcher is challenged, add a Bypass for it.
   - These are the bots that open a page live when someone asks ChatGPT, Claude or Perplexity about a code. A 429 there means "can't cite you".
3. Keep the **AI Bots managed ruleset on "Allow"** (it's off by default). Never set it to deny.
4. In GSC, check **Settings → Crawl stats → by response**. A rise in 429s after Oct 25 means Googlebot is hitting the checkpoint too.
5. Live test: ask ChatGPT (with search) and Perplexity "what is the duty on HTS 3926.90.99 from China, check htshero.com". See whether they can read the page.

---

## 4. Chapter 99 (9903) pages: the biggest content gap

**Evidence:**
- 9903 queries make up **41% of code-query impressions** (697 of 1,707), across 117 distinct queries. Examples:

  | Query | Impressions | Position |
  |---|---|---|
  | 9903.05.93 | 77 | 7.0 |
  | 9903.74.11 | 57 | 10.2 |
  | 9903.05.76 | 51 | 7.7 |
  | 9903.01.25 | 35 | 10.2 |
  | 9903.02.76 | 29 | 9.1 |

- Only 3 clicks in total.
- In web search, the only third parties with pages for single 9903 lines are **Tandom** (`tariffs.tandom.ai/hts-catalog/9903.74.11`) and **Unisco**. For 9903.05.93, nobody had a page for the code itself; results were nearby codes and White House annex PDFs.
- **Our page for 9903.01.25 today:**
  - H1: "Articles the product of any country".
  - Meta description: "covers articles the product of any country".
  - The rate box says "The duty provided in the applicable subheading + 10%".
  - It never says this is the **IEEPA reciprocal baseline tariff**, whether it's in effect, when it started or ended, which countries it covers, or whether refunds apply.
- The engine has exactly that data: `tariffs/engine-v2/data/headings/*.ts` holds `name` (e.g. "IEEPA Reciprocal Tariff: Baseline (Countries Without Their Own Rate)"), `program`, scope (countries/codes), start/end dates, exceptions and notes for 399 headings. `REFUNDS.md` covers refund status.

**Do: put an engine-driven summary at the top of every modeled 9903 page.**
- **Title:** `9903.01.25: IEEPA Reciprocal Tariff, Baseline 10% (Ended {date}) | HTS Hero`. Program, rate and status, the same pattern as competitors that rank.
- **A direct-answer paragraph first:** "9903.01.25 is the Chapter 99 number for … It added 10% to … from {date} to {date}. It applied to goods from {countries}, except …"
  - This is the sentence AI answers lift. The GEO paper (below) found that specific statistics and cited sources raise citation rates the most.
- **Status box:** in force / ended / announced, with effective dates and the Federal Register, proclamation or CSMS links.
- **Coverage:** countries, the number of HTS codes it applies to, and links to the top covered codes.
  - Good internal linking, and the exceptions list links to the sibling 9903 pages.
- **Refunds** (IEEPA lines): where refunds stand, in "may qualify" wording per our rules, with a link to /tariff-audit.
- **FAQ:** "Is 9903.01.25 still in effect?", "What rate does 9903.01.25 add?", "Which countries…?", "Can I get a refund…?"
- **Effort:** one component plus a lookup from code to heading data. 399 pages improve at once.

---

## 5. `/hts` pages: names, titles and what they answer

**What's already good:**
- Pages are server-rendered with about 2,300 words.
- BreadcrumbList, FAQPage and WebPage schema with `dateModified`.
- Duty by country, CROSS rulings, notes, sources, a visible "Updated" date, child and sibling links.
- That's about the same as the best competitors (Gateway Lines, Borderless, Tariffs API). No rebuild needed.

**Problem 1: weak product names flow into the title, H1, description and every FAQ answer.**
- `/hts/7317.00.55` (steel nails) is titled **"HTS 7317.00.55: Made of round wire"**. The word "nails" isn't in the title.
- `/hts/3926.90.99` reads "articles of plastics and articles of other materials of headings…". It's our **most-cited page in AI features** (121 impressions) and gets 639 web impressions at a 0.16% CTR.
- Cause: in `libs/hts-duty-summary.ts:211` (`htsProductName`), a qualifier like "Made of…" isn't treated as a fragment, and long heading text gets cut mid-clause.
- **Do:**
  - Treat "Made of…/Of…/Having…/With…" lines as qualifiers, so 7317.00.55 becomes "Steel nails, one-piece, of round wire".
  - Use a short, clean name for headings whose text is a cross-reference list. For example "Other articles of plastics" for 3926.
  - The name lands in the AI-quoted FAQ sentence ("US imports of … from China pay 25.3%"). Getting it right matters for citations as well as clicks.

**Problem 2: titles don't carry the answer.**
- Searchers type a bare code: about 540 code queries vs. a handful of product queries.
- The pages that win put the rate in the title:
  - Tariffs API: "HTS {code}: {desc}, 25.3% US duty (2026)"
  - Gateway Lines: "HTS {code}: {plain name} | Duty Rate and Tariffs"
  - Borderless: "HTS {code} duty rates 2026: …"
- Our CTR at positions 5–10 is 0.3–0.7%.
- **Do:** test `HTS 6109.10.00: Cotton T-shirts – 16.5% Duty, 46.5% from China (2026)` where it fits. Compare CTR by position bucket in GSC 3–4 weeks before and after.
  - That's a reasoned test, not a proven win: CTR in AI-Overview SERPs is noisy.

**Problem 3: other ways of writing the code.**
- The GSC queries include `3926.90.9989` (pos 14.3), `3926909989`, `hts 3926909989` and `3926.90.9989` written CBP-style. Our pages only show `3926.90.99.89`.
- Gateway Lines uses `/hts/3926909989` URLs.
- **Do:** add a line near the H1: "Also written 3926909989 and 3926.90.9989". Keep the current URLs and canonical.

**Problem 4: no worked "how the rate is built" example per tariff line.**
- Gateway Lines, Tariffs API and Borderless all show one row per 9903 line on a $10,000 example ("How the 25.3% is built").
- We have the estimate box with program names and %, but not the 9903 numbers next to them, and the lines don't link to the 9903 pages.
- **Do:** show the 9903 number on each line of the estimate and link it to its page. This adds internal links into the section 4 pages and gives AI answers a citable breakdown.
  - Per our rules, keep it in %; the $ example already exists in the estimate.

**Leave alone:** schema (already done), word count, and the idea of per-country `/hts/{code}/{country}` pages. I rejected that on Oct 6 because of duplicate/doorway risk, and nothing here changes that.

---

## 6. AD/CVD pages

**Evidence:**
- For case and rate queries, results are mostly trade.gov and Federal Register PDFs, law-firm and news posts, and customsmobile message pages.
- **Tandom has one page per order and ranks for them.** A generic "A-570 cash deposit rate" search returned 9 Tandom order pages. Example, verified today: `compliance.tandom.ai/adcvd-catalog/orders/A-570-894`.
  - Title: "Tissue Paper Products from China AD cash deposit rate | Case A-570-894".
  - Content: plain-English explanation, country-wide rate and effective date, 28 HTS codes, scope text, FAQ.
- We have 909 live cases with HTS codes, scope documents, rates and a 12-month event history. On the public site, a case is only a line on the HTS page, e.g. "Certain Steel Nails – From UAE, China, South Korea and 4 more – Scope in the Federal Register".
  - No case number, no page of its own, and the only link goes to the Federal Register.
- Our `/tariff-updates/adcvd-*` pages cover individual case *events* (investigation, final determination), not the standing order.
- **No GSC data either way.** No AD/CVD query appears in our data, which is expected with no AD/CVD pages.

**Do: build public order pages, e.g. `/adcvd/a-570-909-steel-nails-china`.**
- One page per case number, plus a product hub (`/adcvd/steel-nails`) that lists every country's case.
- **Title:** `Steel Nails from China: Antidumping Duty Order A-570-909 – Rates, HTS Codes, Scope`.
- **Content:**
  - Status and dates (initiated, order, last sunset).
  - "Rates Commerce Set", shown as a range plus the all-others rate, in %.
  - The scope text, quoted.
  - HTS codes, linking to our `/hts` pages and back.
  - Timeline, linking to the `/tariff-updates/adcvd-*` event pages.
  - Primary sources (Federal Register, ACCESS, CBP messages).
  - The "the scope's written description decides; your broker files" wording.
- **CTA:** "Check whether this case covers your import" leads to the free-account AD/CVD check.
- **Schema:** Article/WebPage with dates, plus BreadcrumbList and FAQPage. That's hygiene: Ahrefs' 2026 controlled test found no significant citation lift from schema alone.
- **A decision for you:**
  - On Oct 22 you decided that signed-out visitors get only a "may apply" tease and nothing is looked up for them.
  - Public case pages would show case-level facts (rates Commerce published, the scope), not a check of the visitor's import. I think that fits the rule, and Tandom shows rates publicly.
  - Confirm you're OK with case rates being public.
- **Cost:** the data exists in `adcvd_cases`. A template plus ISR, about 900 pages. Add them to the sitemap only for cases with codes and scope text, so thin cases stay out.

---

## 7. Tariff news (`/tariff-updates`)

**What's there (checked live):**
- Server-rendered.
- Hub: CollectionPage + ItemList + FAQPage + BreadcrumbList, 237 updates, RSS.
- Each update: a 2,400–3,700-word page with Article schema and dates, "How we got here" timeline, HTS codes named (122 links on the Canada Section 338 page), sources and "More {law} updates".
- That's the same pattern as the ranking pages (OIA's hub with dated entries and NewsArticle schema; GHY's one post per update).

**Evidence:**
- None yet. The pages went live Oct 21 and our latest GSC data ends about Oct 20.
- Generic news queries ("tariff news today", "new tariffs this week") are big-media and spam territory, so not worth chasing.
- Specific action queries ("section 232 … update", "CSMS …") go to brokers and law firms with one page per update, which is what we have.

**Do:**
1. **Bing Webmaster Tools + IndexNow.** We have neither (I searched the code).
   - Bing's index feeds Copilot, DuckDuckGo and, by one agency study, most SearchGPT citations (87% matched Bing's top results; older, small sample).
   - Ping IndexNow from the tariff-updates publish step and on each new HTS revision. That's a small cron/webhook change; add its path to the Bypass rule.
2. Make sure each update page links to the `/hts` pages it names (done), and that those `/hts` pages link back. The "Tariff updates" block on HTS pages does this.
3. Check in GSC 2–3 weeks from now: are `/tariff-updates/*` URLs indexed, and for which queries? Decide on anything else then.
4. Consider switching the update pages to `NewsArticle` (OIA uses it). It's cheap, but there's no evidence it matters.

---

## 8. Off-site: brand and Bing

- **No third-party mentions found.** Web search for "htshero" and "HTS Hero tariff" returns nothing about us. There are no Reddit threads or directory listings, and there's one YouTube video.
- LLMs lean on mentions to decide which sources are trustworthy, and AI Mode cites a different set of pages each time. Brand mentions are the usual lever, but I have no data showing how much they'd help us.
- **Low-cost options, in the founder routine from the self-serve playbook:**
  - Answer real HTS and 9903 questions on r/FulfillmentByAmazon, r/importexport and LinkedIn, linking the exact code or update page.
  - Get listed on tariff and trade tool roundups.
  - Post each big tariff update as a short LinkedIn/X post linking its permalink (Social Studio).
- **Verify the site in Bing Webmaster Tools and submit the sitemap** (see 7.1).

---

## 9. What not to spend time on

- **llms.txt:** we have a good one. Keep it, but don't invest more. Ahrefs found 97% of llms.txt files got zero requests, and Google says AI Overviews don't use it.
- **Schema as a ranking or citation lever:** Ahrefs' May 2026 controlled test (1,885 pages vs about 4,000 controls) found no significant lift. We already have the useful types.
- **Generic "tariff news" head terms:** the results are spam and major media.
- **More `/hts` page count or per-country variants:** rejected earlier, still no evidence for them.

**What the studies say about getting cited:**

| Source | Finding | How solid |
|---|---|---|
| GEO paper (Aggarwal et al., KDD 2024) | Adding quotations +43%, statistics +33%, cited sources +28% visibility. Biggest gains for lower-ranked pages. Keyword stuffing hurt. | Peer-reviewed; mostly a simulated engine |
| Ahrefs, Mar 2026 | Only 38% of AI Overview citations come from top-10 pages, down from 76% in Jul 2025. Fan-out sub-queries reach deeper pages. | Vendor; large sample |
| Ahrefs, freshness study | AI-cited pages are about 26% fresher than organic results. | Vendor; large sample |

All three favor what we're best placed to provide: exact numbers, primary sources, and current dates on deep long-tail pages.

---

## 10. What I need from you

1. **Vercel Firewall:** a log check for the AI bots in section 3.2, and add `/sitemap-*.xml` to the Bypass rule.
2. **New GSC exports**, so we can measure the post-Oct-21 pages:
   - Performance for the last 28 days, compared to the previous period.
   - Pages indexing report.
   - Sitemaps status.
   - URL Inspection on one `/tariff-updates/…` page.
3. **Your call on the AD/CVD public-rates question** in section 6.

---

## 11. Suggested order

| # | Work | Effort | Evidence |
|---|---|---|---|
| 1 | Bypass `/sitemap-*.xml`, check AI-bot logs | 15 min (you) | Direct (429s observed) |
| 2 | Chapter 99 summary block from engine data | 1–2 days | Strong (41% of code impressions, empty competition) |
| 3 | Product-name fix in `htsProductName` | 0.5 day | Examples + CTR; fixes AI-quoted sentences |
| 4 | 9903 numbers + links in the HTS estimate breakdown | 0.5 day | Competitor pattern; links to #2 |
| 5 | Bing Webmaster + IndexNow on publish | 0.5 day | Moderate (Bing's role in ChatGPT/Copilot) |
| 6 | AD/CVD order pages | 2–3 days | Competitor ranks with exactly this; no GSC data |
| 7 | Title test (rate in title) + alternate code formats | 0.5 day | Weak to moderate; measure before/after |
| 8 | Brand mentions routine | ongoing | Indirect |

**Sources:**
- [GEO paper](https://arxiv.org/abs/2311.09735)
- [Ahrefs: AI Overview citations vs. top 10](https://ahrefs.com/blog/ai-overview-citations-top-10/)
- [Ahrefs: schema and AI citations](https://ahrefs.com/blog/schema-ai-citations/)
- [Ahrefs: freshness](https://ahrefs.com/blog/do-ai-assistants-prefer-to-cite-fresh-content/)
- [Ahrefs: llms.txt](https://ahrefs.com/blog/llmstxt-study/)
- [Seer: SearchGPT vs. Bing](https://www.seerinteractive.com/insights/87-percent-of-searchgpt-citations-match-bings-top-results)
- [SE Ranking: AI Mode](https://seranking.com/blog/ai-mode-research/)
- [OpenAI crawlers](https://developers.openai.com/api/docs/bots)
- [Anthropic crawlers](https://support.claude.com/en/articles/8896518)
- [Vercel bot management](https://vercel.com/docs/bot-management)
- [bots.fyi](https://bots.fyi)
- Competitor pages:
  - [Tandom HTS](https://tariffs.tandom.ai/hts-catalog/3926.90.99/other)
  - [Tandom AD/CVD](https://compliance.tandom.ai/adcvd-catalog/orders/A-570-894)
  - [Gateway Lines](https://tariff.gatewaylines.com/hts/3926909989)
  - [Tariffs API](https://tariffsapi.com/hts/3926.90.99.89)
  - [Borderless](https://borderless.us/hts/3926)
  - [OIA tariff updates](https://www.oiaglobal.com/tariff-updates/)
