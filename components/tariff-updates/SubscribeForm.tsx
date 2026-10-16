"use client"

import { FormEvent, useState } from "react"
import Link from "next/link"
import { ArrowRightIcon, CheckCircleIcon, CheckIcon, EnvelopeIcon } from "@heroicons/react/20/solid"
import { signupHref } from "@/components/tariff-tracker/access/signup"
import * as ui from "@/components/ui/styles"
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel"
import { DEFAULT_NEWS_PREFERENCES, NewsPreferencesFields, type NewsPreferencesValue } from "./NewsPreferencesFields"

// Subscribe to US tariff updates by email, on /tariff-updates and every update page. Weekly digest
// of new actions by default; "Choose what you get" opens the laws, countries and timing. After
// subscribing, the next step is offered: alerts on their own imports, in the Tariff Tracker.
// `inline` is the small one inside another box (the duty calculator's Tariff News): the email and
// a button on one row, the weekly digest of every law and country, and a one-line confirmation.

// What the free Tariff Tracker adds to the news, offered right after subscribing
const UPSELL = [
  "See which of your imports each new tariff update affects",
  "Get alerted with the rate before and after, by email, Slack or Teams",
  "Find potential savings and audit what you paid",
]

// The address they subscribed with, for the sign-up page to fill in (this tab only, never in a URL)
export const SIGNUP_EMAIL_KEY = "hts-hero-signup-email"

const upsellClicked = (source: string) => trackEvent(MixpanelEvent.TARIFF_UPDATES_TRACKER_UPSELL_CLICKED, { source })

type Status = "idle" | "sending" | "confirm_sent" | "manage_link_sent" | "throttled"

const DONE: Record<"confirm_sent" | "manage_link_sent" | "throttled", { title: string; body: string }> = {
  confirm_sent: { title: "Check your inbox", body: "Click the link we just sent to confirm. Nothing is sent until you do." },
  manage_link_sent: { title: "You're already subscribed", body: "We've emailed you a link to change what you get." },
  throttled: { title: "Check your inbox", body: "We sent you an email a few minutes ago. Use the link in it." },
}

export function SubscribeForm({ source, compact = false, inline = false }: { source: string; compact?: boolean; inline?: boolean }) {
  const [email, setEmail] = useState("")
  const [website, setWebsite] = useState("")
  const [prefs, setPrefs] = useState<NewsPreferencesValue>(DEFAULT_NEWS_PREFERENCES)
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<Status>("idle")
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setStatus("sending")
    try {
      const response = await fetch("/api/tariff-updates/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website, source, ...prefs }),
      })
      const body = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(body.error ?? "Something went wrong. Please try again.")
      setStatus(body.status)
      try {
        sessionStorage.setItem(SIGNUP_EMAIL_KEY, email.trim())
      } catch {
        // Private mode: they type it again
      }
      trackEvent(MixpanelEvent.TARIFF_UPDATES_SUBSCRIBED, { source, frequency: prefs.frequency, scope: prefs.scope, filtered: prefs.authorities.length + prefs.countries.length > 0 })
    } catch (err) {
      setStatus("idle")
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
    }
  }

  // Subscribed: the confirmation, then straight on to the Tariff Tracker, which matches every update
  // to their own imports. The account is created first (the address carried over), then the
  // Tracker onboards them.
  if (status !== "idle" && status !== "sending") {
    const done = DONE[status]
    const signup = signupHref("/tariff-tracker")
    if (inline)
      return (
        <div className="flex flex-col gap-3" role="status">
          <p className="m-0 flex items-start gap-2 text-sm text-base-content/80">
            <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
            <span>
              <span className="font-semibold text-base-content">{done.title}.</span> {done.body}
            </span>
          </p>
          <div className="flex flex-col gap-2 rounded-xl border border-primary/20 bg-primary/[0.06] p-3.5">
            <p className="m-0 text-sm font-semibold text-base-content">Next: see when an update hits your own imports</p>
            <p className="m-0 text-xs leading-relaxed text-base-content/70">Track your imports free, get alerted with the rate before and after, and find potential savings.</p>
            <Link href={signup} onClick={() => upsellClicked(source)} className={`${ui.button({ variant: "primary", size: "sm" })} self-start`}>
              Create my free account
              <ArrowRightIcon className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      )
    return (
      <div className="flex flex-col gap-4" role="status">
        <div className="flex items-start gap-3">
          <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden />
          <div>
            <p className="font-semibold text-base-content">{done.title}</p>
            <p className="text-sm text-base-content/70">{done.body}</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 rounded-2xl border border-primary/20 bg-primary/[0.06] p-5">
          <p className="m-0 text-base font-semibold text-base-content">Now see exactly when an update hits your imports</p>
          <ul className="m-0 flex list-none flex-col gap-1.5 p-0 text-sm text-base-content/80">
            {UPSELL.map((line) => (
              <li key={line} className="flex items-start gap-2">
                <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                {line}
              </li>
            ))}
          </ul>
          <Link href={signup} onClick={() => upsellClicked(source)} className={`${ui.button({ variant: "primary" })} self-start`}>
            Create my free account
            <ArrowRightIcon className="h-4 w-4" aria-hidden />
          </Link>
          <p className="m-0 text-xs text-base-content/60">Free. Takes a minute; then add your HTS codes and countries.</p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className={`flex flex-col ${inline ? "gap-2" : "gap-3"}`}>
      <div className={`flex gap-2 ${compact ? "flex-col" : inline ? "flex-row" : "flex-col sm:flex-row"}`}>
        <label className="relative flex-1">
          <span className="sr-only">Email address</span>
          <EnvelopeIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-base-content/40" aria-hidden />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            autoComplete="email"
            className={`${inline ? "h-9" : "h-10"} w-full rounded-full border border-base-300 bg-base-100 pl-10 pr-4 text-sm text-base-content placeholder:text-base-content/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30`}
          />
        </label>
        {/* Only bots fill this in */}
        <input type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} className="hidden" aria-hidden />
        <button type="submit" className={`${ui.button({ variant: "primary", size: inline ? "sm" : undefined })} shrink-0`} disabled={status === "sending"}>
          {status === "sending" ? "Subscribing…" : inline ? "Subscribe" : "Get tariff updates"}
        </button>
      </div>
      {inline ? (
        <p className="text-xs text-base-content/60">A free weekly digest every Monday. Unsubscribe anytime.</p>
      ) : (
        <p className="text-xs text-base-content/60">
          {prefs.frequency === "instant" ? "Each new action as it happens" : "A weekly digest every Monday"}
          {prefs.authorities.length || prefs.countries.length ? ", for the laws and countries you picked" : ", every law and country"}.{" "}
          <button type="button" className="font-semibold text-primary underline-offset-4 hover:underline" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
            {open ? "Done choosing" : "Choose what you get"}
          </button>
        </p>
      )}
      {open && (
        <div className="rounded-2xl border border-base-300 p-4">
          <NewsPreferencesFields value={prefs} onChange={setPrefs} />
        </div>
      )}
      {error && <p className="text-sm text-error">{error}</p>}
    </form>
  )
}
