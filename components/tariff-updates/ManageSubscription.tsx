"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRightIcon, CheckCircleIcon } from "@heroicons/react/20/solid"
import toast from "react-hot-toast"
import * as ui from "@/components/ui/styles"
import * as tt from "@/components/ui/styles/tracker"
import { NewsPreferencesFields, type NewsPreferencesValue } from "./NewsPreferencesFields"

// One subscriber's choices, changed from an email link: how often, how much, which laws and
// countries, or off. Under them, the next step: alerts on their own imports in the Tracker (or
// their Tracker, for account holders).

export function ManageSubscription({
  token,
  email,
  hasAccount,
  justConfirmed,
  initial,
  unsubscribed,
  lifecycle: initialLifecycle,
}: {
  token: string
  email: string
  hasAccount: boolean
  justConfirmed: boolean
  initial: NewsPreferencesValue
  unsubscribed: boolean
  lifecycle: boolean
}) {
  const [prefs, setPrefs] = useState(initial)
  const [saved, setSaved] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [lifecycle, setLifecycle] = useState(initialLifecycle)
  const [savedLifecycle, setSavedLifecycle] = useState(initialLifecycle)
  const changed = JSON.stringify(prefs) !== JSON.stringify(saved) || lifecycle !== savedLifecycle

  const save = async (next = prefs) => {
    setSaving(true)
    try {
      const response = await fetch("/api/email/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, ...next, ...(hasAccount ? { lifecycle } : {}) }),
      })
      const body = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(body.error ?? "Couldn't save")
      setSaved(next)
      setPrefs(next)
      setSavedLifecycle(lifecycle)
      toast.success(next.frequency === "off" ? "Tariff news is off" : "Saved")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save")
    } finally {
      setSaving(false)
    }
  }

  const banner = justConfirmed
    ? { title: "You're subscribed", body: saved.frequency === "instant" ? "You'll get each new US tariff action as it happens." : "Your first weekly digest arrives Monday." }
    : unsubscribed && saved.frequency === "off"
      ? { title: "You're unsubscribed", body: "You won't get any more email from HTS Hero. Changed your mind? Pick how often below." }
      : null

  return (
    <>
      {banner && (
        <div className="flex items-start gap-3 rounded-lg border border-success/30 bg-success/5 p-5">
          <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden />
          <div>
            <p className="font-semibold text-base-content">{banner.title}</p>
            <p className="text-sm text-base-content/70">{banner.body}</p>
          </div>
        </div>
      )}

      <section className={`${tt.panel} flex flex-col gap-6 p-7`}>
        <div className="flex flex-col gap-1">
          <h1 className={`${tt.display} text-2xl font-semibold text-base-content`}>Your tariff updates</h1>
          <p className="text-sm text-base-content/70">For {email}</p>
        </div>
        <NewsPreferencesFields value={prefs} onChange={setPrefs} allowOff />
        {hasAccount && (
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-base-300 px-4 py-3">
            <input type="checkbox" className="checkbox checkbox-primary checkbox-sm mt-0.5" checked={lifecycle} onChange={(e) => setLifecycle(e.target.checked)} />
            <span className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-base-content">Tips for getting the most from your account</span>
              <span className="text-xs text-base-content/60">A few emails while you set up your Tariff Tracker, and the occasional note on what&apos;s new.</span>
            </span>
          </label>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className={ui.button({ variant: "primary" })} disabled={!changed || saving} onClick={() => save()}>
            {saving ? "Saving…" : "Save"}
          </button>
          {saved.frequency !== "off" && (
            <button type="button" className={ui.button({ variant: "ghost" })} disabled={saving} onClick={() => save({ ...prefs, frequency: "off" })}>
              Turn off tariff news
            </button>
          )}
        </div>
      </section>

      <section className={`${tt.panel} flex flex-col gap-3 p-7`}>
        {hasAccount ? (
          <>
            <h2 className={tt.title}>See what each update means for your imports</h2>
            <p className="text-sm text-base-content/70">Your Tariff Tracker shows the duty on every import you add, what changed on it, and where you could pay less.</p>
            <Link href="/tariff-tracker" className={`${ui.button({ variant: "secondary" })} self-start`}>
              Open my Tracker
              <ArrowRightIcon className="h-4 w-4" aria-hidden />
            </Link>
          </>
        ) : (
          <>
            <h2 className={tt.title}>Know when a tariff hits your own imports</h2>
            <p className="text-sm text-base-content/70">
              Add your HTS codes and countries to the free Tariff Tracker. You&apos;ll see every duty on each import today, and we&apos;ll alert you
              every time an update affects one of them.
            </p>
            <Link href="/tariff-tracker?tab=catalog&add=paste" className={`${ui.button({ variant: "secondary" })} self-start`}>
              Add my imports, free
              <ArrowRightIcon className="h-4 w-4" aria-hidden />
            </Link>
          </>
        )}
      </section>
    </>
  )
}
