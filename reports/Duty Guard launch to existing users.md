# Duty Guard launch to existing users: research + playbook

2026-11-03. Research only: nothing is built or sent.

## TL;DR

1. **The base is small**, so treat it as a list of people, not a list of emails. Mixpanel counts about 160 unique sign-ups since Sept 2025, when the `Sign Up` event started. Add older accounts and newsletter, webinar and ebook leads, and the whole base is likely a few hundred. At that size you can personally touch every warm account, and almost nobody else can.
2. **The single best lever is a "your codes" email, not an announcement.** Show each person what changed on the HTS codes *they* looked up: rate before → after, as +X%. Then one click opens Duty Guard with those codes already loaded. The research points the same way every time: triggered and personalized emails get roughly 2–5x the clicks and conversions of batch sends.
3. **Today an email click can't reliably show the cinematic flow.** It only renders for signed-in users. A browser without the known-account cookie gets sent to **sign-up**, and the flow won't open again if it was already seen on that device or if the account has imports. Fix this with a one-tap sign-in link plus a forced `?welcome=` param (section 3).
4. **Send in founder voice, plain text, one link.** Expect about 1–2% of the whole list to pay and 10–15% of real trial starters, and only if they upload. The upload is the whole game.
5. **Decide whether a real deadline exists.** Your memory says launch pricing ends Fri Nov 13. The code agent found `LAUNCH_PRICING` removed from the code (`OFFERS_ROLLOUT.md:108-110`). Last-day sends are often the biggest day of a launch, but only when the deadline is real. Never fake or extend one.

---

## 1. What to expect (benchmarks)

| What | Number | Strength |
|---|---|---|
| Free trial → paid (B2B, Lenny/OpenView/Pendo, more than 1,000 companies) | good 8–12%, great 15–25% | Solid |
| No-card trial start → paid (Elena Verna/Amplitude) | about 15% | Practitioner |
| Reverse trial lift over plain freemium | 10–40% | Anecdotal |
| Old dormant free users who upgrade | 0.8–9% in indie cases | Anecdotal |
| Trials vs freemium: time to buy | median about 14 days vs 60–90 | Kyle Poyar |

**Plan on this:**
- 3–10% of engaged users start a trial.
- About 0.5–2% of the whole list pay.
- Poyar warns that even 14 days can be too short to show value, and your trial is 7. So value has to land in the first session: upload, then the first impact, audit finding or AD/CVD flag.

Sources: lennysnewsletter.com/p/what-is-a-good-free-to-paid-conversion · amplitude.com/blog/reverse-trial · growthunhinged.com/p/your-guide-to-reverse-trials

## 2. The core idea: "Here's what changed on your codes"

**Why it works:**
- Blueshift (14.9B messages): triggered emails get 7.06% vs 1.24% click and 3.41% vs 0.55% conversion against batch sends.
- NP Digital 2025 (162M emails): 4.4% vs 2.3% click.
- Mailchimp: segmented sends get about +52% clicks and fewer unsubscribes.
- Grammarly's weekly personal-stats email is about half of everything it sends, and Grammarly credits it for retention.
- Nobody has published a controlled test of exactly this email, but every adjacent result points the same way.

**What we hold per person:**
- **Calculator lookups.** These are server-side only in Mixpanel: `DUTY_CALCULATOR_RESULTS_VIEWED {hts_code, country_code}` and `DUTY_CALCULATOR_HTS_CODE_SELECTED`, tied to the user after `identify`. The browser copy (`libs/recent-lookups.ts`) is per device and can't be used from an email.
- **Classifications:** the `classifications` table has the final code and `country_of_origin`.
- **Saved codes:** `hts_code_sets`, plus `tracker_catalogs.items` for anyone who already started.
- **Role and company type:** `signup_onboarding`, for newer accounts only.
- **Tariff history to diff against:** `tariff_update_impacts`, `tariff_changelog` and the engine.

