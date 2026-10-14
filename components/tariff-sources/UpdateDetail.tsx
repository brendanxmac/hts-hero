"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { AUTHORITIES, KINDS, STAGES } from "@/libs/tariff-updates/types"
import { formatTime } from "../hts-revision-diff/shared"
import { Callout, DefList, Field, Modal, Pill, Spinner, btn, inputCls, selectCls } from "../hts-revision-diff/ui"
import { sourceLabel } from "./ItemsTable"
import { adminCall, type SourceItemRow, type UpdateRow } from "./types"

// One update, for review: edit its title and summary, publish or hide it, clear its review flag,
// and fix its grouping by moving source items to another update or into one of their own.

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
        <select className={`${selectCls} select-xs max-w-md`} value={target} onChange={(e) => setTarget(e.target.value)}>
          <option value="">Move to…</option>
          <option value={NEW}>An update of its own</option>
          {others.map((u) => (
            <option key={u.id} value={u.id}>
              {day(u.last_activity_at)} · {u.title}
            </option>
          ))}
        </select>
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
  onClose,
}: {
  update: UpdateRow | null
  items: SourceItemRow[]
  updates: UpdateRow[]
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

  const save = async (patch: Record<string, unknown>, done: string) => {
    if (!update) return
    setSaving(true)
    try {
      await adminCall(`/api/tariff-updates/${update.id}`, "PATCH", patch)
      toast.success(done)
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save")
    } finally {
      setSaving(false)
    }
  }

  const textChanged = !!update && (title.trim() !== update.title || summary.trim() !== update.summary)

  return (
    <Modal
      open={!!update}
      onClose={onClose}
      wide
      title={update ? (update.status === "published" ? "Published update" : "Hidden update") : ""}
      description={update ? `/tariff-updates/${update.slug}` : undefined}
      footer={
        update && (
          <>
            {update.needs_review && (
              <button type="button" className={btn.secondary} disabled={saving} onClick={() => save({ needs_review: false }, "Marked reviewed")}>
                Mark reviewed
              </button>
            )}
            {update.status === "published" ? (
              <button type="button" className={btn.secondary} disabled={saving} onClick={() => save({ status: "hidden" }, "Hidden")}>
                Hide
              </button>
            ) : (
              <button type="button" className={btn.secondary} disabled={saving} onClick={() => save({ status: "published", needs_review: false }, "Published")}>
                Publish
              </button>
            )}
            <button
              type="button"
              className={btn.primary}
              disabled={saving || !textChanged}
              onClick={() => save({ title, summary }, "Saved. Later sources won't overwrite it.")}
            >
              {saving && <Spinner />}
              Save text
            </button>
          </>
        )
      }
    >
      {update && (
        <div className="flex flex-col gap-5">
          {update.needs_review && update.review_notes && (
            <Callout tone="warning" title="Needs review">
              <span className="whitespace-pre-line">{update.review_notes}</span>
            </Callout>
          )}
          <Field label="Title" hint={update.edited ? "Edited by hand: sources no longer change it" : undefined}>
            <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field label="Summary">
            <textarea className="textarea textarea-bordered min-h-28 border-base-content/15 text-sm" value={summary} onChange={(e) => setSummary(e.target.value)} />
          </Field>
          <DefList
            items={[
              { label: "Stage", value: STAGES[update.stage] },
              { label: "Authority", value: AUTHORITIES[update.authority] ?? update.authority },
              { label: "Kind", value: KINDS[update.kind] ?? update.kind },
              { label: "Effective", value: update.effective_on ?? "—" },
              { label: "Countries", value: update.countries.length ? update.countries.join(", ") : "—" },
              { label: "Products", value: update.products ?? "—" },
              {
                label: "HTS codes",
                value: update.hts_codes.length
                  ? `${update.hts_codes.slice(0, 40).join(", ")}${update.hts_codes.length > 40 ? ` and ${update.hts_codes.length - 40} more` : ""}`
                  : "—",
              },
              { label: "First seen", value: formatTime(update.first_seen_at) },
            ]}
          />
          <section>
            <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-base-content/50">Sources ({own.length})</h4>
            <ul>
              {own.map((item) => (
                <ItemRow key={item.id} item={item} others={others} />
              ))}
            </ul>
          </section>
        </div>
      )}
    </Modal>
  )
}
