"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"
import type { Audience, MarketingEmailInfo } from "@/libs/email/marketing"
import { btn, Callout, EmptyState, Field, inputCls, Modal, Panel, Segmented, Spinner } from "../hts-revision-diff/ui"

// The Content Studio's Marketing Emails tab: every email under emails/marketing/<campaign>/, each
// with a subject and preview line you write here, a rendered preview, a test copy to the admin,
// and a send behind a confirm. Sends go through the outbox (libs/email/marketing.ts); whoever
// already has an email is left out, so it never reaches anyone twice. Drafts stay in this browser.

const API = "/api/social-studio/marketing-emails"
const DRAFT_STORE = (file: string) => `content-studio:marketing:${file}`

const AUDIENCE_LABEL: Record<Audience, string> = {
  users: "All users",
  accounts: "Account emails on",
  news: "Tariff news subscribers",
  everyone: "Everyone",
}
const AUDIENCE_HINT: Record<Audience, string> = {
  users: "Every account with an email, minus only those who unsubscribed. Anyone who clicks unsubscribe is never sent another.",
  accounts: "Every account, minus anyone who turned account emails off or unsubscribed.",
  news: "Confirmed tariff news subscribers who haven't turned news off or unsubscribed.",
  everyone: "All users and tariff news subscribers, once per address.",
}

// Roughly what one send gets through before the outbox cron takes over (about four minutes)
const SENDS_AT_ONCE = 5000

type Counts = Record<Audience, { willGet: number; alreadySent: number }>

interface Draft {
  subject: string
  preview: string
}

const readDraft = (e: MarketingEmailInfo): Draft => {
  try {
    const saved = localStorage.getItem(DRAFT_STORE(e.file))
    if (saved) return { subject: e.subject, preview: e.preview, ...JSON.parse(saved) }
  } catch {
    // Storage blocked or a bad entry: start from the file's own
  }
  return { subject: e.subject, preview: e.preview }
}

const saveDraft = (file: string, d: Draft) => {
  try {
    localStorage.setItem(DRAFT_STORE(file), JSON.stringify(d))
  } catch {
    // Storage blocked: the draft just isn't kept
  }
}

const post = async (body: Record<string, unknown>) => {
  const res = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error ?? `Failed (${res.status})`)
  return json
}

const people = (n: number) => `${n.toLocaleString()} ${n === 1 ? "person" : "people"}`

