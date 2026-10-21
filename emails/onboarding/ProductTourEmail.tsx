import { EmailFooter, EmailLayout } from "../kit/Layout"
import { AlertSample, Checklist, Cta, Eyebrow, P, PlanStrip, Signature, Title, TRACKER_POINTS, UpdateBlock, UpdateSummary } from "../kit/parts"
import { siteLink } from "../kit/brand"
import { REVERSE_TRIAL } from "../../components/pricing-calculator/lib/pricing"
import { NUM_FREE_CLASSIFICATIONS } from "../../constants/classification"

// To an account that signed up from a generic link (the home page, the header) and hasn't opened
// the Tariff Tracker (libs/email/lifecycle.ts product_tour_1/2/3): one product per email, each with
// what it does for them and what's free.
//   1 (day 1)  the duty calculator: free and unlimited, with the latest tariff action as the hook
//   2 (day 3)  the Tariff Tracker: alerts on their imports, free for 14 days from their first ones
//   3 (day 6)  the classification assistant: the right HTS code, free to try
// Opening the Tracker ends the tour: its own onboarding emails take over.

export interface ProductTourEmailProps {
  step: 1 | 2 | 3
  // The latest tariff action, for step 1
  latest?: UpdateSummary | null
  footer: EmailFooter
}

const SUBJECTS = {
  1: "The duty on any import, free and unlimited",
  2: "Know the day a new tariff hits your imports",
  3: "The right HTS code, with the reasoning to back it",
} as const

export const productTourSubject = (p: ProductTourEmailProps) => SUBJECTS[p.step]

const PREVIEWS = {
  1: "Every tariff stacked up on any HTS code and country, in seconds. Unlimited with your account.",
  2: `Add your imports once and get alerted when a change hits one. Free for ${REVERSE_TRIAL.days} days, starting when you add them.`,
  3: `Describe a product and get a defensible HTS classification. ${NUM_FREE_CLASSIFICATIONS} classifications free.`,
} as const

export default function ProductTourEmail({ step, latest, footer }: ProductTourEmailProps) {
  const campaign = `product-tour-${step}`
  return (
    <EmailLayout preview={PREVIEWS[step]} footer={footer}>
      {step === 1 && (
        <>
          <Eyebrow>Duty Calculator</Eyebrow>
          <Title>The duty on any import, in seconds</Title>
          <P>Put in an HTS code and a country of origin and the calculator stacks up every tariff that applies today, line by line:</P>
          <Checklist
            items={[
              "The base rate plus Section 232, Section 301, reciprocal and every other tariff on top",
              "Duty over time, so you see what changed and when, unlocked with your account",
              "Analysis of where else you could source it, and for how much less duty",
              "Free and unlimited, as often as you like",
            ]}
          />
          {latest && (
            <>
              <P>Tariffs keep moving. The latest change:</P>
              <UpdateBlock update={latest} campaign={campaign} compact />
            </>
          )}
          <Cta href={siteLink("/duty-calculator", campaign)} variant="next">
            Calculate a duty &rarr;
          </Cta>
        </>
      )}
      {step === 2 && (
        <>
          <Eyebrow tone="up">Tariff Tracker</Eyebrow>
          <Title>Know the day a new tariff hits your imports</Title>
          <P>Add the products you import once, as HTS codes and countries of origin, and the Tracker watches every one of them, every day:</P>
          <AlertSample
            label="Example alert"
            updateTitle="Section 232: more steel derivative products added"
            code="7326.90.86.88"
            country="Germany"
            description="Other articles of iron or steel"
            beforePct={12.9}
            afterPct={52.9}
          />
          <Checklist items={TRACKER_POINTS} />
          <P>
            It&apos;s free for {REVERSE_TRIAL.days} days on up to {REVERSE_TRIAL.imports} imports, no credit card, and the 14 days only start when you add your imports.
            Paste a list or drop in a spreadsheet: about a minute.
          </P>
          <Cta href={siteLink("/tariff-tracker", campaign)} variant="next">
            Add my imports &rarr;
          </Cta>
        </>
      )}
      {step === 3 && (
        <>
          <Eyebrow>Classification Assistant</Eyebrow>
          <Title>The right HTS code, with the reasoning to back it</Title>
          <P>Not sure a product is classified right? Describe it and the assistant works through the HTS the way a customs expert would:</P>
          <Checklist
            items={[
              "A classification you can defend, with the reasoning at every step",
              "Checked against CBP rulings (CROSS) for similar products",
              "Reasoning you can keep on file, ready for an audit",
              `${NUM_FREE_CLASSIFICATIONS} classifications free to try it`,
            ]}
          />
          <Cta href={siteLink("/classify#try-classify", campaign)} variant="next">
            Classify a product &rarr;
          </Cta>
        </>
      )}
      <Signature />
      <PlanStrip campaign={campaign} />
    </EmailLayout>
  )
}

ProductTourEmail.PreviewProps = {
  step: 1,
  latest: {
    slug: "commerce-defines-u-s-content",
    title: 'Commerce defines "U.S. content" for USMCA metal goods under Proclamation 11032',
    summary: "A Bureau of Industry and Security notice tells CBP how to assess U.S. content for metal goods entered under USMCA.",
    authorityLabel: "Section 232",
    stageLabel: "Published",
    effectiveOn: null,
    countriesLabel: "Canada, Mexico",
    tone: "brand",
  },
  footer: {
    reason: "You're getting this because you have an HTS Hero account.",
    manageUrl: "https://htshero.com/tariff-updates/subscription?token=example",
    unsubscribeUrl: "https://htshero.com/api/email/unsubscribe?token=example",
  },
} satisfies ProductTourEmailProps
