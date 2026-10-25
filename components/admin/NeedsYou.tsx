"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, WrenchScrewdriverIcon } from "@heroicons/react/20/solid"
import * as tt from "@/components/ui/styles/tracker"
import type { AdminQueue, QueueGroup, QueueItem, QueueTone } from "@/libs/admin/queue"
import { PageHeader, Spinner, btn } from "../hts-revision-diff/ui"

// /admin: what needs the admin across every tool (libs/admin/queue.ts), like the Tracker's Home
// (DESIGN_SYSTEM.md §15 principle 1). What holds things up first, then what's broken, then what
// can wait; each item one line on what it is, one on what waiting costs, the first few things it's
// about, and one button that opens the fix. A rail says how the system runs on its own.

const GROUPS: { id: QueueGroup; title: string; line: string }[] = [
  { id: "blocking", title: "Holding Things Up", line: "Emails or alerts wait until you act on these." },
  { id: "health", title: "Something's Broken", line: "A source, a cron or sending has stopped working." },
  { id: "whenever", title: "When You Have Time", line: "Nothing waits on these." },
]

const ICON_TONE: Record<QueueTone, string> = {
  error: "bg-error/10 text-error",
  warning: "bg-warning/10 text-warning",
  primary: "bg-primary/10 text-primary",
  neutral: "bg-tt-soft text-base-content/60",
}

const ICON: Record<QueueGroup, typeof ExclamationTriangleIcon> = {
  blocking: ExclamationTriangleIcon,
  health: WrenchScrewdriverIcon,
  whenever: InformationCircleIcon,
}

const Item = ({ item, primary }: { item: QueueItem; primary: boolean }) => {
  const Icon = ICON[item.group]
  return (
    <li className="flex gap-4 border-t border-base-300 px-6 py-5 first:border-t-0">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${ICON_TONE[item.tone]}`}>
        <Icon className="h-[18px] w-[18px]" aria-hidden />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="text-[0.9375rem] font-semibold">{item.title}</div>
        <p className={tt.caption}>{item.detail}</p>
        {item.entries && item.entries.length > 0 && (
          <ul className="mt-2 flex flex-col gap-1">
            {item.entries.map((e) => (
              <li key={`${e.href}${e.label}`} className="flex min-w-0 items-baseline gap-2 text-sm">
                <Link href={e.href} className="truncate font-medium text-primary hover:underline">
                  {e.label}
                </Link>
                {e.meta && <span className="shrink-0 text-xs text-base-content/60">{e.meta}</span>}
              </li>
            ))}
            {item.count > item.entries.length && item.group !== "health" && (
              <li className="text-xs text-base-content/60">and {(item.count - item.entries.length).toLocaleString()} more</li>
            )}
          </ul>
        )}
      </div>
      <Link href={item.href} className={`${primary ? btn.primary : btn.secondary} shrink-0 self-start`}>
        {item.action}
      </Link>
    </li>
  )
}

const RAIL = [
  { title: "Goes Out by Itself", lines: ["News emails for published updates", "Onboarding and trial emails (but “Trial unlocked”)", "Alerts once an impact check is approved", "Confirmations when the HTS catches up"] },
  { title: "Waits for You", lines: ["Updates Claude flagged for review", "Impact checks, before any import alert", "The weekly digest, Mondays", "The “Trial unlocked” email"] },
]

export default function NeedsYou({ queue }: { queue: AdminQueue }) {
  const router = useRouter()
  const [busy, setBusy] = useState<"refresh" | "email" | null>(null)
  const urgent = queue.items.filter((i) => i.group !== "whenever")
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
  const firstBlocking = queue.items.find((i) => i.group === "blocking")

  const emailMe = async () => {
    setBusy("email")
    try {
      const response = await fetch("/api/admin/queue", { method: "POST" })
      const body = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(body.error ?? "Couldn't send it")
      toast.success("Sent to your inbox")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't send it")
    } finally {
      setBusy(null)
    }
  }

  return (
    <>
      <PageHeader
        title="Needs You"
        meta={
          <>
            {today} ·{" "}
            {urgent.length
              ? `${urgent.length} thing${urgent.length === 1 ? "" : "s"} waiting on you`
              : queue.items.length
                ? "Nothing urgent. A few things when you have time."
                : "Nothing needs you today."}
          </>
        }
        actions={
          <>
            <button type="button" className={btn.ghost} disabled={!!busy} onClick={emailMe} title="The 7 a.m. Bangkok email, now">
              {busy === "email" && <Spinner />}
              Email me this
            </button>
            <button
              type="button"
              className={btn.secondary}
              disabled={!!busy}
              onClick={() => {
                setBusy("refresh")
                router.refresh()
                setTimeout(() => setBusy(null), 600)
              }}
            >
              {busy === "refresh" && <Spinner />}
              Refresh
            </button>
          </>
        }
      />

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex flex-col gap-4">
          {queue.items.length === 0 ? (
            <section className={`${tt.panel} flex items-center gap-4 px-6 py-6`}>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10 text-success">
                <CheckCircleIcon className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <div className={tt.title}>Nothing Needs You Today</div>
                <p className={tt.caption}>Updates, alerts and emails are all moving on their own.</p>
              </div>
            </section>
          ) : (
            GROUPS.map((g) => {
              const list = queue.items.filter((i) => i.group === g.id)
              if (!list.length) return null
              return (
                <section key={g.id} className={`${tt.panel} overflow-hidden`}>
                  <header className="flex items-baseline gap-3 border-b border-base-300 px-6 py-4">
                    <h2 className={tt.title}>{g.title}</h2>
                    <span className={tt.caption}>{g.line}</span>
                  </header>
                  <ul>
                    {list.map((item) => (
                      <Item key={item.id} item={item} primary={item === firstBlocking} />
                    ))}
                  </ul>
                </section>
              )
            })
          )}
        </div>

        <aside className={`${tt.rail} flex flex-col gap-6 p-5`}>
          <div className="flex flex-col gap-1">
            <h2 className={tt.sectionTitle}>Your Morning Email</h2>
            <p className={tt.caption}>This list lands in your inbox every day at 7:00 a.m. Bangkok time, empty or not. No email means the cron has stopped.</p>
          </div>
          {RAIL.map((r) => (
            <div key={r.title} className="flex flex-col gap-2">
              <h2 className={tt.sectionTitle}>{r.title}</h2>
              <ul className="flex flex-col gap-1.5">
                {r.lines.map((line) => (
                  <li key={line} className={`${tt.caption} flex gap-2`}>
                    <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${r.title === "Waits for You" ? "bg-warning" : "bg-success"}`} aria-hidden />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <p className={tt.caption}>Checked {new Date(queue.generatedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}.</p>
        </aside>
      </div>
    </>
  )
}
