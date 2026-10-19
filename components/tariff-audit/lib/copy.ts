import { TRIAL_ALLOWANCE } from "@/components/pricing-calculator/lib/pricing"
import { AUDITS_ENABLED } from "@/libs/tariff-tracker/features"
import { COMING_LOWER } from "@/components/ui/marketing/comingSoon"

// The audit page's fixed copy. The FAQ is shown on the page and in its FAQPage schema, so the two
// always match.

// The one-sentence answer to "what is it?", written so it can be quoted on its own
export const DEFINITION =
  "HTS Hero's tariff audit recalculates the US duty on each of your past entries using the rates in force on its entry date, and flags potential overpaid duty, missed exemptions and tariffs that may be refundable."

// Why importers overpay, in the order they're most often found
export const CAUSES = [
  {
    title: "Tariffs stacked that shouldn't be",
    text: "Many Chapter 99 tariffs exempt goods that pay another one. Section 122 skipped Section 232 articles, for example, but it was often charged anyway.",
  },
  {
    title: "Exemptions and preferences not claimed",
    text: "A USMCA or other trade-agreement claim left off an entry, or an exemption that applied on the entry date but wasn't used.",
  },
  {
    title: "Rules that changed after entry",
    text: "Retroactive exemptions, technical corrections and court rulings can turn duty you paid correctly at the time into duty you can get back.",
  },
  {
    title: "Tariffs struck down",
    text: "IEEPA duties are being refunded with interest, and the Section 122 surcharge is under appeal. Each one depends on the entry's date and status.",
  },
]

export const STEPS = [
  {
    title: "Add your entries",
    text: "Upload an ACE entry summary report (ES-003) or your 7501 data: entry number, entry date, HTS code, country of origin, entered value and duty paid.",
  },
  {
    title: "Each one is recalculated",
    text: "HTS Hero works out the duty on every line with the rules in force on its entry date: the base rate, each Chapter 99 tariff, exemptions, preferences and fees.",
  },
  {
    title: "See what to recover",
    text: "Overpaid and underpaid lines are flagged with the reason, the amount and the route to fix it, ready to hand to your customs broker.",
  },
]

export const AUDIT_FAQS = [
  {
    question: "What is a tariff audit?",
    answer: `A tariff audit (or customs duty audit) checks the duty you paid on past imports against what you actually owed. ${DEFINITION} Each flag shows the reason, the amount and how it can be corrected.`,
  },
  {
    question: "How do I find out if I overpaid import duty?",
    answer:
      "Compare the duty on each entry line with the duty the rules required on its entry date. HTS Hero does this for every line you upload: it recalculates the base rate, each Chapter 99 tariff, exemptions, trade preferences and fees, and flags any difference.",
  },
  {
    question: "What do I need to run an audit?",
    answer:
      "Your entry data: an ACE entry summary report (ES-003 line-level detail works best) or the data from your CBP Form 7501s. For each line, HTS Hero needs the entry number, entry date, HTS code, country of origin, entered value and duty paid. Your customs broker can export this for you.",
  },
  {
    question: "Can I get my IEEPA tariffs refunded?",
    answer:
      "Usually, yes. The Supreme Court held on Feb 20, 2026 that IEEPA doesn't authorize tariffs, and CBP refunds IEEPA duty with interest through CAPE in ACE. Unliquidated entries and entries within 80 days of liquidation are covered; finally liquidated entries need a timely protest or a court action. Refunds go to the importer of record.",
  },
  {
    question: "Can I get a refund of the Section 122 tariff?",
    answer:
      "Not yet for most importers. The Court of International Trade held the 10% Section 122 surcharge invalid on May 7, 2026, with relief for the named plaintiffs, and the Federal Circuit stayed that ruling while the appeal proceeds. Many importers are preserving their claims before their entries liquidate. HTS Hero shows the Section 122 duty on each entry so you know what's at stake.",
  },
  {
    question: "Does HTS Hero file the refund for me?",
    answer:
      "No. HTS Hero finds and flags potential overpaid duty, and documents why. Corrections and refunds are filed by your licensed customs broker or attorney: a post-summary correction before the entry liquidates, a protest within 180 days after liquidation, or a post-importation trade-agreement claim within one year of import.",
  },
  {
    question: "What if the audit finds duty I underpaid?",
    answer:
      "It flags underpayments too, so you see the full picture. Talk to your customs broker or attorney about correcting them; a prior disclosure made before CBP opens an inquiry can greatly reduce penalties.",
  },
  {
    question: "Is the audit free?",
    // Self-serve audits are off for the Tracker MVP (features.ts); the request is done by hand
    answer: AUDITS_ENABLED
      ? `Self-audits run in the Tariff Tracker. Every account gets ${TRIAL_ALLOWANCE.auditChecks} free audit checks (one per past entry) with no credit card, and paid Tracker plans include unlimited audit checks. Two ways are free outright: upload your entries for a one-time check with the results emailed to you, or request an audit and we'll review your entries and send you a report.`
      : `Requesting an audit is free, with no obligation: tell us about your company and we'll review your entries and send you a report of potential overpaid and underpaid duty, for your customs broker to review. Automatic auditing in the Tariff Tracker is ${COMING_LOWER}: every entry checked against the duty in force on its date, flagging possible over and underpayments, included in the trial and every Tracker plan at no extra cost.`,
  },
]
