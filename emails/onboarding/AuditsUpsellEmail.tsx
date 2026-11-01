import { EmailFooter, EmailLayout } from "../kit/Layout"
import { Checklist, Cta, Eyebrow, P, Signature, Title } from "../kit/parts"
import { siteLink } from "../kit/brand"

// To Duty Guard Essentials subscribers, two weeks and a month in (libs/email/lifecycle.ts): the alerts tell
// them what changed; Duty Guard Pro answers "was I charged right?". Always "may" and "could".

export interface AuditsUpsellEmailProps {
  step: 1 | 2
  imports: number
  // The same-size Duty Guard Pro plan
  plan?: { name: string; price: number } | null
  footer: EmailFooter
}

export const auditsUpsellSubject = (p: AuditsUpsellEmailProps) => (p.step === 1 ? "Your alerts say what changed. Were you charged right?" : "What could your products qualify for?")

const CAMPAIGN = "audits-upsell"

export default function AuditsUpsellEmail({ step, imports, plan, footer }: AuditsUpsellEmailProps) {
  const size = imports ? `your ${imports.toLocaleString("en-US")} products` : "your products"
  return (
    <EmailLayout preview={step === 1 ? "Tariff changes are easy to miss on an entry. An audit checks each one." : "Trade programs, exemptions and lower-duty origins, checked for you."} footer={footer}>
      <Eyebrow>Duty Guard</Eyebrow>
      <Title>{step === 1 ? "Are you overpaying on duty?" : "Sitting on savings?"}</Title>
      {step === 1 ? (
        <P>
          With tariffs changing so often, many importers have been paying the wrong duty on their entires. Our Duty Guard can check each of your entry entries and flag possible
          over and underpayments for you. It includes:
        </P>
      ) : (
        <P>
          Duty Guard can analyze your imports for trade programs, exemptions and lower-duty origins you may qualify for. Give it a try!
        </P>
      )}
      {step === 1 && <Checklist items={["Everything in your Duty Guard Essentials plan", "Unlimited audits on your products", "Savings detection", "10-audit money-back guarantee"]} />}
      <Cta href={siteLink("/duty-guard?upgrade=entries", CAMPAIGN)}>{`Check your imports`}</Cta>
      <Signature />
    </EmailLayout>
  )
}

AuditsUpsellEmail.PreviewProps = {
  step: 1,
  imports: 18,
  plan: { name: "Duty Guard Pro 25", price: 79 },
  footer: { reason: "You're getting this because you have an HTS Hero account.", manageUrl: "https://htshero.com/tariff-updates/subscription?token=example", unsubscribeUrl: "https://htshero.com/api/email/unsubscribe?token=example" },
} satisfies AuditsUpsellEmailProps
