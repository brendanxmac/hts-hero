"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { ChatMessage } from "@/emails/chat"
import toast from "react-hot-toast"
import { formatTime } from "../hts-revision-diff/shared"
import { Callout, EmptyState, PageHeader, Panel, Pill, Spinner, Tabs, btn, type Tone } from "../hts-revision-diff/ui"
import { Select } from "@/components/ui/Select"

// The outbox: every batch of email, Slack and Teams messages. Batches that wait for the admin (the
// weekly digest, the "trial unlocked" email) lead; the rest sent on their own and are here as the
// record. Pick a batch, step through each recipient's message exactly as it will arrive (← →),
// take recipients out, add a note at the top, send yourself a test, then approve (it sends at
// once) or skip. ?batch=<id> and ?view= open a batch or a view from a link.

interface Batch {
  id: string
  kind: string
  title: string
  note: string | null
  status: "pending" | "approved" | "sending" | "sent" | "skipped"
  created_at: string
  approved_at: string | null
  finished_at: string | null
  counts: Record<string, number>
}

interface Message {
  id: string
  channel: "email" | "slack" | "teams"
  recipient: string
  subject: string | null
  status: "pending" | "removed" | "sending" | "sent" | "failed"
  error: string | null
  sent_at: string | null
}

interface Preview {
  channel: Message["channel"]
  recipient: string
  subject?: string
  html?: string
  chat?: ChatMessage
  payload?: unknown
}

type View = "pending" | "done" | "failed" | "all"
const VIEWS: View[] = ["pending", "done", "failed", "all"]

const STATUS_TONE: Record<string, Tone> = {
  pending: "warning",
  approved: "info",
  sending: "info",
  sent: "success",
  skipped: "neutral",
  removed: "neutral",
  failed: "error",
}

const call = async <T,>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(path, { cache: "no-store", ...init, headers: init?.body ? { "Content-Type": "application/json" } : undefined })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.error ?? `Request failed (${response.status})`)
  return body as T
}

const total = (b: Batch) => (b.counts.channel_email ?? 0) + (b.counts.channel_slack ?? 0) + (b.counts.channel_teams ?? 0)

const shortRecipient = (m: Message) => (m.channel === "email" ? m.recipient : `${m.channel === "slack" ? "Slack" : "Teams"} webhook …${m.recipient.slice(-10)}`)

