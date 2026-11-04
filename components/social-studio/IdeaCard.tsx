"use client"

import type { Format } from "@/social/brand"
import type { Post } from "@/social/types"
import type { Idea } from "@/libs/social-studio/ideas"
import PostCard from "./PostCard"

// An idea (from Find ideas, or a post made from the News tab): its post and why it's worth
// making. Nothing is stored; edits last until the page is closed.
export default function IdeaCard({ idea, format, onChange }: { idea: Idea; format: Format; onChange: (idea: Idea) => void }) {
  return (
    <PostCard
      post={{ key: `${idea.kind}-${idea.dedupe_key}`, template: idea.template, title: idea.title, props: idea.props, sources: idea.sources ?? [] } as Post}
      format={format}
      captions={idea.captions}
      onProps={(props) => onChange({ ...idea, props })}
      onCaptions={(captions) => onChange({ ...idea, captions })}
      about={
        <div className="rounded-lg bg-base-content/[0.04] px-3 py-2 text-sm text-base-content/70 tracker:rounded-xl tracker:bg-tt-soft">
          <span className="font-medium text-base-content">Why: </span>
          {idea.why} <span className="text-base-content/40">· {idea.kind}</span>
        </div>
      }
    />
  )
}
