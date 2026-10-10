// Checks every code list the engine models against a revision's own Chapter 99 note text, for
// backfills (HowTariffsWork.md §17.13): each list version in effect on the revision's first day
// should match the note subdivision it comes from. Lists have no first-seen safeguard in the
// validator, so a list still carrying a later revision's codes would otherwise go unnoticed.
//
//   npm run lists:check -- 2025HTSRev28 [--all]
//
// Subdivision numbers shift between revisions (2(v)(xx) became (xxi)), so each list is matched to
// the note subdivision (with everything under it) whose codes overlap it most, not by citation.
// Prints the lists that differ: codes the list has that the note doesn't, and the reverse. Lists
// not drawn from note text (EU members, chapter headings, proclamation annexes) find no good match
// and are listed separately. --all also prints the lists that match exactly.

import { createClient } from "@supabase/supabase-js"
import { existsSync } from "fs"
import { AllRules } from "../../tariffs/engine-v2/data"
import { getRevision } from "../../tariffs/engine-v2/revisions"

const BUCKET = "hts-revision-diff-parsing"
// Below this overlap (Jaccard), a list isn't treated as coming from that subdivision
const MIN_OVERLAP = 0.5

interface ParsedNode {
  key: string
  parentKey: string | null
  htsCodes: string[]
}

const digits = (code: string) => code.replace(/\D/g, "")
// Cross-references to chapter 98 and 99 provisions in the note text aren't list members
const isListCode = (code: string) => !/^9[89]/.test(code)

const fail = (message: string): never => {
  console.error(`✗ ${message}`)
  process.exit(1)
}

const main = async () => {
  if (existsSync(".env.local")) process.loadEnvFile(".env.local")
  const revisionName = process.argv[2]
  const showAll = process.argv.includes("--all")
  if (!revisionName) fail("Usage: npm run lists:check -- <revision name> [--all]")
  const revision = getRevision(revisionName) ?? fail(`Unknown revision ${revisionName}`)

  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data: row } = await db.from("hts_revision_diff_revisions").select("active_attempt_id").eq("name", revisionName).maybeSingle()
  const { data: attempt } = row?.active_attempt_id
    ? await db.from("hts_revision_diff_attempts").select("notes_path").eq("id", row.active_attempt_id).maybeSingle()
    : { data: null }
  if (!attempt?.notes_path) fail(`${revisionName} has no parsed notes in the revision checker. Upload and parse its Chapter 99 notes first.`)
  const { data: blob, error } = await db.storage.from(BUCKET).download(attempt!.notes_path)
  if (error || !blob) fail(`Couldn't download ${revisionName}'s notes: ${error?.message}`)
  const nodes = (JSON.parse(await blob!.text()) as { nodes: ParsedNode[] }).nodes

  // Each subdivision's codes, with everything under it
  const children = new Map<string, ParsedNode[]>()
  for (const n of nodes) if (n.parentKey) children.set(n.parentKey, [...(children.get(n.parentKey) ?? []), n])
  const subtreeCodes = new Map<string, Set<string>>()
  const collect = (n: ParsedNode): Set<string> => {
    const cached = subtreeCodes.get(n.key)
    if (cached) return cached
    const set = new Set(n.htsCodes.map(digits).filter(isListCode))
    for (const c of children.get(n.key) ?? []) collect(c).forEach((x) => set.add(x))
    subtreeCodes.set(n.key, set)
    return set
  }
  nodes.forEach(collect)
  // Which subdivisions mention each code, to find candidates fast
  const byCode = new Map<string, string[]>()
  for (const [key, set] of Array.from(subtreeCodes)) for (const c of Array.from(set)) byCode.set(c, [...(byCode.get(c) ?? []), key])

  const date = revision.from
  // Only lists that a tariff in effect on the date uses
  const inForce = (e?: { from?: string; to?: string }) => (!e?.from || e.from <= date) && (!e?.to || e.to > date)
  const used = new Set<string>()
  for (const t of AllRules.tariffs.filter((t) => inForce(t.effective)))
    for (const m of Array.from(JSON.stringify(t).matchAll(/"list":"([^"]+)"/g))) used.add(m[1])
  const differing: string[] = []
  const exact: string[] = []
  const unmatched: string[] = []
  for (const list of AllRules.lists) {
    const version = list.versions.find((v) => (!v.effective?.from || v.effective.from <= date) && (!v.effective?.to || v.effective.to > date))
    if (!version || !used.has(list.id)) continue // not in effect, or not used, in this revision
    const codes = new Set(version.codes.map(digits).filter(isListCode))
    let best: { key: string; overlap: number; inter: number } | null = null
    const candidates = new Set<string>()
    codes.forEach((c) => (byCode.get(c) ?? []).forEach((k) => candidates.add(k)))
    for (const key of Array.from(candidates)) {
      const note = subtreeCodes.get(key)!
      let inter = 0
      codes.forEach((c) => note.has(c) && inter++)
      const overlap = inter / (codes.size + note.size - inter)
      // The deepest subdivision wins a tie (it's the list itself, not the note containing it)
      if (!best || overlap > best.overlap || (overlap === best.overlap && key.length > best.key.length)) best = { key, overlap, inter }
    }
    const label = `${list.id} (${codes.size} codes)`
    if (!best || best.overlap < MIN_OVERLAP) {
      unmatched.push(`${label}${best ? `: closest ${best.key.replace(/^.*us-notes\//, "note ")} at ${Math.round(best.overlap * 100)}%` : ""}`)
      continue
    }
    const note = subtreeCodes.get(best.key)!
    const onlyList = Array.from(codes).filter((c) => !note.has(c))
    const onlyNote = Array.from(note).filter((c) => !codes.has(c))
    const where = best.key.replace(/^.*us-notes\//, "note ")
    if (!onlyList.length && !onlyNote.length) exact.push(`${label} = ${where}`)
    else
      differing.push(
        `${label} vs ${where} (${Math.round(best.overlap * 100)}% overlap)\n` +
          (onlyList.length ? `      in the list, not the note (${onlyList.length}): ${onlyList.slice(0, 12).join(" ")}${onlyList.length > 12 ? " …" : ""}\n` : "") +
          (onlyNote.length ? `      in the note, not the list (${onlyNote.length}): ${onlyNote.slice(0, 12).join(" ")}${onlyNote.length > 12 ? " …" : ""}` : ""),
      )
  }

  console.log(`Lists in effect on ${date} vs ${revisionName}'s note text: ${exact.length} match, ${differing.length} differ, ${unmatched.length} not from note text\n`)
  if (differing.length) {
    console.log("DIFFER (each needs an earlier list version, or the extraction is off; check the PDF):")
    differing.forEach((d) => console.log(`  ${d}`))
  }
  if (unmatched.length) {
    console.log("\nNot matched to note text (check by hand if the step touches them):")
    unmatched.forEach((u) => console.log(`  ${u}`))
  }
  if (showAll && exact.length) {
    console.log("\nMATCH:")
    exact.forEach((e) => console.log(`  ${e}`))
  }
}

main()