export default function OutboxDashboard({ updates }: { updates: { id: string; title: string; last_activity_at: string }[] }) {
  const [batches, setBatches] = useState<Batch[] | null>(null)
  const [view, setView] = useState<View>("pending")
  const [openId, setOpenId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [index, setIndex] = useState(0)
  const [preview, setPreview] = useState<Preview | null>(null)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [note, setNote] = useState("")
  const [busy, setBusy] = useState<string | null>(null)
  const [draftFrom, setDraftFrom] = useState("")
  // The note field shows once asked for, or when the batch has one
  const [noteOpen, setNoteOpen] = useState(false)

  const loadBatches = useCallback(async () => {
    const { batches } = await call<{ batches: Batch[] }>("/api/email-outbox")
    setBatches(batches)
    return batches
  }, [])

  useEffect(() => {
    loadBatches().catch((e) => toast.error(e.message))
  }, [loadBatches])

  const shown = useMemo(
    () =>
      (batches ?? []).filter((b) =>
        view === "pending" ? b.status === "pending" : view === "done" ? b.status !== "pending" : view === "failed" ? !!b.counts.failed : true
      ),
    [batches, view]
  )
  const open = batches?.find((b) => b.id === openId) ?? null

  // ?view= and ?batch= from a link (Needs You, the morning email)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const v = params.get("view")
    if (v && VIEWS.includes(v as View)) setView(v as View)
    const id = params.get("batch")
    if (id) setOpenId(id)
  }, [])
  // A linked batch shows in whichever view holds it
  useEffect(() => {
    if (!openId || !batches) return
    const b = batches.find((x) => x.id === openId)
    if (b && !shown.some((x) => x.id === openId)) setView(b.status === "pending" ? "pending" : "all")
  }, [openId, batches, shown])

  // The first batch of the view opens by itself
  useEffect(() => {
    if (!openId && shown.length) setOpenId(shown[0].id)
  }, [openId, shown])

  const pick = (id: string | null) => {
    setOpenId(id)
    const url = new URL(window.location.href)
    if (id) url.searchParams.set("batch", id)
    else url.searchParams.delete("batch")
    window.history.replaceState(null, "", url)
  }

  const loadBatch = useCallback(async (id: string) => {
    const { batch, messages } = await call<{ batch: Batch; messages: Message[] }>(`/api/email-outbox/${id}`)
    setMessages(messages)
    setNote(batch.note ?? "")
    setIndex((i) => Math.min(i, Math.max(0, messages.length - 1)))
  }, [])

  useEffect(() => {
    if (!openId) return
    setIndex(0)
    setNoteOpen(false)
    loadBatch(openId).catch((e) => toast.error(e.message))
  }, [openId, loadBatch])

  const current = messages[index]

  // The selected message, rendered as it will go out
  useEffect(() => {
    if (!current) return setPreview(null)
    let cancelled = false
    setPreviewError(null)
    call<Preview>(`/api/email-outbox/messages/${current.id}`)
      .then((p) => !cancelled && setPreview(p))
      .catch((e) => !cancelled && setPreviewError(e.message))
    return () => {
      cancelled = true
    }
    // Re-render when the note is saved (the batch reloads)
  }, [current, open?.note])

  // ← → step through recipients
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest("input, textarea, select")) return
      if (e.key === "ArrowRight") setIndex((i) => Math.min(messages.length - 1, i + 1))
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(0, i - 1))
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [messages.length])

  const act = async (label: string, fn: () => Promise<unknown>, done?: string) => {
    setBusy(label)
    try {
      await fn()
      if (done) toast.success(done)
      await loadBatches()
      if (openId) await loadBatch(openId)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setBusy(null)
    }
  }

  const pending = open?.status === "pending"
  const toSend = messages.filter((m) => m.status === "pending").length
  const noteChanged = (open?.note ?? "") !== note.trim()

  const approve = () => {
    if (!open) return
    if (noteChanged) return toast.error("Save or undo the note first")
    if (!window.confirm(`Send ${toSend} message${toSend === 1 ? "" : "s"} now?`)) return
    act(
      "approve",
      async () => {
        const { result } = await call<{ result: { sent: number; failed: number } }>(`/api/email-outbox/${open.id}`, { method: "POST", body: JSON.stringify({ action: "approve" }) })
        toast.success(`Sent ${result.sent}${result.failed ? `, ${result.failed} failed` : ""}`)
      }
    )
  }

  const waiting = (batches ?? []).filter((b) => b.status === "pending").length
  const failing = (batches ?? []).filter((b) => b.counts.failed).length

  return (
    <>
      <PageHeader
        title="Outbox"
        meta={
          batches === null
            ? "Loading…"
            : `${waiting ? `${waiting} batch${waiting === 1 ? "" : "es"} waiting for you.` : "Nothing waiting for you."} The weekly digest and the “trial unlocked” email wait here; news, onboarding emails and approved alerts send on their own.`
        }
        actions={
          <>
            <Select
              value={draftFrom}
              onChange={(v) => setDraftFrom(v)}
              options={updates.map((u) => ({ value: u.id, label: u.title }))}
              label="Draft a test from an update"
              placeholder="Draft a test news email from…"
              size="sm"
              className="w-72"
              menuClassName="w-96"
              align="right"
            />
            <button
              type="button"
              className={btn.secondary}
              disabled={!draftFrom || !!busy}
              title="A batch of one, addressed to you, to see a news email before it goes out"
              onClick={() =>
                act(
                  "draft",
                  async () => {
                    const { id } = await call<{ id: string }>("/api/email-outbox", { method: "POST", body: JSON.stringify({ action: "draft-test", updateId: draftFrom }) })
                    setView("pending")
                    pick(id)
                    setDraftFrom("")
                  },
                  "Test batch drafted, addressed to you"
                )
              }
            >
              {busy === "draft" && <Spinner />}
              Draft test
            </button>
          </>
        }
      >
        <Tabs<View>
          tabs={[
            { value: "pending", label: "Waiting", count: waiting, tone: "warning" },
            { value: "done", label: "Sent and Skipped" },
            ...(failing ? [{ value: "failed" as View, label: "With Failures", count: failing, tone: "warning" as Tone }] : []),
            { value: "all", label: "All", count: batches?.length },
          ]}
          value={view}
          onChange={(v) => {
            setView(v)
            pick(null)
          }}
        />
      </PageHeader>

      <div className="grid items-start gap-4 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <Panel bodyClassName="max-h-[calc(100svh-2rem)] overflow-y-auto">
          {batches === null ? (
            <div className="flex justify-center p-8">
              <Spinner />
            </div>
          ) : shown.length === 0 ? (
            <EmptyState title={view === "pending" ? "Nothing waiting" : "No batches"}>
              {view === "pending" ? "Weekly digests and the trial-unlocked email land here for you to approve." : "Nothing here yet."}
            </EmptyState>
          ) : (
            <ul>
              {shown.map((b) => (
                <li key={b.id} className="border-t border-base-300 first:border-t-0">
                  <button
                    type="button"
                    onClick={() => pick(b.id)}
                    aria-current={b.id === openId}
                    className={`flex w-full flex-col gap-1 px-5 py-3.5 text-left transition-colors ${b.id === openId ? "bg-tt-soft-high" : "hover:bg-tt-soft"}`}
                  >
                    <span className="flex items-center gap-2">
                      <Pill tone={STATUS_TONE[b.status]}>{b.status}</Pill>
                      <span className="text-xs text-base-content/60">{b.kind.replace(/_/g, " ")}</span>
                      {b.counts.failed ? <span className="text-xs font-semibold text-error">{b.counts.failed} failed</span> : null}
                    </span>
                    <span className="line-clamp-2 text-sm font-semibold">{b.title}</span>
                    <span className="text-xs text-base-content/60">
                      {total(b)} message{total(b) === 1 ? "" : "s"} · {formatTime(b.created_at)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {open ? (
          <section className="flex min-w-0 flex-col gap-4">
            <Panel>
              <div className="flex flex-col gap-4 px-6 py-5">
                <div className="flex flex-wrap items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-semibold tracker:[font-family:var(--font-tracker-display)]">{open.title}</h2>
                    <p className="mt-1 text-sm text-base-content/60">
                      {open.counts.channel_email ?? 0} email · {open.counts.channel_slack ?? 0} Slack · {open.counts.channel_teams ?? 0} Teams
                      {open.counts.removed ? ` · ${open.counts.removed} taken out` : ""}
                      {open.approved_at ? ` · approved ${formatTime(open.approved_at)}` : ""}
                    </p>
                  </div>
                  {pending && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className={btn.ghost}
                        disabled={!!busy}
                        onClick={() => act("skip", () => call(`/api/email-outbox/${open.id}`, { method: "POST", body: JSON.stringify({ action: "skip" }) }), "Skipped")}
                      >
                        Skip
                      </button>
                      <button type="button" className={btn.primary} disabled={!!busy || !toSend} onClick={approve}>
                        {busy === "approve" && <Spinner />}
                        Approve and send {toSend}
                      </button>
                    </div>
                  )}
                  {open.status === "skipped" && (
                    <button
                      type="button"
                      className={btn.secondary}
                      disabled={!!busy}
                      onClick={() => act("reopen", () => call(`/api/email-outbox/${open.id}`, { method: "POST", body: JSON.stringify({ action: "reopen" }) }), "Back in review")}
                    >
                      Reopen
                    </button>
                  )}
                </div>
                {pending &&
                  (noteOpen || note || open.note ? (
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold" htmlFor="batch-note">
                        Note at the top of every message
                      </label>
                      <textarea
                        id="batch-note"
                        className="textarea min-h-16 w-full border-base-300 text-sm tracker:rounded-xl"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="e.g. Heads-up: this one hits steel derivatives hard. Check your Chapter 73 imports."
                      />
                      {noteChanged && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className={btn.xsSecondary}
                            disabled={!!busy}
                            onClick={() => act("note", () => call(`/api/email-outbox/${open.id}`, { method: "PATCH", body: JSON.stringify({ note }) }), "Note saved")}
                          >
                            Save note
                          </button>
                          <button type="button" className={btn.xsGhost} onClick={() => setNote(open.note ?? "")}>
                            Undo
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button type="button" className="self-start text-sm font-medium text-primary hover:underline" onClick={() => setNoteOpen(true)}>
                      + Add a note at the top of every message
                    </button>
                  ))}
              </div>
            </Panel>

            <Panel className="grid xl:grid-cols-[17rem_minmax(0,1fr)]" bodyClassName="contents">
              <ul className="flex max-h-[80vh] flex-col overflow-y-auto border-base-300 max-xl:border-b xl:border-r">
                {messages.map((m, i) => (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => setIndex(i)}
                      className={`flex w-full flex-col gap-1 border-b border-base-300 px-4 py-2.5 text-left text-xs ${i === index ? "bg-tt-soft-high" : "hover:bg-tt-soft"}`}
                    >
                      <span className={`truncate text-sm font-medium ${m.status === "removed" ? "text-base-content/40 line-through" : ""}`}>{shortRecipient(m)}</span>
                      <span className="flex items-center gap-1.5">
                        <Pill tone={STATUS_TONE[m.status]}>{m.status}</Pill>
                        {m.error && <span className="truncate text-error">{m.error}</span>}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>

              <div className="flex min-w-0 flex-col">
                {current && (
                  <div className="flex flex-wrap items-center gap-2 border-b border-base-300 px-5 py-3 text-sm">
                    <button type="button" className={btn.xsSecondary} onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0} aria-label="Previous recipient">
                      ←
                    </button>
                    <button type="button" className={btn.xsSecondary} onClick={() => setIndex((i) => Math.min(messages.length - 1, i + 1))} disabled={index >= messages.length - 1} aria-label="Next recipient">
                      →
                    </button>
                    <span className="min-w-0 truncate text-base-content/60">
                      {index + 1} of {messages.length} · {shortRecipient(current)}
                    </span>
                    <span className="ml-auto flex gap-2">
                      {current.channel === "email" && (
                        <button
                          type="button"
                          className={btn.xsSecondary}
                          disabled={!!busy}
                          onClick={() => act("test", () => call(`/api/email-outbox/messages/${current.id}`, { method: "POST", body: JSON.stringify({ action: "test" }) }), "Test sent to you")}
                        >
                          Send me this one
                        </button>
                      )}
                      {pending && current.status === "pending" && (
                        <button
                          type="button"
                          className={btn.xsSecondary}
                          disabled={!!busy}
                          onClick={() => act("remove", () => call(`/api/email-outbox/messages/${current.id}`, { method: "POST", body: JSON.stringify({ action: "remove" }) }), "Taken out")}
                        >
                          Take out
                        </button>
                      )}
                      {pending && current.status === "removed" && (
                        <button
                          type="button"
                          className={btn.xsSecondary}
                          disabled={!!busy}
                          onClick={() => act("restore", () => call(`/api/email-outbox/messages/${current.id}`, { method: "POST", body: JSON.stringify({ action: "restore" }) }), "Back in")}
                        >
                          Put back
                        </button>
                      )}
                    </span>
                  </div>
                )}
                {previewError && (
                  <div className="p-5">
                    <Callout tone="error" title="Couldn't render this message">
                      {previewError}
                    </Callout>
                  </div>
                )}
                {preview?.channel === "email" && preview.html && (
                  <>
                    <div className="border-b border-base-300 px-5 py-2.5 text-sm">
                      <span className="text-base-content/60">Subject </span>
                      <span className="font-semibold">{preview.subject}</span>
                    </div>
                    <iframe title="Email preview" srcDoc={preview.html} className="h-[75vh] w-full bg-white" sandbox="allow-popups allow-popups-to-escape-sandbox" />
                  </>
                )}
                {preview && preview.channel !== "email" && preview.chat && (
                  <div className="flex flex-col gap-3 p-5 text-sm">
                    {preview.chat.eyebrow && <div className="text-xs font-semibold text-base-content/60">{preview.chat.eyebrow}</div>}
                    <div className="text-base font-semibold">{preview.chat.title}</div>
                    {preview.chat.summary && <p className="whitespace-pre-line text-base-content/80">{preview.chat.summary.replace(/\*/g, "")}</p>}
                    {preview.chat.facts?.map((f) => (
                      <div key={f.label} className="text-base-content/80">
                        <span className="font-semibold">{f.label}: </span>
                        {f.value}
                      </div>
                    ))}
                    {preview.chat.rows?.map((r, i) => (
                      <div key={i} className="flex items-start justify-between gap-4 border-t border-base-300 pt-2">
                        <div>
                          <div className="font-semibold">{r.label}</div>
                          {r.detail && <div className="text-xs text-base-content/60">{r.detail}</div>}
                        </div>
                        {r.value && <div className="whitespace-nowrap font-semibold">{r.value}</div>}
                      </div>
                    ))}
                    {preview.chat.notes?.map((n) => (
                      <p key={n} className="text-xs text-base-content/60">
                        {n}
                      </p>
                    ))}
                    <div className="flex flex-wrap gap-2">
                      {preview.chat.actions.map((a) => (
                        <a key={a.url} href={a.url} target="_blank" rel="noreferrer" className={btn.xsSecondary}>
                          {a.label}
                        </a>
                      ))}
                    </div>
                    <details>
                      <summary className="cursor-pointer text-xs text-base-content/60">Payload</summary>
                      <pre className="mt-2 overflow-x-auto text-[11px]">{JSON.stringify(preview.payload, null, 2)}</pre>
                    </details>
                  </div>
                )}
                {!preview && !previewError && current && (
                  <div className="flex justify-center p-10">
                    <Spinner />
                  </div>
                )}
                {!messages.length && <EmptyState title="No messages in this batch" />}
              </div>
            </Panel>
          </section>
        ) : (
          <Panel>
            <EmptyState title="Pick a batch">Its messages show here exactly as they&apos;ll arrive.</EmptyState>
          </Panel>
        )}
      </div>
    </>
  )
}
