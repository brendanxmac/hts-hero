# Fix the funnel, then sell the audit: a growth plan for the Tariff Tracker

_Researched 2026-10-25. Sources: Search Console exports in `seo-data/` (to 2026-10-23), Mixpanel prod (project 3768432), a code audit of every landing page and the Tracker funnel, and web research on market size, competitors and channels (sources at the end). [V] means checked against a cited source; [I] means inference._

## The short version

HTS Hero doesn't have a traffic problem yet. It has a **conversion and activation problem**, and it shows in the numbers. Over the last 60 days there were 12 sign-ups, 4 accounts that added imports, and 0 Tracker subscribers. Several of the main "Try it free" buttons send brand-new visitors to a **sign-in** form. The HTS code pages, which are the only pages Google is now sending real traffic to, have no "watch this code" capture. And the 14-day trial can end before a single tariff change hits the user's imports. Buying traffic into that funnel would burn the $1,000/mo budget.

The plan, in order:

1. **Fix the leaks** (1–2 weeks). Pay for no traffic until this is done.
2. **Pick one ICP.** SMB product brands that are their own importer of record, with 20–150 HTS × origin pairs. They fit the $29 and $89 plans and buy on a card.
3. **Turn the entry audit into the front door.** A free "overpayment check" built on an upload of the ES-003 report or 7501s. Competitors use the same lead magnet to sell 15–25% contingency recovery, which HTS Hero can't and shouldn't do. The counter-position: "keep 100% of what you find; your broker files."
4. **Add a "watch this code" capture to every HTS page**, so organic visitors leave an email and a tracked import on their first visit.
5. **Add a $149+ assisted lane**: a one-time flat-fee audit report and done-for-you catalog setup for bigger accounts. It is the only human time worth spending, and you said you'd do it.
6. **Use forwarders and 3PLs, your existing classification customers, as a distribution channel.** Offer a multi-client plan they use to send their own importer clients impact alerts.
7. Only then spend the $1,000/mo, on tests with kill criteria (section 7).

## 1. Where things stand (evidence)

**Search is finally starting to work.** Google began indexing the `/hts/` pages around Oct 12. Weekly impressions went from about 50 to 10–12k, and clicks from about 5 to 56–66 a week [V, GSC]. 939 of the top 1,000 pages by impressions are `/hts/` pages. They rank at an **average position of 6–8 but get about 0.5% CTR**. For example, `/hts/3926.90.99` had 639 impressions and 1 click at position 7.1. Many of the queries are bare Chapter 99 numbers (`9903.05.93`, `9903.74.11`, `9903.01.25`). Those searchers are mostly brokers and compliance staff [I]. Head terms are still far back: "tariff calculator" sits at position 36.7, "tariff calculator usa" at 35.1, and "us import duty calculator free" at 23.

**Mixpanel shows bot traffic, not demand.** In the last 14 days there were about 36k "unique" page viewers. Of those, 97% are `$direct` and spread over hundreds of cities worldwide: Singapore 4.8k, Hong Kong 709, Frankfurt 391, Ashburn 248, and so on. Real search referrals were about 800: Bing 479, Google 276, DuckDuckGo 41 [V, Mixpanel]. Duty Calculator Results Viewed jumped to 18.7k in one week, against 66 Google clicks. **Until bots are filtered out, every Mixpanel rate (sign-up %, activation %) is meaningless.** Fix this before spending money, because otherwise you can't measure ROI.

**The real funnel today** [V, Mixpanel, 60 days]: about 400 real visitors a week → about 1.5 sign-ups a week → 4 accounts with imports in 60 days → 0 paid. Your paying customers are on classification plans: mostly importers, forwarders and 3PLs, very few brokers.

## 2. The ICP

