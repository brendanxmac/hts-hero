import { MixpanelEvent, trackEvent } from "./mixpanel"
import {
  resolveExplorerSurface,
  type ExplorerSurface,
} from "./explorer-surface"

export type ExplorerNavigationKind =
  | "deeper_child"
  | "deeper_chapter"
  | "deeper_heading"
  | "back"
  | "breadcrumb"
  | "search_result"
  | "url_code"

export function trackExplorerNavigatedToLevel(params: {
  pathname: string | null | undefined
  explorerSurface?: ExplorerSurface
  navigation_kind: ExplorerNavigationKind
  from_depth: number
  to_depth: number
  /** Breadcrumb segment index navigated to (0-based), when kind is `breadcrumb` */
  breadcrumb_index?: number
  hts_code?: string | null
  chapter_number?: number | null
}) {
  const explorer_surface = resolveExplorerSurface(
    params.explorerSurface,
    params.pathname,
  )

  const payload: Record<string, unknown> = {
    explorer_surface,
    navigation_kind: params.navigation_kind,
    from_depth: params.from_depth,
    to_depth: params.to_depth,
    depth_delta: params.to_depth - params.from_depth,
  }

  if (params.breadcrumb_index !== undefined) {
    payload.breadcrumb_index = params.breadcrumb_index
  }
  if (params.hts_code) {
    payload.hts_code = params.hts_code
  }
  if (params.chapter_number != null) {
    payload.chapter_number = params.chapter_number
  }

  trackEvent(MixpanelEvent.EXPLORER_NAVIGATED_TO_LEVEL, payload)
}
