import { Link } from "@react-email/components"
import { EmailLayout, type EmailFooter } from "../kit/Layout"
import { Checklist, Cta, DarkHero, Divider, HeroMuted, P, Signature, UpdateBlock, type UpdateSummary } from "../kit/parts"
import { C, formatDay, siteLink } from "../kit/brand"
import { REVERSE_TRIAL } from "../../components/pricing-calculator/lib/pricing"

// The welcome to tariff news (libs/email/subscribers.ts sendWelcome): the moment someone confirms
// their subscription (`already` is no longer sent: an address that's already subscribed gets no
// email since 2026-11-04, and is kept only so past messages still open). It says they made a good call, when the
// first digest lands, what's in it, and shows the latest real updates so there's value on day one.
// Then: forward it to a colleague, make it fit (the manage link), and, quietly, Tariff Alerts.

export interface NewsWelcomeEmailProps {
  frequency: "instant" | "weekly" | "both"
  // The Monday the next digest goes out ("2026-11-09"); weekly and both only
  firstDigestOn: string | null
  recent: UpdateSummary[]
  manageUrl: string
  // The address was already subscribed: nothing changed, here's a welcome back and the manage link
  already?: boolean
  footer: EmailFooter
}

export const newsWelcomeSubject = ({ frequency, already }: NewsWelcomeEmailProps) =>
  already
    ? frequency === "weekly"
      ? "You're already getting the Weekly Tariff Digest"
      : "You're already getting US tariff updates"
    : frequency === "weekly"
      ? "Welcome to the Weekly Tariff Digest"
      : frequency === "both"
      ? "Welcome to US tariff updates and the Weekly Tariff Digest"
      : "Welcome to US tariff updates from HTS Hero"

const CAMPAIGN = "digest-welcome"

const WHAT = [
  "Every new US tariff action, in plain English",
  "The goods, HTS codes and countries each one covers",
  "When it takes effect, and how far it has got",
  "A link to the official document behind it",
]

export default function NewsWelcomeEmail({ frequency, firstDigestOn, recent, manageUrl, already = false, footer }: NewsWelcomeEmailProps) {
  const weekly = frequency === "weekly"
  const both = frequency === "both"
  const when = (weekly || both) && firstDigestOn ? `Monday, ${formatDay(firstDigestOn).replace(/, \d{4}$/, "")}` : "Monday"
  const next = both
    ? `Each new action lands the moment it moves, and your first digest ${when}.`
    : weekly
      ? `Your ${already ? "next" : "first"} tariff digest lands ${when}.`
      : "Each new action lands the moment it moves."
  return (
    <EmailLayout preview={`${already ? "You're already on the list." : "You're in."} ${next}`} footer={footer}>
      <DarkHero
        eyebrow={weekly ? "The Weekly Tariff Digest" : "US tariff updates"}
        title={
          <>
            {already ? "You're already on the list." : "You're in!"}
            <br />
            <HeroMuted>{next}</HeroMuted>
          </>
        }
      >
        {/* {already
          ? "Great minds. This address already gets every US tariff change from HTS Hero, so nothing has changed: you're all set."
          : "Good call. From now on, no US tariff change gets past you: what changed, for which goods and countries, and from when, without the hours of reading."} */}
      </DarkHero>

      <P>
        {both
          ? "Each new US tariff action comes to your inbox as it happens, and every Monday you'll get the week's recap, with:"
          : weekly
            ? "Every Monday, you'll get an email with every new US tariff action from the week before:"
            : "Each one comes to your inbox as it happens, with:"}
      </P>
      <Checklist items={WHAT} />

      {recent.length > 0 && (
        <>
          <Divider />
          <P>
            <strong>{already ? "In case you missed it, here's the latest tariff news:" : "While you wait, here's the latest tariff news:"}</strong>
          </P>
          {recent.map((u, i) => (
            <div key={u.slug}>
              {i > 0 && <Divider />}
              <UpdateBlock update={u} campaign={CAMPAIGN} compact />
            </div>
          ))}
        </>
      )}

      <Cta href={siteLink("/tariff-updates", CAMPAIGN)} variant="next">
        See Every Tariff Update &rarr;
      </Cta>

      <P small>
        <strong>Know someone who should get it?</strong> Forward this email, or send them{" "}
        <Link href={siteLink("/tariff-digest", `${CAMPAIGN}-share`)} style={{ color: C.cobalt, fontWeight: 600 }}>
          htshero.com/tariff-digest
        </Link>
        .
      </P>
      <P small>
        <strong>Want it to fit you?</strong> Pick the laws and countries you follow, or switch between weekly, as it happens, or both:{" "}
        <Link href={manageUrl} style={{ color: C.cobalt, fontWeight: 600 }}>
          choose what you get
        </Link>
        .
      </P>
      <Signature />

      <Divider />
      <P muted small>
        Want to know the moment a tariff hits your own imports, or your clients&apos;?{" "}
        <Link href={siteLink("/tariff-alerts", CAMPAIGN)} style={{ color: C.cobalt, fontWeight: 600 }}>
          Try Tariff Alerts free for {REVERSE_TRIAL.days} days
        </Link>
        , no credit card required.
      </P>
    </EmailLayout>
  )
}

NewsWelcomeEmail.PreviewProps = {
  frequency: "weekly",
  firstDigestOn: "2026-11-09",
  recent: [
    {
      slug: "example-1",
      title: "Commerce defines \"U.S. content\" for USMCA metal goods under Proclamation 11032 tariffs",
      summary: "A Bureau of Industry and Security notice gives CBP guidance on assessing \"U.S. content\" under the Section 232 metal tariffs.",
      authorityLabel: "Section 232",
      stageLabel: "Published",
      effectiveOn: "2026-10-14",
      countriesLabel: "Canada, Mexico",
      tone: "up",
    },
    {
      slug: "example-2",
      title: "USTR conforms China Section 301 exclusion 20(vvv)(i)(20) to new HTS statistical number",
      summary: "USTR makes a conforming amendment to a Section 301 product exclusion so it follows the item's new HTS number.",
      authorityLabel: "Section 301",
      stageLabel: "CBP guidance",
      effectiveOn: "2026-07-01",
      countriesLabel: "China",
      tone: "brand",
    },
  ],
  manageUrl: "https://htshero.com/tariff-updates/subscription?token=example",
  footer: {
    reason: "You're getting this because you subscribed to US tariff updates from HTS Hero.",
    manageUrl: "https://htshero.com/tariff-updates/subscription?token=example",
    unsubscribeUrl: "https://htshero.com/api/email/unsubscribe?token=example",
  },
} satisfies NewsWelcomeEmailProps
