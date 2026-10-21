import { describe, it, expect } from "./test-runner"
import { mergeItems, realItems } from "../components/tariff-tracker/catalog"
import { cellText, columnLetter, detectColumns } from "../components/tariff-tracker/spreadsheet"
import { signupSourceFor } from "../libs/tariff-tracker/onboarding"
import { pickEmail, type OnboardingRow } from "../libs/email/lifecycle"
import { problemGroups } from "../components/tariff-tracker/onboarding/problems"
import { parseTable } from "../components/tariff-tracker/csv"

// The import onboarding (2026-10-20): the example list never counts as the user's imports, where
// a sign-up came from, which email each kind of account gets, and reading real-world spreadsheets

describe("Tariff Tracker onboarding: example imports", () => {
  it("example items aren't the user's imports", () => {
    const { items } = mergeItems([], [{ code: "8413919015", country: "BR", example: true }, { code: "8409999190", country: "AR" }])
    expect(items.length).toBe(2)
    expect(realItems(items).length).toBe(1)
  })

  it("adding an example product for real makes it theirs, and counts as added", () => {
    const start = mergeItems([], [{ code: "8413919015", country: "BR", example: true }]).items
    const { items, added, duplicates } = mergeItems(start, [{ code: "8413919015", country: "BR" }])
    expect(items.length).toBe(1)
    expect(items[0].example).toBe(undefined)
    expect(added).toBe(1)
    expect(duplicates).toBe(0)
  })

  it("adding the example list again changes nothing", () => {
    const start = mergeItems([], [{ code: "8413919015", country: "BR" }]).items
    const { items, added } = mergeItems(start, [{ code: "8413919015", country: "BR", example: true }])
    expect(added).toBe(0)
    expect(items[0].example).toBe(undefined)
  })
})

describe("Tariff Tracker onboarding: sign-up source", () => {
  it("follows where the sign-up was headed", () => {
    expect(signupSourceFor("/duty-calculator?code=8413")).toBe("calculator")
    expect(signupSourceFor("/tariff-tracker?product=8413-BR")).toBe("tracker")
    expect(signupSourceFor("/tariff-monitor")).toBe("tracker")
    expect(signupSourceFor("/classify#try-classify")).toBe("classify")
    expect(signupSourceFor("/?welcome=1")).toBe("generic")
    expect(signupSourceFor(null)).toBe("generic")
  })
})

describe("Tariff Tracker onboarding: emails", () => {
  const DAY = 86_400_000
  const created = "2026-11-01T15:00:00Z"
  const account = { id: "u1", email: "a@example.com", created_at: created }
  const at = (days: number) => new Date(Date.parse(created) + days * DAY)
  const none = new Set<string>()
  const row = (patch: Partial<OnboardingRow>): OnboardingRow => ({
    user_id: "u1",
    signup_source: null,
    first_visit_at: null,
    skipped_at: null,
    skip_reason: null,
    skip_note: null,
    ...patch,
  })
  const pick = (days: number, onboarding: OnboardingRow | null | undefined, sent = none, imports = 0) =>
    pickEmail({ account, imports, sent, now: at(days), scoped: false, onboarding })?.key ?? null

  it("opened the Tracker and left it empty: day 1, then the founder's note on day 3, then day 10", () => {
    const visited = row({ first_visit_at: created, signup_source: "generic" })
    expect(pick(0.5, visited)).toBe(null)
    expect(pick(1.2, visited)).toBe("tracker_no_imports_1")
    expect(pick(3.2, visited, new Set(["tracker_no_imports_1"]))).toBe("tracker_no_imports_2")
    expect(pick(10.2, visited, new Set(["tracker_no_imports_1", "tracker_no_imports_2"]))).toBe("tracker_no_imports_3")
    expect(pick(16, visited)).toBe(null)
  })

  it("counts from the first visit, not sign-up", () => {
    const late = row({ first_visit_at: at(5).toISOString() })
    expect(pick(5.5, late)).toBe(null)
    expect(pick(6.2, late)).toBe("tracker_no_imports_1")
  })

  it("never opened it: a calculator sign-up meets the Tracker; a generic one gets the tour", () => {
    expect(pick(1.2, row({ signup_source: "calculator" }))).toBe("tracker_intro")
    expect(pick(3.2, row({ signup_source: "calculator" }), new Set(["tracker_intro"]))).toBe(null)
    expect(pick(1.2, row({ signup_source: "generic" }))).toBe("product_tour_1")
    expect(pick(3.2, row({ signup_source: "generic" }), new Set(["product_tour_1"]))).toBe("product_tour_2")
    expect(pick(6.2, row({ signup_source: "generic" }), new Set(["product_tour_1", "product_tour_2"]))).toBe("product_tour_3")
  })

  it("a reminder they asked for comes the next morning", () => {
    const remind = row({ first_visit_at: created, skip_reason: "remind_me", skipped_at: at(4).toISOString() })
    const sent = new Set(["tracker_no_imports_1", "tracker_no_imports_2"])
    expect(pick(4.3, remind, sent)).toBe(null)
    expect(pick(4.8, remind, sent)).toBe(`reminder_${at(4).toISOString().slice(0, 10)}`)
  })

  it("nothing once they have imports of their own", () => {
    expect(pick(1.2, row({ first_visit_at: created }), none, 3)).toBe(null)
  })

  it("the old keys count as sent", () => {
    const visited = row({ first_visit_at: created })
    expect(pick(1.2, visited, new Set(["no_imports_1"]))).toBe(null)
    expect(pick(3.2, visited, new Set(["no_imports_1", "no_imports_3"]))).toBe(null)
  })

  it("without the onboarding table, the Tracker sequence counts from sign-up", () => {
    expect(pick(1.2, null)).toBe("tracker_no_imports_1")
  })
})

