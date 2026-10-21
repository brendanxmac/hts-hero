"use client"

import { renderMediaOnWeb, renderStillOnWeb } from "@remotion/web-renderer"
import { Format, FORMATS, FPS } from "@/social/brand"
import { COMPONENTS } from "@/social/components"
import { compositionId, TEMPLATES } from "@/social/registry"
import type { Post } from "@/social/types"

// Renders a post to a PNG or MP4 in the browser (Remotion's web renderer: WebCodecs, no server),
// so downloads work on the deployed site as well as locally.

const composition = (post: Post, format: Format) => ({
  id: compositionId(post.template, format),
  component: COMPONENTS[post.template],
  width: FORMATS[format].width,
  height: FORMATS[format].height,
  fps: FPS,
  durationInFrames: TEMPLATES[post.template].seconds * FPS,
})

export const renderPostInBrowser = async ({
  post,
  format,
  kind,
  frame,
  onProgress,
}: {
  post: Post
  format: Format
  kind: "png" | "mp4"
  // For a still: the frame to draw; the video's last frame by default
  frame?: number
  onProgress?: (progress: number) => void
}): Promise<Blob> => {
  const comp = composition(post, format)
  const inputProps = post.props as unknown as Record<string, unknown>
  if (kind === "png") {
    const result = await renderStillOnWeb({ composition: comp, inputProps, frame: frame ?? comp.durationInFrames - 1 })
    return result.blob({ format: "png" })
  }
  const result = await renderMediaOnWeb({
    composition: comp,
    inputProps,
    container: "mp4",
    videoCodec: "h264",
    videoBitrate: "high",
    muted: true,
    onProgress: onProgress ? (p) => onProgress(p.progress) : null,
  })
  return result.getBlob()
}
