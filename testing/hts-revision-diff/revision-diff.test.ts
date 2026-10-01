import { describe, expect, it } from "../test-runner"
import { parseCh99NotesMarkdown } from "../../libs/hts-revision-diff/parse-ch99-notes"
import { parseCh99Json } from "../../libs/hts-revision-diff/parse-ch99-json"
import { diffCodes, diffNotes } from "../../libs/hts-revision-diff/diff"
import { buildChanges } from "../../libs/hts-revision-diff/build-changes"
import { wordDiff, renderWordDiff } from "../../libs/hts-revision-diff/word-diff"
import { extractHtsCodes } from "../../libs/hts-revision-diff/text"
import type { ChangeRecordItem } from "../../libs/hts-revision-diff/types"
import { CH99_JSON_A, CH99_JSON_B, CH99_REV_A, CH99_REV_B } from "./fixtures"

const a = parseCh99NotesMarkdown(CH99_REV_A)
const b = parseCh99NotesMarkdown(CH99_REV_B)
const keysA = a.nodes.map((n) => n.key)
const node = (key: string) => a.nodes.find((n) => n.key === key)
// HTS letters a to u, with "ij" for i
const LETTERS_TO_U = ["a", "b", "c", "d", "e", "f", "g", "h", "ij", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u"]

describe("Chapter 99 notes parser", () => {
  it("reads chapter-level notes and statistical notes", () => {
    expect(keysA.includes("ch99/notes/1")).toBe(true)
    expect(keysA.includes("ch99/notes/1(a)")).toBe(true)
    expect(keysA.includes("ch99/notes/2")).toBe(true)
    expect(keysA.includes("ch99/statistical-notes/1")).toBe(true)
  })

  it("splits a note number and its first subdivision on one line", () => {
    expect(node("sub-III/us-notes/2")?.text).toBe("")
    expect(node("sub-III/us-notes/2(a)")?.text.startsWith("Heading 9903.01.25 applies")).toBe(true)
  })

  it("nests roman numerals under letters", () => {
    expect(keysA.includes("sub-III/us-notes/2(c)(i)")).toBe(true)
    expect(keysA.includes("sub-III/us-notes/2(c)(iii)")).toBe(true)
    expect(keysA.includes("sub-III/us-notes/2(d)")).toBe(true)
  })

  it("reads (v) after (u) as a letter, (i) under it as roman, and (v) after (iv) as roman", () => {
    const parsed = parseCh99NotesMarkdown(
      ["## SUBCHAPTER III", "### U.S. Notes", "1. Intro.", ...LETTERS_TO_U.map((l) => `(${l}) Item ${l}.`), "(v) V.", "(i) One.", "(ii) Two.", "(iii) Three.", "(iv) Four.", "(v) Five.", "(w) W."].join("\n\n")
    )
    const citations = parsed.nodes.map((n) => n.citation)
    expect(citations.slice(-8)).toEqual(["1(u)", "1(v)", "1(v)(i)", "1(v)(ii)", "1(v)(iii)", "1(v)(iv)", "1(v)(v)", "1(w)"])
    expect(citations.includes("1(ij)")).toBe(true)
    expect(parsed.warnings.length).toBe(0)
  })

  it("reads (C) after (B) as a letter and (I) under (C) as roman", () => {
    const parsed = parseCh99NotesMarkdown(
      ["## SUBCHAPTER III", "### U.S. Notes", "1. (a) A.", "(A) Big A.", "(B) Big B.", "(C) Big C.", "(I) Roman one.", "(II) Roman two.", "(D) Big D."].join("\n\n")
    )
    expect(parsed.nodes.map((n) => n.citation)).toEqual(["1", "1(a)", "1(a)(A)", "1(a)(B)", "1(a)(C)", "1(a)(C)(I)", "1(a)(C)(II)", "1(a)(D)"])
  })

  it("accepts a small gap in lettering with a warning", () => {
    const parsed = parseCh99NotesMarkdown(
      ["## SUBCHAPTER III", "### U.S. Notes", "1. (a) A.", "(b) B.", "(d) D.", "(e) E."].join("\n\n")
    )
    expect(parsed.nodes.map((n) => n.citation)).toEqual(["1", "1(a)", "1(b)", "1(d)", "1(e)"])
    expect(parsed.warnings.filter((w) => w.kind === "numbering_gap").length).toBe(1)
  })

  it("reads (A), (B) as upper-case letters", () => {
    expect(keysA.includes("sub-III/us-notes/6(a)(A)")).toBe(true)
    expect(keysA.includes("sub-III/us-notes/6(a)(B)")).toBe(true)
    expect(keysA.includes("sub-III/us-notes/6(b)")).toBe(true)
  })

  it("links children to parents", () => {
    expect(node("sub-III/us-notes/2(c)(ii)")?.parentKey).toBe("sub-III/us-notes/2(c)")
    expect(node("sub-III/us-notes/6(a)(A)")?.parentKey).toBe("sub-III/us-notes/6(a)")
  })

  it("keeps the group through a '(con.)' heading", () => {
    expect(keysA.includes("sub-III/us-notes/3")).toBe(true)
    expect(keysA.filter((k) => k.endsWith("#2")).length).toBe(0)
  })

  it("keeps tables inside notes and extracts their codes", () => {
    expect(node("sub-III/us-notes/3")?.htsCodes).toEqual(["0101.21.00", "0101.29.00", "8471.30.01.00", "8471.41.01", "9903.01.30"])
  })

  it("skips the tariff table and what follows it", () => {
    const last = node("sub-III/us-notes/6(b)")
    expect(last?.text.includes("Products of listed countries")).toBe(false)
    expect(last?.text.includes("See subchapter")).toBe(false)
  })

  it("records PDF pages", () => {
    expect(node("ch99/notes/1")?.page).toBe(1)
    expect(node("sub-III/us-notes/2(a)")?.page).toBe(2)
    expect(node("sub-III/us-notes/6(a)")?.page).toBe(3)
  })

  it("warns about the jump from note 4 to note 6", () => {
    expect(a.warnings.some((w) => w.kind === "numbering_gap" && w.message.includes("Note 6 follows note 4"))).toBe(true)
  })

  it("keeps a wrapped '(a) of this note' line as text", () => {
    const parsed = parseCh99NotesMarkdown(
      "## SUBCHAPTER III\n\n### U.S. Notes\n\n1. (a) First item.\n\n(b) Except as provided in subdivision\n(a) of this note, duties apply.\n"
    )
    expect(parsed.nodes.map((n) => n.key)).toEqual(["sub-III/us-notes/1", "sub-III/us-notes/1(a)", "sub-III/us-notes/1(b)"])
    expect(parsed.nodes[2].text).toBe("Except as provided in subdivision (a) of this note, duties apply.")
  })

  it("strips markdown formatting and escapes", () => {
    const parsed = parseCh99NotesMarkdown(
      "## SUBCHAPTER III\n\n### **U.S. Notes**\n\n- 1\\. The **rate** is \\$5 per <sup>1</sup>unit.\n"
    )
    expect(parsed.nodes[0].key).toBe("sub-III/us-notes/1")
    expect(parsed.nodes[0].text).toBe("The rate is $5 per 1unit.")
  })
})

describe("HTS code extraction", () => {
  it("normalizes 10-digit codes and skips years", () => {
    expect(extractHtsCodes("in 2025 under 8471.30.0100 and 8471.30.01.00 or 9903.01.25")).toEqual([
      "8471.30.01.00",
      "9903.01.25",
    ])
  })
})

describe("Word diff", () => {
  it("marks only the changed words", () => {
    const ops = wordDiff("entered on or after April 5, 2025.", "entered on or after May 1, 2025.")
    expect(renderWordDiff(ops)).toBe("entered on or after [-April 5,-] {+May 1,+} 2025.")
  })
})

const noteDiffs = diffNotes(a.nodes, b.nodes)
const byKey = (key: string) => noteDiffs.find((d) => d.key === key)

describe("Note diff", () => {
  it("finds the modified date", () => {
    expect(byKey("sub-III/us-notes/2(b)")?.status).toBe("modified")
  })

  it("finds the added subdivision", () => {
    expect(byKey("sub-III/us-notes/2(e)")?.status).toBe("added")
  })

  it("finds the reworded exclusion", () => {
    expect(byKey("sub-III/us-notes/2(c)(i)")?.status).toBe("modified")
  })

  it("reports a list change as codes added and removed", () => {
    const d = byKey("sub-III/us-notes/3")
    expect(d?.codesAdded).toEqual(["0101.30.00"])
    expect(d?.codesRemoved).toEqual(["0101.29.00"])
  })

  it("detects renumbering instead of a rewrite", () => {
    const moved = noteDiffs.find((d) => d.status === "renumbered")
    expect(moved?.fromKey).toBe("sub-III/us-notes/6(a)(B)")
    expect(moved?.toKey).toBe("sub-III/us-notes/6(a)(C)")
    expect(byKey("sub-III/us-notes/6(a)(B)")?.status).toBe("added")
  })

  it("leaves unchanged notes out", () => {
    expect(byKey("sub-III/us-notes/1")).toBe(undefined)
    expect(byKey("ch99/notes/1(a)")).toBe(undefined)
  })
})

const rowsA = parseCh99Json(CH99_JSON_A).rows
const rowsB = parseCh99Json(CH99_JSON_B).rows
const codeDiffs = diffCodes(rowsA, rowsB)

describe("Code diff", () => {
  it("finds the rate change and the new heading", () => {
    expect(codeDiffs.map((d) => `${d.status}:${d.key}`)).toEqual(["modified:9903.01.25", "added:9903.01.31"])
    expect(codeDiffs[0].fields[0].field).toBe("general")
  })

  it("keys rows without a code by the code above them", () => {
    expect(rowsA[1].key.startsWith("9903.01.25~")).toBe(true)
  })

  it("rejects a file that isn't an HTS export", () => {
    let message = ""
    try {
      parseCh99Json({ not: "an array" })
    } catch (e) {
      message = (e as Error).message
    }
    expect(message.includes("array")).toBe(true)
  })
})

const item = (over: Partial<ChangeRecordItem>): ChangeRecordItem => ({
  id: "CR-1",
  in_chapter_99: true,
  kind: "note",
  action: "modified",
  subchapter: "III",
  note_type: "us_note",
  note_citations: [],
  hts_codes: [],
  hts_code_ranges: [],
  description: "",
  effective_date: null,
  authority: null,
  source_text: "",
  ...over,
})

describe("Grouping into changes", () => {
  const changes = buildChanges({
    changeRecordItems: [
      item({ id: "CR-1", note_citations: ["2"], description: "Note 2 modified" }),
      item({ id: "CR-2", kind: "hts_code", note_type: null, hts_code_ranges: [{ from: "9903.01.25", to: "9903.01.31" }], description: "Headings modified" }),
      item({ id: "CR-3", note_citations: ["40(b)"], description: "Note 40(b) added" }),
      item({ id: "CR-4", in_chapter_99: false, note_citations: [], description: "Chapter 72 change" }),
    ],
    noteDiffs,
    codeDiffs,
    fromNodes: a.nodes,
    toNodes: b.nodes,
    toRows: rowsB,
  })
  const get = (key: string) => changes.find((c) => c.change_key === key)

  it("gives a change record item the diffs under its note", () => {
    const cr1 = get("cr:CR-1")
    expect(cr1?.source).toBe("change_record")
    expect(cr1?.payload.noteDiffs.length).toBe(3)
  })

  it("matches code ranges", () => {
    expect(get("cr:CR-2")?.payload.codeDiffs.length).toBe(2)
  })

  it("flags change record items with no difference", () => {
    expect(get("cr:CR-3")?.source).toBe("change_record_no_diff")
    expect(get("cr:CR-3")?.payload.warnings.length).toBe(2)
  })

  it("leaves out items outside chapter 99", () => {
    expect(get("cr:CR-4")).toBe(undefined)
  })

  it("groups unmentioned differences by top-level note", () => {
    expect(get("notes:sub-III/us-notes/3")?.source).toBe("not_in_change_record")
    expect(get("notes:sub-III/us-notes/6")?.payload.noteDiffs.length).toBe(2)
  })

  it("adds notes the changed text refers to as context", () => {
    const context = get("cr:CR-1")?.payload.context.map((c) => c.key) ?? []
    expect(context.includes("sub-III/us-notes/6(a)")).toBe(true)
  })

  it("hashes payloads stably", () => {
    const again = buildChanges({
      changeRecordItems: [item({ id: "CR-1", note_citations: ["2"] })],
      noteDiffs,
      codeDiffs,
      fromNodes: a.nodes,
      toNodes: b.nodes,
      toRows: rowsB,
    })
    expect(again[0].payload.hash).toBe(get("cr:CR-1")?.payload.hash)
  })
})