describe("Tariff Tracker onboarding: spreadsheets", () => {
  const find = (digits: string) => (digits.length === 8 || digits.length === 10 ? digits : undefined)

  it("finds a known header under a title row", () => {
    const rows = [["Acme Imports: product list"], [], ["SKU", "Description", "HTS Code", "Cost", "COO"], ["A1", "Pump", "8413.91.90.15", "42", "Brazil"]]
    const found = detectColumns(rows)!
    expect(found.headerIndex).toBe(2)
    expect(found.columns.code).toBe(2)
    expect(found.columns.country).toBe(4)
    const parsed = parseTable(rows, found.headerIndex, found.columns, find)
    expect(parsed.entries.length).toBe(1)
    expect(parsed.entries[0].country.code).toBe("BR")
  })

  it("finds the columns from the cells when the headers are unfamiliar", () => {
    const rows = [
      ["Part", "Tarif", "Made in"],
      ["A1", "8413919015", "BR"],
      ["A2", "8409.99.91.90", "Argentina"],
      ["A3", "8482105044", "CN"],
    ]
    const found = detectColumns(rows)!
    expect(found.columns.code).toBe(1)
    expect(found.columns.country).toBe(2)
    expect(found.headerIndex).toBe(0)
  })

  it("gives up when nothing looks like codes and countries", () => {
    expect(detectColumns([["a", "b"], ["c", "d"]])).toBe(null)
  })

  it("Excel numbers get their leading zero back", () => {
    expect(cellText(102210010)).toBe("0102210010")
    expect(cellText(8413919015)).toBe("8413919015")
    expect(cellText(null)).toBe("")
  })

  it("column letters", () => {
    expect(columnLetter(0)).toBe("A")
    expect(columnLetter(25)).toBe("Z")
    expect(columnLetter(26)).toBe("AA")
  })
})

describe("Tariff Tracker onboarding: upload problems", () => {
  const find = (digits: string) => (digits === "8413919015" ? digits : undefined)
  it("groups unreadable rows by cause, most common first", () => {
    const rows = [
      ["hts", "coo"],
      ["610910", "CN"],
      ["611020", "VN"],
      ["8413.91.90.15", "Narnia"],
      ["8413.91.90.15", ""],
      ["9999.99.99.99", "CN"],
      ["8413.91.90.15", "US"],
    ]
    const { entries, errors } = parseTable(rows, 0, { code: 0, country: 1 }, find)
    expect(entries.length).toBe(0)
    const groups = problemGroups(errors)
    expect(groups[0].kind).toBe("hs6")
    expect(groups[0].errors.length).toBe(2)
    expect(groups.map((g) => g.kind).sort().join(",")).toBe("hs6,missing_country,not_in_hts,unknown_country,us")
    expect(groups.find((g) => g.kind === "unknown_country")!.fix(groups.find((g) => g.kind === "unknown_country")!.errors).includes("Narnia")).toBe(true)
  })
})

