import { Countries } from "@/constants/countries"
import { PROGRAM } from "@/components/ui/marketing/colors"
import { AUTHORITIES, KINDS, type Authority, type Kind, type Stage } from "@/libs/tariff-updates/types"

// How /tariff-updates names things: authorities with their program color (the same as in every
// other visual), kinds, the stages an action moves through, and countries.

export const authorityLabel = (a: Authority) => AUTHORITIES[a] ?? a
export const kindLabel = (k: Kind) => KINDS[k] ?? k

const PROGRAM_COLOR: Partial<Record<Authority, string>> = {
  section_232: PROGRAM["Section 232"],
  section_301: PROGRAM["Section 301"],
  section_338: PROGRAM["Section 338"],
  section_201: PROGRAM["Section 201"],
  section_122: PROGRAM["Section 122"],
  ieepa: PROGRAM.IEEPA,
  trade_agreement: PROGRAM.Exemption,
}
export const authorityColor = (a: Authority) => PROGRAM_COLOR[a] ?? "#94a3b8"

export const STAGE_LABELS: Record<Stage, string> = {
  announced: "Announced",
  signed: "Signed",
  filed: "Filed early",
  published: "Published",
  cbp_guidance: "CBP guidance",
  in_hts: "In the HTS",
}

export const STAGE_DETAIL: Record<Stage, string> = {
  announced: "Announced by USTR or the White House",
  signed: "Signed by the President",
  filed: "Filed for public inspection at the Federal Register, before publication",
  published: "Published in the Federal Register",
  cbp_guidance: "CBP told filers how to apply it (CSMS)",
  in_hts: "Written into the Harmonized Tariff Schedule",
}

const byCode = new Map(Countries.map((c) => [c.code, c]))

export const countryOf = (code: string) =>
  code === "ALL" ? { code, flag: "🌐", name: "All countries" } : byCode.get(code) ?? { code, flag: "", name: code }

// "Oct 14, 2026"
export const formatDay = (iso: string) =>
  new Date(`${iso.slice(0, 10)}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })
