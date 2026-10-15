import { EmailFooter, EmailLayout } from "../kit/Layout"
import { Cta, Eyebrow, P, PlanStrip, Signature, Title } from "../kit/parts"
import { siteLink } from "../kit/brand"

// After a demo request: a person will reply, and in the meantime the fastest way to see the
// product is on one of their own codes, free.

export interface DemoRequestEmailProps {
  name: string
  footer: EmailFooter
}

export const demoRequestSubject = () => "Got your demo request: one thing to try before we talk"

const CAMPAIGN = "demo-request"

export default function DemoRequestEmail({ name, footer }: DemoRequestEmailProps) {
  return (
    <EmailLayout preview="I'll reply personally to set a time. Until then, try it on one of your own codes." footer={footer}>
      <Eyebrow>Demo request received</Eyebrow>
      <Title>Thanks, {name}. I&apos;ll be in touch to set a time.</Title>
      <P>
        I&apos;ll reply personally to find a time that works. To get the most from the call, try the calculator on one of your own HTS codes first:
        it shows every duty on the import, line by line, with the reason each one applies.
      </P>
      <Cta href={siteLink("/duty-calculator", CAMPAIGN)}>Try it on one of my codes</Cta>
      <P muted small>
        Bring the codes you care about most to the call, and we&apos;ll go through what changed on them and where you could pay less.
      </P>
      <Signature />
      <PlanStrip campaign={CAMPAIGN} signedUp={false} />
    </EmailLayout>
  )
}

DemoRequestEmail.PreviewProps = {
  name: "Alex",
  footer: { reason: "You're getting this because you asked for an HTS Hero demo with this email." },
} satisfies DemoRequestEmailProps
