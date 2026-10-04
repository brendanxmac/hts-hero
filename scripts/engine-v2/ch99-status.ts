// Chapter 99 headings that are still printed in the HTS but no longer apply, for
// `npm run ch99:coverage`. Each entry's `codes` is one of:
//   "9922"            a prefix: every heading that starts with it (any code under 10 digits)
//   "9903.02.30"      one heading
//   "9903.01.43-76"   a range of the last two digits, inclusive (9903.01.43 … 9903.01.76)

export interface StatusEntry {
  codes: string
  note: string
}

export const expired: StatusEntry[] = [
  { codes: "9901", note: "Expired" },
  { codes: "9902", note: "Expired" },
  { codes: "9903.01.20", note: "Expired (9903.01.21–24 need review)" },
  { codes: "9903.01.43-76", note: "Terminated" },
  { codes: "9903.01.84-89", note: "Terminated Feb 7, 2026" },
  { codes: "9903.02.30", note: "Terminated (See 90 Fed. Reg. 44638)" },
  { codes: "9903.02.36", note: "Terminated (See 90 Fed. Reg. 59281)" },
  { codes: "9903.02.56", note: "Terminated Nov 14, 2025 (See 90 Fed. Reg. 55964)" },
  { codes: "9903.02.58", note: "Terminated (See 90 Fed. Reg. 59281)" },
  { codes: "9903.03.01-11", note: "Expired" },
  { codes: "9903.04.05-55", note: "Expired" },
  { codes: "9903.08.04-15", note: "Expired" },
  { codes: "9903.19.19-23", note: "Expired" },
  { codes: "9903.27.01-15", note: "Expired" },
  { codes: "9903.40.05-10", note: "Expired" },
  { codes: "9903.41.15-45", note: "Expired" },
  { codes: "9903.45.01-29", note: "Expired" },
  { codes: "9903.53.01", note: "Expired" },
  { codes: "9903.88.05-14", note: "Expired" },
  { codes: "9903.88.17-20", note: "Expired" },
  { codes: "9903.88.33-68", note: "Expired" },
  { codes: "9915", note: "All expired" },
  { codes: "9917", note: "All expired" },
  { codes: "9920", note: "All expired" },
  { codes: "9922", note: "All expired" },
]

const FTZ_NOTE = "Duties suspended except on certain goods entered from foreign trade zones"

export const ftzSuspended: StatusEntry[] = [
  "9903.89.05",
  "9903.89.10",
  "9903.89.13",
  "9903.89.16",
  "9903.89.19",
  "9903.89.22",
  "9903.89.25",
  "9903.89.28",
  "9903.89.31",
  "9903.89.34",
  "9903.89.37",
  "9903.89.40",
  "9903.89.43",
  "9903.89.46",
  "9903.89.49",
  "9903.89.52",
  "9903.89.55",
  "9903.89.57",
  "9903.89.61",
].map((codes) => ({ codes, note: FTZ_NOTE }))

// Still in effect (they stay in missing), but flagged for a closer look
export const needsReview: StatusEntry[] = [{ codes: "9903.01.21-24", note: "Needs review (see 9903.01.20, expired)" }]

// A parsed entry: either a prefix, or the exact headings it lists
export type Matcher = { entry: StatusEntry; prefix: string } | { entry: StatusEntry; exact: string[] }

const PREFIX = /^99\d\d(\.\d\d){0,1}$/
const HEADING = /^99\d\d\.\d\d\.\d\d$/
const RANGE = /^(99\d\d\.\d\d)\.(\d\d)-(\d\d)$/

export const parseEntry = (entry: StatusEntry): Matcher => {
  const codes = entry.codes.trim()
  if (HEADING.test(codes)) return { entry, exact: [codes] }
  if (PREFIX.test(codes)) return { entry, prefix: codes }
  const range = codes.match(RANGE)
  if (range) {
    const [, stem, from, to] = range
    if (Number(to) < Number(from)) throw new Error(`Range ${codes} ends before it starts`)
    const exact: string[] = []
    for (let n = Number(from); n <= Number(to); n++) exact.push(`${stem}.${String(n).padStart(2, "0")}`)
    return { entry, exact }
  }
  throw new Error(`Can't parse Chapter 99 status entry "${entry.codes}"`)
}

// A prefix matches whole segments only: "9903.01" matches 9903.01.05 but not 9903.010
export const matches = (m: Matcher, code: string) =>
  "prefix" in m ? code === m.prefix || code.startsWith(`${m.prefix}.`) : m.exact.includes(code)
