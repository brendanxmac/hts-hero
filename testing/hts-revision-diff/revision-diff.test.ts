import { describe, expect, it } from "../test-runner"
import { parseCh99NotesMarkdown } from "../../libs/hts-revision-diff/parse-ch99-notes"
import { parseCh99Json } from "../../libs/hts-revision-diff/parse-ch99-json"
import { codeChanges, diffCodes, diffNotes } from "../../libs/hts-revision-diff/diff"
import { buildChanges } from "../../libs/hts-revision-diff/build-changes"
import { wordDiff, renderWordDiff } from "../../libs/hts-revision-diff/word-diff"
import { extractHtsCodes, extractHtsRanges } from "../../libs/hts-revision-diff/text"
import type { ChangeRecordItem } from "../../libs/hts-revision-diff/types"
import { readFileSync } from "fs"
import { parseCh99HeadingTables } from "../../libs/hts-revision-diff/parse-ch99-tables"
import { headingRowsAsHtsRows, headingRowsFingerprint, reconcileHeadingRows, uncitedHeadingRowIds } from "../../libs/hts-revision-diff/headings"
import type { HeadingRow } from "../../libs/hts-revision-diff/types"
import { join } from "path"
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

  it("accepts gaps left by deleted subdivisions without warnings", () => {
    const parsed = parseCh99NotesMarkdown(
      ["## SUBCHAPTER III", "### U.S. Notes", "1. (a) A.", "(b) B.", "(c) C.", "(j) J.", "(k) K.", "(s) S."].join("\n\n")
    )
    expect(parsed.nodes.map((n) => n.citation)).toEqual(["1", "1(a)", "1(b)", "1(c)", "1(j)", "1(k)", "1(s)"])
    expect(parsed.warnings.length).toBe(0)
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

  it("continues after a jump in note numbers", () => {
    expect(keysA.includes("sub-III/us-notes/6(a)")).toBe(true)
    expect(a.warnings.length).toBe(0)
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
    fullHeadingDiff: true,
    toRevisionName: "Rev B",
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

  it("finds a note when the change record leaves out the subchapter", () => {
    // A cut-off row ("U.S. note 2(aa)(v)(1), ch") gives no subchapter; the
    // note exists only in subchapter III
    const [cr] = buildChanges({
      changeRecordItems: [item({ id: "CR-9", subchapter: null, note_citations: ["6(a)"] })],
      noteDiffs,
      codeDiffs,
      fromNodes: a.nodes,
      toNodes: b.nodes,
      toRows: rowsB,
      fullHeadingDiff: true,
      toRevisionName: "Rev B",
    })
    expect(cr.source).toBe("change_record")
    expect(cr.payload.noteDiffs.length > 0).toBe(true)
    expect(cr.payload.warnings[0].includes("subchapter III")).toBe(true)
  })

  it("gives a new note's empty headers to the item citing its subdivisions", () => {
    const doc = (lines: string[]) => parseCh99NotesMarkdown(["## SUBCHAPTER III", "### U.S. Notes", ...lines].join("\n\n")).nodes
    const before = doc(["1. (a) A."])
    const after = doc(["1. (a) A.", "2. (a) (i) New one.", "(ii) New two."])
    const changes = buildChanges({
      changeRecordItems: [item({ id: "CR-9", note_citations: ["2(a)(i)", "2(a)(ii)"] })],
      noteDiffs: diffNotes(before, after),
      codeDiffs: [],
      fromNodes: before,
      toNodes: after,
      toRows: null,
      fullHeadingDiff: false,
      toRevisionName: "Rev B",
    })
    expect(changes.length).toBe(1)
    expect(changes[0].payload.noteDiffs.map((d) => d.key)).toEqual([
      "sub-III/us-notes/2", "sub-III/us-notes/2(a)", "sub-III/us-notes/2(a)(i)", "sub-III/us-notes/2(a)(ii)",
    ])
  })

  it("keeps chapter-level notes for a citation without a subchapter that exists there", () => {
    const [cr] = buildChanges({
      changeRecordItems: [item({ id: "CR-9", subchapter: null, note_type: null, note_citations: ["1"] })],
      noteDiffs,
      codeDiffs,
      fromNodes: a.nodes,
      toNodes: b.nodes,
      toRows: rowsB,
      fullHeadingDiff: true,
      toRevisionName: "Rev B",
    })
    expect(cr.payload.noteDiffs.every((d) => d.key.startsWith("ch99/"))).toBe(true)
    expect(cr.payload.warnings.some((w) => w.includes("doesn't say which subchapter"))).toBe(false)
  })

  it("hashes payloads stably", () => {
    const again = buildChanges({
      changeRecordItems: [item({ id: "CR-1", note_citations: ["2"] })],
      noteDiffs,
      codeDiffs,
      fromNodes: a.nodes,
      toNodes: b.nodes,
      toRows: rowsB,
      fullHeadingDiff: true,
      toRevisionName: "Rev B",
    })
    expect(again[0].payload.hash).toBe(get("cr:CR-1")?.payload.hash)
  })
})

describe("Heading changes without a full heading diff", () => {
  const headingItem = item({
    id: "CR-H",
    kind: "hts_code",
    note_type: null,
    hts_codes: ["9903.01.31", "9903.01.99"],
    hts_code_ranges: [{ from: "9903.01.25", to: "9903.01.30" }],
    description: "Headings added and modified",
  })
  const build = (toRows: typeof rowsB | null) =>
    buildChanges({
      changeRecordItems: [headingItem],
      noteDiffs: [],
      codeDiffs: [],
      fromNodes: a.nodes,
      toNodes: b.nodes,
      toRows,
      fullHeadingDiff: false,
      toRevisionName: "Rev B",
    })[0]

  it("treats a cited heading as the change itself", () => {
    expect(build(rowsB).source).toBe("change_record")
    expect(build(null).source).toBe("change_record")
  })

  it("looks up cited codes and ranges in the newer revision's rows", () => {
    const cited = build(rowsB).payload.citedHeadings ?? []
    expect(cited.map((c) => `${c.code}:${c.status}`)).toEqual([
      "9903.01.31:found",
      "9903.01.99:not_found",
      "9903.01.25:found",
      "9903.01.30:found",
    ])
    expect(build(rowsB).payload.warnings.some((w) => w.includes("9903.01.99"))).toBe(true)
  })

  it("marks codes unverified when the newer revision has no JSON", () => {
    const change = build(null)
    expect((change.payload.citedHeadings ?? []).every((c) => c.status === "unverified")).toBe(true)
    expect(change.payload.warnings.some((w) => w.includes("isn't available"))).toBe(true)
  })
})

// Pages 1-86 of the 2026 HTS Revision 5 Chapter 99 PDF as converted by
// datalab (subchapters I and II and the tariff tables removed before upload)
describe("Real Chapter 99 text (2026HTSRev5, pages 1-86)", () => {
  const real = parseCh99NotesMarkdown(
    readFileSync(join("testing", "hts-revision-diff", "fixtures", "ch99-2026HTSRev5-pages-1-86.md"), "utf8")
  )
  const keys = new Set(real.nodes.map((n) => n.key))
  const childrenOf = (key: string) => real.nodes.filter((n) => n.parentKey === key).map((n) => n.citation)

  it("parses without warnings", () => {
    expect(real.warnings.length).toBe(0)
  })

  it("finds every note, including deleted ones written as [U.S. note 8 deleted]", () => {
    const top = real.nodes.filter((n) => !n.parentKey && n.groupKey === "sub-III/us-notes").map((n) => n.citation)
    expect(top).toEqual(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19"])
    expect(real.nodes.find((n) => n.key === "sub-III/us-notes/8")?.text).toBe("[Deleted]")
  })

  it("follows lettering with gaps from deleted subdivisions", () => {
    expect(childrenOf("sub-III/us-notes/2")).toEqual(["2(a)", "2(b)", "2(c)", "2(j)", "2(k)", "2(l)", "2(m)", "2(s)", "2(t)", "2(u)", "2(v)", "2(x)", "2(y)", "2(z)", "2(aa)"])
  })

  it("nests a letter list under a roman numeral under a letter", () => {
    expect(childrenOf("sub-III/us-notes/2(v)(iii)")).toEqual(["2(v)(iii)(a)", "2(v)(iii)(b)"])
    expect(keys.has("sub-III/us-notes/2(v)(xxv)")).toBe(true)
  })

  it("strips page headers and footers", () => {
    expect(real.nodes.some((n) => /99 - III -|Annotated for Statistical/.test(n.text))).toBe(false)
  })

  it("keeps every subdivision a sensible size", () => {
    expect(real.nodes.every((n) => n.text.length < 40_000)).toBe(true)
  })
})

describe("Numbering patterns found in Chapter 99", () => {
  const parse = (lines: string[]) =>
    parseCh99NotesMarkdown(["## SUBCHAPTER III", "### U.S. Notes", ...lines].join("\n\n"))

  it("continues the alphabet past (z) with (aa) and (aaa)", () => {
    const p = parse(["1. (a) A.", "(x) X.", "(y) Y.", "(z) Z.", "(aa) AA.", "(bb) BB.", "(zz) ZZ.", "(aaa) AAA.", "(1) 0713.33.1040", "(2) 0713.50.1000", "(bbb) BBB."])
    expect(p.nodes.filter((n) => n.parentKey === "sub-III/us-notes/1").map((n) => n.citation)).toEqual([
      "1(a)", "1(x)", "1(y)", "1(z)", "1(aa)", "1(bb)", "1(zz)", "1(aaa)", "1(bbb)",
    ])
    expect(p.nodes.find((n) => n.citation === "1(aaa)(2)")?.text).toBe("0713.50.1000")
    expect(p.warnings.length).toBe(0)
  })

  it("starts a deeper (aa) level under a roman numeral", () => {
    const p = parse(["7. (a) A.", "(i) One.", "(ii) Two.", "(aa) Deeper.", "(bb) Deeper.", "(iii) Three."])
    expect(p.nodes.map((n) => n.citation)).toEqual(["7", "7(a)", "7(a)(i)", "7(a)(ii)", "7(a)(ii)(aa)", "7(a)(ii)(bb)", "7(a)(iii)"])
  })

  // 2026HTSRev12: the conversion dropped "50. (a)" before "(i) Except…", after note 39
  const droppedNote = [
    "39. (a) Semiconductors.",
    "(b) B.",
    "(c) C.",
    "(d) D.",
    "(i) Heading 9903.79.03.",
    "(ii) Heading 9903.79.04.",
    "(i) Except as provided in headings 9903.05.02–9903.05.09 and in subdivisions (a)(ii) through (a)(vi) of this note.",
    "(ii) As provided in heading 9903.05.03.",
    "(1) Etrogs.",
    "(iii) As provided in heading 9903.05.04.",
  ]

  it("puts back a note number the conversion dropped, from the change record's citations", () => {
    const expectedCitations = ["50(a)(i)", "50(a)(ii)", "50(a)(iii)"].map((citation) => ({ subchapter: "III", slug: "us-notes", citation }))
    const p = parseCh99NotesMarkdown(["## SUBCHAPTER III", "### U.S. Notes", ...droppedNote].join("\n\n"), { expectedCitations })
    expect(p.nodes.map((n) => n.citation)).toEqual([
      "39", "39(a)", "39(b)", "39(c)", "39(d)", "39(d)(i)", "39(d)(ii)",
      "50", "50(a)", "50(a)(i)", "50(a)(ii)", "50(a)(ii)(1)", "50(a)(iii)",
    ])
    // (numbering_gap: this excerpt starts at note 39)
    expect(p.warnings.map((w) => w.kind)).toEqual(["numbering_gap", "recovered_note_marker"])
  })

  it("warns once when a note number seems dropped and the change record doesn't say which", () => {
    const p = parse(droppedNote)
    const missing = p.warnings.filter((w) => w.kind === "possible_missing_note")
    expect(missing.length).toBe(1)
    expect(missing[0].message.includes("under 39")).toBe(true)
  })

  it("reads (i) after (h) as roman under (h) when (ii) follows, even though letter (i) would be next", () => {
    // 2026HTSRev14 note 40(h): three roman subdivisions, then the letter (i)
    const p = parse([
      "40. (g) G.",
      "(h) Headings 9903.04.64–9903.04.66 apply to patented pharmaceutical articles.",
      "(i) Heading 9903.04.64 applies to onshoring plans.",
      "(ii) Heading 9903.04.65 applies to pricing agreements.",
      "(iii) Heading 9903.04.66 applies to orphan drugs.",
      "(i) Heading 9903.04.69 applies to other articles.",
    ])
    expect(p.nodes.map((n) => n.citation)).toEqual(["40", "40(g)", "40(h)", "40(h)(i)", "40(h)(ii)", "40(h)(iii)", "40(i)"])
    // (the excerpt starting at 40(g) raises numbering_gap and unexpected_start)
    expect(p.warnings.some((w) => /missing_note|out_of_sequence|duplicate/.test(w.kind))).toBe(false)
  })

  it("keeps a letter (i) when (ii) continues a roman list already open above it", () => {
    const p = parse(["2. (i) One:", "(a) A.", "(b) B.", "(c) C.", "(d) D.", "(e) E.", "(f) F.", "(g) G.", "(h) H.", "(i) I.", "(ii) Two."])
    expect(p.nodes.map((n) => n.citation).slice(-3)).toEqual(["2(i)(h)", "2(i)(i)", "2(ii)"])
  })

  it("reads (i) after (h) as a letter when (j) follows", () => {
    const p = parse(["1. (g) G.", "(h) H.", "(i) I.", "(j) J."])
    expect(p.nodes.map((n) => n.citation)).toEqual(["1", "1(g)", "1(h)", "1(i)", "1(j)"])
  })

  it("keeps numbered lists inside a note as list items", () => {
    const p = parse(["20. (a) The following:", "1. Other seats.", "2. Furniture.", "(b) Next.", "21. Next note."])
    expect(p.nodes.map((n) => n.citation)).toEqual(["20", "20(a)", "20(a)[1]", "20(a)[2]", "20(b)", "21"])
  })

  it("reads OCR's (II) as (ll) when it continues the lettering", () => {
    const p = parse(["1. Intro.", "20. (a) A.", "(gg) GG.", "(II) LL.", "(1) One.", "(mm) MM."])
    expect(p.nodes.filter((n) => n.parentKey === "sub-III/us-notes/20").map((n) => n.citation)).toEqual(["20(a)", "20(gg)", "20(ll)", "20(mm)"])
    expect(p.warnings.map((w) => w.kind)).toEqual(["ocr_correction"])
  })

  // Capital I and lowercase l look alike in the PDF font
  const citations = (lines: string[]) => parse(["1. Intro.", ...lines]).nodes.map((n) => n.citation)

  it("reads (II) after (gg) as (ll), at the same level as (gg), even with a roman (I) open below", () => {
    const p = parse(["1. Intro.", "20. (a) A.", "(gg) GG.", "(1) Item.", "(I) Roman one.", "(II) LL.", "(1) Item.", "(mm) MM."])
    expect(p.nodes.find((n) => n.citation === "20(ll)")?.parentKey).toBe("sub-III/us-notes/20")
    expect(p.nodes.find((n) => n.citation === "20(mm)")?.parentKey).toBe("sub-III/us-notes/20")
    expect(p.warnings.filter((w) => w.kind === "ocr_correction").length).toBe(1)
  })

  it("keeps a real roman list (I), (II), (III)", () => {
    expect(citations(["2. (a) A.", "(I) One.", "(II) Two.", "(III) Three.", "(b) B."])).toEqual([
      "1", "2", "2(a)", "2(a)(I)", "2(a)(II)", "2(a)(III)", "2(b)",
    ])
  })

  it("reads (I) between (k) and (m) as the letter l", () => {
    expect(citations(["2. (a) A.", "(k) K.", "(I) L.", "(m) M."])).toEqual(["1", "2", "2(a)", "2(k)", "2(l)", "2(m)"])
  })

  it("reads (ll) as roman II when (III) follows", () => {
    expect(citations(["2. (a) A.", "(I) One.", "(ll) Two.", "(III) Three."])).toEqual([
      "1", "2", "2(a)", "2(a)(I)", "2(a)(II)", "2(a)(III)",
    ])
  })

  it("keeps (I) as the capital letter I between (H) and (J)", () => {
    expect(citations(["2. (a) A.", "(A) A.", "(H) H.", "(I) I.", "(J) J."])).toEqual([
      "1", "2", "2(a)", "2(a)(A)", "2(a)(H)", "2(a)(I)", "2(a)(J)",
    ])
  })

  it("keeps items the PDF numbers alike as separate items", () => {
    const p = parse(["20. (a) A.", "(1) One.", "(2) Two.", "(2) Two again.", "(3) Three."])
    expect(p.nodes.map((n) => n.key.replace("sub-III/us-notes/", ""))).toEqual(["20", "20(a)", "20(a)(1)", "20(a)(2)", "20(a)(2)#2", "20(a)(3)"])
    expect(p.nodes.find((n) => n.key.endsWith("(2)#2"))?.text).toBe("Two again.")
    expect(p.warnings.filter((w) => w.kind !== "numbering_gap").map((w) => w.kind)).toEqual(["duplicate_number"])
  })

  it("continues the closest matching sequence after nested letters", () => {
    const p = parse(["1. Intro.", "2. (a) A.", "(v) V.", "(i) One.", "(ii) Two.", "(iii) Three.", "(a) A.", "(b) B.", "(x) X."])
    expect(p.nodes.find((n) => n.citation === "2(v)(iii)(b)")?.parentKey).toBe("sub-III/us-notes/2(v)(iii)")
    expect(p.nodes.find((n) => n.citation === "2(x)")?.parentKey).toBe("sub-III/us-notes/2")
    expect(p.warnings.length).toBe(0)
  })
})

describe("Code ranges", () => {
  const changes = (before: string, after: string) =>
    codeChanges(before, after, extractHtsCodes(before), extractHtsCodes(after))

  it("reads ranges written with dashes, through and to", () => {
    expect(extractHtsRanges("headings 9903.82.02–9903.82.17, 9903.45.01-9903.45.06, 9903.01.25 through 9903.01.30 and 9903.88.01 to 9903.88.04").map((r) => `${r.from}..${r.to}`)).toEqual([
      "9903.82.02..9903.82.17",
      "9903.45.01..9903.45.06",
      "9903.01.25..9903.01.30",
      "9903.88.01..9903.88.04",
    ])
  })

  it("ignores pairs that aren't ranges", () => {
    expect(extractHtsRanges("subheadings 7208.10.15 - 7225.30.30 and 9903.01.30-9903.01.25").length).toBe(0)
  })

  it("reports a range extended at the end, not a code removed", () => {
    const c = changes("headings 9903.82.02–9903.82.17 provide", "headings 9903.82.02–9903.82.19 provide")
    expect(c.removed).toEqual([])
    expect(c.added).toEqual([])
    expect(c.rangeChanges.map((r) => r.description)).toEqual(["extended at the end: now runs to 9903.82.19"])
  })

  it("reports a range shortened at the start", () => {
    const c = changes("9903.01.25 through 9903.01.30", "9903.01.26 through 9903.01.30")
    expect(c.rangeChanges.map((r) => r.description)).toEqual(["shortened at the start: now starts at 9903.01.26"])
  })

  it("reports new ranges and plain list changes", () => {
    const c = changes("9903.45.01-9903.45.06; 0101.21.00, 0101.29.00", "9903.45.01-9903.45.06 and 9903.45.21-9903.45.29; 0101.21.00, 0101.30.00")
    expect(c.rangeChanges.map((r) => `${r.after} ${r.description}`)).toEqual(["9903.45.21–9903.45.29 new range"])
    expect(c.added).toEqual(["0101.30.00"])
    expect(c.removed).toEqual(["0101.29.00"])
  })

  it("doesn't report a code as removed when a range now covers it", () => {
    const c = changes("headings 9903.82.05 and 9903.82.10", "headings 9903.82.04–9903.82.19")
    expect(c.removed).toEqual([])
  })
})

const TABLE_MD = `{0}------------------------------------------------

| Heading/ Subheading | Stat. Suf- fix | Article Description | Unit of Quantity | Rates of Duty |  |  |
|  |  |  |  | 1 General | Special | 2 |
|---|---|---|---|---|---|---|
| 9903.82.18 |  | Derivative articles of copper, as provided for in subdivision (h) of U.S. note 16 to this subchapter .......... |  | The duty provided in the applicable subheading + 50% <sup>1/</sup> | No change | No change |
|  |  | Articles of aluminum: |  |  |  |  |
| 9903.82.19 |  | Other, as provided for in subdivision (i) of U.S. note 16 | No. | 25% | Free (A) | 35% |

<sup>1/</sup> See chapter 99 statistical note 1.
`

describe("Heading tables", () => {
  const { rows, warnings } = parseCh99HeadingTables(TABLE_MD)

  it("reads coded rows, description-only rows and rates", () => {
    expect(rows.map((r) => r.htsno)).toEqual(["9903.82.18", "", "9903.82.19"])
    expect(rows[1].description).toBe("Articles of aluminum:")
    expect([rows[2].general, rows[2].special, rows[2].other, rows[2].units]).toEqual(["25%", "Free (A)", "35%", "No."])
    expect(warnings.length).toBe(0)
  })

  it("strips dot leaders and attaches footnotes", () => {
    expect(rows[0].description.endsWith("subchapter")).toBe(true)
    expect(rows[0].footnotes).toEqual(["1/ See chapter 99 statistical note 1."])
  })

  it("warns when there are no tables", () => {
    expect(parseCh99HeadingTables("Just text").warnings.map((w) => w.kind)).toEqual(["no_tables"])
  })
})

const headingRow = (over: Partial<HeadingRow>): HeadingRow => ({
  id: "x", attempt_id: "a", sort_order: 0, htsno: "", stat_suffix: "", indent: 0, description: "", general: "", special: "",
  other: "", units: "", footnotes: [], page: 1, source: "pdf", claude_status: "pending", claude_notes: null, parser_original: null,
  reviewed: false, reviewed_at: null, created_at: "", updated_at: "", ...over,
})

describe("Claude check of heading rows", () => {
  const parsed = [
    headingRow({ id: "r1", htsno: "9903.82.18", description: "Derivative articles of copper", general: "+ 50%" }),
    headingRow({ id: "r2", htsno: "9903.82.19", description: "Other", general: "26%" }),
    headingRow({ id: "r3", htsno: "9903.82.99", description: "Garbled row" }),
  ]
  const fields = (over: Partial<HeadingRow>) => {
    const r = headingRow(over)
    return { htsno: r.htsno, stat_suffix: r.stat_suffix, indent: r.indent, description: r.description, general: r.general, special: r.special, other: r.other, units: r.units, footnotes: r.footnotes, page: r.page }
  }
  const { updates, inserts } = reconcileHeadingRows(parsed, [
    fields({ htsno: "9903.82.18", indent: 1, description: "Derivative articles of copper", general: "+ 50%" }),
    fields({ description: "Articles of aluminum:" }),
    fields({ htsno: "9903.82.19", indent: 2, description: "Other", general: "25%" }),
  ])
  const update = (id: string) => updates.find((u) => u.id === id)!.values

  it("confirms matching rows, counting a new indent as no correction", () => {
    expect(update("r1").claude_status).toBe("ok")
    expect(update("r1").indent).toBe(1)
  })

  it("corrects differing fields and keeps the parser's values", () => {
    expect(update("r2").claude_status).toBe("corrected")
    expect(update("r2").general).toBe("25%")
    expect(update("r2").parser_original).toEqual({ general: "26%" })
  })

  it("adds rows the parser missed and flags rows Claude didn't find", () => {
    expect(inserts.map((r) => [r.description, r.claude_status])).toEqual([["Articles of aluminum:", "added"]])
    expect(update("r3").claude_status).toBe("flagged")
  })

  it("only hands reviewed rows to comparisons", () => {
    const rows = headingRowsAsHtsRows([
      headingRow({ htsno: "9903.82.18", general: "+ 50%", reviewed: true }),
      headingRow({ htsno: "9903.82.19", general: "25%", reviewed: false }),
    ])
    expect(rows.map((r) => r.htsno)).toEqual(["9903.82.18"])
  })
})

describe("uncitedHeadingRowIds", () => {
  const row = (id: string, htsno: string, indent = 0, source: HeadingRow["source"] = "pdf") =>
    ({ id, htsno, indent, source }) as HeadingRow
  const item = (in_chapter_99: boolean, hts_codes: string[], hts_code_ranges: { from: string; to: string }[] = []) =>
    ({ in_chapter_99, hts_codes, hts_code_ranges }) as ChangeRecordItem

  it("keeps cited headings (by code or range), their parents and continuations, and manual rows", () => {
    const rows = [
      row("parent", "", 0),
      row("c18", "9903.82.18", 1),
      row("c18-cont", "", 2),
      row("nested-other", "9903.82.30", 2),
      row("u17", "9903.82.17", 0),
      row("u17-cont", "", 1),
      row("r41", "9903.94.41", 0),
      row("r65", "9903.94.65", 0),
      row("r66", "9903.94.66", 0),
      row("manual", "9903.99.99", 0, "manual"),
      row("not-ch99", "9903.01.25", 0),
    ]
    const items = [
      item(true, ["9903.82.18"]),
      item(true, [], [{ from: "9903.94.40", to: "9903.94.65" }]),
      item(false, ["9903.01.25"]),
    ]
    expect(uncitedHeadingRowIds(rows, items)).toEqual(["nested-other", "u17", "u17-cont", "r66", "not-ch99"])
  })
})

describe("headingRowsFingerprint", () => {
  const base = {
    stat_suffix: "", indent: 0, description: "Steel", general: "", special: "+25%", other: "", units: "",
    footnotes: [] as string[], source: "pdf", reviewed: true,
  }
  const rows = [
    { ...base, id: "a", htsno: "9903.82.18" },
    { ...base, id: "b", htsno: "9903.82.19", reviewed: false },
  ] as unknown as HeadingRow[]
  const fp = headingRowsFingerprint(rows)

  it("changes when a reviewed row's text changes or a row is (un)reviewed", () => {
    expect(headingRowsFingerprint([{ ...rows[0], special: "+50%" }, rows[1]]) !== fp).toBe(true)
    expect(headingRowsFingerprint([rows[0], { ...rows[1], reviewed: true }]) !== fp).toBe(true)
    expect(headingRowsFingerprint([{ ...rows[0], reviewed: false }, rows[1]]) !== fp).toBe(true)
  })

  it("ignores unreviewed rows, which comparisons don't use", () => {
    expect(headingRowsFingerprint([rows[0], { ...rows[1], special: "anything" }])).toBe(fp)
    expect(headingRowsFingerprint([rows[0]])).toBe(fp)
  })
})
