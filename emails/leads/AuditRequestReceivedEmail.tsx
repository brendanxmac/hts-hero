import { EmailFooter, EmailLayout } from "../kit/Layout"
import { Checklist, Cta, Eyebrow, P, Signature, Title } from "../kit/parts"
import { siteLink } from "../kit/brand"
import { TRIAL_ALLOWANCE } from "../../components/pricing-calculator/lib/pricing"
import { AUDITS_ENABLED } from "../../libs/tariff-tracker/features"

// After a tariff audit request: what happens next, what to have ready, and how to start finding
// overpayments today on their own. While self-serve audits are off (features.ts), the head start is
// tracking their imports instead (the Entries section is hidden).

export interface AuditRequestReceivedEmailProps {
  name: string
  company: string
  footer: EmailFooter
}

export const auditRequestReceivedSubject = (p: AuditRequestReceivedEmailProps) => `We've got your tariff audit request for ${p.company}`

const CAMPAIGN = "audit-request"

export default function AuditRequestReceivedEmail({ name, company, footer }: AuditRequestReceivedEmailProps) {
  return (
    <EmailLayout
      preview={
        AUDITS_ENABLED
          ? "What happens next, and how to start checking past entries yourself today."
          : "What happens next, and how to watch your imports for tariff changes while you wait."
      }
      footer={footer}
    >
      <Eyebrow>Audit request received</Eyebrow>
      <Title>Thanks, {name}. We&apos;ve got your request for {company}.</Title>
      <P>I&apos;ll reply personally with next steps. It helps to have these ready:</P>
      <Checklist
        items={[
          "The entries you want checked: dates, HTS codes and the duty paid",
          "The HTS codes and countries of origin you import most",
          "Any refunds or protests already filed",
        ]}
      />
      {AUDITS_ENABLED ? (
        <>
          <P>
            Want a head start? Check past entries yourself: enter what you paid and we&apos;ll compare it with the duty in force on that date.{" "}
            {TRIAL_ALLOWANCE.auditChecks} checks are free with an account.
          </P>
          <Cta href={siteLink("/tariff-tracker?tab=entries", CAMPAIGN)} variant="next">
            Check my past entries
          </Cta>
        </>
      ) : (
        <>
          <P>
            Self-serve audits are coming soon. In the meantime, add your imports to the Tariff Tracker: you can track {TRIAL_ALLOWANCE.alertImports} free,
            and we&apos;ll alert you the moment a tariff change hits one, with the rate before and after.
          </P>
          <Cta href={siteLink("/tariff-tracker?tab=catalog&add=paste", CAMPAIGN)} variant="next">
            Track my imports free
          </Cta>
        </>
      )}
      <Signature />
    </EmailLayout>
  )
}

AuditRequestReceivedEmail.PreviewProps = {
  name: "Alex",
  company: "Acme Imports",
  footer: { reason: "You're getting this because you requested a tariff audit from HTS Hero with this email." },
} satisfies AuditRequestReceivedEmailProps
