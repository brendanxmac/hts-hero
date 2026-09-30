// Runs the legacy engine the same way the Tariff Finder page does, so its results can be
// compared with engine-v2. Mirrors CountryTariff.tsx: column choice, the "below 15%" rule
// for EU/JP/KR, and calculateAllTariffs().

import { Countries } from "../../constants/countries"
import { TariffColumn } from "../../enums/tariff"
import { HtsElement, Navigatable } from "../../interfaces/hts"
import { calculateAllTariffs, getTariffContext } from "../../tariffs/tariff-calculations"
import { addTariffsToCountry, getTotalBaseRate } from "../../tariffs/tariffs"

export interface HtsLine {
  htsno: string
  general: string | null
  special: string | null
  other: string | null
}

export const toHtsElement = (line: HtsLine): HtsElement => ({
  uuid: line.htsno,
  type: Navigatable.ELEMENT,
  chapter: Number(line.htsno.slice(0, 2)),
  htsno: line.htsno,
  indent: "0",
  description: "",
  superior: null,
  units: [],
  general: line.general,
  special: line.special,
  other: line.other,
  footnotes: [],
  quotaQuantity: null,
  additionalDuties: null,
})

export interface LegacyResult {
  totalDuty: number
  activeCodes: string[]
}

export const legacyCalculate = (
  htsno: string,
  rates: HtsLine,
  countryCode: string,
  customsValue: number,
  units: number,
): LegacyResult => {
  const country = Countries.find((c) => c.code === countryCode) ?? {
    flag: "",
    name: countryCode,
    code: countryCode,
  }
  const element = toHtsElement({ ...rates, htsno })
  const tariffElement = toHtsElement(rates)

  const withTariffs = addTariffsToCountry(
    country,
    element,
    tariffElement,
    [],
    undefined,
    units,
    customsValue,
  )

  const { tariffColumn, is15Cap } = getTariffContext(countryCode)
  const adValoremEquivalent = getTotalBaseRate(
    withTariffs.baseTariffs.flatMap((t) => t.tariffs),
    customsValue,
    units,
  )
  const below15Rule = is15Cap && adValoremEquivalent < 15

  const result = calculateAllTariffs(
    withTariffs.tariffSets,
    withTariffs.baseTariffs,
    customsValue,
    units,
    [],
    tariffColumn as TariffColumn,
    below15Rule,
  )

  return {
    totalDuty: result.totalTariffDuty,
    activeCodes: withTariffs.tariffSets
      .flatMap((set) => set.tariffs)
      .filter((t) => t.isActive)
      .map((t) => t.code),
  }
}
