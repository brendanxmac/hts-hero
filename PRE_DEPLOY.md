# Before deploying the PLG / Tariff Tracker release

A running list of what has to be done before this release ships. Tick items off as they land;
add new ones as they come up.

## Must do

- [ ] **PDF download.** The calculator's "Download PDF" button (free with an account).
      Sign-up returns to the import with `export=pdf`, but nothing builds the PDF yet. Build it in
      the Tracker calculator: on `export=pdf`, open a print-ready, branded view of the results
      (with a link back) and start the download.
- [ ] **Qualification check (guided workflow).** The paid tier of Possible Adjustments: visitors
      see every adjustment and what it could change the total by; free accounts see a plain-English
      line on why each could apply; paying (and trial) users step through a guided workflow that
      works out exactly which adjustments SHOULD apply to their goods, and the proof they'd need.
      The calculator teases it ("Find out exactly which of these apply" under Possible Adjustments,
      "Check if you qualify" on each row that could save money); trial and paid users see "Coming
      soon to your plan". Build the workflow in the Tracker.
- [ ] **Refund check.** Duty Over Time teases "Check if you might qualify for a refund" (enter what
      was paid on a past entry; compare with the duty then). Trial and paid users see "Coming soon
      to your plan". Build it (it overlaps the Tracker's Entry audit, still marked Soon).
- [ ] **Apply the migration** `supabase/migrations/tariff_tracker_accounts.sql` (tracker_catalogs,
      tracker_trials, tracker_alert_settings).
- [ ] **Stripe prices.** Create the products and set
      `STRIPE_TARIFF_TRACKER_<30|100|500>_<MONTHLY|ANNUAL>_PRICE_ID`.
- [ ] **Alert sending job.** Alert settings are saved, but nothing sends alerts yet.
- [ ] **Onboarding email sequence** (plan in ONBOARDING_PLAN.md, worktree
      claude/vibrant-maxwell-5fa15d, awaiting answers).

## Should do

- [ ] **Track this Import email** on the calculator: the form shows "Coming soon" and does
      nothing. Wire it to alerts, or hide it.
- [ ] **`view=history` in the Tracker calculator.** The Duty Over Time teaser signs people up
      back to `view=history`; the Tracker should open on the duty history for it.