**Market** [V]:
- **Importers:** about 242,500 identified US importing companies (Census, 2023). About 97–98% have under 500 employees.
- **Tariff payers:** 330,566 importers paid IEEPA duties (CBP declaration, Mar 2026). Only 21,423 of them had set up ACH refunds. Most are tariff-hit and not set up for compliance.
- **Intermediaries:** about 11,000–16,000 licensed brokers, and 9,000+ FMC-licensed ocean intermediaries.
- **Pace of change:** 29 HTS revisions in the 12 months to Oct 9 2026, about one every 13 days.

**Primary ICP: established SMB product brands that are their own importer of record.**

| | |
|---|---|
| Who | DTC, Amazon and wholesale brands, plus small distributors. About $2–30M revenue. Import from China, Vietnam or India through a broker. |
| Size | 20–150 HTS × origin pairs. That maps to the **$29 and $89** plans. |
| Buyer | Founder/owner, ops manager, sourcing manager, controller. Buys on a card with no procurement process. |
| Pain [V] | 96% of small businesses say tariffs hurt them (Ship4wd, May 2026). Small importers paid about $306k more in tariffs on average over Mar 2025–Feb 2026 (CAP). Brokers raised fees by $1–5 per HTS code (Reuters). |
| Triggers | A new tariff announcement or effective date; a surprise on a 7501 or broker invoice; refund news (CAPE phases, court rulings); moving a SKU to a new origin; a quarterly margin review. |
| Exclude | Micro sellers who ship DDP, or whose carrier or supplier is the importer of record. They can't act on audits or refunds and won't convert. |

**Secondary ICP: buyers and sourcing managers at small manufacturers and distributors.** 100–500+ pairs, which is the **$89–149** plans. The pain is concrete for anyone exposed to Section 232 steel, aluminum, copper or wood derivatives, where duty now applies to the full entered value since Apr 6 2026 [V]. Some need a manager's sign-off, but rarely a sales cycle.

**Expansion segment: small forwarders and 3PLs (1–30 staff).** They already pay you for classification. Each one has dozens of importer clients who ask "does this tariff hit me?" A multi-client plan lets them send branded impact alerts to their clients. That is $249–499/mo per account and puts HTS Hero in front of many importers at once [I]. Brokers fit the same plan, but sell to them by letting them self-identify, not by prospecting. Automatic entry audits can feel like a threat to a broker, and GingerControl already targets brokers [V].

**Don't target:** enterprise compliance teams (sales-led, security reviews) or consultants and CPAs (better as an affiliate channel).

**Add a qualifier at sign-up or onboarding:** "Are you the importer of record (you receive 7501s)?" and "Roughly how many products do you import?" Use the answers to route 100+ import accounts to the assisted lane and to segment emails.

## 3. Competitors, and the gap HTS Hero can own

- **Free calculators subsidized by freight.** Flexport, Gateway Lines, Wove and AMZ Prep give everything away because they "earn on the container" [V]. Don't compete on the free calculator alone.
- **Self-serve SaaS:**
  - TariffsAPI HTS Watch: $29/mo, alerts only.
  - SkuWatch: $49–99, Shopify only.
  - GingerControl: GingerLite at $150/mo, aimed at brokers.
  - Gaia Dynamics: $99 to $2,599/mo billed yearly, with a "Tariff Audit Engine". This is the closest overlap, possibly funded [V, one source].
  - **Nobody self-serve bundles alerts, impact checks, rate history, savings detection and entry audits at $12–89 with no card and no sales call** [I].
- **Refund and audit firms.** Free ES-003 calculator → consultation → **15–25% contingency**. Examples: Tarifflo (YC S26), Declaro (20%), Leyton, law firms [V]. Pax notes that brokers won't take claims under about $100k [V]. That leaves the SMB importer, your ICP, underserved.
- **Accuracy gap.** Several free calculators still show the expired Section 122 rates [V]. Your "verified as of revision X" stamp plus primary-source citations is a real trust edge. Put it in snippets and ads.
- **Act now:** GingerControl's October 2026 roundup lists HTS Hero at $49/$79/$149, which are wrong prices [V]. A comparison page that ranks is shaping buyer expectations. Email them a correction.

