import { EmailFooter, EmailLayout } from "../kit/Layout"
import { Checklist, Cta, Eyebrow, P, Signature, Title } from "../kit/parts"
import { siteLink } from "../kit/brand"
import { REVERSE_TRIAL, TRIAL_ALLOWANCE } from "../../components/pricing-calculator/lib/pricing"
import { AUDITS_ENABLED } from "../../libs/tariff-tracker/features"
import { COMING_LOWER, FREE_FOREVER_SHORT } from "../../components/ui/marketing/comingSoon"

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
      <Title>
        Thanks, {name}. We&apos;ve got your request for {company}.
      </Title>
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
            Automatic auditing in the Tariff Tracker is {COMING_LOWER}: every entry checked against the duty in force on its date, flagging possible over and
            underpayments. In the meantime, try the Tariff Tracker free for {REVERSE_TRIAL.days} days on up to {REVERSE_TRIAL.imports} imports, with no credit card
            (the {REVERSE_TRIAL.days} days start when you add your imports): we&apos;ll alert you the moment a tariff change hits one, with the rate before and after.
            After that, {FREE_FOREVER_SHORT} stay free, forever.
          </P>
          <Cta href={siteLink("/tariff-tracker?setup=add", CAMPAIGN)} variant="next">
            Try the Tariff Tracker free
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
