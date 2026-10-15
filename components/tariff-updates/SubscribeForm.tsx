"use client"

import { FormEvent, useState } from "react"
import Link from "next/link"
import { ArrowRightIcon, CheckCircleIcon, EnvelopeIcon } from "@heroicons/react/20/solid"
import * as ui from "@/components/ui/styles"
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel"
import { DEFAULT_NEWS_PREFERENCES, NewsPreferencesFields, type NewsPreferencesValue } from "./NewsPreferencesFields"

// Subscribe to US tariff updates by email, on /tariff-updates and every update page. Weekly digest
// of new actions by default; "Choose what you get" opens the laws, countries and timing. After
// subscribing, the next step is offered: alerts on their own imports, in the Tariff Tracker.

type Status = "idle" | "sending" | "confirm_sent" | "manage_link_sent" | "throttled"

const DONE: Record<"confirm_sent" | "manage_link_sent" | "throttled", { title: string; body: string }> = {
  confirm_sent: { title: "Check your inbox", body: "Click the link we just sent to confirm. Nothing is sent until you do." },
  manage_link_sent: { title: "You're already subscribed", body: "We've emailed you a link to change what you get." },
  throttled: { title: "Check your inbox", body: "We sent you an email a few minutes ago. Use the link in it." },
}

export function SubscribeForm({ source, compact = false }: { source: string; compact?: boolean }) {
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
      trackEvent(MixpanelEvent.TARIFF_UPDATES_SUBSCRIBED, { source, frequency: prefs.frequency, scope: prefs.scope, filtered: prefs.authorities.length + prefs.countries.length > 0 })
    } catch (err) {
      setStatus("idle")
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
    }
  }

  if (status !== "idle" && status !== "sending") {
    const done = DONE[status]
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden />
          <div>
            <p className="font-semibold text-base-content">{done.title}</p>
            <p className="text-sm text-base-content/70">{done.body}</p>
          </div>
        </div>
        <div className="rounded-2xl bg-tt-soft p-4">
          <p className="text-sm font-semibold text-base-content">Want to know when a tariff hits your own imports?</p>
          <p className="mt-1 text-sm text-base-content/70">
            Add your HTS codes and countries to the free Tariff Tracker, and we&apos;ll alert you every time an update affects one of them.
          </p>
          <Link href="/tariff-tracker?tab=catalog&add=paste" className={`${ui.button({ variant: "primary", size: "sm" })} mt-3`}>
            Add my imports, free
            <ArrowRightIcon className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <div className={`flex gap-2 ${compact ? "flex-col" : "flex-col sm:flex-row"}`}>
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
            className="h-10 w-full rounded-full border border-base-300 bg-base-100 pl-10 pr-4 text-sm text-base-content placeholder:text-base-content/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </label>
        {/* Only bots fill this in */}
        <input type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} className="hidden" aria-hidden />
        <button type="submit" className={ui.button({ variant: "primary" })} disabled={status === "sending"}>
          {status === "sending" ? "Subscribing…" : "Get tariff updates"}
        </button>
      </div>
      <p className="text-xs text-base-content/60">
        {prefs.frequency === "instant" ? "Each new action as it happens" : "A weekly digest every Monday"}
        {prefs.authorities.length || prefs.countries.length ? ", for the laws and countries you picked" : ", every law and country"}.{" "}
        <button type="button" className="font-semibold text-primary underline-offset-4 hover:underline" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          {open ? "Done choosing" : "Choose what you get"}
        </button>
      </p>
      {open && (
        <div className="rounded-2xl border border-base-300 p-4">
          <NewsPreferencesFields value={prefs} onChange={setPrefs} />
        </div>
      )}
      {error && <p className="text-sm text-error">{error}</p>}
    </form>
  )
}
