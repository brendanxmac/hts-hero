import { ReactElement } from "react"
import { render } from "@react-email/render"
import WelcomeEmail, { welcomeSubject, type WelcomeEmailProps } from "./account/WelcomeEmail"
import PurchaseConfirmationEmail, { purchaseConfirmationSubject, type PurchaseConfirmationEmailProps } from "./account/PurchaseConfirmationEmail"
import PlaybookEmail, { playbookSubject, type PlaybookEmailProps } from "./leads/PlaybookEmail"
import AuditRequestReceivedEmail, { auditRequestReceivedSubject, type AuditRequestReceivedEmailProps } from "./leads/AuditRequestReceivedEmail"
import InternalNoticeEmail, { internalNoticeSubject, type InternalNoticeEmailProps } from "./internal/InternalNoticeEmail"
import AdminDigestEmail, { adminDigestSubject, type AdminDigestEmailProps } from "./internal/AdminDigestEmail"
import NewsConfirmEmail, { newsConfirmSubject, type NewsConfirmEmailProps } from "./tariff-updates/NewsConfirmEmail"
import NewsManageLinkEmail, { newsManageLinkSubject, type NewsManageLinkEmailProps } from "./tariff-updates/NewsManageLinkEmail"
import OnboardingEmail, { onboardingSubject, type OnboardingEmailProps } from "./onboarding/OnboardingEmail"
import FounderNoteEmail, { founderNoteSubject, type FounderNoteEmailProps } from "./onboarding/FounderNoteEmail"
import TrackerFindingsEmail, { trackerFindingsSubject, type TrackerFindingsEmailProps } from "./onboarding/TrackerFindingsEmail"
import MeetTrackerEmail, { meetTrackerSubject, type MeetTrackerEmailProps } from "./onboarding/MeetTrackerEmail"
import TrackerIntroEmail, { trackerIntroSubject, type TrackerIntroEmailProps } from "./onboarding/TrackerIntroEmail"
import ProductTourEmail, { productTourSubject, type ProductTourEmailProps } from "./onboarding/ProductTourEmail"
import TrialEmail, { trialSubject, type TrialEmailProps } from "./onboarding/TrialEmail"
import ImpactAlertEmail, { impactAlertSubject, type ImpactAlertEmailProps } from "./tariff-updates/ImpactAlertEmail"
import TariffDigestEmail, { tariffDigestSubject, type TariffDigestEmailProps } from "./tariff-updates/TariffDigestEmail"
import TariffNewsEmail, { tariffNewsSubject, type TariffNewsEmailProps } from "./tariff-updates/TariffNewsEmail"
import { updateUrl } from "./kit/parts"
import { SITE } from "./kit/brand"
import { AUTHORITIES } from "../libs/tariff-updates/types"
import { chatDate, rateChange, type ChatMessage } from "./chat"

export { slackPayload, teamsPayload, type ChatMessage } from "./chat"

