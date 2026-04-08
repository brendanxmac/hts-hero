"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { ClassificationI } from "../../interfaces/hts"
import {
  getPreferredPreliminarySectionChapterIds,
  preliminaryNavDisplay,
} from "../../libs/classification-helpers"

export type NavTab =
  | "overview"
  | "classification-section"
  | "classification-chapter"
  | `classification-level-${number}`
  | "cross-rulings"
  | "duty-tariffs"
  | "attachments"
  | "classification-report"

export type NavItemStatus = "completed" | "active" | "pending" | "locked"

export interface ClassificationNavItem {
  id: NavTab
  label: string
  status: NavItemStatus
  isSubItem?: boolean
  htsno?: string
  selectionDescription?: string
  lockedForAnon?: boolean
}

export const ANON_LOCKED_TABS: ReadonlySet<NavTab> = new Set<NavTab>([
  "cross-rulings",
  "attachments",
  "classification-report",
])

export function getSubGroupName(
  levelIndex: number,
  levels: ClassificationI["levels"],
): string {
  for (let i = levelIndex - 1; i >= 0; i--) {
    const prev = levels[i]?.selection
    if (prev?.htsno) {
      const d = prev.htsno.replace(/\./g, "").length
      if (d <= 4) return "Heading Sub Group"
      if (d <= 6) return "Subheading Sub Group"
      if (d <= 8) return "US Subheading Sub Group"
      return "Statistical Suffix Sub Group"
    }
  }
  return "Sub Group"
}

function getLevelLabel(
  levelIndex: number,
  levels: ClassificationI["levels"],
): string {
  const level = levels[levelIndex]
  const selection = level?.selection

  if (selection && !selection.htsno) {
    return getSubGroupName(levelIndex, levels)
  }

  const htsno = selection?.htsno || ""
  const digitCount = htsno.replace(/\./g, "").length

  if (digitCount === 4) return "Heading (4-digit)"
  if (digitCount === 6) return "Subheading (6-digit)"
  if (digitCount === 8) return "US Subheading (8-digit)"
  if (digitCount === 10) return "Statistical Suffix (10-digit)"

  if (!selection) {
    return ""
  }

  return ""
}

