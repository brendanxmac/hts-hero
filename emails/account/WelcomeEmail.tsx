import { ReactNode } from "react"
import { Section, Text } from "@react-email/components"
import { EmailFooter, EmailLayout } from "../kit/Layout"
import { Checklist, Cta, Eyebrow, P, Title, TRACKER_POINTS, UpdateSummary } from "../kit/parts"
import { C, FONT_DISPLAY, siteLink } from "../kit/brand"
import { REVERSE_TRIAL } from "../../components/pricing-calculator/lib/pricing"
import { FREE_FOREVER_SHORT } from "../../components/ui/marketing/comingSoon"

// Sent the moment an account is created. General, like the old one: welcome to HTS Hero, then the
// two places to start, each a card with what it does and one button (the Tariff Tracker, led by the
// 14-day reverse trial that started with the account, then the Classification Assistant), then a
// note from Brendan that he's a reply away.

export interface WelcomeEmailProps {
  // Not shown any more; the sign-up webhook still passes it
  latestUpdate?: UpdateSummary | null
  footer: EmailFooter
}

export const welcomeSubject = () => "Welcome to HTS Hero"

const CAMPAIGN = "welcome"

const Card = ({ title, intro, children }: { title: string; intro: string; children: ReactNode }) => (
  <Section style={{ border: `1px solid ${C.border}`, borderRadius: 18, padding: "22px 22px 0", margin: "0 0 16px" }}>
    <Text style={{ margin: "0 0 6px", fontFamily: FONT_DISPLAY, fontSize: 19, lineHeight: "25px", fontWeight: 600, color: C.text }}>{title}</Text>
    <Text style={{ margin: "0 0 12px", fontSize: 15, lineHeight: "22px", color: C.muted }}>{intro}</Text>
    {children}
  </Section>
)

export default function WelcomeEmail({ footer }: WelcomeEmailProps) {
  return (
    <EmailLayout
      preview={`Your ${REVERSE_TRIAL.days}-day Tariff Tracker trial has started: everything, on up to ${REVERSE_TRIAL.imports} imports. Here's where to start.`}
      footer={footer}
    >
      <Eyebrow>Welcome</Eyebrow>
      <Title>Welcome to HTS Hero!</Title>
      <P>Thanks for signing up. There are two ways to get started:</P>

      <Card
        title="Tariff Tracker: Your Free Trial Has Started"
        intro={`For the next ${REVERSE_TRIAL.days} days you get everything the Tracker does, on up to ${REVERSE_TRIAL.imports} imports, with no credit card. Add your imports once and we watch them for you.`}
      >
        <Checklist items={TRACKER_POINTS} />
        <Text style={{ margin: "0 0 12px", fontSize: 13, lineHeight: "20px", color: C.muted }}>
          After {REVERSE_TRIAL.days} days, {FREE_FOREVER_SHORT} stay free, forever. Nothing is deleted.
        </Text>
        <Cta href={siteLink("/tariff-tracker?tab=catalog&add=paste", CAMPAIGN)} variant="next">
          Open the Tariff Tracker
        </Cta>
      </Card>

      <Card title="Classification Assistant" intro="Find the right HTS code for a product, with the reasoning to back it up.">
        <Checklist
          items={[
            "Find the candidate codes in minutes",
            "Back every code with legal notes and CROSS rulings",
            "Catch the headings you might have missed",
            "Download an audit-ready classification report",
          ]}
        />
        <Cta href={siteLink("/classifications/new", CAMPAIGN)}>Classify a product</Cta>
      </Card>

      <Text style={{ margin: "20px 0 0", fontSize: 16, lineHeight: "25px", color: C.text }}>
        If you have a question, an idea, or get stuck anywhere, just reply to this email. It comes straight to me, and I&apos;m happy to help any time.
      </Text>
      <Text style={{ margin: "18px 0 0", fontSize: 15, lineHeight: "22px", color: C.text }}>
        Brendan
        <br />
        <span style={{ color: C.muted, fontSize: 13 }}>Founder, HTS Hero</span>
      </Text>
    </EmailLayout>
  )
}

WelcomeEmail.PreviewProps = {
  latestUpdate: {
    slug: "commerce-defines-u-s-content",
    title: 'Commerce defines "U.S. content" for USMCA metal goods under Proclamation 11032',
    summary: "A Bureau of Industry and Security notice tells CBP how to assess U.S. content for metal goods entered under USMCA.",
    authorityLabel: "Section 232",
    stageLabel: "Published",
    effectiveOn: null,
    countriesLabel: "Canada, Mexico",
    tone: "brand",
  },
  footer: { reason: "You're getting this because you created an HTS Hero account with this email." },
} satisfies WelcomeEmailProps