// Every template the outbox can send, by name. Messages store a template name and its props, not
// HTML, so they're rendered when reviewed and again when sent (a template fix applies to messages
// still waiting). Each template also says how it reads in Slack and Teams (emails/chat.ts).

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
      title: p.step ? `${p.step}: ${p.update.title}` : p.update.title,
      tone: p.update.tone,
      eyebrow: `US tariff news · ${p.update.authorityLabel}`,
      summary: [p.note ? `*${p.note}*` : null, p.update.summary].filter(Boolean).join("\n\n"),
      facts: [
        { label: "Stage", value: p.update.stageLabel },
        ...(p.update.effectiveOn ? [{ label: "Effective", value: chatDate(p.update.effectiveOn) }] : []),
        ...(p.update.countriesLabel ? [{ label: "Countries", value: p.update.countriesLabel }] : []),
      ],
      actions: [{ label: "Read the update", url: updateUrl(p.update.slug, "tariff-news-chat") }],
    }),
  }),
  tariff_digest: template<TariffDigestEmailProps>({
    subject: tariffDigestSubject,
    email: (p) => <TariffDigestEmail {...p} />,
    chat: (p) => ({
      title: `${p.updates.length} US tariff ${p.updates.length === 1 ? "update" : "updates"} this week`,
      tone: "brand",
      eyebrow: `Weekly tariff digest · ${p.period}`,
      summary: p.note ? `*${p.note}*` : undefined,
      rows: p.updates.slice(0, 8).map((u) => ({
        label: u.title,
        url: updateUrl(u.slug, "tariff-digest-chat"),
        detail: [u.authorityLabel, u.stageLabel, u.effectiveOn ? `effective ${chatDate(u.effectiveOn)}` : null, u.countriesLabel].filter(Boolean).join(" · "),
      })),
      notes: p.updates.length > 8 ? [`…and ${p.updates.length - 8} more this week`] : undefined,
      actions: [{ label: "See every tariff update", url: `${SITE}/tariff-updates?utm_source=chat&utm_medium=chat&utm_campaign=tariff-digest` }],
    }),
  }),
  impact_alert: template<ImpactAlertEmailProps>({
    subject: impactAlertSubject,
    email: (p) => <ImpactAlertEmail {...p} />,
    chat: (p) => {
      const adcvd = p.update.authorityLabel === AUTHORITIES.ad_cvd
      const onlyRemoved = !p.imports.length && !p.beyond && p.removed.length > 0
      const shown = p.imports.slice(0, 6)
      return {
        title: impactAlertSubject(p),
        tone: onlyRemoved ? "down" : adcvd ? "heads-up" : "up",
        eyebrow: ["Tariff alert", p.update.authorityLabel, p.update.countriesLabel].filter(Boolean).join(" · "),
        summary: `*${p.update.title}*\n${[p.update.stageLabel, p.update.effectiveOn ? `Effective ${chatDate(p.update.effectiveOn)}` : null].filter(Boolean).join(" · ")}`,
        rows: [
          ...shown.map((i) => {
            const change = rateChange(i.beforePct, i.afterPct)
            return {
              label: `${i.code} · ${i.country}`,
              detail: i.description || undefined,
              value: i.level === "likely" || !change ? (adcvd ? "May be covered" : "May apply") : change.value,
              tone: i.level === "likely" || !change ? ("heads-up" as const) : change.tone,
            }
          }),
          ...p.removed.slice(0, 6 - shown.length).map((r) => ({ label: `${r.code} · ${r.country}`, detail: r.description || undefined, value: "No longer affected", tone: "down" as const })),
        ],
        notes: [
          ...(p.imports.length > 6 ? [`…and ${p.imports.length - 6} more of your imports`] : []),
          ...(p.beyond ? [`It may also affect ${p.beyond} more of your imports outside your alerts.`] : []),
        ],
        actions: [
          { label: "See the impact on my imports", url: `${SITE}/tariff-tracker?tab=impact&update=${encodeURIComponent(p.update.slug)}&utm_source=chat&utm_medium=chat&utm_campaign=impact-alert` },
          { label: "Read the update", url: updateUrl(p.update.slug, "impact-alert-chat") },
        ],
      }
    },
  }),
  welcome: template<WelcomeEmailProps>({ subject: welcomeSubject, email: (p) => <WelcomeEmail {...p} /> }),
  purchase_confirmation: template<PurchaseConfirmationEmailProps>({ subject: purchaseConfirmationSubject, email: (p) => <PurchaseConfirmationEmail {...p} /> }),
  playbook: template<PlaybookEmailProps>({ subject: playbookSubject, email: (p) => <PlaybookEmail {...p} /> }),
  audit_request_received: template<AuditRequestReceivedEmailProps>({ subject: auditRequestReceivedSubject, email: (p) => <AuditRequestReceivedEmail {...p} /> }),
  news_confirm: template<NewsConfirmEmailProps>({ subject: newsConfirmSubject, email: (p) => <NewsConfirmEmail {...p} /> }),
  news_manage_link: template<NewsManageLinkEmailProps>({ subject: newsManageLinkSubject, email: (p) => <NewsManageLinkEmail {...p} /> }),
  onboarding: template<OnboardingEmailProps>({ subject: onboardingSubject, email: (p) => <OnboardingEmail {...p} /> }),
  founder_note: template<FounderNoteEmailProps>({ subject: founderNoteSubject, email: (p) => <FounderNoteEmail {...p} /> }),
  tracker_findings: template<TrackerFindingsEmailProps>({ subject: trackerFindingsSubject, email: (p) => <TrackerFindingsEmail {...p} /> }),
  meet_tracker: template<MeetTrackerEmailProps>({ subject: meetTrackerSubject, email: (p) => <MeetTrackerEmail {...p} /> }),
  tracker_intro: template<TrackerIntroEmailProps>({ subject: trackerIntroSubject, email: (p) => <TrackerIntroEmail {...p} /> }),
  product_tour: template<ProductTourEmailProps>({ subject: productTourSubject, email: (p) => <ProductTourEmail {...p} /> }),
  trial: template<TrialEmailProps>({ subject: trialSubject, email: (p) => <TrialEmail {...p} /> }),
  internal_notice: template<InternalNoticeEmailProps>({ subject: internalNoticeSubject, email: (p) => <InternalNoticeEmail {...p} /> }),
  admin_digest: template<AdminDigestEmailProps>({ subject: adminDigestSubject, email: (p) => <AdminDigestEmail {...p} /> }),
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
