import { EmailFooter, EmailLayout } from "../kit/Layout"
import { Checklist, Cta, Eyebrow, Facts, P, Signature, Title } from "../kit/parts"
import { siteLink } from "../kit/brand"

// After a purchase: the receipt facts, then the three things that get the most out of the plan
// right away, and one button into the product.

export interface PurchaseConfirmationEmailProps {
  planName: string
  // "Monthly", "Annual", "One-time"
  billing: string
  // "Renews Nov 15, 2026" or "Access until Nov 15, 2026"
  term: string
  orderId: string
  purchasedOn: string
  product: "tracker" | "classify"
  // Tariff Tracker plans: how many imports it covers
  importsCovered?: number | null
  footer: EmailFooter
}

export const purchaseConfirmationSubject = (p: PurchaseConfirmationEmailProps) => `Purchase Confirmed: ${p.planName}`

const CAMPAIGN = "purchase"

export default function PurchaseConfirmationEmail(p: PurchaseConfirmationEmailProps) {
  const tracker = p.product === "tracker"
  return (
    <EmailLayout preview={`Your ${p.planName} plan is active. Here's what to do next.`} footer={p.footer}>
      <Eyebrow tone="down">Purchase confirmed</Eyebrow>
      <Title>{p.planName}</Title>
      <P>
        Thank you for choosing HTS Hero!{" "}
        {tracker
          ? `Alerts, savings and audits now cover ${p.importsCovered ? `up to ${p.importsCovered} imports` : "your imports"}.`
          : "Your classification plan is active."}
      </P>
      <Facts
        rows={[
          { label: "Plan", value: p.planName },
          { label: "Billing", value: `${p.billing} · ${p.term}` },
          { label: "Order", value: p.orderId },
          { label: "Date", value: p.purchasedOn },
        ]}
      />
      <P>Three things worth doing first:</P>
      <Checklist
        items={
          tracker
            ? [
              "Add the rest of your imports, so every one is covered",
              "Choose where alerts go (email, Slack or Microsoft Teams), so the right people hear the day a tariff change hits your imports",
              "Check for savings on your imports: trade programs, exemptions and lower-duty origins you may qualify for",
            ]
            : [
              "Start a classification from a product description",
              "Quickly see candidates, legal notes, and CROSS rulings",
              "Generate an audit-ready report for your files",
            ]
        }
      />
      <Cta href={siteLink(tracker ? "/tariff-tracker" : "/classifications", CAMPAIGN)} variant="next">
        {tracker ? "Open the Tariff Tracker" : "Start a classification"}
      </Cta>
      <P muted small>
        Sign in with this email address to use your plan. Manage billing any time from your account&apos;s settings.
      </P>
      <Signature />
    </EmailLayout>
  )
}

PurchaseConfirmationEmail.PreviewProps = {
  planName: "Tariff Tracker 30",
  billing: "Annual",
  term: "Renews Oct 15, 2027",
  orderId: "a1b2c3d4",
  purchasedOn: "Oct 15, 2026",
  product: "tracker",
  importsCovered: 30,
  footer: { reason: "You're getting this receipt because you bought an HTS Hero plan with this email." },
} satisfies PurchaseConfirmationEmailProps
