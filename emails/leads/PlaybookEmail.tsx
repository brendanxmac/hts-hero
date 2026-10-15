import { EmailFooter, EmailLayout } from "../kit/Layout"
import { Cta, Eyebrow, P, Panel, PlanStrip, Signature, Title } from "../kit/parts"
import { C, siteLink } from "../kit/brand"
import { Link, Text } from "@react-email/components"

// The audit-ready classifications playbook, delivered: the download first, then a way to put it to
// work on their own codes.

export interface PlaybookEmailProps {
  downloadUrl: string
  footer: EmailFooter
}

export const playbookSubject = () => "Your playbook: Audit-Ready Classifications"

const CAMPAIGN = "playbook"

export default function PlaybookEmail({ downloadUrl, footer }: PlaybookEmailProps) {
  return (
    <EmailLayout preview="Your copy of the Audit-Ready Classifications playbook is ready to download." footer={footer}>
      <Eyebrow>Your download</Eyebrow>
      <Title>The Audit-Ready Classifications playbook</Title>
      <P>Here&apos;s your copy: how to classify so every decision holds up to a CBP review, with the evidence to show for it.</P>
      <Cta href={downloadUrl}>Download the playbook</Cta>
      <Text style={{ margin: "4px 0 18px", fontSize: 12, lineHeight: "18px", color: C.muted }}>
        Button not working? Copy this link: <Link href={downloadUrl} style={{ color: C.cobalt, wordBreak: "break-all" }}>{downloadUrl}</Link>
      </Text>
      <Panel>
        <P small>
          <strong>Put it to work:</strong> look up one of your codes in the free tariff calculator and see every duty that applies to it today, with the
          legal reason for each.{" "}
          <Link href={siteLink("/duty-calculator", CAMPAIGN)} style={{ color: C.cobalt, fontWeight: 600 }}>
            Try it on a code
          </Link>
        </P>
      </Panel>
      <Signature />
      <PlanStrip campaign={CAMPAIGN} signedUp={false} />
    </EmailLayout>
  )
}

PlaybookEmail.PreviewProps = {
  downloadUrl: "https://htshero.com/playbook-download?token=example",
  footer: { reason: "You're getting this because you asked for the playbook with this email." },
} satisfies PlaybookEmailProps
