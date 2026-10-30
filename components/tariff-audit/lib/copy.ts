import {
  ANNUAL_DISCOUNT,
  AUDIT_TIERS,
  formatPrice,
  REVERSE_TRIAL,
  TRIAL_ALLOWANCE,
} from "@/components/pricing-calculator/lib/pricing"

// The audit page's fixed copy. The FAQ is shown on the page and in its FAQPage schema, so the two
// always match.

// The money-back promise on the plans, under the prices (honored in full on request: FTC 16 CFR
// 239, so its one condition is stated wherever it's offered). It backs the plans that follow the
// week-long free trial
export const AUDIT_GUARANTEE_DAYS = 30
export const AUDIT_GUARANTEE_AUDITS = 10
export const AUDIT_GUARANTEE = `${AUDIT_GUARANTEE_AUDITS}-Audit Money-Back Guarantee`
export const AUDIT_GUARANTEE_DETAIL = `If you do ${AUDIT_GUARANTEE_AUDITS} audits on your products within ${AUDIT_GUARANTEE_DAYS} days and are not satisfied with the results, we'll give you a full refund.`

const auditTierList = AUDIT_TIERS.map(
  (t) =>
    `Duty Audits ${t.name}, ${formatPrice(t.price)} a month for up to ${t.maxPairs} products`,
).join("; ")

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
    title: "Unclaimed exemptions",
    text: "A USMCA or other trade-agreement claim left off an entry, or an exemption that applied on the entry date but wasn't used.",
  },
  {
    title: "Rules that changed after entry",
    text: "Retroactive exemptions, technical corrections and court rulings can turn duty you paid correctly at the time into duty you can get back.",
  },
  {
    title: "Terminated Tariffs",
    text: "IEEPA duties are being refunded with interest, and the Section 122 surcharge is under appeal. Each one depends on the entry's date and status.",
  },
]

export const STEPS = [
  {
    title: "You Upload Entries",
    text: "Upload or type in your ACE entry summary report (ES-003) or 7501 data",
  },
  {
    title: "We Audit",
    text: "HTS Hero works out the duty on every line with the rules in force on its entry date: the base rate, each Chapter 99 tariff, exemptions, preferences and fees.",
  },
  {
    title: "You File",
    text: "Overpaid and underpaid lines are flagged with the reason, the amount and the route to fix it, ready for you to take action.",
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
      "No. HTS Hero finds and flags potential overpaid duty, and documents why, instantly, so you can decide whether a claim is worth filing at all. Corrections and refunds are filed by your own team as the importer of record, or by your licensed customs broker or attorney: a post-summary correction before the entry liquidates, a protest within 180 days after liquidation, or a post-importation trade-agreement claim within one year of import.",
  },
  {
    question: "What if the audit finds duty I underpaid?",
    answer:
      "It flags underpayments too, so you see the full picture. Talk to your customs broker or attorney about correcting them; a prior disclosure made before CBP opens an inquiry can greatly reduce penalties.",
  },
  {
    question: "How much does a tariff audit cost?",
    answer: `Every new account starts with ${REVERSE_TRIAL.days} days free, no credit card. After that, ongoing audits are a flat monthly price by the number of products you audit (a product is one HTS code from one country of origin): ${auditTierList}. Each plan includes Tariff Alerts for the same products, annual billing takes ${ANNUAL_DISCOUNT * 100}% off, and every plan comes with our ${AUDIT_GUARANTEE_AUDITS}-audit money-back guarantee. A historical audit of your past entries is a one-time project, quoted after a short call. Neither takes a cut of what you recover.`,
  },
  {
    question: "Is there a free trial?",
    answer: `Yes. Every new account gets Tariff Alerts and Duty Audits free for ${REVERSE_TRIAL.days} days, on all its products (up to ${REVERSE_TRIAL.imports}), with no credit card. The ${REVERSE_TRIAL.days} days start when you add your products. When the trial ends, pick a plan to keep everything on; without one, alerts stay on ${TRIAL_ALLOWANCE.alertImports} of your products.`,
  },
  {
    question: "What if Duty Audits isn't worth it for me?",
    answer: `Ask for your money back. Every plan comes with our ${AUDIT_GUARANTEE_AUDITS}-audit money-back guarantee: if you do ${AUDIT_GUARANTEE_AUDITS} audits on your products within ${AUDIT_GUARANTEE_DAYS} days and are not satisfied with the results, we'll give you a full refund. You can also cancel anytime.`,
  },
  {
    question: "Do you take a percentage of my refund?",
    answer:
      "No. Full-service recovery firms usually work on contingency and keep a share of every refund, typically 15–30%. HTS Hero charges a flat price: we flag the potential overpayments and document why, you decide whether it's worth filing, your team or your broker files, and you keep 100% of what's recovered.",
  },
]
