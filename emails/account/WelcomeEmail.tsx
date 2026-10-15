import { EmailFooter, EmailLayout } from "../kit/Layout"
import { Checklist, Cta, Eyebrow, P, Panel, PlanStrip, Signature, Title, UpdateBlock, UpdateSummary } from "../kit/parts"
import { siteLink } from "../kit/brand"

// Sent the moment an account is created. Value first: what the Tracker shows once imports are in,
// two ways to add them in a minute, and the latest tariff
// action, so the first email already teaches something. One button: add my imports.

export interface WelcomeEmailProps {
  latestUpdate?: UpdateSummary | null
  footer: EmailFooter
}

export const welcomeSubject = () => "Your tariff dashboard is ready for your imports"

const CAMPAIGN = "welcome"

export default function WelcomeEmail({ latestUpdate, footer }: WelcomeEmailProps) {
  return (
    <EmailLayout preview="Add your HTS codes and see every duty, change and possible saving on each one." footer={footer}>
      <Eyebrow>Welcome to HTS Hero</Eyebrow>
      <Title>Your tariff dashboard is ready for your imports</Title>
      <P>
        Add the HTS codes and countries you import, and the Tariff Tracker shows every duty on each one, what changed on it this year, and where you
        could pay less.
      </P>
      <P>Adding them takes about a minute:</P>
      <Checklist
        items={[
          "Paste your HTS codes and countries of origin",
          "Upload a CSV, with values and quantities if you have them",
        ]}
      />
      <Cta href={siteLink("/tariff-tracker?tab=catalog&add=paste", CAMPAIGN)} variant="next">
        Add my imports
      </Cta>
      {/* {latestUpdate && (
        <>
          <Panel>
            <Eyebrow tone="neutral">The latest US tariff action</Eyebrow>
            <UpdateBlock update={latestUpdate} campaign={CAMPAIGN} compact />
          </Panel>
        </>
      )} */}
      <Signature />
      <PlanStrip campaign={CAMPAIGN} />
    </EmailLayout>
  )
}

WelcomeEmail.PreviewProps = {
  latestUpdate: {
    slug: "commerce-defines-u-s-content",
    title: "Commerce defines \"U.S. content\" for USMCA metal goods under Proclamation 11032",
    summary: "A Bureau of Industry and Security notice tells CBP how to assess U.S. content for metal goods entered under USMCA.",
    authorityLabel: "Section 232",
    stageLabel: "Published",
    effectiveOn: null,
    countriesLabel: "Canada, Mexico",
    tone: "brand",
  },
  footer: { reason: "You're getting this because you created an HTS Hero account with this email." },
} satisfies WelcomeEmailProps
