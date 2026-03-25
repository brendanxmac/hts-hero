export interface CrossRuling {
  id: number
  rulingNumber: string
  subject: string
  categories: string
  rulingDate: string
  isUsmca: boolean
  isNafta: boolean
  isRevokedByOperationalLaw: boolean
  collection: string
  relatedRulings: string[]
  modifiedBy: string[]
  modifies: string[]
  revokedBy: string[]
  revokes: string[]
  tariffs: string[]
  operationallyRevoked: boolean
  commodityGrouping: string | null
}

export interface CrossRulingDetail extends CrossRuling {
  text: string
  url: string
}
