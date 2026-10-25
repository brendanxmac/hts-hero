import type { SupabaseClient } from "@supabase/supabase-js"
import config from "../../config"
import { Countries } from "../../constants/countries"
import type { EmailFooter } from "../../emails/kit/Layout"
import { AUTHORITIES } from "../tariff-updates/types"
import { sendTransactional } from "./outbox"

// Email subscribers (email_subscribers): tariff news subscriptions for anyone, and every
// account's email choices. A row's token is the key in its manage and unsubscribe links.
// Visitors confirm by email before anything else is sent (double opt-in); an address that's
// already getting the news gets a link to change its choices instead, so nobody can change another
// person's subscription by typing their address. An account's address with the news off (accounts
// from before subscriptions) confirms like a visitor, with the choices carried in the link.

type Db = SupabaseClient

export type NewsFrequency = "instant" | "weekly" | "off"
export type NewsScope = "actions" | "all_steps"

export interface NewsPreferences {
  frequency: NewsFrequency
  scope: NewsScope
  authorities: string[]
  countries: string[]
}

export interface Subscriber {
  id: string
  email: string
  user_id: string | null
  token: string
  news_frequency: NewsFrequency
  news_scope: NewsScope
  news_authorities: string[]
  news_countries: string[]
  lifecycle: boolean
  confirmed_at: string | null
  unsubscribed_at: string | null
  confirm_sent_at: string | null
}

export const SUBSCRIBER_COLUMNS =
  "id, email, user_id, token, news_frequency, news_scope, news_authorities, news_countries, lifecycle, confirmed_at, unsubscribed_at, confirm_sent_at"

// Where links in emails point: this deployment (BASE_URL), so dev links stay on dev
export const appUrl = (path: string) => `${(process.env.BASE_URL || `https://${config.domainName}`).replace(/\/$/, "")}${path}`

export const manageUrl = (token: string) => appUrl(`/tariff-updates/subscription?token=${token}`)
export const unsubscribeUrl = (token: string) => appUrl(`/api/email/unsubscribe?token=${token}`)
export const confirmUrl = (token: string, prefs?: NewsPreferences) => {
  const params = new URLSearchParams({ token })
  if (prefs) {
    params.set("frequency", prefs.frequency)
    params.set("scope", prefs.scope)
    if (prefs.authorities.length) params.set("authorities", prefs.authorities.join(","))
    if (prefs.countries.length) params.set("countries", prefs.countries.join(","))
  }
  return appUrl(`/api/email/confirm?${params}`)
}

export const subscriberFooter = (s: Pick<Subscriber, "token">, reason: string): EmailFooter => ({
  reason,
  manageUrl: manageUrl(s.token),
  unsubscribeUrl: unsubscribeUrl(s.token),
})

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const isEmail = (email: unknown): email is string => typeof email === "string" && EMAIL.test(email.trim()) && email.length <= 254

const COUNTRY_CODES = new Set(Countries.map((c) => c.code))

// The choices from a form, cleaned: unknown laws and countries are dropped
export const parsePreferences = (body: Record<string, unknown>): NewsPreferences => {
  const list = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [])
  return {
    frequency: body.frequency === "instant" || body.frequency === "off" ? body.frequency : "weekly",
    scope: body.scope === "all_steps" ? "all_steps" : "actions",
    authorities: list(body.authorities).filter((a) => a in AUTHORITIES),
    countries: list(body.countries).map((c) => c.toUpperCase()).filter((c) => COUNTRY_CODES.has(c)),
  }
}

const preferenceColumns = (p: NewsPreferences) => ({
  news_frequency: p.frequency,
  news_scope: p.scope,
  news_authorities: p.authorities,
  news_countries: p.countries,
  updated_at: new Date().toISOString(),
})

export const subscriberByToken = async (db: Db, token: string) => {
  if (!/^[a-f0-9]{32,80}$/.test(token)) return null
  const { data } = await db.from("email_subscribers").select(SUBSCRIBER_COLUMNS).eq("token", token).maybeSingle()
  return (data as Subscriber | null) ?? null
}

const byEmail = async (db: Db, email: string) => {
  const { data } = await db.from("email_subscribers").select(SUBSCRIBER_COLUMNS).ilike("email", email.replace(/[%_\\]/g, "\\$&")).maybeSingle()
  return (data as Subscriber | null) ?? null
}

// One confirmation or manage-link email per address per 10 minutes
const THROTTLE_MS = 10 * 60 * 1000
const throttled = (s: Subscriber) => !!s.confirm_sent_at && Date.now() - new Date(s.confirm_sent_at).getTime() < THROTTLE_MS

export type SubscribeResult = "confirm_sent" | "manage_link_sent" | "throttled"

