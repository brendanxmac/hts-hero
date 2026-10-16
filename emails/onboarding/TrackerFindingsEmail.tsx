import { Link, Section, Text } from "@react-email/components"
import { EmailFooter, EmailLayout } from "../kit/Layout"
import { Checklist, Cta, Eyebrow, P, Signature, Title } from "../kit/parts"
import { C, FONT_DISPLAY, siteLink } from "../kit/brand"

// The morning after an account first adds imports, once: well done, here's what that gets you
// (the best rate, alerts when a new tariff hits, easy audits), then HTS Hero Managed for those
// who'd rather we handle all of it. No numbers, no dollars.

export interface TrackerFindingsEmailProps {
  // How many imports are in the Tracker
  imports?: number
  footer: EmailFooter
}

const covered = (n?: number) => (n ? `${n} ${n === 1 ? "import" : "imports"}` : "your imports")

export const trackerFindingsSubject = (p: TrackerFindingsEmailProps) => `Nice work! Your ${covered(p.imports).replace(/^your /, "")} ${p.imports === 1 ? "is" : "are"} covered`

const CAMPAIGN = "first-look"

export default function TrackerFindingsEmail({ imports, footer }: TrackerFindingsEmailProps) {
  return (
    <EmailLayout preview="The best rate, alerts on new tariffs and easy audits. Your Tracker handles it from here." footer={footer}>
      <Eyebrow>You&apos;re all set</Eyebrow>
      <Title>Great job adding your imports!</Title>
      <P>Your Tariff Tracker is now watching {covered(imports)}. The hard part is done. From here on, you&apos;ll:</P>
      <Checklist
        items={[
          <>
            <strong>Always know your best rate.</strong> Every duty on each import, kept current, plus lower-duty options you may qualify for.
          </>,
          <>
            <strong>Know when a new tariff hits you.</strong> We check every new US tariff action against your imports and alert you when one applies.
          </>,
          <>
            <strong>Audit every entry with ease.</strong> Check what you paid against the rates in force that day, in a few clicks.
          </>,
        ]}
      />
      <Cta href={siteLink("/tariff-tracker", CAMPAIGN)} variant="next">
        Open my Tariff Tracker
      </Cta>

      <Section style={{ backgroundColor: C.soft, borderRadius: 18, padding: "20px 22px", margin: "0 0 8px" }}>
        <Text style={{ margin: "0 0 6px", fontFamily: FONT_DISPLAY, fontSize: 18, lineHeight: "24px", fontWeight: 600, color: C.text }}>
          Rather hand tariffs off completely?
        </Text>
        <Text style={{ margin: "0 0 12px", fontSize: 15, lineHeight: "23px", color: C.text }}>
          With HTS Hero Managed, our team takes care of all of it. We watch your whole catalog, flag every change that hits you, audit your entries for
          overpaid duty, find savings, and tell you exactly what to do about each one. You run your business; we run your tariffs.
        </Text>
        <Text style={{ margin: 0, fontSize: 15, lineHeight: "23px", color: C.text }}>
          <Link href={siteLink("/tariff-tracker?tab=expert-help", CAMPAIGN)} style={{ color: C.cobalt, fontWeight: 600 }}>
            See how HTS Hero Managed works
          </Link>{" "}
          or reply &quot;managed&quot; and I&apos;ll send you the details.
        </Text>
      </Section>

      <Signature />
    </EmailLayout>
  )
}

TrackerFindingsEmail.PreviewProps = {
  imports: 24,
  footer: { reason: "You're getting this because you have an HTS Hero account.", manageUrl: "https://htshero.com/tariff-updates/subscription?token=example", unsubscribeUrl: "https://htshero.com/api/email/unsubscribe?token=example" },
} satisfies TrackerFindingsEmailProps
