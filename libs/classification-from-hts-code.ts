import {
  ClassificationI,
  ClassificationProgression,
  HtsElement,
  HtsSection,
  PreliminaryClassificationLevel,
} from "../interfaces/hts"
import {
  getDirectChildrenElements,
  getElementsInChapter,
  getHtsElementParents,
  getSectionAndChapterFromChapterNumber,
} from "./hts"
import {
  elementsAtClassificationLevel,
  setIndexInArray,
} from "../utilities/data"
import { htsCodeDigitsOnly, normalizeHtsCode } from "./hts-code"

export const EMDASH = "\u2014"

/** No user-supplied product text — skip LLM section/chapter/heading/analysis calls. */
export function lacksProductDescriptionForAnalysis(
  articleDescription: string | undefined | null,
): boolean {
  const t = articleDescription?.trim() ?? ""
  return t.length === 0 || t === EMDASH
}

/** US HTS: first four digits are the heading; chapter = floor(heading / 100). */
function impliedChapterFromTenDigitDigits(digits10: string): number {
  const heading4 = parseInt(digits10.slice(0, 4), 10)
  if (Number.isNaN(heading4)) return NaN
  return Math.floor(heading4 / 100)
}

function findLeafElementForTenDigitCode(
  htsElements: HtsElement[],
  normalizedDotted: string,
): HtsElement | undefined {
  const targetDigits = htsCodeDigitsOnly(normalizedDotted)
  const matches = htsElements.filter((el) => {
    if (!el.htsno?.trim()) return false
    return htsCodeDigitsOnly(el.htsno) === targetDigits
  })
  if (matches.length === 0) return undefined
  if (matches.length === 1) return matches[0]

  const implied = impliedChapterFromTenDigitDigits(targetDigits)
  if (!Number.isNaN(implied)) {
    const byChapter = matches.find((el) => el.chapter === implied)
    if (byChapter) return byChapter
  }
  return matches[0]
}

function buildPreliminaryLevels(
  sections: HtsSection[],
  chapterNumber: number,
): PreliminaryClassificationLevel[] | null {
  const details = getSectionAndChapterFromChapterNumber(sections, chapterNumber)
  if (!details) return null

  const sectionLevel: PreliminaryClassificationLevel = {
    level: "section",
    candidates: [
      {
        identifier: details.section.number,
        description: details.section.description,
      },
    ],
    analysis: "",
  }

  const chapterLevel: PreliminaryClassificationLevel = {
    level: "chapter",
    candidates: [
      {
        identifier: details.chapter.number,
        description: details.chapter.description,
      },
    ],
    analysis: "",
  }

  return [sectionLevel, chapterLevel]
}

export type BuildClassificationFromHtsCodeResult =
  | { ok: true; classification: ClassificationI }
  | { ok: false; error: string }

/**
 * Build a completed classification from a validated 10-digit HTS code using the flat
 * HTS tree (indent-based parents and chapter slice), matching VerticalCandidateElement
 * candidate semantics.
 */
export function buildCompletedClassificationFromHtsCode(
  rawCode: string,
  htsElements: HtsElement[],
  sections: HtsSection[],
): BuildClassificationFromHtsCodeResult {
  const normalized = normalizeHtsCode(rawCode.trim())
  const leaf = findLeafElementForTenDigitCode(htsElements, normalized)
  if (!leaf) {
    return {
      ok: false,
      error: "That HTS code was not found in the current tariff schedule.",
    }
  }

  const preliminaryLevels = buildPreliminaryLevels(sections, leaf.chapter)
  if (!preliminaryLevels) {
    return {
      ok: false,
      error: "Could not resolve section and chapter for this code.",
    }
  }

  const chapterSlice = getElementsInChapter(htsElements, leaf.chapter)
  const parents = getHtsElementParents(leaf, chapterSlice)
  const chain: HtsElement[] = [...parents, leaf]
  const chapterWithIndex = setIndexInArray(chapterSlice)

  const levels: ClassificationProgression[] = []

  for (let i = 0; i < chain.length; i++) {
    const element = chain[i]
    const candidates: HtsElement[] =
      i === 0
        ? elementsAtClassificationLevel(chapterWithIndex, 0)
        : getDirectChildrenElements(chain[i - 1], chapterSlice)

    if (!candidates.some((c) => c.uuid === element.uuid)) {
      return {
        ok: false,
        error: "Could not reconstruct the classification path for this code.",
      }
    }

    levels.push({
      candidates,
      selection: element,
    })
  }

  const progressionDescription = chain.map((e) => e.description).join(" > ")

  const classification: ClassificationI = {
    articleDescription: EMDASH,
    articleAnalysis: "",
    progressionDescription,
    preliminaryLevels,
    levels,
    isComplete: true,
    notes: "",
  }

  return { ok: true, classification }
}

/** Resolve dotted 10-digit form for display/storage consistency. */
export function normalizedTenDigitCodeForDisplay(raw: string): string {
  return normalizeHtsCode(raw.trim())
}