**The email (E1):**
- Subject: "3 of the codes you looked up have new tariffs" (or "…haven't changed. Here's what's next" when nothing moved).
- Body: a small table with code, country, rate then → now and +X%. Below it, one line on what Duty Guard would have done ("you'd have gotten this alert the day it was announced"), and that audits and savings checks run on the same list.
- One full-width CTA: **"Watch these codes"**. It opens a signed one-tap link straight into Duty Guard with those codes pre-loaded as the import list, so the trial starts on a confirmation click.
- People with no lookup history get a role-specific version (importer / forwarder-3PL / broker) instead.

**Build cost:**
- A script that exports lookups per user from Mixpanel and joins them to classifications and saved sets.
- A diff of those codes against rate changes since the lookup date.
- A new template with props.
- A pre-filled-import landing.

It fits the existing outbox approval flow. This is the one build worth doing before anything else.

## 3. Make every email click open the cinematic flow

**Today:**
- The launch CTA is `/duty-guard` with no `?welcome` param.
- Signed-out clicks are redirected to `/signup` unless the browser has the `hts-hero-known-account` cookie (`proxy.ts:83-91`).
- The flow auto-opens only for accounts with no imports that haven't seen it on that device (localStorage, `tourStore.ts`).

**Changes:**
1. **One-tap sign-in links.** Per recipient, generate a short-lived Supabase magic link (`auth.admin.generateLink`). Its redirect is `/duty-guard?welcome=imports&from=email-<campaign>`. Remember that email links get forwarded, so use a short expiry and a per-recipient token. At minimum, send signed-out email clicks to **/signin** with the email pre-filled, never to sign-up.
2. **Force the flow from email.** `?welcome=` already opens it regardless of "seen". Add every campaign CTA to it.
3. **Pre-filled variant.** After the flow, its last screen ("Add your imports") becomes **"Start watching your N codes"** when the link carries their codes. That lets the cinematic flow end in the aha moment rather than an upload chore.
4. **Accounts that already have imports** skip the flow and go straight to their first impact or audit result.

**Evidence:**
- Navattic, 40k demos: ungated flows engage more (58% vs 52%), and short flows of 1–6 steps complete best.
- Your flow (welcome → audits → savings → alerts → impact → start) is already 6 screens. Don't lengthen it.

## 4. Sequence (founder voice, plain text, one link each)

HubSpot data shows heavy HTML templates lost up to 51% of clicks against plain text, and one GIF cost 42%. Keep the designed kit for alerts and digests. Send launch notes as plain emails from Brendan, with one annotated screenshot at most.

| # | When | Who | Content |
|---|---|---|---|
| E1 | Day 0 | Everyone (segmented) | "Your codes" email (section 2), or the role version |
| E2 | +3 days | Didn't start | Proof story: a real recent tariff action (e.g. a 232 derivative or Section 122 change), what a Duty Guard user saw that morning, and what an audit flagged |
| E3 | +6 days | Didn't start, opened or clicked before | Short and personal: "Can I ask what's in the way?", one-word replies ("alerts", "audits", "not for me") |
| E4 | Deadline −2 days | Non-payers, including trialists | Only if there is a real deadline: what ends, when |
| E5 | Deadline day | Same | "Last day", 3 lines |

**Rules:**
- **Suppress anyone who started a trial** from E2/E3. The trial sequence (`trial_lesson_*`, `trial_ending_*`) takes over. Note that `PRE_DEPLOY.md:294` says the trial email text still says 14 days, so fix that first.
- **Don't double-send.** The `duty_guard_launch` and `trial_unlocked` batches overlap, so pick one.
- **Paying classification customers** (`purchases` CLASSIFY_*) get a separate thank-you version: early access framing and a direct reply line.
- **Hold out about 10%** of the dormant segment (no email) to measure real lift.
- **Resend Pro is required** before a send over 100/day, because the outbox doesn't retry (`PRE_DEPLOY.md:246`).
- **No click data comes back today** (no Resend webhook). UTMs plus Mixpanel page views are your only read, so make each CTA's `utm_content` unique.

## 5. Get them talking to you