import { applyFixes, codeSuggestions, countrySuggestion } from "../components/tariff-tracker/onboarding/fixes"

describe("Tariff Tracker onboarding: fixing rows in place", () => {
  const known = new Set(["6109100012", "6109100027", "0102210010", "8413919015"])
  const find = (digits: string) => (known.has(digits) ? digits : undefined)

  it("a fixed row becomes an import, a skipped one drops out, a still-wrong one keeps a reason", () => {
    const rows = [["hts", "coo"], ["610910", "CN"], ["8413919015", "Narnia"], ["0000000000", "CN"]]
    const parsed = parseTable(rows, 0, { code: 0, country: 1 }, find)
    expect(parsed.errors.length).toBe(3)
    expect(parsed.errors[0].code).toBe("610910")
    expect(parsed.errors[1].country).toBe("Narnia")
    const { parsed: fixed, skipped } = applyFixes(
      parsed,
      { 2: { code: "6109.10.00.12", country: "CN" }, 3: { code: "8413919015", country: "Atlantis" }, 4: { code: "", country: "", skipped: true } },
      find
    )
    expect(fixed.entries.length).toBe(1)
    expect(fixed.entries[0].country.code).toBe("CN")
    expect(fixed.errors.length).toBe(1)
    expect(fixed.errors[0].country).toBe("Atlantis")
    expect(skipped).toBe(1)
  })

  const els = ["6109.10.00.12", "6109.10.00.27", "6109.10.00", "0102.21.00.10", "8413.91.90.15"].map((htsno) => ({ htsno }) as never)
  const name = (el: { htsno: string }) => el.htsno

  it("suggests the full US codes under a 6-digit HS code", () => {
    expect(codeSuggestions("6109.10", els, name).map((s) => s.htsno).join(",")).toBe("6109.10.00.12,6109.10.00.27")
  })

  it("puts back a dropped leading zero", () => {
    expect(codeSuggestions("102210010", els, name).map((s) => s.htsno).join(",")).toBe("0102.21.00.10")
  })

  it("reads countries written other ways, never the US", () => {
    expect(countrySuggestion("Viet Nam")?.code).toBe("VN")
    expect(countrySuggestion("PRC")?.code).toBe("CN")
    expect(countrySuggestion("Veitnam")?.code).toBe("VN")
    expect(countrySuggestion("Made in China")?.code).toBe("CN")
    expect(countrySuggestion("USA")).toBe(null)
    expect(countrySuggestion("China")).toBe(null)
  })
})

import { NO_EDITS, readSheet } from "../components/tariff-tracker/onboarding/sheet"
import { headerAbove } from "../components/tariff-tracker/spreadsheet"

describe("Tariff Tracker onboarding: reading a sheet", () => {
  const find = (digits: string) => (["8413919015", "6109100012"].includes(digits) ? digits : undefined)
  const rows = [
    ["Acme parts list, Oct 2026"],
    [],
    ["Part", "HTS Code", "Country of Origin"],
    ["A1", "8413.91.90.15", "Brazil"],
    ["A2", "610910", "CN"],
    ["Part", "HTS Code", "Country of Origin"],
    ["", "", ""],
    ["Total", "", ""],
    ["A3", "6109.10.00.12", "Narnia"],
  ]
  const kinds = (edits = NO_EDITS) => readSheet(rows, 2, { code: 1, country: 2 }, edits, find).map((r) => r.kind).join(",")

  it("sets titles, the header, its repeats, blanks and totals aside; reads the rest", () => {
    expect(kinds()).toBe("above,blank,header,ok,error,ignored,blank,ignored,error")
  })

  it("edits, skips and includes change how rows read", () => {
    expect(
      kinds({ cells: { "4:1": "6109.10.00.12", "8:2": "Vietnam" }, skipped: [3], included: [7] })
    ).toBe("above,blank,header,skipped,ok,ignored,blank,error,ok")
  })

  it("a bad first row isn't taken for the header", () => {
    expect(headerAbove([["Title"], ["HTS", "COO"], ["610910", "CN"], ["8413.91.90.15", "BR"]], 0)).toBe(1)
  })
})

