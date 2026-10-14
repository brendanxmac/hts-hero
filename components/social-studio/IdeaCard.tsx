"use client"

import { useState } from "react"
import toast from "react-hot-toast"
import type { Format } from "@/social/brand"
import type { Post } from "@/social/types"
import type { Idea } from "@/libs/social-studio/ideas"
import { btn, Pill, Spinner } from "../hts-revision-diff/ui"
import PostCard from "./PostCard"

// A saved idea (a daily pick, or a post made from the News tab): its post, why it's worth making,
// and its status. Edits to the words and captions stay local until saved.

const STATUS_TONE = { new: "info", used: "success", skipped: "neutral" } as const
const STATUS_LABEL = { new: "New", used: "Used", skipped: "Skipped" } as const

const patchIdea = async (body: Record<string, unknown>) => {
  const res = await fetch("/api/social-studio/ideas", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
  if (!res.ok) throw new Error((await res.json()).error ?? "Couldn't save")
}

export default function IdeaCard({ idea, format, onChange }: { idea: Idea; format: Format; onChange: (idea: Idea) => void }) {
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)

  const edit = (patch: Partial<Idea>) => {
    onChange({ ...idea, ...patch })
    setDirty(true)
  }

  const save = async () => {
    if (!idea.id) return toast.error("This idea isn't saved; apply the social_ideas migration first")
    setSaving(true)
    try {
      await patchIdea({ id: idea.id, props: idea.props, captions: idea.captions })
      setDirty(false)
      toast.success("Saved")
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const setStatus = async (status: Idea["status"]) => {
    onChange({ ...idea, status })
    if (!idea.id) return
    try {
      await patchIdea({ id: idea.id, status })
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  return (
    <PostCard
      post={{ key: `${idea.kind}-${idea.id ?? idea.position}`, template: idea.template, title: idea.title, props: idea.props } as Post}
      format={format}
      captions={idea.captions}
      onProps={(props) => edit({ props })}
      onCaptions={(captions) => edit({ captions })}
      badge={<Pill tone={STATUS_TONE[idea.status]}>{STATUS_LABEL[idea.status]}</Pill>}
      about={
        <div className="rounded-lg bg-base-content/[0.04] px-3 py-2 text-sm text-base-content/70">
          <span className="font-medium text-base-content">Why: </span>
          {idea.why} <span className="text-base-content/40">· {idea.kind}</span>
        </div>
      }
      actions={
        <div className="flex gap-1">
          {dirty && (
            <button className={btn.xsPrimary} disabled={saving} onClick={save}>
              {saving && <Spinner />} Save changes
            </button>
          )}
          {idea.status !== "used" && (
            <button className={btn.xsSecondary} onClick={() => setStatus("used")}>
              Mark used
            </button>
          )}
          {idea.status !== "skipped" && (
            <button className={btn.xsGhost} onClick={() => setStatus("skipped")}>
              Skip
            </button>
          )}
          {idea.status !== "new" && (
            <button className={btn.xsGhost} onClick={() => setStatus("new")}>
              Undo
            </button>
          )}
        </div>
      }
    />
  )
}