**Positioning line** [I]: *"Every tariff on your imports, watched and audited. Keep 100% of what you find; your broker files. From $12/mo, no card, no sales call."* It sets you against both the free calculators (they don't watch or audit) and the contingency firms (they take 20%).

## 4. Funnel leaks to fix first (from the code audit)

These are ordered by impact. Every one is a code change of hours to a day.

1. **"Try it free" sends new visitors to sign-in.** `OFFER.href` is `config.auth.loginUrl` (`components/home/lib/offer.ts`). `/signin` only opens in sign-up mode with `?sign-up=true` (`app/signin/page.tsx`). The `/tariff-tracker` proxy redirect drops it as well (`proxy.ts:74-81`). Affected: the homepage hero, pricing and closing CTA; the header's "Try Tariff Tracker"; the `/tariff-monitor` hero, demo and closing; the bottom of country pages; the blog's Tracker CTA; and the HTS banner (via the monitor page). `/tariff-audit` and the calculator's "Track this import" do it right. **Make sign-up the default for every acquisition CTA**, and add `sign-up=true` to the proxy redirect when there's no session cookie history.
2. **No redirect, so the wrong onboarding.** Plain `/signin` lands new accounts on the 3-product home notice and tags them "generic". They get product-tour emails instead of Tracker emails. **Every CTA should carry `redirect=` into the Tracker's add-imports step.**
3. **HTS pages have no per-code capture.** The only code-specific CTA sits below the full Duty by Country table, says "Start my free 14-day trial" to people with no account, and doesn't carry the code (`components/tariff-updates/TrackerCta.tsx`). **Replace it with a "Watch {code}" box above the fold**: "Email me when the duty on {code} changes", with email or Google one-tap. The account gets created with that code as its first tracked import (reuse `useTrackImport`). That is activation at sign-up.
4. **Too many offers on HTS pages.** Calculator, news digest, Tracker, Playbook and Classify each have their own CTA. Cut it to two: **Watch this code** (primary) and **Open in calculator**.
5. **Sign-up friction.** Email + password asks for the password twice and then requires an email confirmation before the user gets back. Lead with Google and the email passcode, and drop the confirm-password field.
6. **No email capture on the blog.** Add the same "Watch an HTS code" or news capture.
7. **Measurement gaps.**
   - `Sign Up` has no source or landing page.
   - The plain-link CTAs fire no click events.
   - There is no bot filter.
   - **Fix:** add `signup_source` and `landing_path` to Sign Up, add `CTA Clicked {cta, page}`, and build a Mixpanel cohort of real visitors (has a search or AI referrer, or any interaction event; excludes known datacenter cities). Re-point the Business Pulse cards at that cohort.
   - **Also:** `libs/email/lifecycle.ts:17-18` still says savings and audits are off. That's out of date.

**Measure the fixes by:** sign-ups per 100 real visitors (now about 0.4–1%; target 3%+) and the share of new accounts with an import on day 0 (now about 33%; target 70%+ once Watch carries the code).

## 5. The funnel to build

```
ENTRY                     MICRO-CONVERSION                 ACTIVATED ACCOUNT            PAY
HTS / Ch.99 pages ──────► "Watch {code}" (email/1-tap) ─┐
Calculator / country ───► "Track this import" ──────────┼──► Account with imports  ──► Trial (14d) ──► $29 / $89 self-serve
"Tariff on X" / news ───► Free overpayment check ───────┤    + Day-0 "first look"      loss screens     $149+ → assisted lane
Reddit / PR / ads ──────► (upload ES-003 or 7501s) ─────┘    + retro alerts            launch price     forwarders → multi-client
Forwarder clients ──────► branded impact alert ──────────────────────────────────────────────────────────────────────►
```

**a) Every entry point creates an account that already has data in it.** Watch, Track and the overpayment check all write imports at sign-up, so the trial starts with real value. "Sign up, then figure out what to upload" is the step where people drop off: 12 sign-ups, 4 with imports.