export default function MarketingEmails() {
  const [emails, setEmails] = useState<MarketingEmailInfo[] | null>(null)
  const [file, setFile] = useState<string | null>(null)
  const [draft, setDraft] = useState<Draft>({ subject: "", preview: "" })
  const [audience, setAudience] = useState<Audience>("users")
  const [counts, setCounts] = useState<Counts | null>(null)
  const [html, setHtml] = useState<string | null>(null)
  const [busy, setBusy] = useState<"test" | "send" | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadEmails = useCallback(async () => {
    try {
      const res = await fetch(API)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? `Failed (${res.status})`)
      setEmails(json.emails)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }, [])
  useEffect(() => {
    loadEmails()
  }, [loadEmails])

  const selected = useMemo(() => emails?.find((e) => e.file === file) ?? null, [emails, file])

  const loadCounts = useCallback(async (f: string) => {
    setCounts(null)
    try {
      const res = await fetch(`${API}?file=${encodeURIComponent(f)}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? `Failed (${res.status})`)
      setCounts(json.counts)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }, [])

  const pick = (e: MarketingEmailInfo) => {
    setFile(e.file)
    setDraft(readDraft(e))
    setHtml(null)
    setError(null)
    loadCounts(e.file)
    post({ action: "preview", file: e.file })
      .then((r) => setHtml(r.html))
      .catch((err) => setError(err.message))
  }

  const edit = (change: Partial<Draft>) => {
    const next = { ...draft, ...change }
    setDraft(next)
    if (file) saveDraft(file, next)
  }

  const sendTest = async () => {
    if (!file) return
    setBusy("test")
    try {
      const r = await post({ action: "test", file, ...draft })
      toast.success(`Test sent to ${r.to}`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(null)
    }
  }

  const send = async () => {
    if (!file) return
    setBusy("send")
    try {
      const r = await post({ action: "send", file, audience, ...draft })
      setConfirming(false)
      if (!r.queued) toast.success("Nothing to send: everyone in this audience already has it")
      else if (r.sent + r.failed >= r.queued) toast.success(`Sent to ${people(r.sent)}`)
      else
        toast.success(`Sending to ${people(r.queued)}: ${r.sent.toLocaleString()} sent so far. The outbox sends the rest every 15 minutes; track it in /email-outbox.`, {
          duration: 10000,
        })
      if (r.failed) toast.error(`${r.failed.toLocaleString()} failed. See /email-outbox.`)
      loadCounts(file)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(null)
    }
  }

  // Emails grouped by campaign folder
  const groups = useMemo(() => {
    const map = new Map<string, MarketingEmailInfo[]>()
    for (const e of emails ?? []) map.set(e.campaign, [...(map.get(e.campaign) ?? []), e])
    return Array.from(map.entries())
  }, [emails])

  const count = counts?.[audience]
  const canSend = !!selected && !!draft.subject.trim() && !!count?.willGet && !busy

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
      <Panel
        title="Emails"
        count={emails?.length}
        actions={
          <button className={btn.xsGhost} onClick={loadEmails}>
            Refresh
          </button>
        }
        bodyClassName="flex flex-col gap-4 p-3"
        className="self-start"
      >
        {!emails ? (
          <Spinner />
        ) : !emails.length ? (
          <p className="px-2 py-1 text-sm text-base-content/60">
            None yet. Copy <code>emails/marketing/_starter/StarterEmail.tsx</code> into <code>emails/marketing/&lt;campaign&gt;/</code>, then Refresh.
          </p>
        ) : (
          groups.map(([campaign, list]) => (
            <div key={campaign || "_"}>
              <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-base-content/50">{campaign || "No campaign"}</p>
              {list.map((e) => (
                <button
                  key={e.file}
                  onClick={() => pick(e)}
                  className={`flex w-full flex-col rounded-xl px-3 py-2 text-left transition-colors ${
                    e.file === file ? "bg-primary/10 text-primary" : "hover:bg-base-content/5"
                  }`}
                >
                  <span className="text-sm font-semibold">{e.name}</span>
                  {e.subject && <span className="truncate text-xs text-base-content/60">{e.subject}</span>}
                </button>
              ))}
            </div>
          ))
        )}
      </Panel>

      <div className="flex min-w-0 flex-col gap-4">
        {error && <Callout tone="error">{error}</Callout>}
        {!selected ? (
          <Panel>
            <EmptyState title="Pick an email">Every file under emails/marketing/ shows up on the left, grouped by its campaign folder.</EmptyState>
          </Panel>
        ) : (
          <>
            <Panel title={selected.name} bodyClassName="flex flex-col gap-4 px-6 py-5">
              <Field label="Subject">
                <input className={`${inputCls} w-full`} value={draft.subject} maxLength={200} onChange={(e) => edit({ subject: e.target.value })} placeholder="What gets the open" />
              </Field>
              <Field label="Preview" hint="The line inboxes show after the subject.">
                <input className={`${inputCls} w-full`} value={draft.preview} maxLength={300} onChange={(e) => edit({ preview: e.target.value })} placeholder="What makes them open it" />
              </Field>
              <Field label="Who gets it" hint={AUDIENCE_HINT[audience]}>
                <div>
                  <Segmented<Audience>
                    value={audience}
                    onChange={setAudience}
                    options={(Object.keys(AUDIENCE_LABEL) as Audience[]).map((a) => ({
                      value: a,
                      label: (
                        <>
                          {AUDIENCE_LABEL[a]}
                          <span className="tabular-nums text-base-content/50">{counts ? counts[a].willGet.toLocaleString() : "…"}</span>
                        </>
                      ),
                    }))}
                  />
                </div>
              </Field>
              {!!count?.alreadySent && (
                <p className="text-sm text-base-content/60">{people(count.alreadySent)} in this audience already have it and won&apos;t get it again.</p>
              )}
              <div className="flex flex-wrap items-center gap-2 border-t border-base-300 pt-4">
                <button className={btn.secondary} onClick={sendTest} disabled={!!busy || !draft.subject.trim()}>
                  {busy === "test" ? <Spinner /> : null}
                  Send me a test
                </button>
                <button className={btn.primary} onClick={() => setConfirming(true)} disabled={!canSend}>
                  {count ? `Send to ${people(count.willGet)}…` : "Send…"}
                </button>
              </div>
            </Panel>

            <Panel title="Preview" bodyClassName="flex flex-col">
              {/* How it reads in an inbox list */}
              <div className="border-b border-base-300 px-6 py-3 text-sm">
                <span className="font-semibold">HTS Hero</span>
                <span className="mx-2 text-base-content/30">·</span>
                <span className="font-semibold">{draft.subject || <span className="text-base-content/40">No subject</span>}</span>
                <span className="text-base-content/55"> — {draft.preview || "No preview"}</span>
              </div>
              {html ? (
                <iframe title="Email preview" srcDoc={html} className="h-[1000px] w-full bg-white" sandbox="allow-popups allow-popups-to-escape-sandbox" />
              ) : (
                <div className="p-6">
                  <Spinner />
                </div>
              )}
            </Panel>
          </>
        )}
      </div>

      <Modal
        open={confirming}
        onClose={() => busy !== "send" && setConfirming(false)}
        title={`Send to ${count ? people(count.willGet) : "…"}?`}
        description="It goes out right away and can't be called back."
        footer={
          <>
            <button className={btn.ghost} onClick={() => setConfirming(false)} disabled={busy === "send"}>
              Cancel
            </button>
            <button className={btn.primary} onClick={send} disabled={!canSend}>
              {busy === "send" ? <Spinner /> : null}
              Yes, send it
            </button>
          </>
        }
      >
        <dl className="grid grid-cols-[110px_minmax(0,1fr)] gap-x-4 gap-y-2 text-sm">
          <dt className="text-base-content/60">Email</dt>
          <dd className="font-medium">{selected?.file}</dd>
          <dt className="text-base-content/60">Subject</dt>
          <dd className="font-medium">{draft.subject}</dd>
          <dt className="text-base-content/60">Preview</dt>
          <dd>{draft.preview || <span className="text-base-content/40">None</span>}</dd>
          <dt className="text-base-content/60">To</dt>
          <dd>
            {AUDIENCE_LABEL[audience]} · {count ? people(count.willGet) : "…"}
            {!!count?.alreadySent && <span className="text-base-content/60"> ({count.alreadySent.toLocaleString()} already have it)</span>}
          </dd>
        </dl>
        {busy === "send" && <p className="mt-4 text-sm text-base-content/60">Sending… keep this open. A big list can take a few minutes.</p>}
        {busy !== "send" && !!count && count.willGet > SENDS_AT_ONCE && (
          <p className="mt-4 text-sm text-base-content/60">
            About {SENDS_AT_ONCE.toLocaleString()} go right away; the outbox sends the rest every 15 minutes until everyone has it. Nobody gets it twice.
          </p>
        )}
      </Modal>
    </div>
  )
}
