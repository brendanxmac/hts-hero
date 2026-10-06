// Products of Canada excluded from importation from September 29, 2026 under Section 338: the
// Annexes to Proclamations 11061 (alcoholic beverages), 11062 (dairy) and 11063 (motor
// vehicles), as attached to CSMS #70050970 (Sep 28, 2026). Copied from the annexes as published.

import { CodeList } from "../../types"

const FROM = "2026-09-29"
const SOURCE = { citation: "CSMS # 70050970", url: "https://content.govdelivery.com/accounts/USDHSCBP/bulletins/42ce49a" }

const list = (id: string, description: string, codes: string[], citation: string): CodeList => ({
  id,
  kind: "hts",
  description,
  versions: [{ codes, effective: { from: FROM }, source: { ...SOURCE, citation: `${citation}, ${SOURCE.citation}` } }],
})

// Proclamation 11061 Annex: provisions with no scope limitation, banned in any container
const alcohol = [
  "2204.21.20", "2204.21.30", "2204.21.50", "2204.21.60", "2204.21.80",
  "2204.22.20", "2204.22.40",
  "2205.10.30",
  "2208.20.20", "2208.20.30", "2208.20.40",
  "2208.30.6020", "2208.30.6055", "2208.30.6065",
  "2208.40.20", "2208.40.40",
  "2208.60.10", "2208.60.20",
  "2208.70.0030",
  "2208.90.12", "2208.90.20", "2208.90.25", "2208.90.30", "2208.90.50", "2208.90.72",
]

// Proclamation 11061 Annex, scope limitation "Packaged": banned only in bottles, cans, boxes, kegs
// or other similar direct-to-consumption containers. In bulk they keep the 50% duty.
const alcoholPackaged = [
  "2203.00.00",
  "2204.10.00",
  "2204.22.60", "2204.22.80", "2204.29.61", "2204.29.81",
  "2206.00.15", "2206.00.30", "2206.00.45", "2206.00.60", "2206.00.90",
  "2207.10.30",
  "2208.20.10", "2208.20.50", "2208.20.60",
  "2208.30.30", "2208.30.6040", "2208.30.6075",
  "2208.40.60", "2208.40.80",
  "2208.50.00",
  "2208.60.50",
  "2208.90.10", "2208.90.14", "2208.90.15", "2208.90.35", "2208.90.40", "2208.90.75",
]

// Proclamation 11062 Annex: whey, molasses and non-alcoholic beer
const dairy = [
  "0404.10.05", "0404.10.08", "0404.10.11", "0404.10.15", "0404.10.20", "0404.10.48", "0404.10.50", "0404.10.90",
  "1702.90.35",
  "1703.10.30", "1703.10.50", "1703.90.30", "1703.90.50",
  "2202.91.00",
]

// Proclamation 11063 Annex: motorcycles over 800 cc
const motorVehicles = ["8711.50.00"]

export const canada338BanLists: CodeList[] = [
  list("canada338BanAlcohol", "Proclamation 11061 Annex: alcoholic beverages", alcohol, "Proclamation 11061"),
  list("canada338BanAlcoholPackaged", "Proclamation 11061 Annex: alcoholic beverages, packaged only", alcoholPackaged, "Proclamation 11061"),
  list("canada338BanDairy", "Proclamation 11062 Annex: dairy and related products", dairy, "Proclamation 11062"),
  list("canada338BanMotorVehicles", "Proclamation 11063 Annex: motorcycles", motorVehicles, "Proclamation 11063"),
]
