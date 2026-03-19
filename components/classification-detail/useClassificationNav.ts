"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { ClassificationI } from "../../interfaces/hts"

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

    // Old classifications have levels but no preliminaryLevels - skip section/chapter tabs
    const hasLevelsWithSelections =
      (classification.levels?.length ?? 0) > 0 &&
      classification.levels?.some((l) => l.selection)
    const sectionDone =
      hasLevelsWithSelections || (sectionLevel?.candidates?.length ?? 0) > 0
    const chapterDone =
      hasLevelsWithSelections || (chapterLevel?.candidates?.length ?? 0) > 0

    // For old classifications (no preliminaryLevels), skip section/chapter and show levels only
    if (!hasLevelsWithSelections) {
      items.push({
        id: "classification-section",
        label: "Sections",
        status: sectionDone ? "completed" : "active",
        isSubItem: true,
      })

      if (sectionDone) {
        items.push({
          id: "classification-chapter",
          label: "Chapters",
          status: chapterDone ? "completed" : "active",
          isSubItem: true,
        })
      }
    }

    if (chapterDone || hasLevelsWithSelections) {
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

  // Auto-advance when a step completes (e.g. section discovery finishes while
  // the user is watching it). Only fires on data changes — NOT on tab changes —
  // so user-initiated navigation is never overridden.
  useEffect(() => {
    if (!classification) return
    if (classification.isComplete) return
    if (!firstIncompleteLevel || activeTab === firstIncompleteLevel.id) return

    const currentItem = navItems.find((i) => i.id === activeTab)
    if (currentItem?.isSubItem && currentItem?.status === "completed") {
      setActiveTab(firstIncompleteLevel.id)
    }
  }, [classification?.levels, classification?.preliminaryLevels, navItems])

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
