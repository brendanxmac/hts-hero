"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { formatTime } from "../hts-revision-diff/shared"
import { Callout, Field, SectionLabel, Spinner, btn } from "../hts-revision-diff/ui"
import { adminCall, type UpdateRow } from "./types"

// An update's scope in review: what it covers (codes, countries, exclusions, Chapter 99
// headings), where that came from (the PDF reader or a hand edit) and what the reader wasn't sure
// of. "Read from PDFs" runs the reader again; "Save scope" keeps a hand-edited one for good. Both
// work out the users' matches again.

const toText = (list: string[] | null) => (list ?? []).join("\n")
const toList = (text: string) => text.split(/[\n,;]+/).map((s) => s.trim()).filter(Boolean)
// Carve-outs for a use or a claim, one per line: "for use in civil aircraft | 8411.11, 8411.12"
const conditionalText = (list: { condition: string; codes: string[] }[] | null) => (list ?? []).map((c) => `${c.condition} | ${c.codes.join(", ")}`).join("\n")
const toConditional = (text: string) =>
  text
    .split("\n")
    .map((line) => {
      const [condition, codes = ""] = line.split("|")
      return { condition: condition.trim(), codes: toList(codes) }
    })
    .filter((c) => c.condition && c.codes.length)

const area = "textarea min-h-24 w-full border-base-content/15 font-mono text-xs leading-relaxed tracker:rounded-xl tracker:border-base-300"

export default function ScopeEditor({ update }: { update: UpdateRow }) {
  const router = useRouter()
  const [busy, setBusy] = useState<"read" | "save" | null>(null)
  const initial = () => ({
    codes: toText(update.scope_codes ?? update.hts_codes),
    excludedCodes: toText(update.scope_excluded_codes),
    conditional: conditionalText(update.scope_conditional_exclusions),
    countries: toText(update.scope_countries ?? update.countries),
    excludedCountries: toText(update.scope_excluded_countries),
    headings: toText(update.scope_headings),
  })
  const [form, setForm] = useState(initial)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setForm(initial()), [update])
  const set = (key: keyof ReturnType<typeof initial>) => (e: React.ChangeEvent<HTMLTextAreaElement>) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const run = async (kind: "read" | "save") => {
    setBusy(kind)
    try {
      const body =
        kind === "read"
          ? { action: "read-scope" }
          : {
              action: "save-scope",
              codes: toList(form.codes),
              excludedCodes: toList(form.excludedCodes),
              conditionalExclusions: toConditional(form.conditional),
              countries: toList(form.countries),
              excludedCountries: toList(form.excludedCountries),
              headings: toList(form.headings),
            }
      const r = await adminCall<{ result?: { status: string; codes?: number; documents?: number }; impacts: { impacts: number } }>(`/api/tariff-updates/${update.id}`, "POST", body)
      const read = r.result?.status === "read" ? `Read ${r.result.codes} codes from ${r.result.documents} PDFs. ` : r.result?.status === "no_documents" ? "No PDFs to read. " : ""
      toast.success(`${read}${r.impacts.impacts} matches worked out.`)
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't update the scope")
    } finally {
      setBusy(null)
    }
  }

  const source =
    update.scope_source === "admin"
      ? "Set by hand: the reader won't change it"
      : update.scope_source === "reader"
        ? `Read from ${update.scope_documents?.length ?? 0} PDF${update.scope_documents?.length === 1 ? "" : "s"} ${update.scope_read_at ? formatTime(update.scope_read_at) : ""}`
        : "Not read yet: from what the sources named"

  return (
    <section className="flex flex-col gap-3">
      <SectionLabel
        right={
          <button type="button" className={btn.xsSecondary} disabled={!!busy} onClick={() => run("read")} title="Have Claude read the update's PDFs, annexes included">
            {busy === "read" && <Spinner />}
            Read from PDFs
          </button>
        }
      >
        What It Covers
      </SectionLabel>
      <p className="-mt-2 text-xs text-base-content/60">{source}</p>
      {update.scope_notes && <Callout tone="warning">{update.scope_notes}</Callout>}
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={`Codes covered (${toList(form.codes).length})`} hint='One per line: "7326.90.86", "8703", "Chapter 73", or "ALL" for every product (less the exclusions)'>
          <textarea className={area} value={form.codes} onChange={set("codes")} />
        </Field>
        <Field label={`Codes excluded (${toList(form.excludedCodes).length})`}>
          <textarea className={area} value={form.excludedCodes} onChange={set("excludedCodes")} />
        </Field>
        <Field
          label={`May be exempt (${toConditional(form.conditional).length})`}
          hint='Carved out only for a use or a claim, one condition per line: "for use in civil aircraft | 8411.11, 8411.12". These imports are still matched.'
          className="sm:col-span-2"
        >
          <textarea className={`${area} min-h-12`} value={form.conditional} onChange={set("conditional")} />
        </Field>
        <Field label="Countries" hint='Two-letter codes, or "ALL"'>
          <textarea className={`${area} min-h-12`} value={form.countries} onChange={set("countries")} />
        </Field>
        <Field label="Countries excluded">
          <textarea className={`${area} min-h-12`} value={form.excludedCountries} onChange={set("excludedCountries")} />
        </Field>
        <Field label="Chapter 99 headings" className="sm:col-span-2">
          <textarea className={`${area} min-h-12`} value={form.headings} onChange={set("headings")} />
        </Field>
      </div>
      <button type="button" className={`${btn.xsSecondary} self-start`} disabled={!!busy} onClick={() => run("save")} title="Keep this scope for good and work out the matches again">
        {busy === "save" && <Spinner />}
        Save scope
      </button>
    </section>
  )
}