export function useClassificationNav(classification: ClassificationI | null) {
  const navItems = useMemo<ClassificationNavItem[]>(() => {
    if (!classification) return []

    const items: ClassificationNavItem[] = [
      { id: "overview", label: "Overview", status: "completed" },
    ]

    const sectionLevel = classification.preliminaryLevels?.find(
      (l) => l.level === "section",
    )
    const chapterLevel = classification.preliminaryLevels?.find(
      (l) => l.level === "chapter",
    )

    const hasLevelSelections =
      classification.levels?.some((l) => l.selection) ?? false
    const sectionHasCandidates =
      (sectionLevel?.candidates?.length ?? 0) > 0
    const chapterHasCandidates =
      (chapterLevel?.candidates?.length ?? 0) > 0

    // Legacy: completed HTS path saved before section/chapter prelims existed
    const isLegacyNoPreliminaryLevels =
      hasLevelSelections && !sectionHasCandidates && !chapterHasCandidates

    const sectionDone =
      hasLevelSelections || sectionHasCandidates
    const chapterDone =
      hasLevelSelections || chapterHasCandidates

    const topSectionCandidate = sectionLevel?.candidates?.[0]
    const topChapterCandidate = chapterLevel?.candidates?.[0]

    const { sectionId: preferredSectionId, chapterId: preferredChapterId } =
      getPreferredPreliminarySectionChapterIds(classification)

    const sectionRow = preliminaryNavDisplay(
      "section",
      sectionLevel?.candidates,
      preferredSectionId,
      topSectionCandidate,
    )
    const chapterRow = preliminaryNavDisplay(
      "chapter",
      chapterLevel?.candidates,
      preferredChapterId,
      topChapterCandidate,
    )

    if (!isLegacyNoPreliminaryLevels) {
      items.push({
        id: "classification-section",
        label: "Sections",
        status: sectionDone ? "completed" : "active",
        isSubItem: true,
        htsno: sectionRow.htsno,
        selectionDescription: sectionRow.selectionDescription,
      })

      if (sectionDone) {
        items.push({
          id: "classification-chapter",
          label: "Chapters",
          status: chapterDone ? "completed" : "active",
          isSubItem: true,
          htsno: chapterRow.htsno,
          selectionDescription: chapterRow.selectionDescription,
        })
      }
    }

    if (chapterDone || hasLevelSelections) {
      const levels = classification.levels ?? []
      levels.forEach((level, index) => {
        const previousDone =
          index === 0
            ? true
            : !!(classification.levels ?? [])[index - 1]?.selection

        const status: NavItemStatus = level.selection
          ? "completed"
          : previousDone
            ? "active"
            : "pending"

        items.push({
          id: `classification-level-${index}`,
          label: level.selection
            ? "Current Level"
            : getLevelLabel(index, classification.levels ?? []),
          status,
          isSubItem: true,
          htsno: level.selection?.htsno || undefined,
          selectionDescription: level.selection?.description || undefined,
        })
      })
    }

    items.push(
      { id: "duty-tariffs", label: "Duty / Tariffs", status: "pending" },
      {
        id: "cross-rulings",
        label: "CROSS Ruling Validation",
        status: "pending",
        lockedForAnon: true,
      },
      {
        id: "attachments",
        label: "Attachments",
        status: "pending",
        lockedForAnon: true,
      },
      {
        id: "classification-report",
        label: "Classification Report",
        status: "pending",
        lockedForAnon: true,
      },
    )

    return items
  }, [classification])

  const firstIncompleteLevel = useMemo(() => {
    return navItems.find((item) => item.isSubItem && item.status === "active")
  }, [navItems])

  const [activeTab, setActiveTab] = useState<NavTab>("overview")
  const hasSetInitialTab = useRef(false)
  /** Last known nav status for `activeTab`; used to detect active → completed transitions only. */
  const prevActiveTabNavRef = useRef<{
    tab: NavTab
    status: NavItemStatus | undefined
  } | null>(null)

  // Jump to the correct tab once when the classification first loads.
  // Complete → overview. In-progress → first incomplete level.
  useEffect(() => {
    if (hasSetInitialTab.current) return
    if (!classification) return

    hasSetInitialTab.current = true

    if (classification.isComplete) return // stay on overview

    if (firstIncompleteLevel) {
      setActiveTab(firstIncompleteLevel.id)
    }
  }, [classification, firstIncompleteLevel])

  // Auto-advance only when the tab the user is on *just became* completed (e.g. they
  // selected a candidate or discovery finished). Do not advance when `levels` changes
  // for other reasons (e.g. removing an extra candidate while reviewing an earlier step).
  useEffect(() => {
    if (!classification) return
    if (classification.isComplete) return

    const currentItem = navItems.find((i) => i.id === activeTab)
    const prev = prevActiveTabNavRef.current

    if (
      prev &&
      prev.tab === activeTab &&
      prev.status === "active" &&
      currentItem?.isSubItem &&
      currentItem.status === "completed" &&
      firstIncompleteLevel &&
      firstIncompleteLevel.id !== activeTab
    ) {
      setActiveTab(firstIncompleteLevel.id)
    }

    prevActiveTabNavRef.current =
      currentItem !== undefined
        ? { tab: activeTab, status: currentItem.status }
        : { tab: activeTab, status: undefined }
  }, [
    classification?.levels,
    classification?.preliminaryLevels,
    classification?.isComplete,
    navItems,
    activeTab,
    firstIncompleteLevel,
  ])

  const navigateToTab = useCallback((tab: NavTab) => {
    setActiveTab(tab)
  }, [])

  return {
    activeTab,
    setActiveTab: navigateToTab,
    navItems,
    firstIncompleteLevel,
  }
}
