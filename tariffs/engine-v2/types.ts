// Types for the versioned tariff engine. See HowTariffsWork.md for the design.

// ── Dates and sources ──

export type IsoDate = string // "YYYY-MM-DD"

export interface EffectivePeriod {
  from?: IsoDate // inclusive
  to?: IsoDate // exclusive
}

export interface Source {
  revision?: string // USITC release name, e.g. "2026HTSRev5"
  citation?: string // "Proclamation 11021", "91 FR 12345", "CSMS # 68554727"
  url?: string
  note?: string
}

export interface Dated {
  effective: EffectivePeriod
  source?: Source
}

// ── Programs ──

export type Authority =
  | "232"
  | "301"
  | "122"
  | "201"
  | "IEEPA"
  | "ADCVD"
  | "deal"
  | "other"

export interface Program {
  id: string
  name: string
  authority: Authority
  legalBasis?: string[]
  description?: string
}

export interface Selector {
  codes?: string[] // Chapter 99 headings
  programs?: string[]
  authorities?: Authority[]
}

// ── Lists ──

export interface ListRef {
  list: string
}

export type CountrySelector = "all" | (string | ListRef)[]
export type CodeSelector = (string | ListRef)[]

export interface CodeListVersion extends Dated {
  codes?: string[]
  includes?: ListRef[]
}

export interface CodeList {
  id: string
  kind: "hts" | "country"
  description: string
  versions: CodeListVersion[]
}

// ── Tariffs ──

export type DutyColumn = "general" | "special" | "column2"

// A reference to a handler by name, plus that handler's parameters
export interface HandlerRef {
  kind: string
  [param: string]: unknown
}

export type Condition = HandlerRef
export type ValueBasis = HandlerRef
export type RateRule = HandlerRef

export interface Scope {
  countries: CountrySelector
  excludeCountries?: (string | ListRef)[]
  codes: "all" | CodeSelector
  excludeCodes?: CodeSelector
  whenApplies?: Selector
}

export interface Tariff extends Dated {
  code: string
  program: string
  name: string
  description: string
  scope: Scope
  requires?: Condition[]
  exceptions?: string[]
  basis?: ValueBasis
  rate: RateRule
  rateByColumn?: Partial<Record<DutyColumn, RateRule>>
}

// ── Interactions ──

interface InteractionBase extends Dated {
  id: string
  description: string
  appliesTo?: { countries?: CountrySelector; codes?: "all" | CodeSelector }
}

export type Interaction = InteractionBase &
  (
    | { kind: "noStack"; order: Selector[] }
    | { kind: "excludePortion"; winner: Selector; losers: Selector }
    | { kind: "capTotal"; pct: number; covers: Selector; includesBaseRate: boolean }
  )

// ── Columns, preferences, fees ──

export interface ColumnAssignment extends Dated {
  country: string
  column: "column2"
}

export interface TradePreference extends Dated {
  symbol: string // SPI symbol in the HTS special column
  name: string
  countries: CountrySelector
}

export type TransportMode = "ocean" | "air" | "truck" | "rail"

export interface FeeSchedule extends Dated {
  id: "mpf" | "hmf"
  name: string
  ratePct: number
  min?: number
  max?: number
  // Transport modes the fee applies to; all modes when omitted
  modes?: TransportMode[]
}

// ── Inputs ──

export type InputType = "boolean" | "percent" | "number" | "date"

export interface InputDefinition {
  id: string
  label: string
  help?: string
  type: InputType
  unit?: string
  // Note subdivisions to show with the help text, when it doesn't cite them itself
  // ("U.S. note 41(d)"); see citations.ts
  citations?: string[]
}

export type Answers = Record<string, unknown>

// ── Rules for a date ──

export interface RuleSet {
  programs: Program[]
  tariffs: Tariff[]
  lists: CodeList[]
  interactions: Interaction[]
  columnAssignments: ColumnAssignment[]
  preferences: TradePreference[]
  fees: FeeSchedule[]
  inputs: InputDefinition[]
}

export interface RuleSnapshot {
  asOf: IsoDate
  programs: Map<string, Program>
  tariffs: Tariff[]
  tariffsByCode: Map<string, Tariff>
  // Resolved list members as of the snapshot date (includes flattened)
  lists: Map<string, Set<string>>
  interactions: Interaction[]
  column2Countries: Set<string>
  preferences: TradePreference[]
  fees: FeeSchedule[]
  inputs: Map<string, InputDefinition>
}

// ── Calculation ──

export interface BaseRates {
  // Raw column strings from the HTS line that carries rates
  general: string | null
  special: string | null
  other: string | null
}

export interface CalculationInput {
  htsCode: string
  country: string
  asOf: IsoDate
  customsValue: number
  quantity?: number
  baseRates: BaseRates
  claimedPreference?: string // SPI symbol
  answers?: Answers
  // Mode of transport, for fees such as HMF (ocean only). All fees apply when omitted.
  transportMode?: TransportMode
}

export type Tri = true | false | "unknown"

export type LineStatus = "applies" | "excluded" | "notApplicable" | "needsAnswer"

export interface DutyLine {
  code: string // Chapter 99 heading, or "BASE"
  name: string
  program?: string
  status: LineStatus
  basisValue: number
  ratePct?: number
  amount: number
  reasons: string[]
  source?: Source
}

export interface UnansweredInput {
  input: InputDefinition
  headings: string[] // headings whose outcome depends on it
}

// An input the engine consulted for this entry, answered or not
export interface Question extends UnansweredInput {
  answered: boolean
}

export interface FeeLine {
  id: string
  name: string
  ratePct: number
  amount: number
  note?: string
}

// One part of a base rate, e.g. "4.5% on the case" of "24¢ each + 4.5% on the case + 3.5% on the battery"
export interface BasePart {
  raw: string
  kind: "percent" | "amount"
  rate: number // percent, or dollars per unit
  unit?: string // for amounts: "each", "kg", "liter"…
  component?: string // "the case", "lead content"; absent when the part applies to the whole article
  inputId?: string // the answer that supplies the component's value or weight
  basis: number // the value (USD) or quantity the rate applies to
  assumed: boolean // the component wasn't given, so the whole value or quantity was used
  amount: number
}

export interface CalculationResult {
  asOf: IsoDate
  htsCode: string
  country: string
  column: DutyColumn
  claimedPreference?: string
  availablePreferences: TradePreference[]
  baseRateEquivalentPct: number
  // The base rate includes a per-unit amount, so the result depends on the quantity
  requiresQuantity: boolean
  base: DutyLine
  baseParts: BasePart[]
  lines: DutyLine[] // Chapter 99 lines, in evaluation order
  fees: FeeLine[]
  totalDuty: number
  totalFees: number
  unansweredInputs: UnansweredInput[]
  questions: Question[]
  warnings: string[]
}
