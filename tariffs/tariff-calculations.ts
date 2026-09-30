import { HtsElement } from "../interfaces/hts"
import { TariffSet, UITariff } from "../interfaces/tariffs"
import { ParsedBaseTariff } from "../libs/hts"
import { getHtsElementParents } from "../libs/hts"
import { ContentRequirementI } from "../components/Element"
import { ContentRequirements, TariffColumn } from "../enums/tariff"
import { Column2CountryCodes } from "./tariff-columns"
import {
  getTotalBaseRate,
  getAdValoremRate,
  getAmountRatesString,
} from "./tariffs"

// ── Constants ──

export const SECTION_232_METAL_CONTENT_SET_NAME = "Section 232 Metal Content"
export const HARBOR_MAINTENANCE_FEE_RATE = 0.00125 // 0.125%
export const MERCHANDISE_PROCESSING_FEE_RATE = 0.003464 // 0.3464%

// MPF minimum and maximum change every October 1, the start of CBP's fiscal year
const MPF_LIMITS_BY_FISCAL_YEAR = [
  { from: "2025-10-01", min: 33.58, max: 651.5 }, // FY2026
  { from: "2026-10-01", min: 34.58, max: 670.86 }, // FY2027 (FR Doc. 2026-15530)
]

const localIsoDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`

// MPF limits in effect on `date` (YYYY-MM-DD), today (local time) by default
export const getMpfLimits = (date: string = localIsoDate(new Date())) =>
  [...MPF_LIMITS_BY_FISCAL_YEAR].reverse().find((l) => l.from <= date) ??
  MPF_LIMITS_BY_FISCAL_YEAR[0]
export const ADDITIONAL_FEES_TOTAL_RATE = 0.4714

// ── Utility Functions ──

export function hasActiveBaseDutySuppressor(tariffs: UITariff[]): boolean {
  return tariffs.some((t) => t.isActive && t.suppressesBaseDuty)
}

// ── Interfaces ──

export interface DutyEstimate {
  tariffSetName: string
  percentRate: number
  amountDuty: number
  adValoremDuty: number
  totalDuty: number
  applicableValue: number
  contentPercentage: number
}

export interface FeeEstimate {
  name: string
  rate: number
  amount: number
  note?: string
}

export interface SummaryTotal {
  name: string
  rate: number
  hasAmountTariffs: boolean
  amountRatesString: string | null
}

export interface TariffCalculationResult {
  dutyEstimates: DutyEstimate[]
  feeEstimates: FeeEstimate[]
  summaryTotals: SummaryTotal[]
  totalImportDuty: number
  totalFees: number
  totalTariffDuty: number
}

// ── Utility Functions ──

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Walk up the element tree to find the nearest ancestor (or self) that
 * carries tariff rate data (general / special / other columns).
 */
export function findTariffElement(
  element: HtsElement,
  htsElements: HtsElement[],
): HtsElement {
  if (element.general || element.special || element.other) return element
  const parents = getHtsElementParents(element, htsElements)
  for (let i = parents.length - 1; i >= 0; i--) {
    if (parents[i].general || parents[i].special || parents[i].other)
      return parents[i]
  }
  return element
}

/**
 * Derive tariff-column context from a country code so callers don't
 * have to duplicate the Column 2 check.
 */
export function getTariffContext(countryCode: string) {
  const isOtherColumn = Column2CountryCodes.includes(countryCode)
  const tariffColumn: TariffColumn = isOtherColumn
    ? TariffColumn.OTHER
    : TariffColumn.GENERAL
  return { tariffColumn, isOtherColumn }
}

// ── Calculation Functions ──

export function calculateDutyEstimates(
  tariffSets: TariffSet[],
  baseTariffs: ParsedBaseTariff[],
  customsValue: number,
  units: number,
  contentRequirements: ContentRequirementI<ContentRequirements>[],
  tariffColumn: TariffColumn,
  filterByProgram?: <T extends { programs?: string[] }>(tariffs: T[]) => T[],
): DutyEstimate[] {
  const identity = <T>(arr: T[]) => arr
  const filter = filterByProgram ?? identity

  const flatBase = filter(baseTariffs.flatMap((t) => t.tariffs))
  const estimates: DutyEstimate[] = []

  const contentPercentageMap = new Map<string, number>()
  contentRequirements.forEach((cr) => {
    contentPercentageMap.set(cr.name, cr.value)
  })

  const totalContentPercentage = contentRequirements
    .filter((cr) => cr.name !== "Section 232 Metal")
    .reduce((sum, cr) => sum + cr.value, 0)
  const articlePercentage = Math.max(
    0,
    Math.min(100, 100 - totalContentPercentage),
  )

  tariffSets.forEach((tariffSet) => {
    const isArticleSet = tariffSet.name === "Article" || tariffSet.name === ""

    let contentPercentage = 100
    if (isArticleSet) {
      contentPercentage =
        contentRequirements.length > 0 ? articlePercentage : 100
    } else if (tariffSet.name === SECTION_232_METAL_CONTENT_SET_NAME) {
      contentPercentage = 100
    } else {
      const contentName = tariffSet.name.replace(" Content", "")
      contentPercentage = contentPercentageMap.get(contentName) || 0
    }

    const applicableValue = (customsValue * contentPercentage) / 100
    const isSection232Metal =
      tariffSet.name === SECTION_232_METAL_CONTENT_SET_NAME
    const shouldIncludeBase =
      (isArticleSet || isSection232Metal) &&
      !hasActiveBaseDutySuppressor(tariffSet.tariffs)

    const adValoremRate = shouldIncludeBase
      ? getAdValoremRate(tariffColumn, tariffSet.tariffs, flatBase)
      : getAdValoremRate(tariffColumn, tariffSet.tariffs)

    const adValoremDuty = (applicableValue * adValoremRate) / 100

    let amountDuty = 0
    if (shouldIncludeBase) {
      flatBase
        .filter((t) => t.type === "amount")
        .forEach((tariff) => {
          const applicableUnits = (units * contentPercentage) / 100
          amountDuty += (tariff.value || 0) * applicableUnits
        })
    }

    estimates.push({
      tariffSetName: tariffSet.name || "Article",
      percentRate: adValoremRate,
      amountDuty,
      adValoremDuty,
      totalDuty: amountDuty + adValoremDuty,
      applicableValue,
      contentPercentage,
    })
  })

  return estimates
}

export function calculateFeeEstimates(customsValue: number): FeeEstimate[] {
  const hmfAmount = customsValue * HARBOR_MAINTENANCE_FEE_RATE
  let mpfAmount = customsValue * MERCHANDISE_PROCESSING_FEE_RATE
  let mpfNote: string | undefined
  const { min, max } = getMpfLimits()
  if (mpfAmount < min) {
    mpfNote = `Minimum applied ($${min.toFixed(2)})`
    mpfAmount = min
  } else if (mpfAmount > max) {
    mpfNote = `Maximum applied ($${max.toFixed(2)})`
    mpfAmount = max
  }

  return [
    {
      name: "Harbor Maintenance Fee",
      rate: HARBOR_MAINTENANCE_FEE_RATE * 100,
      amount: hmfAmount,
    },
    {
      name: "Merchandise Processing Fee",
      rate: MERCHANDISE_PROCESSING_FEE_RATE * 100,
      amount: mpfAmount,
      note: mpfNote,
    },
  ]
}

export function calculateSummaryTotals(
  tariffSets: TariffSet[],
  baseTariffs: ParsedBaseTariff[],
  tariffColumn: TariffColumn,
  filterByProgram?: <T extends { programs?: string[] }>(tariffs: T[]) => T[],
): SummaryTotal[] {
  const identity = <T>(arr: T[]) => arr
  const filter = filterByProgram ?? identity

  const flatBase = filter(baseTariffs.flatMap((t) => t.tariffs))
  const amountRatesString = getAmountRatesString(flatBase)

  return tariffSets.map((tariffSet) => {
    const isArticleSet = tariffSet.name === "Article" || tariffSet.name === ""
    const isSection232Metal =
      tariffSet.name === SECTION_232_METAL_CONTENT_SET_NAME
    const shouldIncludeBase =
      (isArticleSet || isSection232Metal) &&
      !hasActiveBaseDutySuppressor(tariffSet.tariffs)

    const rate = shouldIncludeBase
      ? getAdValoremRate(tariffColumn, tariffSet.tariffs, flatBase)
      : getAdValoremRate(tariffColumn, tariffSet.tariffs)

    const hasAmountTariffs =
      shouldIncludeBase && flatBase.some((t) => t.type === "amount")

    return {
      name: tariffSet.name,
      rate,
      hasAmountTariffs,
      amountRatesString: hasAmountTariffs ? amountRatesString : null,
    }
  })
}

/**
 * Run all three calculations and return a single result object.
 */
export function calculateAllTariffs(
  tariffSets: TariffSet[],
  baseTariffs: ParsedBaseTariff[],
  customsValue: number,
  units: number,
  contentRequirements: ContentRequirementI<ContentRequirements>[],
  tariffColumn: TariffColumn,
  filterByProgram?: <T extends { programs?: string[] }>(tariffs: T[]) => T[],
): TariffCalculationResult {
  const dutyEstimates = calculateDutyEstimates(
    tariffSets,
    baseTariffs,
    customsValue,
    units,
    contentRequirements,
    tariffColumn,
    filterByProgram,
  )
  const feeEstimates = calculateFeeEstimates(customsValue)
  const summaryTotals = calculateSummaryTotals(
    tariffSets,
    baseTariffs,
    tariffColumn,
    filterByProgram,
  )

  const totalTariffDuty = dutyEstimates.reduce((sum, e) => sum + e.totalDuty, 0)
  const totalFees = feeEstimates.reduce((sum, f) => sum + f.amount, 0)

  return {
    dutyEstimates,
    feeEstimates,
    summaryTotals,
    totalTariffDuty,
    totalImportDuty: totalTariffDuty + totalFees,
    totalFees,
  }
}
