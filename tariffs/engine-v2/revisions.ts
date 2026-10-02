import revisionsJson from "./data/hts-revisions.json"
import { IsoDate } from "./types"

// HTS revisions and their dates, generated from USITC by `npm run sync-revisions`.
// Each revision is in force from `from` (inclusive) to `to` (exclusive).
export interface HtsRevision {
  name: string // "2026HTSRev5"
  title: string // "Revision 5 (2026)"
  from: IsoDate
  to?: IsoDate
}

export const HtsRevisions: HtsRevision[] = revisionsJson

// Revisions whose Chapter 99 data has been entered with dates and checked. Only these are
// offered in the UI. Add a revision once its changes are recorded (HowTariffsWork.md §17.13).
export const VerifiedTariffRevisions: string[] = ["2026HTSRev5", "2026HTSRev6", "2026HTSRev7", "2026HTSRev8", "2026HTSRev9", "2026HTSRev10", "2026HTSRev11", "2026HTSRev12", "2026HTSRev13", "2026HTSRev14", "2026HTSRev15", "2026HTSRev16"]

export const getRevision = (name: string) => HtsRevisions.find((r) => r.name === name)

export const getRevisionForDate = (date: IsoDate) =>
  HtsRevisions.find((r) => r.from <= date && (!r.to || date < r.to))

export const getVerifiedRevisions = () =>
  HtsRevisions.filter((r) => VerifiedTariffRevisions.includes(r.name))

export const getLatestVerifiedRevision = () => {
  const verified = getVerifiedRevisions()
  return verified[verified.length - 1]
}

// True if `date` falls in a revision whose tariff data has been verified
export const isVerifiedDate = (date: IsoDate) =>
  VerifiedTariffRevisions.includes(getRevisionForDate(date)?.name)
