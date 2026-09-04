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