- **Top 20–50 accounts** (paid classification customers, forwarders, brokers, anyone with many lookups): send a 60-second Loom or a personal plain-text note that names *their* codes. Vendor case data claims 10–20% replies for personalized video. You set the bar of a human touch at $149+, and these are the accounts that clear it.
- **"Reply with one word"** in E3. It's cheap, it starts threads, and it improves deliverability. Count positive replies, not raw replies.
- **One live session** tied to news rather than to the product: "What changed in tariffs this month, and how to see which of your products it hits", with a live Duty Guard walk-through. ON24 benchmarks show about half of registrants attend, counting live and replay. You already have `webinars` and `webinar_registrations` tables.
- **Brokers and forwarders:** pitch Duty Guard as a *client-alert tool*. Brokers report that most of their time now goes to tariff education for clients. That framing (alert your clients before they call you) is the conversation starter.
- Skipped on purpose: "send me your list / ACE report and I'll load it". You've ruled it out, and the one-tap pre-filled codes in section 2 does the same job with no work from them.

## 6. Other channels

- **In-app, in context:** after a calculator lookup by a signed-in user, show "Watch this code for changes, free for 7 days. 1 click." Event-triggered prompts beat generic modals. You already have `TrackImportButton` and the recent-lookups "track all".
- **Returning-user banner:** add a one-time "Duty Guard is live" bar for signed-in users on `/`, the calculator and classifications. No such system exists yet. Keep it additive and off the SEO pages' cited content.
- **LinkedIn from your personal profile:** company pages reach about 1.6% of followers. Pair weekly "what changed" posts with a soft Duty Guard line.
- **Retargeting ads to your own list:** not yet viable. LinkedIn needs 300 matched members, Google about 1,000 (100 reported for Search), Meta 100. Revisit later.
- **Skip for now:** SMS (consent risk, no B2B evidence), Product Hunt (wrong audience), direct mail (too slow; maybe Q1 for the top 20 accounts, as a postcard showing their changed codes).

## 7. Offer mechanics

- **Deep discounts hurt.** ProfitWell (6,000+ companies) found discounted subscribers churn at about 2x. If you want a launch offer, make it a modest **founding-customer price locked for life**, and actually honor it forever. Kit was publicly burned for retiring grandfathered plans.
- **Extend the trial for past paying customers**, e.g. 14 days instead of 7, framed as a thank-you. There's no data on this, but it addresses the "7 days is short" risk for your warmest people.
- **Positioning against the market:** Flexport's Tariff Simulator Pro does code-change emails but needs a Flexport client login. HTS Watch charges $29/mo and CodeHTS Pro $99/mo for alerts alone. Lead with the full bundle (alerts + audits + savings + AD/CVD) rather than alerts, and with "works with any broker or forwarder".
- **Copy rules:** "could save / may qualify", rate changes in %, never the trial cap, and "no credit card required".

## 8. Priority order

1. Decide the deadline question (TL;DR #5) and which batch replaces `trial_unlocked` / `duty_guard_launch`.
2. Build one-tap sign-in plus `?welcome=` on every campaign CTA (section 3). This is small, and it fixes the sign-up leak for every existing email too.
3. Build the "your codes" export, diff and template, plus the pre-filled landing (section 2).
4. Personal notes or Looms to the top 20–50 accounts, sent the same day as E1.
5. E2–E5 with suppression and a holdout. Get Resend Pro first.
6. In-app contextual prompt plus the returning-user banner.
7. One live session the week after E1.

## Decisions that are yours

- Is there a real deadline or founding offer, and what is it?
- Is a one-tap sign-in link from email acceptable to you security-wise (short expiry, one use)?
- Should E1 replace the current `DutyGuardLaunchEmail`, or go after it as a follow-up?
- Do past paying classification customers get a longer trial?
- How many accounts are you willing to Loom or write to personally?

## Gaps

- No prod user counts: the local env points at the dev database. Run `npm run email:duty-guard-launch -- --dry-run` against prod for the real number.
- No published benchmark for "your data" reactivation emails, one-word replies or in-app modal click rates.
- No email engagement data for trade compliance specifically.
- Treat sections 2, 5 and 6 as hypotheses, and measure them with the holdout.
