"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { ClassificationI } from "../../interfaces/hts"

export type NavTab =
  | "overview"
  | "classification-section"
  | "classification-chapter"
  | `classification-level-${number}`
  | "cross-rulings"
  | "classification-defense"
  | "duty-tariffs"
  | "attachments"
  | "audit-report"

export type NavItemStatus = "completed" | "active" | "pending" | "locked"

export interface ClassificationNavItem {
  id: NavTab
  label: string
  status: NavItemStatus
  isSubItem?: boolean
  htsno?: string
  selectionDescription?: string
}

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
    return `Level ${levelIndex + 1}`
  }

  return `Level ${levelIndex + 1}`
}

export function useClassificationNav(classification: ClassificationI | null) {
  const navItems = useMemo<ClassificationNavItem[]>(() => {
    if (!classification) return []

    const items: ClassificationNavItem[] = [
      { id: "overview", label: "Overview", status: "completed" },
    ]

    const hasPreliminary = !!classification.preliminaryLevels?.length

    if (hasPreliminary) {
      const sectionLevel = classification.preliminaryLevels?.find(
        (l) => l.level === "section",
      )
      const chapterLevel = classification.preliminaryLevels?.find(
        (l) => l.level === "chapter",
      )

      const sectionDone = (sectionLevel?.candidates?.length ?? 0) > 0
      const chapterDone = (chapterLevel?.candidates?.length ?? 0) > 0

      items.push({
        id: "classification-section",
        label: "Sections",
        status: sectionDone ? "completed" : "active",
        isSubItem: true,
      })

      items.push({
        id: "classification-chapter",
        label: "Chapters",
        status: chapterDone ? "completed" : sectionDone ? "active" : "pending",
        isSubItem: true,
      })
    }

    classification.levels.forEach((level, index) => {
      const previousDone =
        index === 0
          ? hasPreliminary
            ? (classification.preliminaryLevels?.every(
                (p) => (p.candidates?.length ?? 0) > 0,
              ) ?? true)
            : true
          : !!classification.levels[index - 1]?.selection

      const status: NavItemStatus = level.selection
        ? "completed"
        : previousDone
          ? "active"
          : "pending"

      items.push({
        id: `classification-level-${index}`,
        label: level.selection ? "Current Level" : getLevelLabel(index, classification.levels),
        status,
        isSubItem: true,
        htsno: level.selection?.htsno || undefined,
        selectionDescription: level.selection?.description || undefined,
      })
    })

    items.push(
      { id: "cross-rulings", label: "CROSS Rulings", status: "pending" },
      {
        id: "classification-defense",
        label: "Classification Defense",
        status: "pending",
      },
      { id: "duty-tariffs", label: "Duty / Tariffs", status: "pending" },
      { id: "attachments", label: "Attachments", status: "pending" },
      { id: "audit-report", label: "Audit-Ready Report", status: "pending" },
    )

    return items
  }, [classification])

  const firstIncompleteLevel = useMemo(() => {
    return navItems.find((item) => item.isSubItem && item.status === "active")
  }, [navItems])

  const [activeTab, setActiveTab] = useState<NavTab>("overview")

  // Auto-advance to the next incomplete classification level when a selection is made
  useEffect(() => {
    if (!classification) return

    if (classification.isComplete) return

    if (firstIncompleteLevel && activeTab !== firstIncompleteLevel.id) {
      const currentItem = navItems.find((i) => i.id === activeTab)
      if (currentItem?.isSubItem && currentItem?.status === "completed") {
        setActiveTab(firstIncompleteLevel.id)
      }
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
