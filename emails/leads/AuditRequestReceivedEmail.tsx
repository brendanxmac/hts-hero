import { EmailFooter, EmailLayout } from "../kit/Layout"
import { Checklist, Cta, Eyebrow, P, Signature, Title } from "../kit/parts"
import { siteLink } from "../kit/brand"
import { TRIAL_ALLOWANCE } from "../../components/pricing-calculator/lib/pricing"

// After a tariff audit request: what happens next, what to have ready, and how to start finding
// overpayments today on their own.

export interface AuditRequestReceivedEmailProps {
  name: string
  company: string
  footer: EmailFooter
}

export const auditRequestReceivedSubject = (p: AuditRequestReceivedEmailProps) => `We've got your tariff audit request for ${p.company}`

const CAMPAIGN = "audit-request"

export default function AuditRequestReceivedEmail({ name, company, footer }: AuditRequestReceivedEmailProps) {
  return (
    <EmailLayout preview="What happens next, and how to start checking past entries yourself today." footer={footer}>
      <Eyebrow>Audit request received</Eyebrow>
      <Title>Thanks, {name}. We&apos;ve got your request for {company}.</Title>
      <P>I&apos;ll reply personally with next steps. It helps to have these ready:</P>
      <Checklist
        items={[
          "Your ACE entry summary report (ES-003) for the period, or a list of entries",
          "The HTS codes and countries of origin you import most",
          "Any refunds or protests already filed",
        ]}
      />
      <P>
        Want a head start? Check past entries yourself: enter what you paid and we&apos;ll compare it with the duty in force on that date.{" "}
        {TRIAL_ALLOWANCE.auditChecks} checks are free with an account.
      </P>
      <Cta href={siteLink("/tariff-tracker?tab=entries", CAMPAIGN)} variant="next">
        Check my past entries
      </Cta>
      <Signature />
    </EmailLayout>
  )
}

AuditRequestReceivedEmail.PreviewProps = {
  name: "Alex",
  company: "Acme Imports",
  footer: { reason: "You're getting this because you requested a tariff audit from HTS Hero with this email." },
} satisfies AuditRequestReceivedEmailProps