import { matchedDigits } from "../components/tariff-tracker/onboarding/fixes"

describe("Tariff Tracker onboarding: matching digits in suggestions", () => {
  it("lights the digits a suggestion shares with what was written", () => {
    expect([...matchedDigits("6109.10", "6109100012")].join(",")).toBe("0,1,2,3,4,5")
    expect([...matchedDigits("102210010", "0102210010")].length).toBe(9)
    expect(matchedDigits("102210010", "0102210010").has(0)).toBe(false)
    // The zeros of a padded HS code aren't a match
    expect([...matchedDigits("6109.10.00.00", "6109100004")].join(",")).toBe("0,1,2,3,4,5")
  })
})

import { cardDone, describingColumn, fixCards } from "../components/tariff-tracker/onboarding/guide"

describe("Tariff Tracker onboarding: the guided fix", () => {
  const known = ["8413919015", "6109100012", "8409999190"]
  const find = (digits: string) => (known.includes(digits) ? digits : undefined)
  const codeOk = (d: string) => known.includes(d)
  const rows = [
    ["Part", "Description", "HTS", "COO"],
    ["A1", "Pump housing", "8413.91.90.15", "Brazil"],
    ["A2", "Cotton tee", "610910", "CN"],
    ["A3", "Cotton tee, boys", "610910", "VN"],
    ["A4", "Gasket", "8409.99.91.90", "Viet Nam"],
    ["A5", "Tee", "6109.10.00.12", "Viet Nam"],
    ["A6", "Bearing", "8482.10.50.44", ""],
    ["A7", "Mystery", "610910", "Narnia"],
  ]
  const cols = { code: 2, country: 3 }

  it("groups the same mistake first, then each row left; a 6-digit code is never one fix for all", () => {
    const sheet = readSheet(rows, 0, cols, NO_EDITS, find)
    const cards = fixCards(sheet, codeOk)
    expect(cards.map((c) => (c.kind === "row" ? `row:${c.row}` : `${c.kind}:${c.rows.join("+")}`)).join(" ")).toBe("country:4+5 row:2 row:3 row:6 row:7")
  })

  it("a group is done when its fix is in on every row", () => {
    const fixed = readSheet(rows, 0, cols, { cells: { "4:3": "Vietnam", "5:3": "Vietnam" }, skipped: [], included: [] }, find)
    const cards = fixCards(readSheet(rows, 0, cols, NO_EDITS, find), codeOk)
    expect(cardDone(cards[0], fixed, codeOk)).toBe(true)
    expect(cardDone(cards[1], fixed, codeOk)).toBe(false)
  })

  it("finds the column that describes the product", () => {
    expect(describingColumn(rows, rows[0], [2, 3])).toBe(1)
  })
})

describe("Tariff Tracker onboarding: codes with one right answer", () => {
  const known = ["0102210010", "6109100012"]
  const find = (digits: string) => (known.includes(digits) ? digits : undefined)
  const codeOk = (d: string) => known.includes(d)
  const rows = [["HTS", "COO"], ["102210010", "Canada"], ["102210010", "Mexico"], ["610910", "CN"], ["610910", "VN"]]

  it("groups a code only when it can only mean one thing", () => {
    const sheet = readSheet(rows, 0, { code: 0, country: 1 }, NO_EDITS, find)
    const onlyFix = (code: string) => (code.replace(/\D/g, "") === "102210010" ? "0102.21.00.10" : null)
    const cards = fixCards(sheet, codeOk, onlyFix)
    expect(cards.map((c) => (c.kind === "row" ? `row:${c.row}` : `${c.kind}:${c.rows.join("+")}`)).join(" ")).toBe("code:1+2 row:3 row:4")
  })

  it("says a zero-padded HS code is one", () => {
    const sheet = readSheet([["HTS", "COO"], ["6109.10.00.00", "CN"]], 0, { code: 0, country: 1 }, NO_EDITS, find)
    expect(sheet[1].reason).toBe("6109.10.00.00 isn't a real HTS code")
  })
})
