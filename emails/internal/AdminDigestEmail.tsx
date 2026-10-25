import { Column, Link, Row, Section, Text } from "@react-email/components"
import { EmailLayout } from "../kit/Layout"
import { Cta, Divider, Eyebrow, P, Subtitle, Title } from "../kit/parts"
import { C, SITE, TONES, type Tone } from "../kit/brand"

// For the admin, every morning at 7 a.m. Bangkok (/api/cron/admin-digest): what needs them across
// the admin tools (libs/admin/queue.ts), most urgent first, each with a link straight to it.

interface DigestItem {
  group: "blocking" | "health" | "whenever"
  tone: "error" | "warning" | "primary" | "neutral"
  title: string
  detail: string
  action: string
  href: string
  entries?: { label: string; href: string; meta?: string }[]
}

export interface AdminDigestEmailProps {
  // "Friday, October 24"
  day: string
  items: DigestItem[]
}

const GROUPS: { id: DigestItem["group"]; title: string }[] = [
  { id: "blocking", title: "Holding Things Up" },
  { id: "health", title: "Something's Broken" },
  { id: "whenever", title: "When You Have Time" },
]

const TONE: Record<DigestItem["tone"], Tone> = { error: "up", warning: "heads-up", primary: "brand", neutral: "neutral" }

const url = (href: string) => `${SITE}${href}${href.includes("?") ? "&" : "?"}utm_source=email&utm_medium=email&utm_campaign=admin-digest`

const headline = (items: DigestItem[]) => {
  const blocking = items.filter((i) => i.group === "blocking").length
  const broken = items.filter((i) => i.group === "health").length
  if (!blocking && !broken) return items.length ? "Nothing urgent today" : "Nothing needs you today"
  const parts = [blocking && `${blocking} thing${blocking === 1 ? "" : "s"} waiting on you`, broken && `${broken} thing${broken === 1 ? "" : "s"} broken`].filter(Boolean)
  return parts.join(", ")
}

export const adminDigestSubject = (p: AdminDigestEmailProps) => `Admin: ${headline(p.items)}`

const Item = ({ item }: { item: DigestItem }) => (
  <Section style={{ borderLeft: `3px solid ${TONES[TONE[item.tone]].fg}`, padding: "2px 0 2px 14px", margin: "0 0 18px" }}>
    <Text style={{ margin: "0 0 2px", fontSize: 15, lineHeight: "21px", fontWeight: 700, color: C.text }}>{item.title}</Text>
    <Text style={{ margin: "0 0 8px", fontSize: 13, lineHeight: "19px", color: C.muted }}>{item.detail}</Text>
    {item.entries?.map((e) => (
      <Row key={`${e.href}${e.label}`} style={{ marginBottom: 4 }}>
        <Column>
          <Link href={url(e.href)} style={{ fontSize: 13, lineHeight: "19px", color: C.cobalt, textDecoration: "none" }}>
            {e.label}
          </Link>
          {e.meta && <span style={{ fontSize: 12, color: C.faint }}> · {e.meta}</span>}
        </Column>
      </Row>
    ))}
    <Link href={url(item.href)} style={{ display: "inline-block", marginTop: 6, fontSize: 13, fontWeight: 700, color: C.cobalt, textDecoration: "none" }}>
      {item.action} →
    </Link>
  </Section>
)

export default function AdminDigestEmail({ day, items }: AdminDigestEmailProps) {
  const title = headline(items)
  return (
    <EmailLayout preview={items[0]?.title ?? "Everything is running on its own."} footer={{ reason: "Sent to the HTS Hero admin every morning at 7 a.m. Bangkok time." }}>
      <Eyebrow tone={items.some((i) => i.group !== "whenever") ? "heads-up" : "down"}>Admin · {day}</Eyebrow>
      <Title size={24}>{title}</Title>
      {items.length === 0 ? (
        <P muted>Tariff updates, alerts and emails are all moving on their own. Nothing is waiting for you.</P>
      ) : (
        GROUPS.map((g) => {
          const list = items.filter((i) => i.group === g.id)
          if (!list.length) return null
          return (
            <Section key={g.id} style={{ marginTop: 8 }}>
              <Subtitle>{g.title}</Subtitle>
              {list.map((item) => (
                <Item key={item.title} item={item} />
              ))}
            </Section>
          )
        })
      )}
      <Divider />
      <Cta href={url("/admin")} variant="next">
        Open Needs You
      </Cta>
    </EmailLayout>
  )
}

AdminDigestEmail.PreviewProps = {
  day: "Friday, October 24",
  items: [
    {
      group: "blocking",
      tone: "warning",
      title: "2 tariff updates to review",
      detail: "No news email or import alerts go out for these until you clear them.",
      action: "Review",
      href: "/tariff-sources?view=review",
      entries: [
        { label: "US raises Section 232 duties on steel derivatives to 50%", href: "/tariff-sources?update=1", meta: "Oct 23" },
        { label: "CBP guidance on the Brazil IEEPA exemption list", href: "/tariff-sources?update=2", meta: "Oct 22" },
      ],
    },
    {
      group: "blocking",
      tone: "warning",
      title: "1 impact check to approve",
      detail: "14 accounts won't get import alerts until you check and approve.",
      action: "Check and approve",
      href: "/tariff-sources?update=3",
    },
    {
      group: "whenever",
      tone: "primary",
      title: "8 post ideas from Oct 23",
      detail: "Ready-made posts from the tariff data. Use one or skip them.",
      action: "Open Content Studio",
      href: "/content-studio",
    },
  ],
} satisfies AdminDigestEmailProps