**b) The free overpayment check is the main lead magnet.**
- **Format:** upload the ACE ES-003 report or 7501 PDFs. Show a free summary ("N entry lines with possible overpayment, up to $X, across these issues"). Line-by-line detail needs an account and starts the trial.
- **Precedent** [V]: Flexport, Gateway Lines, Wove, UNIS and Reform all run ES-003 uploads, but for IEEPA only.
- **Your angle:** every line where they may have overpaid. Missed USMCA/CAFTA or Chapter 98 claims, stacking errors, 232 on the wrong value, AD/CVD flags, and the IEEPA duty still in your verified window.
- **Status today:** 7501 upload is "Coming soon" (`entries/Upload7501Card.tsx`). **This is the highest-value build on the list.**
- **Limits:** verified history starts Nov 17 2025, so you can audit entries since then. That includes the last three months of IEEPA (to Feb 20 2026), but not earlier. Say so plainly on the page. Wording stays "may have overpaid", "up to".
- **Optional:** process the file in the browser, as UNIS does, for privacy.

**c) Fix the trial's dead air.** With an HTS revision about every 13 days, a 14-day trial can end with zero alerts. On day 0, show "**what you would have been alerted to in the last 90 days**" from rate history, plus pending announcements that may hit their imports. The first-look email the next morning should lead with that, and with any savings or audit flags.

**d) Conversion.**
- **Launch pricing ends Fri Nov 13.** That is a real, honest deadline. Run a 3-email campaign to every account and Tariff News subscriber (Nov 2, Nov 9, Nov 12).
- At trial end, keep the loss screens.

**e) The assisted lane ($149+, light human touch).**
- **Who it's for:** any account with 100+ imports, or anyone who requests an audit, gets "Book a 15-minute setup" or "We'll load your catalog for you".
- **New product:** a **flat-fee prior-entry audit report**. For example, $499 for up to 12 months of entries, credited against an annual plan. It is legal for an unlicensed company, because the importer pays HTS Hero a flat fee and HTS Hero only finds and flags; their broker files.
- **Why:** it captures the contingency firms' demand at a price SMBs like, and it converts into a subscription. `/tariff-audit`'s "Request an audit" form already collects these leads.

**f) Forwarder and 3PL channel.** A "Client workspaces" plan with pooled imports across clients and co-branded impact alerts, at $249–499/mo. Paying a non-broker forwarder or 3PL a referral or affiliate fee is fine. Don't pay brokers or take money from them (19 CFR 111.36). Start by emailing your existing forwarder and 3PL classification customers.

**g) Rethink the free plan's zero alerts.** Your own pricing report (`reports/HTS Hero pricing and packaging.md`) argued that "a free account with no tracked imports has nothing to come back to". Every tariff-change alert is a re-engagement touch that sells the upgrade ("this also hits N imports you're not tracking"). That matters even more if "Watch {code}" becomes the main capture, because the watcher's reason to stay disappears on day 15. **Test 3 free tracked imports (email only) against 0.** This is your call (see questions).

## 6. SEO: what the evidence supports

Following the rule that SEO changes need GSC data plus proof of what ranks:

