import { ReactElement } from "react"
import { render } from "@react-email/render"
import WelcomeEmail, { welcomeSubject, type WelcomeEmailProps } from "./account/WelcomeEmail"
import PurchaseConfirmationEmail, { purchaseConfirmationSubject, type PurchaseConfirmationEmailProps } from "./account/PurchaseConfirmationEmail"
import DemoRequestEmail, { demoRequestSubject, type DemoRequestEmailProps } from "./leads/DemoRequestEmail"
import PlaybookEmail, { playbookSubject, type PlaybookEmailProps } from "./leads/PlaybookEmail"
import AuditRequestReceivedEmail, { auditRequestReceivedSubject, type AuditRequestReceivedEmailProps } from "./leads/AuditRequestReceivedEmail"
import InternalNoticeEmail, { internalNoticeSubject, type InternalNoticeEmailProps } from "./internal/InternalNoticeEmail"
import NewsConfirmEmail, { newsConfirmSubject, type NewsConfirmEmailProps } from "./tariff-updates/NewsConfirmEmail"
import NewsManageLinkEmail, { newsManageLinkSubject, type NewsManageLinkEmailProps } from "./tariff-updates/NewsManageLinkEmail"
import OnboardingEmail, { onboardingSubject, type OnboardingEmailProps } from "./onboarding/OnboardingEmail"
import FounderNoteEmail, { founderNoteSubject, type FounderNoteEmailProps } from "./onboarding/FounderNoteEmail"
import TrackerFindingsEmail, { trackerFindingsSubject, type TrackerFindingsEmailProps } from "./onboarding/TrackerFindingsEmail"
import MeetTrackerEmail, { meetTrackerSubject, type MeetTrackerEmailProps } from "./onboarding/MeetTrackerEmail"
import ImpactAlertEmail, { impactAlertSubject, type ImpactAlertEmailProps } from "./tariff-updates/ImpactAlertEmail"
import TariffDigestEmail, { tariffDigestSubject, type TariffDigestEmailProps } from "./tariff-updates/TariffDigestEmail"
import TariffNewsEmail, { tariffNewsSubject, type TariffNewsEmailProps } from "./tariff-updates/TariffNewsEmail"
import { updateUrl } from "./kit/parts"
import { SITE } from "./kit/brand"

// Every template the outbox can send, by name. Messages store a template name and its props, not
// HTML, so they're rendered when reviewed and again when sent (a template fix applies to messages
// still waiting). Each template also says how it reads in Slack and Teams: a title, a few lines
// and a link.

export interface ChatMessage {
  title: string
  lines: string[]
  url: string
  linkLabel: string
}

interface Template<P> {
  subject: (props: P) => string
  email: (props: P) => ReactElement
  // Templates that only ever go by email (receipts, confirmations) have none
  chat?: (props: P) => ChatMessage
}

const template = <P,>(t: Template<P>) => t