export const subscribe = async (db: Db, { email, prefs, source }: { email: string; prefs: NewsPreferences; source: string }): Promise<SubscribeResult> => {
  const address = email.trim().toLowerCase()
  let s = await byEmail(db, address)
  const confirmed = !!s?.confirmed_at && !s.unsubscribed_at
  const active = confirmed && s!.news_frequency !== "off"

  if (s && throttled(s)) return "throttled"

  if (s && active) {
    // Already subscribed (or an account): send a link to change the choices, change nothing here
    await db.from("email_subscribers").update({ confirm_sent_at: new Date().toISOString() }).eq("id", s.id)
    await sendTransactional(db, {
      recipient: s.email,
      subscriberId: s.id,
      userId: s.user_id,
      template: "news_manage_link",
      props: { manageUrl: manageUrl(s.token), footer: { reason: "You're getting this because someone asked to change the tariff updates sent to this address." } },
    })
    return "manage_link_sent"
  }

  if (s && confirmed) {
    // An account with the news off: nothing changes until they confirm from their inbox
    await db.from("email_subscribers").update({ confirm_sent_at: new Date().toISOString() }).eq("id", s.id)
  } else if (s) {
    const { data } = await db
      .from("email_subscribers")
      .update({ ...preferenceColumns(prefs), confirm_sent_at: new Date().toISOString(), source })
      .eq("id", s.id)
      .select(SUBSCRIBER_COLUMNS)
      .single()
    s = data as Subscriber
  } else {
    const { data, error } = await db
      .from("email_subscribers")
      .insert({ email: address, ...preferenceColumns(prefs), source, confirm_sent_at: new Date().toISOString() })
      .select(SUBSCRIBER_COLUMNS)
      .single()
    if (error) throw new Error(`Saving the subscription: ${error.message}`)
    s = data as Subscriber
  }
  await sendTransactional(db, {
    recipient: s.email,
    subscriberId: s.id,
    template: "news_confirm",
    props: {
      confirmUrl: confirmUrl(s.token, confirmed ? prefs : undefined),
      frequency: prefs.frequency,
      footer: { reason: "You're getting this because this address was entered to get US tariff updates from HTS Hero. If that wasn't you, ignore it: nothing is sent without your confirmation." },
    },
  })
  return "confirm_sent"
}

// The confirmation link; `prefs` are the choices carried in it (an account turning the news on)
export const confirmSubscriber = async (db: Db, token: string, prefs?: NewsPreferences) => {
  const s = await subscriberByToken(db, token)
  if (!s) return null
  await db
    .from("email_subscribers")
    .update({
      ...(prefs ? preferenceColumns(prefs) : {}),
      confirmed_at: s.confirmed_at ?? new Date().toISOString(),
      unsubscribed_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", s.id)
  return s
}

export const updatePreferences = async (db: Db, token: string, prefs: NewsPreferences) => {
  const s = await subscriberByToken(db, token)
  if (!s) return null
  await db.from("email_subscribers").update({ ...preferenceColumns(prefs), unsubscribed_at: null }).eq("id", s.id)
  return s
}

export const unsubscribe = async (db: Db, token: string) => {
  const s = await subscriberByToken(db, token)
  if (!s) return null
  await db.from("email_subscribers").update({ unsubscribed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", s.id)
  return s
}

// An account's row: confirmed (they signed up with the address), on the weekly digest unless told
// otherwise (accounts from before subscriptions start with news off and are offered an opt-in).
// An address that already subscribed keeps its choices and is linked to the account.
export const ensureAccountSubscriber = async (
  db: Db,
  { userId, email, newsFrequency = "weekly" }: { userId: string; email: string; newsFrequency?: NewsFrequency }
) => {
  const existing = await byEmail(db, email)
  if (existing) {
    await db
      .from("email_subscribers")
      .update({ user_id: userId, confirmed_at: existing.confirmed_at ?? new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("id", existing.id)
    return
  }
  await db.from("email_subscribers").insert({
    email: email.trim().toLowerCase(),
    user_id: userId,
    confirmed_at: new Date().toISOString(),
    news_frequency: newsFrequency,
    source: "account",
  })
}

// The signed-in user's row, made on first use (accounts from before subscriptions existed, so the
// news starts off)
export const accountSubscriber = async (db: Db, { userId, email }: { userId: string; email: string }) => {
  const { data } = await db.from("email_subscribers").select(SUBSCRIBER_COLUMNS).eq("user_id", userId).maybeSingle()
  if (data) return data as Subscriber
  await ensureAccountSubscriber(db, { userId, email, newsFrequency: "off" })
  const { data: created } = await db.from("email_subscribers").select(SUBSCRIBER_COLUMNS).eq("user_id", userId).single()
  return created as Subscriber
}