| Move | Evidence | Verdict |
|---|---|---|
| **Rewrite HTS page titles and meta descriptions.** Lead with the answer and date, for example "3926.90.99 duty from China: X% total (Oct 2026)", and say what the page has that thin aggregators lack. | GSC: hundreds of HTS pages at position 6–8 with about 0.5% CTR. Competitors ranking for "hts code [n]" are thin template pages (camtomx, credlix, findhs) that disagree with each other [V]. | **Supported.** Test on half of the pages with the most impressions and compare CTR in GSC after 3–4 weeks. Cheapest lever there is. |
| **Chapter 99 pages** (`/hts/9903.*`) as first-class pages: what the heading covers, which products, effective dates, current status. | GSC: `9903.05.93` 77 impressions at position 7; `9903.74.11` 57; `9903.05.76` 51; `9903.01.25` 35; plus dozens more. | **Supported.** These searchers are professionals. A "Watch this heading" CTA fits them. |
| **HTS lookup cluster** (/explore): "hts code lookup" and variants at about 14.8k/mo each [V, Google Ads data via seodata.dev]. | GSC: "harmonized tariff code lookup" at position 13, "hs code calculator" at 5.9. Low impressions so far. | **Promising, not proven.** Watch GSC for 4 weeks after the HTS pages index more fully. |
| **Head terms** ("tariff calculator": 4.4k/mo, $8 CPC). | Position 36. The top 5 are funded logistics brands (Flexport, Wove, Gateway, e2open) [V]. | **A links problem, not an on-page one.** Earn links through data PR (section 7), not more pages. |
| **"Tariff on [product] from [country]" pages** | SERPs are dominated by news articles that go stale [V]. No GSC data either way yet. | **Unproven.** Pilot at most 20 demand-backed pairs with a dated stack and timeline, and measure before scaling. Never generate code × country at scale: that is doorway and scaled-content abuse risk (spam updates in Jun, Aug and Sep 2026) [V]. |
| **Current, dated list pages**: "Section 301 list (current)", "US tariffs by country" (2.4k/mo), "tariff chart" (9.9k/mo). | Incumbents are 2018 law-firm posts [V]. No GSC data yet. | **Worth one test each.** They also work as linkable assets. |
| **Refund and IEEPA pages** (`content/CONTENT_TODO.md`) | Crowded by about 10 free calculators [V]. Waits on the backfill. | Ship alongside the overpayment check, positioned on "keep 100%". |

**AI search:** Reddit is the top-cited domain for Perplexity and Google AI Overviews [V], so genuine Reddit answers double as AI-citation seeding. Each month, run 20 tariff prompts across ChatGPT, Perplexity and Google and log who gets cited. Keep the MCP listings, but there's no evidence they drive acquisition.

## 7. Channels for $1,000/mo with a 2-month payback

**The unit economics** [I]:
- ARPU of about $50/mo (a mix of $29 and $89) and maybe 8–12 months average life gives an LTV of about $400–600.
- To pay back inside 2 months, CAC has to be about $100 or less.
- At about $7 CPC and 3% click-to-sign-up, a sign-up costs about $230. That only works if paid traffic goes to the **overpayment check** (higher intent, bigger tickets) or produces $499 audits. Sending paid traffic to the calculator won't pay back.

Ranked by expected return per founder-hour. Each has a test budget and a kill rule.

1. **Warm accounts first (free, this week).**
   - Email every classification customer and every existing account about the Tracker with a personal note from you. Include a "reply and I'll load your catalog" offer, then the Nov 13 launch-price campaign.
   - Your forwarder and 3PL customers get the multi-client pitch.
   - These people already pay you, so this is the fastest first Tracker revenue.
2. **On-site fixes plus Watch plus title tests (free, weeks 1–3).** Organic is already about 60 clicks a week and rising. Doubling sign-up rate and day-0 activation compounds with that growth.
3. **Reddit and community answering (about 3 h/week, free).**
   - Where: r/FulfillmentByAmazon, r/AmazonSeller, r/ecommerce, r/smallbusiness, r/supplychain, r/importexport, and the Amazon Seller Forums' tariff and refund threads.
   - How: answer with the number and the source, and link only when asked. The rules for each subreddit weren't checked; read them first.
