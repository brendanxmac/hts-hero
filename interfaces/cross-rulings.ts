export interface CrossRuling {
  id: number
  rulingNumber: string
  subject: string
  /** Search returns a string; detail returns null. */
  categories: string | null
  rulingDate: string
  isUsmca: boolean
  isNafta: boolean
  isRevokedByOperationalLaw: boolean
  collection: string
  /** Search returns arrays (possibly empty); detail returns null for these list fields. */
  relatedRulings: string[] | null
  modifiedBy: string[] | null
  modifies: string[] | null
  revokedBy: string[] | null
  revokes: string[] | null
  /** CBP returns this as a comma-separated string (e.g. "8471.30.01, 8517.62.00"). */
  tariffs: string
  operationallyRevoked: boolean
  commodityGrouping: string | null
}

export interface CrossRulingDetail extends CrossRuling {
  text: string
  url: string
}

/**
 * A CBP ruling a user saved on a classification as evidence for it. The ruling's details are kept
 * as they were when it was added, so the list (and the report) still shows without asking CBP.
 */
export interface CrossEvidence {
  rulingNumber: string
  /** "ny" or "hq" */
  collection: string | null
  subject: string
  rulingDate: string | null
  tariffs: string[]
  /** Revoked or modified away when it was added */
  revoked: boolean
  /** Why it supports the classification, in the user's words */
  note: string
  addedAt: string
}
