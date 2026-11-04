import { Column, Row, Section, Text } from "@react-email/components"
import { EmailFooter, EmailLayout } from "../kit/Layout"
import { AlertSample, AlertSampleProps, Cta, Eyebrow, P, Signature, Title } from "../kit/parts"
import { C, FONT_DISPLAY, M, siteLink } from "../kit/brand"
import { ALERT_TIERS, REVERSE_TRIAL, formatPrice } from "../../components/pricing-calculator/lib/pricing"

// The Tuesday after someone's first weekly tariff digest (libs/email/digest-followup.ts), once:
// the digest tells them about every US tariff; Tariff Alerts tells them which ones land on their
// own imports, or their clients'. An example alert, the two ways people use it, then one button
// to /tariff-alerts. Rates only, never dollars.

export interface DigestAlertsEmailProps {
  // A real alert (the /tariff-alerts page's worked example), when one could be built
  example?: AlertSampleProps | null
  footer: EmailFooter
}

export const digestAlertsSubject = () => "Which of these tariffs hit your imports?"

const CAMPAIGN = "digest-alerts"

const AUDIENCES = [
  {
    label: "For importers",
    title: "Every import you bring in",
    body: "Add your HTS codes and countries once. When a new tariff touches one, you get an alert with the new rate.",
  },
  {
    label: "For brokers and consultants",
    title: "Every client's imports",
    body: "Add your clients' imports once. When a new tariff lands on one, you know before they call you, with the new rate.",
  },
]

export default function DigestAlertsEmail({ example, footer }: DigestAlertsEmailProps) {
  return (
    <EmailLayout preview="Your digest covers every US tariff. Tariff Alerts tells you which ones land on your imports, or your clients'." footer={footer}>
      <Eyebrow>Beyond the digest</Eyebrow>
      <Title>Know which tariffs hit your imports, the day they&apos;re announced</Title>
      <P>
        Every Monday, the digest tells you every US tariff change. <strong>Tariff Alerts</strong> goes one step further: it tells you which of those changes land on your own
        imports, or your clients&apos;, with the duty rate before and after on each one.
      </P>
      {example && <AlertSample {...example} />}
      <Section style={{ margin: "6px 0 18px" }}>
        <Row>
          {AUDIENCES.map((a, i) => (
            <Column key={a.label} className={i ? M.stackGap : M.stack} style={{ width: "50%", verticalAlign: "top", paddingLeft: i ? 6 : 0, paddingRight: i ? 0 : 6 }}>
              <Section className={M.box} style={{ backgroundColor: C.soft, borderRadius: 18, padding: "18px 18px 16px" }}>
                <Text style={{ margin: "0 0 6px", fontSize: 11, lineHeight: "15px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: C.cobalt }}>
                  {a.label}
                </Text>
                <Text style={{ margin: "0 0 6px", fontFamily: FONT_DISPLAY, fontSize: 16, lineHeight: "22px", fontWeight: 600, color: C.text }}>{a.title}</Text>
                <Text style={{ margin: 0, fontSize: 14, lineHeight: "21px", color: C.muted }}>{a.body}</Text>
              </Section>
            </Column>
          ))}
        </Row>
      </Section>
      <P>
        Try it free for {REVERSE_TRIAL.days} days, no credit card required. Plans from {formatPrice(ALERT_TIERS[0].price)} a month after that.
      </P>
      <Cta href={siteLink("/tariff-alerts", CAMPAIGN)} variant="next">
        Get Tariff Alerts for My Imports &rarr;
      </Cta>
      <Signature />
    </EmailLayout>
  )
}

DigestAlertsEmail.PreviewProps = {
  example: {
    label: "Example alert",
    updateTitle: "Section 301: Products of Brazil",
    code: "6403.99.60",
    country: "Brazil",
    description: "Leather footwear",
    beforePct: 10,
    afterPct: 35,
  },
  footer: {
    reason: "You're getting this because you subscribed to the weekly US tariff digest from HTS Hero.",
    manageUrl: "https://htshero.com/tariff-updates/subscription?token=example",
    unsubscribeUrl: "https://htshero.com/api/email/unsubscribe?token=example",
  },
} satisfies DigestAlertsEmailProps
