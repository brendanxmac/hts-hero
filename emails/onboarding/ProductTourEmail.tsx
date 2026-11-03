import { EmailFooter, EmailLayout } from "../kit/Layout"
import { AlertSample, Checklist, Cta, Eyebrow, P, PlanStrip, Signature, Title, TRACKER_POINTS, UpdateBlock, UpdateSummary } from "../kit/parts"
import { siteLink } from "../kit/brand"
import { REVERSE_TRIAL } from "../../components/pricing-calculator/lib/pricing"
import { NUM_FREE_CLASSIFICATIONS } from "../../constants/classification"

// To an account that signed up from a generic link (the home page, the header) and hasn't opened
// Duty Guard (libs/email/lifecycle.ts product_tour_1/2/3): one product per email, each with
// what it does for them and what's free.
//   1 (day 1)  the duty calculator: free and unlimited, with the latest tariff action as the hook
//   2 (day 3)  Duty Guard: alerts on their imports, free for a week from their first ones
//   3 (day 6)  the classification assistant: the right HTS code, free to try
// Opening Duty Guard ends the tour: its own onboarding emails take over.

export interface ProductTourEmailProps {
  step: 1 | 2 | 3
  // The latest tariff action, for step 1
  latest?: UpdateSummary | null
  footer: EmailFooter
}

const SUBJECTS = {
  1: "Nail your US Import Costs",
  2: "Did a new tariff just hit your imports?",
  3: "Classifications you can defend",
} as const

export const productTourSubject = (p: ProductTourEmailProps) => SUBJECTS[p.step]

const PREVIEWS = {
  1: "See every tariff & fee stacked up on any HTS code from any country. Free & Unlimited",
  2: `Get alerted when tariff changes affect your imports.`,
  3: `Get a mountain of evidence for every classification`,
} as const

export default function ProductTourEmail({ step, latest, footer }: ProductTourEmailProps) {
  const campaign = `product-tour-${step}`
  return (
    <EmailLayout preview={PREVIEWS[step]} footer={footer}>
      {step === 1 && (
        <>
          <Eyebrow>Duty Calculator</Eyebrow>
          <Title>Calculate the duty on any import, in seconds</Title>
          <P>Enter in an HTS code and a country of origin and the calculator finds every tariff that applies today, line by line:</P>
          <Checklist
            items={[
              "See the base rate, every additional tariff, and any additional fees",
              "Track duty over time, so you see what changed and when",
              "Analysis of where else you could source it, and what it would cost",
              "Free and unlimited",
            ]}
          />
          <Cta href={siteLink("/duty-calculator", campaign)} variant="next">
            Calculate a duty &rarr;
          </Cta>
        </>
      )}
      {step === 2 && (
        <>
          <Eyebrow tone="up">Duty Guard</Eyebrow>
          <Title>Get notified when new tariff hits your imports</Title>
          <P>Just upload your imports and Duty Guard will watch them, 24/7 any notify you when you&apos;re affected. You&apos;ll get alerts like this:</P>
          <AlertSample
            label="Tariff Alert"
            updateTitle="A new tariff affects 1 of your imports"
            code="7326.90.86.88"
            country="Germany"
            description="Other articles of iron or steel"
            beforePct={12.9}
            afterPct={32.9}
          />
          {/* <Checklist items={TRACKER_POINTS} /> */}
          <P>
            Try it free, no credit card required.
            Just upload your imports in 30 seconds to get started.
          </P>
          <Cta href={siteLink("/duty-guard", campaign)} variant="next">
            Add my imports &rarr;
          </Cta>
        </>
      )}
      {step === 3 && (
        <>
          <Eyebrow>Classification Assistant</Eyebrow>
          <Title>Get Supporting Evidence to Back Up Every HTS Classification</Title>
          <P>Want to make sure a product is classified correctly? Just enter a product description and our assistant will find:</P>
          <Checklist
            items={[
              "HS candidates in seconds",
              "Legal notes that back up each option",
              "CROSS rulings for similar products",
            ]}
          />
          <Cta href={siteLink("/classify#try-classify", campaign)} variant="next">
            Try it free &rarr;
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