export const TEMPLATES = {
  tariff_news: template<TariffNewsEmailProps>({
    subject: tariffNewsSubject,
    email: (p) => <TariffNewsEmail {...p} />,
    chat: (p) => ({
      title: `US tariff update${p.step ? ` · ${p.step}` : ""}: ${p.update.title}`,
      lines: [p.note, p.update.summary, [p.update.authorityLabel, p.update.stageLabel, p.update.effectiveOn ? `effective ${p.update.effectiveOn}` : null].filter(Boolean).join(" · ")].filter(Boolean) as string[],
      url: updateUrl(p.update.slug, "tariff-news-chat"),
      linkLabel: "Read the update",
    }),
  }),
  tariff_digest: template<TariffDigestEmailProps>({
    subject: tariffDigestSubject,
    email: (p) => <TariffDigestEmail {...p} />,
    chat: (p) => ({
      title: `US tariff updates, ${p.period}`,
      lines: [p.note, ...p.updates.map((u) => `• ${u.title}`)].filter(Boolean) as string[],
      url: `${SITE}/tariff-updates?utm_source=chat&utm_medium=chat&utm_campaign=tariff-digest`,
      linkLabel: "See every tariff update",
    }),
  }),
  impact_alert: template<ImpactAlertEmailProps>({
    subject: impactAlertSubject,
    email: (p) => <ImpactAlertEmail {...p} />,
    chat: (p) => ({
      title: impactAlertSubject(p),
      lines: [
        p.update.summary,
        ...p.imports.slice(0, 6).map((i) =>
          i.level === "likely"
            ? `• ${i.code} from ${i.country}: may apply`
            : Number(i.beforePct) === Number(i.afterPct)
              ? `• ${i.code} from ${i.country}: new Chapter 99 number, same duty`
              : `• ${i.code} from ${i.country}: ${i.beforePct}% → ${i.afterPct}%`
        ),
        ...(p.imports.length > 6 ? [`…and ${p.imports.length - 6} more`] : []),
        ...(p.beyond ? [`It may also affect ${p.beyond} more of your imports outside your alerts.`] : []),
        ...(p.removed.length ? [`No longer affected: ${p.removed.map((r) => `${r.code} from ${r.country}`).join(", ")}`] : []),
      ],
      url: `${SITE}/tariff-tracker?tab=impact&update=${encodeURIComponent(p.update.slug)}&utm_source=chat&utm_medium=chat&utm_campaign=impact-alert`,
      linkLabel: "See the impact on my imports",
    }),
  }),
  welcome: template<WelcomeEmailProps>({ subject: welcomeSubject, email: (p) => <WelcomeEmail {...p} /> }),
  purchase_confirmation: template<PurchaseConfirmationEmailProps>({ subject: purchaseConfirmationSubject, email: (p) => <PurchaseConfirmationEmail {...p} /> }),
  demo_request: template<DemoRequestEmailProps>({ subject: demoRequestSubject, email: (p) => <DemoRequestEmail {...p} /> }),
  playbook: template<PlaybookEmailProps>({ subject: playbookSubject, email: (p) => <PlaybookEmail {...p} /> }),
  audit_request_received: template<AuditRequestReceivedEmailProps>({ subject: auditRequestReceivedSubject, email: (p) => <AuditRequestReceivedEmail {...p} /> }),
  news_confirm: template<NewsConfirmEmailProps>({ subject: newsConfirmSubject, email: (p) => <NewsConfirmEmail {...p} /> }),
  news_manage_link: template<NewsManageLinkEmailProps>({ subject: newsManageLinkSubject, email: (p) => <NewsManageLinkEmail {...p} /> }),
  onboarding: template<OnboardingEmailProps>({ subject: onboardingSubject, email: (p) => <OnboardingEmail {...p} /> }),
  founder_note: template<FounderNoteEmailProps>({ subject: founderNoteSubject, email: (p) => <FounderNoteEmail {...p} /> }),
  tracker_findings: template<TrackerFindingsEmailProps>({ subject: trackerFindingsSubject, email: (p) => <TrackerFindingsEmail {...p} /> }),
  meet_tracker: template<MeetTrackerEmailProps>({ subject: meetTrackerSubject, email: (p) => <MeetTrackerEmail {...p} /> }),
  internal_notice: template<InternalNoticeEmailProps>({ subject: internalNoticeSubject, email: (p) => <InternalNoticeEmail {...p} /> }),
}

export type TemplateName = keyof typeof TEMPLATES

export const isTemplate = (name: string): name is TemplateName => name in TEMPLATES

// The batch's note is added at render time, so editing it in the outbox changes every message
const withNote = (props: Record<string, unknown>, note: string | null | undefined) => (note ? { ...props, note } : props)

export const renderEmail = async (name: string, props: Record<string, unknown>, note?: string | null) => {
  if (!isTemplate(name)) throw new Error(`No email template named ${name}`)
  const t = TEMPLATES[name] as unknown as Template<Record<string, unknown>>
  const p = withNote(props, note)
  const element = t.email(p)
  const [html, text] = await Promise.all([render(element), render(element, { plainText: true })])
  return { subject: t.subject(p), html, text }
}

export const subjectOf = (name: string, props: Record<string, unknown>) => {
  if (!isTemplate(name)) throw new Error(`No email template named ${name}`)
  return (TEMPLATES[name] as unknown as Template<Record<string, unknown>>).subject(props)
}

export const renderChat = (name: string, props: Record<string, unknown>, note?: string | null): ChatMessage => {
  if (!isTemplate(name)) throw new Error(`No template named ${name}`)
  const chat = (TEMPLATES[name] as unknown as Template<Record<string, unknown>>).chat
  if (!chat) throw new Error(`${name} only goes by email`)
  return chat(withNote(props, note))
}

// Slack incoming webhook: Block Kit
export const slackPayload = (m: ChatMessage) => ({
  text: m.title,
  blocks: [
    { type: "section", text: { type: "mrkdwn", text: `*${m.title}*` } },
    ...m.lines.map((line) => ({ type: "section", text: { type: "mrkdwn", text: line } })),
    { type: "actions", elements: [{ type: "button", text: { type: "plain_text", text: m.linkLabel }, url: m.url }] },
  ],
})

// Microsoft Teams webhook (Workflows "post to a channel when a webhook request is received"):
// an Adaptive Card
export const teamsPayload = (m: ChatMessage) => ({
  type: "message",
  attachments: [
    {
      contentType: "application/vnd.microsoft.card.adaptive",
      content: {
        $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
        type: "AdaptiveCard",
        version: "1.4",
        body: [
          { type: "TextBlock", text: m.title, weight: "Bolder", size: "Medium", wrap: true },
          ...m.lines.map((line) => ({ type: "TextBlock", text: line, wrap: true })),
        ],
        actions: [{ type: "Action.OpenUrl", title: m.linkLabel, url: m.url }],
      },
    },
  ],
})
