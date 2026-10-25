"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { Select } from "@/components/ui/Select"
import { AUTHORITIES, KINDS, STAGES } from "@/libs/tariff-updates/types"
import { formatTime } from "../hts-revision-diff/shared"
import { Callout, DefList, Drawer, Field, Pill, SectionLabel, Spinner, btn, inputCls } from "../hts-revision-diff/ui"
import { sourceLabel } from "./ItemsTable"
import ImpactCheck from "./ImpactCheck"
import ScopeEditor from "./ScopeEditor"
import { adminCall, type SourceItemRow, type UpdateRow } from "./types"

// One update, for review, in a drawer over the list: why it was flagged first, then its wording,
// what it covers, its impact check and its sources (each can move to another update), with its
// facts in a rail. The footer holds the decision: mark it reviewed (then the next in the queue
// opens), publish or hide it. ← → step through the updates still to review.

const NEW = "__new__"

const day = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString(undefined, { dateStyle: "medium" }) : "")

const ItemRow = ({ item, others }: { item: SourceItemRow; others: UpdateRow[] }) => {
  const router = useRouter()
  const [target, setTarget] = useState("")
  const [moving, setMoving] = useState(false)
  const move = async () => {
    setMoving(true)
    try {
      await adminCall(`/api/tariff-updates/items/${item.id}`, "POST", { updateId: target === NEW ? null : target })
      toast.success("Moved")
      setTarget("")
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't move it")
    } finally {
      setMoving(false)
    }
  }
  return (
    <li className="flex flex-col gap-2 border-t border-base-content/10 py-3 first:border-t-0">
      <div className="flex flex-wrap items-center gap-2 text-xs text-base-content/55">
        <Pill>{item.stage ? STAGES[item.stage] : "—"}</Pill>
        <span className="font-medium text-base-content/80">{sourceLabel(item.source)}</span>
        {item.doc_type && <span>{item.doc_type}</span>}
        <span>{formatTime(item.published_at)}</span>
        {item.grouped_by && (
          <span title="How it joined this update">
            joined by {item.grouped_by}
            {item.match_confidence !== null && item.grouped_by === "claude" ? ` (${item.match_confidence})` : ""}
          </span>
        )}
      </div>
      <a href={item.url} target="_blank" rel="noreferrer" className="text-sm font-medium hover:underline">
        {item.title} <span className="text-base-content/35">↗</span>
      </a>
      {item.extraction?.notes && <p className="text-xs text-base-content/60">Note: {item.extraction.notes}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <Select<string>
          size="xs"
          label="Move to another update"
          placeholder="Move to…"
          className="w-full max-w-md"
          value={target}
          onChange={setTarget}
          options={[
            { value: NEW, label: "An update of its own" },
            ...others.map((u) => ({ value: u.id, label: `${day(u.last_activity_at)} · ${u.title}` })),
          ]}
        />
        {target && (
          <button type="button" className={btn.xsSecondary} onClick={move} disabled={moving}>
            {moving && <Spinner />}
            Move
          </button>
        )}
      </div>
    </li>
  )
}

export default function UpdateDetail({
  update,
  items,
  updates,
  queue,
  onOpen,
  onClose,
}: {
  update: UpdateRow | null
  items: SourceItemRow[]
  updates: UpdateRow[]
  // The updates still to review, in order: stepped through with ← →
  queue: string[]
  onOpen: (id: string) => void
  onClose: () => void
}) {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [summary, setSummary] = useState("")
  const [saving, setSaving] = useState(false)
  useEffect(() => {
    setTitle(update?.title ?? "")
    setSummary(update?.summary ?? "")
  }, [update])

  const own = useMemo(
    () => (update ? items.filter((i) => i.update_id === update.id).sort((a, b) => a.published_at.localeCompare(b.published_at)) : []),
    [items, update]
  )
  // Updates an item could move to: the others, within a year of this one, newest first
  const others = useMemo(() => {
    if (!update) return []
    const at = new Date(update.last_activity_at).getTime()
    return updates.filter((u) => u.id !== update.id && Math.abs(new Date(u.last_activity_at).getTime() - at) < 365 * 86_400_000)
  }, [updates, update])

  const position = update ? queue.indexOf(update.id) : -1
  const step = (by: number) => {
    const next = queue[position + by]
    if (next) onOpen(next)
  }
  // ← → through the queue, unless typing
  useEffect(() => {
    if (!update || position < 0) return
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest("input, textarea, select, [role=listbox]")) return
      if (e.key === "ArrowRight") step(1)
      if (e.key === "ArrowLeft") step(-1)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  const save = async (patch: Record<string, unknown>, done: string, { advance }: { advance?: boolean } = {}) => {
    if (!update) return
    setSaving(true)
    try {
      await adminCall(`/api/tariff-updates/${update.id}`, "PATCH", patch)
      toast.success(done)
      // Done with this one: on to the next still to review, or back to the list
      if (advance) {
        const next = queue.filter((id) => id !== update.id)[Math.max(0, position)]
        if (next) onOpen(next)
        else onClose()
      }
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save")
    } finally {
      setSaving(false)
    }
  }

  const textChanged = !!update && (title.trim() !== update.title || summary.trim() !== update.summary)

  return (
    <Drawer
      open={!!update}
      onClose={onClose}
      top={
        position >= 0 ? (
          <div className="flex items-center gap-2 text-sm">
            <button type="button" className={btn.xsSecondary} onClick={() => step(-1)} disabled={position === 0} aria-label="Previous to review">
              ←
            </button>
            <button type="button" className={btn.xsSecondary} onClick={() => step(1)} disabled={position >= queue.length - 1} aria-label="Next to review">
              →
            </button>
            <span className="text-base-content/60">
              To review: {position + 1} of {queue.length}
            </span>
          </div>
        ) : (
          <span className="text-sm text-base-content/60">Tariff update</span>
        )
      }
      title={update?.title ?? ""}
      description={
        update && (
          <span className="flex flex-wrap items-center gap-2">
            <Pill tone={update.status === "published" ? "success" : "neutral"}>{update.status === "published" ? "Published" : "Hidden"}</Pill>
            {update.needs_review && <Pill tone="warning">Needs review</Pill>}
            <span>
              {STAGES[update.stage]} · latest {day(update.last_activity_at)}
            </span>
            {update.status === "published" && (
              <a href={`/tariff-updates/${update.slug}`} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                Public page ↗
              </a>
            )}
          </span>
        )
      }
      footer={
        update && (
          <>
            <span className="text-sm text-base-content/60">
              {update.needs_review
                ? update.status === "published"
                  ? "Published, but no news email or alerts until it's reviewed."
                  : "Hidden: not on the site, no email or alerts."
                : update.status === "published"
                  ? "Live on the site."
                  : "Hidden from the site."}
            </span>
            <span className="ml-auto flex flex-wrap gap-2">
              {update.status === "published" ? (
                <button type="button" className={btn.ghost} disabled={saving} onClick={() => save({ status: "hidden" }, "Hidden")}>
                  Hide
                </button>
              ) : (
                <button
                  type="button"
                  className={update.needs_review ? btn.secondary : btn.primary}
                  disabled={saving}
                  onClick={() => save({ status: "published", needs_review: false }, "Published", { advance: update.needs_review })}
                >
                  Publish{update.needs_review ? " and mark reviewed" : ""}
                </button>
              )}
              {update.needs_review && update.status === "published" && (
                <button type="button" className={btn.primary} disabled={saving} onClick={() => save({ needs_review: false }, "Marked reviewed", { advance: true })}>
                  {saving && <Spinner />}
                  Mark reviewed
                </button>
              )}
            </span>
          </>
        )
      }
    >
      {update && (
        <div className="grid min-h-full lg:grid-cols-[minmax(0,1fr)_19rem]">
          <div className="flex min-w-0 flex-col gap-8 px-6 py-6">
            {update.needs_review && update.review_notes && (
              <Callout tone="warning" title="Why it was flagged">
                <span className="whitespace-pre-line">{update.review_notes}</span>
              </Callout>
            )}
            <section className="flex flex-col gap-3">
              <SectionLabel
                right={
                  textChanged && (
                    <>
                      <button
                        type="button"
                        className={btn.xsGhost}
                        onClick={() => {
                          setTitle(update.title)
                          setSummary(update.summary)
                        }}
                      >
                        Undo
                      </button>
                      <button type="button" className={btn.xsPrimary} disabled={saving} onClick={() => save({ title, summary }, "Saved. Later sources won't overwrite it.")}>
                        Save wording
                      </button>
                    </>
                  )
                }
              >
                Wording
              </SectionLabel>
              <Field label="Title" hint={update.edited ? "Edited by hand: sources no longer change it" : undefined}>
                <input className={`${inputCls} w-full`} value={title} onChange={(e) => setTitle(e.target.value)} />
              </Field>
              <Field label="Summary">
                <textarea
                  className="textarea min-h-28 w-full border-base-content/15 text-sm tracker:rounded-xl tracker:border-base-300"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                />
              </Field>
            </section>
            <ScopeEditor update={update} />
            <ImpactCheck updateId={update.id} version={`${update.scope_read_at ?? ""}${update.scope_source ?? ""}${(update.scope_codes ?? []).length}`} />
            <section className="flex flex-col gap-1">
              <SectionLabel>Sources ({own.length})</SectionLabel>
              <ul>
                {own.map((item) => (
                  <ItemRow key={item.id} item={item} others={others} />
                ))}
              </ul>
            </section>
          </div>
          <aside className="flex flex-col gap-4 border-base-300 bg-tt-soft/50 px-6 py-6 lg:border-l">
            <SectionLabel>Details</SectionLabel>
            <DefList
              narrow
              items={[
                { label: "Stage", value: STAGES[update.stage] },
                { label: "Authority", value: AUTHORITIES[update.authority] ?? update.authority },
                { label: "Kind", value: KINDS[update.kind] ?? update.kind },
                { label: "Effective", value: update.effective_on ? day(update.effective_on) : "—" },
                { label: "Countries", value: update.countries.length ? update.countries.join(", ") : "—" },
                { label: "Products", value: update.products ?? "—" },
                {
                  label: "HTS codes",
                  value: update.hts_codes.length
                    ? `${update.hts_codes.slice(0, 24).join(", ")}${update.hts_codes.length > 24 ? ` and ${update.hts_codes.length - 24} more` : ""}`
                    : "—",
                },
                { label: "First seen", value: formatTime(update.first_seen_at) },
                { label: "Address", value: <span className="font-mono text-xs">/tariff-updates/{update.slug}</span> },
              ]}
            />
          </aside>
        </div>
      )}
    </Drawer>
  )
}