4. **Monthly data index and PR (about 4 h/month after it's scripted).**
   - An "HTS Hero Tariff Index": the average effective stack by origin and category, plus the month's biggest movers.
   - Pitch it to trade press and through Qwoted/Featured.
   - This is the only realistic path to the links that head terms need. The Yale Budget Lab's reports get this kind of pickup [V].
5. **Google and Microsoft Ads ($300/mo, weeks 4–8).**
   - Exact match on "tariff refund calculator", "tariff overpayment", "tariff alerts", "tariff tracker" and "tariff tracking software", into the overpayment check and `/tariff-monitor`.
   - Copy leads with "keep 100%" and "verified rates".
   - **Kill rule:** no audit request or trial with imports within $300.
6. **One newsletter sponsorship (~$500, week 5–6).**
   - Options [V]: Supply News at €800/week for a banner; My Wife Quit Her Job (70k ecommerce subscribers), rate on request; or a 21k Amazon-operator list.
   - CTA: the free overpayment check, not the trial.
   - **Kill rule:** fewer than 5 uploads.
7. **Embeddable calculator widget (a few days, free).** Give it to 3PLs, sourcing agents and trade blogs, with a branded "Powered by HTS Hero" link (no keyword anchors). It earns links and referral traffic.
8. **Affiliate program for non-brokers (Rewardful or Tolt, 20–30% recurring).** For 3PLs, Amazon and Shopify agencies, sourcing agents and ecommerce accountants. Freight Right already runs a CPA partner program for refunds [V].
9. **Automated outbound from bill-of-lading data (pilot only after #2 converts).**
   - Use a licensed source: ImportGenius or TradeData.Pro, about $1–2k a year [V]. ImportYeti's terms ban commercial use and scraping [V].
   - Pilot: 300 importers in 2 HS chapters. Send a personal "your duty stack on these codes" email that links to a free pre-filled report, never a call.
   - CAN-SPAM rules apply.
   - Benchmarks are generic (5.6% reply rate personalized vs 3.6% generic) [V]. There's no tariff-specific evidence. **Kill rule:** under 1 trial per 150 sends.
10. **Skip for now:** Shopify app (competitors have 0 reviews; demand unproven), Chrome extension, enterprise.

## 8. 90-day plan and targets

| Weeks | Do | Target at end |
|---|---|---|
| 1–2 | Leaks 1–7; bot-filtered cohort and events; personal emails to classification customers and accounts; Nov 13 launch campaign; GingerControl price correction | Sign-up mode right everywhere; first Tracker subscribers from warm accounts |
| 2–4 | "Watch {code}" on HTS pages; cut HTS CTAs to two; title/meta test on half the top HTS pages; day-0 retro alerts and first-look email | 3%+ of real visitors sign up; 70%+ of new accounts have imports on day 0 |
| 3–6 | Overpayment check (ES-003 and 7501 upload); flat-fee audit offer; assisted lane for 100+ imports; ICP qualifier | 20+ uploads a month; the first paid audit |
| 5–8 | $300 ads + one $500 newsletter test into the overpayment check; Reddit answering; first Tariff Index | CAC under $100 on at least one channel, or kill it |
| 6–10 | Client workspaces plan for forwarders/3PLs; affiliate program; embed widget | 2+ forwarder accounts |
| 9–12 | Bill-of-lading outbound pilot if trials convert; scale whichever paid channel passed | Repeatable channel with payback inside 2 months |

**North-star metric:** new accounts with at least one real import, per week. **Guardrail:** trial-to-paid %. The benchmark for "good" no-card trials is 8–12% [V, OpenView/Pendo].

## 9. Decisions that are yours

1. **Free plan alerts:** keep 0, or test 3 free tracked imports (email only)?
2. **Flat-fee audit report:** offer one (e.g. $499 for 12 months of entries, credited to annual)? And how much manual review are you willing to put into each?
3. **Client workspaces plan for forwarders and 3PLs:** build it now or after the core funnel converts?
4. **Bill-of-lading outbound:** OK to spend about $1–2k a year on licensed data if the funnel converts by week 8?

## Sources

Market and ICP: [Census importer profile 2023](https://www.census.gov/foreign-trade/Press-Release/edb/edbrel2024.pdf), [CBP IEEPA declaration via EY](https://www.ey.com/en_gl/technical/tax-alerts/us-customs-and-border-protection-outlines-potential-refund-and-liquidation-mechanics-following-court-order-on-ieepa-duties), [Green Worldwide](https://www.greenworldwide.com/cbp-declaration-outlines-operational-hurdles-in-processing-ieepa-tariff-refunds/), [Thomson Reuters CAPE update](https://www.thomsonreuters.com/en-us/help/onesource-global-trade/regulatory-insights/2026/august-12th/ieepa-duty-refund-processing-update), [trade.gov brokers](https://www.trade.gov/customs-brokers-and-freight-forwarders), [FMC](https://www.fmc.gov/?p=6327), [CAP small-business tariffs](https://www.americanprogress.org/article/in-the-first-year-president-trumps-tariffs-have-cost-small-business-importers-306000-on-average/), [Small Business Expo survey](https://www.thesmallbusinessexpo.com/blog/tariffs-on-small-businesses/), [Reuters on broker fees](https://thefinancialexpress.com.bd/home/us-importers-turn-to-brokers-to-navigate-trump-era-tariffs-at-a-cost), [Section 232 changes](https://www.jdsupra.com/legalnews/trump-admin-adjusts-tariffs-for-8942165/).

Competitors: [Flexport refund calculator](https://www.businesswire.com/news/home/20260120812295/en/Flexport-Launches-Tariff-Refund-Calculator-Giving-Businesses-Early-Insight-Into-Possible-Tariff-Refunds), [Gateway Lines MCP](https://gatewaylines.com/press-releases/your-ai-can-now-price-us-import-tariffs), [TariffsAPI pricing](https://tariffsapi.com/pricing), [GingerControl pricing](https://gingercontrol.com/pricing), [GingerControl alert roundup (lists HTS Hero prices)](https://gingercontrol.com/blog/trade-policy-alert-services-compared-2026), [Gaia Dynamics pricing](https://pricingsaas.com/companies/gaiadynamics), [SkuWatch](https://apps.shopify.com/skuwatch-tariff-intelligence), [Tarifflo](https://yespress.io/tarifflo-yc-s26.md), [Declaro](https://stackknack.com/declaro/tools/hts-classifier), [Pax](https://sacra.com/research/penny-chen-pax-ai-powered-tariff-refunds/), [Leyton](https://leyton.com/us/ieepa-customs-tariff-refund/), [McCune contingency](https://mccunewright.com/practice-areas/commercial-litigation/the-ieepa-tariff-ruling-and-your-business), [Freight Right partner program](https://www.freightright.com/ieepa-tariff-refund-partner-program), [UNIS refund calculator](https://www.unisco.com/ieepa-refund-calculator).

Search and channels: [seodata.dev: tariff calculator](https://www.seodata.dev/keyword/tariff-calculator), [hts code lookup](https://www.seodata.dev/keyword/hts-code-lookup), [tariff tracker](https://www.seodata.dev/keyword/tariff-tracker), [tariff refund](https://www.seodata.dev/keyword/tariff-refund), [scaled content abuse](https://ppc.land/scaled-content-abuse/), [AI citation patterns](https://www.tryprofound.com/blog/ai-platform-citation-patterns), [Supply News ads](https://supply-news.com/advertise/), [MWQHJ newsletter ads](https://mywifequitherjob.com/advertise-newsletter/), [19 CFR 111.36](https://www.law.cornell.edu/cfr/text/19/111.36), [ImportYeti terms](https://www.importyeti.com/policies/terms), [cold email benchmarks](https://hunter.io/the-state-of-cold-email), [CalcMyTariff embed](https://www.calcmytariff.com/embed), [free-to-paid benchmarks](https://www.lennysnewsletter.com/p/what-is-a-good-free-to-paid-conversion).
