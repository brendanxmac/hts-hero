import { Column, Img, Row, Section, Text } from "@react-email/components"
import { EmailLayout } from "../../kit/Layout"
import { Cta, Eyebrow, FeatureList, P, ReplyNote, Signature, Subtitle, Title, TRACKER_FEATURES } from "../../kit/parts"
import { blackFridayHeroUrl, C, FONT_DISPLAY, FONT_SANS, siteLink } from "../../kit/brand"
import type { MarketingEmailProps } from "../../kit/marketing"
import { MARKETING_PREVIEW_FOOTER } from "../../kit/marketing"
import { ALERT_TIERS, AUDIT_TIERS, formatPrice } from "../../../components/pricing-calculator/lib/pricing"
import { SALE, saleAnnual } from "../../../libs/black-friday"

// The Black Friday 2026 sale (libs/black-friday.ts), to every account. Sent from the Content
// Studio's Marketing Emails tab: pick "Account emails on" there to leave out anyone who turned
// account emails off as well as anyone who unsubscribed.
//
// To change the words, edit COPY below (the subject and preview line can also be changed in the
// studio before sending). The prices come from the plans and the sale, so they stay right.
// The animated hero: emails/assets/black-friday (npm run email:render-black-friday, then
// npm run email:upload-logo for each Supabase project).

export const subject = "40% off Duty Guard (ends Dec 3)"
export const preview = "Our Black Friday sale: every annual plan, Essentials and Pro. Applied automatically at checkout."

const COPY = {
  eyebrow: `${SALE.name} · Ends ${SALE.endsLabel}`,
  title: `${SALE.percentOff}% Off Duty Guard`,
  intro:
    "Tariffs keep changing, and any change can land on the products you import. Duty Guard watches every one of them for you: it alerts you the moment a new tariff hits one, shows the rate before and after, and on Pro audits your entries and finds savings you may qualify for.",
  offer: `Through Thursday, December 3, every annual plan is ${SALE.percentOff}% off for the first year. Essentials and Pro, any size. There's no code to enter: the discount is applied automatically at checkout.`,
  button: `Claim ${SALE.percentOff}% Off →`,
  featuresTitle: "What Duty Guard Watches For You",
  fine: `Billed yearly: ${SALE.percentOff}% off your first year, then the regular annual price. 30-day money-back guarantee. Cancel anytime.`,
}

const CAMPAIGN = "black-friday-2026"

const OFFERS = [
  { name: "Duty Guard Essentials", what: "Tariff alerts and impact checks", deal: saleAnnual(ALERT_TIERS[0].price) },
  { name: "Duty Guard Pro", what: "Everything in Essentials, plus entry audits and savings detection", deal: saleAnnual(AUDIT_TIERS[0].price) },
]

export default function BlackFridayEmail({ footer, preview: previewLine = preview }: MarketingEmailProps) {
  return (
    <EmailLayout preview={previewLine} footer={footer}>
      <Eyebrow tone="heads-up">{COPY.eyebrow}</Eyebrow>
      <Title>{COPY.title}</Title>
      {/* Animated (a GIF); its first frame carries the whole offer, for Outlook, which shows only that */}
      <Img
        src={blackFridayHeroUrl()}
        alt={`${SALE.name}: ${SALE.percentOff}% off Duty Guard. Essentials from ${formatPrice(OFFERS[0].deal.sale)}/mo, Pro from ${formatPrice(OFFERS[1].deal.sale)}/mo. Ends ${SALE.endsLabel}.`}
        width="496"
        style={{ display: "block", width: "100%", maxWidth: 496, height: "auto", margin: "4px 0 24px", border: 0, borderRadius: 18, backgroundColor: "#0B0D14", fontFamily: FONT_SANS, fontSize: 13, lineHeight: "20px", color: C.surface }}
      />
      <P>{COPY.intro}</P>
      <P>
        <strong>{COPY.offer}</strong>
      </P>

      {/* The from-prices, struck through against the annual price really charged */}
      <Section style={{ margin: "4px 0 20px" }}>
        {OFFERS.map((o, i) => (
          <Section key={o.name} style={{ backgroundColor: C.soft, border: `1px solid ${C.border}`, borderRadius: 16, padding: "14px 16px", marginTop: i ? 8 : 0 }}>
            <Row>
              <Column style={{ verticalAlign: "top" }}>
                <Text style={{ margin: 0, fontFamily: FONT_DISPLAY, fontSize: 16, lineHeight: "22px", fontWeight: 600, color: C.text }}>{o.name}</Text>
                <Text style={{ margin: "2px 0 0", fontSize: 13, lineHeight: "19px", color: C.muted }}>{o.what}</Text>
              </Column>
              <Column style={{ width: 150, verticalAlign: "top", textAlign: "right" }}>
                <Text style={{ margin: 0, fontSize: 12, lineHeight: "16px", color: C.muted }}>
                  from <span style={{ textDecoration: "line-through" }}>{formatPrice(o.deal.usual)}</span>
                </Text>
                <Text style={{ margin: 0, fontFamily: FONT_DISPLAY, fontSize: 22, lineHeight: "28px", fontWeight: 700, color: C.green }}>
                  {formatPrice(o.deal.sale)}
                  <span style={{ fontFamily: FONT_SANS, fontSize: 12, fontWeight: 500, color: C.muted }}>/mo</span>
                </Text>
              </Column>
            </Row>
          </Section>
        ))}
      </Section>

      {/* The sale's page: the plans, no sign-in until one is picked */}
      <Cta href={siteLink("/black-friday", CAMPAIGN)} variant="money">
        {COPY.button}
      </Cta>
      <P muted small>
        {COPY.fine}
      </P>
      {/* What every plan watches for, under the button for anyone still deciding */}
      <Subtitle>{COPY.featuresTitle}</Subtitle>
      <FeatureList items={TRACKER_FEATURES} />
      <ReplyNote />
      <Signature />
    </EmailLayout>
  )
}

BlackFridayEmail.PreviewProps = { footer: MARKETING_PREVIEW_FOOTER, preview } satisfies MarketingEmailProps
