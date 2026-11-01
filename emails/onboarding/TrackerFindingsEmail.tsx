import { Link, Section, Text } from "@react-email/components"
import { EmailFooter, EmailLayout } from "../kit/Layout"
import { Checklist, Cta, Eyebrow, P, Signature, Title } from "../kit/parts"
import { C, FONT_DISPLAY, M, siteLink } from "../kit/brand"
import { REVERSE_TRIAL } from "../../components/pricing-calculator/lib/pricing"

// The morning after an account first adds imports, once, which is also when its trial starts:
// well done, here's what's on now (alerts, impact checks, savings, audits), then HTS Hero Managed for
// those who'd rather we handle all of it. No dollars.

export interface TrackerFindingsEmailProps {
  // How many imports are in Duty Guard
  imports?: number
  footer: EmailFooter
}

const covered = (n?: number) => (n ? `${n} ${n === 1 ? "product" : "products"}` : "your products")

export const trackerFindingsSubject = (p: TrackerFindingsEmailProps) => `Your free trial is on: ${covered(p.imports).replace(/^your /, "")} covered`

const CAMPAIGN = "first-look"

export default function TrackerFindingsEmail({ imports, footer }: TrackerFindingsEmailProps) {
  return (
    <EmailLayout
      preview={`Alerts, impact checks, savings and audits are on for ${REVERSE_TRIAL.days} days. Your Duty Guard handles it from here.`}
      footer={footer}
    >
      <Eyebrow>Free trial · {REVERSE_TRIAL.days} days</Eyebrow>
      <Title>Great job adding your products!</Title>
      <P>Your Duty Guard is now watching {covered(imports)}, and everything is on for {REVERSE_TRIAL.days} days, no credit card required. The hard part is done. Here&apos;s what&apos;s working for you:</P>
      <Checklist
        items={[
          <>
            <strong>Tariff alerts.</strong> We check every new US tariff action against your products and alert you when one applies, with the rate before and after.
          </>,
          <>
            <strong>Impact checks.</strong> Pick any tariff action and see exactly how it hits each product.
          </>,
          <>
            <strong>Savings detection.</strong> Trade programs, exemptions and lower-duty origins your products may qualify for.
          </>,
          <>
            <strong>Duty audits.</strong> Check what you paid on each entry against the rates in force that day, in a few clicks.
          </>,
        ]}
      />
      <Cta href={siteLink("/duty-guard", CAMPAIGN)} variant="next">
        Open my Duty Guard
      </Cta>

      <Section className={M.box} style={{ backgroundColor: C.soft, borderRadius: 18, padding: "20px 22px", margin: "0 0 8px" }}>
        <Text style={{ margin: "0 0 6px", fontFamily: FONT_DISPLAY, fontSize: 18, lineHeight: "24px", fontWeight: 600, color: C.text }}>
          Rather hand tariffs off completely?
        </Text>
        <Text style={{ margin: "0 0 12px", fontSize: 15, lineHeight: "23px", color: C.text }}>
          With HTS Hero Managed, our team takes care of all of it. We watch your whole catalog, flag every change that hits you, audit your entries for
          overpaid duty, find savings, and tell you exactly what to do about each one. You run your business; we run your tariffs.
        </Text>
        <Text style={{ margin: 0, fontSize: 15, lineHeight: "23px", color: C.text }}>
          <Link href={siteLink("/duty-guard?tab=expert-help", CAMPAIGN)} style={{ color: C.cobalt, fontWeight: 600 }}>
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
