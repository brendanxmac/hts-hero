"use client"

import { Player } from "@remotion/player"
import { ReactNode, useState } from "react"
import toast from "react-hot-toast"
import { Format, FORMATS, FPS } from "@/social/brand"
import type { Captions } from "@/social/captions"
import { COMPONENTS } from "@/social/components"
import { TEMPLATES } from "@/social/registry"
import type { Post, TemplateId } from "@/social/types"
import { btn, Field, inputCls, Panel, Spinner } from "../hts-revision-diff/ui"
import { renderPostInBrowser } from "./renderInBrowser"

// One post in the studio: its live preview, the words you can rewrite, its captions, and
// PNG/MP4 downloads rendered in the browser.

// The text fields each template lets you rewrite
const EDITABLE: Record<TemplateId, { key: string; label: string }[]> = {
  RateTimeline: [
    { key: "headline", label: "Headline" },
    { key: "product", label: "Product" },
  ],
  BigNumber: [
    { key: "eyebrow", label: "Eyebrow" },
    { key: "value", label: "Number" },
    { key: "label", label: "Sentence" },
  ],
  HeadToHead: [
    { key: "headline", label: "Headline" },
    { key: "product", label: "Product" },
  ],
  Ranking: [
    { key: "headline", label: "Headline" },
    { key: "product", label: "Product" },
  ],
  TradeShift: [
    { key: "headline", label: "Headline" },
    { key: "product", label: "Product" },
  ],
  SourcingSaver: [
    { key: "headline", label: "Headline" },
    { key: "product", label: "Product" },
  ],
  CountrySnapshot: [{ key: "headline", label: "Headline" }],
  RateSpread: [
    { key: "headline", label: "Headline" },
    { key: "product", label: "Product" },
  ],
  TopList: [
    { key: "kind", label: "Pill" },
    { key: "headline", label: "Headline" },
    { key: "subhead", label: "Subhead" },
    { key: "footnote", label: "Footnote" },
  ],
  Quiz: [
    { key: "question", label: "Question" },
    { key: "product", label: "Product" },
    { key: "reveal", label: "Answer line" },
  ],
  News: [
    { key: "headline", label: "Headline" },
    { key: "rateBefore", label: "Rate before" },
    { key: "rateAfter", label: "Rate after" },
    { key: "rateNote", label: "Rate applies to" },
    { key: "products", label: "What" },
  ],
}

const CopyBox = ({ label, text, onChange }: { label: string; text: string; onChange?: (text: string) => void }) => (
  <div>
    <div className="mb-1 flex items-center justify-between">
      <span className="text-xs font-medium text-base-content/55">
        {label} <span className="font-normal text-base-content/35">{text.length} chars</span>
      </span>
      <button className={btn.xsGhost} onClick={() => navigator.clipboard.writeText(text).then(() => toast.success(`${label} copied`))}>
        Copy
      </button>
    </div>
    <textarea
      readOnly={!onChange}
      value={text}
      onChange={(e) => onChange?.(e.target.value)}
      className="textarea textarea-bordered h-36 w-full border-base-content/15 text-xs leading-relaxed"
    />
  </div>
)

export default function PostCard({
  post,
  format,
  captions,
  onProps,
  onCaptions,
  badge,
  actions,
  about,
}: {
  post: Post
  format: Format
  captions: Captions
  onProps: (props: Post["props"]) => void
  // Ideas keep their own captions, so they're editable; built posts redraft theirs from the props
  onCaptions?: (captions: Captions) => void
  badge?: ReactNode
  actions?: ReactNode
  about?: ReactNode
}) {
  const [rendering, setRendering] = useState<string | null>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const { width, height } = FORMATS[format]
  const previewWidth = format === "landscape" ? 620 : format === "story" ? 340 : 430
  const props = post.props as unknown as Record<string, unknown>

  const download = async (kind: "png" | "mp4", frame?: number, suffix = "") => {
    const key = `${kind}${suffix}`
    setRendering(key)
    setProgress(null)
    try {
      const blob = await renderPostInBrowser({ post, format, kind, frame, onProgress: setProgress })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `hts-hero-${post.key}-${format}${suffix}.${kind}`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      toast.error(`Couldn't render: ${(e as Error).message}`)
    } finally {
      setRendering(null)
      setProgress(null)
    }
  }

  return (
    <Panel
      title={
        <span className="flex items-center gap-2">
          {post.title}
          <span className="font-normal text-base-content/40">· {TEMPLATES[post.template].label}</span>
          {badge}
        </span>
      }
      actions={actions}
    >
      <div className="flex gap-6 p-4">
        <div style={{ width: previewWidth }} className="shrink-0 overflow-hidden rounded-lg border border-base-content/10">
          <Player
            key={`${post.key}-${format}`}
            component={COMPONENTS[post.template]}
            inputProps={post.props}
            durationInFrames={TEMPLATES[post.template].seconds * FPS}
            fps={FPS}
            compositionWidth={width}
            compositionHeight={height}
            style={{ width: "100%" }}
            controls
            loop
            autoPlay
            initiallyMuted
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          {about}
          {EDITABLE[post.template]
            .filter((f) => f.key in props)
            .map((f) => (
              <Field key={f.key} label={f.label}>
                <input
                  className={`${inputCls} w-full`}
                  value={String(props[f.key] ?? "")}
                  onChange={(e) => onProps({ ...post.props, [f.key]: e.target.value } as Post["props"])}
                />
              </Field>
            ))}
          <div className="grid grid-cols-2 gap-3">
            <CopyBox label="LinkedIn" text={captions.linkedin} onChange={onCaptions && ((linkedin) => onCaptions({ ...captions, linkedin }))} />
            <CopyBox label="X" text={captions.x} onChange={onCaptions && ((x) => onCaptions({ ...captions, x }))} />
          </div>
          <div className="flex flex-wrap gap-2">
            {post.template === "Quiz" && (
              <button className={btn.secondary} disabled={!!rendering} onClick={() => download("png", Math.round(1.5 * FPS), "-question")}>
                {rendering === "png-question" && <Spinner />} Question PNG
              </button>
            )}
            <button className={btn.secondary} disabled={!!rendering} onClick={() => download("png")}>
              {rendering === "png" && <Spinner />} {post.template === "Quiz" ? "Answer PNG" : "Download PNG"}
            </button>
            <button className={btn.secondary} disabled={!!rendering} onClick={() => download("mp4")}>
              {rendering === "mp4" && <Spinner />} {rendering === "mp4" && progress !== null ? `Rendering ${Math.round(progress * 100)}%` : "Download MP4"}
            </button>
          </div>
        </div>
      </div>
    </Panel>
  )
}
