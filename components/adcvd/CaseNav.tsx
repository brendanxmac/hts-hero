"use client"

import { CheckIcon, ExclamationTriangleIcon, QuestionMarkCircleIcon } from "@heroicons/react/20/solid"
import * as tt from "@/components/ui/styles/tracker"
import type { AdcvdFlag } from "@/libs/adcvd/match"
import type { AdcvdAnswer } from "@/components/tariff-tracker/adjustments"
import { countryName, inSentence } from "./AdcvdParts"
import { depositRange, MATCH_CHIP, rangeText, type Answer } from "./AdcvdDecision"

// When more than one AD/CVD case may cover an import: the header over both panels (how many cases,
// how far the user has got), and the left panel listing every case with where the user stands on
// it; the picked one is walked through on the right (CaseWalkthrough). Likely matches first, as the
// lookup sorts them.

// After "Is your product…": the product's name without "Certain", from a capital ("Tool chests and cabinets")
export const caseLabel = (flags: AdcvdFlag[], i: number) => {
  const f = flags[i]
  const name = inSentence(f.product).replace(/^certain\s+/i, "")
  const twin = flags.some((g, j) => j !== i && g.product === f.product)
  return `${name.charAt(0).toUpperCase()}${name.slice(1)}${twin ? ` (from ${countryName(f.country)})` : ""}`
}

const counts = (answers: AdcvdAnswer[]) => {
  const n = (a: Answer) => answers.filter((x) => (x.answer ?? null) === a).length
  return { ruledOut: n("no"), applies: n("yes"), unsure: n("unsure"), left: n(null) }
}

export const CasesHeader = ({ flags, answers }: { flags: AdcvdFlag[]; answers: AdcvdAnswer[] }) => {
  const c = counts(answers)
  const parts = [
    c.applies && `${c.applies} ${c.applies === 1 ? "applies" : "apply"}`,
    c.unsure && `${c.unsure} not sure`,
    c.ruledOut && `${c.ruledOut} ruled out`,
    c.left && `${c.left} to answer`,
  ].filter(Boolean)
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
      <div className="flex min-w-0 flex-col gap-1.5">
        <span className={tt.eyebrow("warning")}>AD/CVD Check</span>
        <h3 className={`${tt.display} m-0 text-2xl font-semibold leading-tight text-base-content`}>{flags.length} AD/CVD cases may cover this import</h3>
        <p className={`${tt.subtitle} m-0 max-w-3xl`}>
          Each case covers one kind of product. Go through them one by one: a &ldquo;No&rdquo; rules a case out, and the rest show what you&apos;d pay and what to do.
        </p>
      </div>
      <p className="m-0 text-sm font-semibold text-base-content/70" aria-live="polite">
        {parts.join(" · ")}
      </p>
    </div>
  )
}

// Where the user stands on a case, as a small round mark
const STATUS: Record<"no" | "yes" | "unsure" | "none", { mark: string; label: string }> = {
  none: { mark: "border-2 border-base-300", label: "To answer" },
  no: { mark: "bg-success text-success-content", label: "Ruled out" },
  yes: { mark: "bg-error text-error-content", label: "Applies" },
  unsure: { mark: "bg-warning text-warning-content", label: "Not sure" },
}

export const CaseNav = ({ flags, answers, open, onOpen }: { flags: AdcvdFlag[]; answers: AdcvdAnswer[]; open: number; onOpen: (index: number) => void }) => (
  <nav aria-labelledby="adcvd-cases-title" className="flex flex-col gap-3">
    <div className="flex flex-col gap-0.5 px-3 pt-1">
      <h4 id="adcvd-cases-title" className={`${tt.title} m-0`}>
        Cases to Check
      </h4>
      <p className={`${tt.subtitle} m-0`}>Pick one to answer its questions. Likely matches are listed first.</p>
    </div>
    <div className="flex flex-col gap-1">
      {flags.map((f, i) => {
        const a = answers[i]?.answer ?? "none"
        const s = STATUS[a]
        const active = i === open
        return (
          <button
            key={f.cases.map((c) => c.case_number).join()}
            type="button"
            onClick={() => onOpen(i)}
            aria-current={active ? "true" : undefined}
            className={`flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40 ${
              active ? "bg-primary/10 ring-1 ring-inset ring-primary/30" : "hover:bg-tt-soft"
            }`}
          >
            <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${s.mark}`} title={s.label}>
              {a === "no" && <CheckIcon className="h-3.5 w-3.5" aria-hidden />}
              {a === "yes" && <ExclamationTriangleIcon className="h-3 w-3" aria-hidden />}
              {a === "unsure" && <QuestionMarkCircleIcon className="h-3.5 w-3.5" aria-hidden />}
              <span className="sr-only">{s.label}</span>
            </span>
            <span className="flex min-w-0 flex-col gap-1">
              <span
                className={`text-sm font-semibold leading-snug ${
                  a === "no" ? "text-base-content/50 line-through decoration-base-content/30" : active ? "text-primary" : "text-base-content"
                }`}
              >
                {caseLabel(flags, i)}
              </span>
              <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-base-content/60">
                <span className={tt.chip(MATCH_CHIP[f.level].tone)}>{MATCH_CHIP[f.level].label.replace(" match", "")}</span>
                <span className="tabular-nums">{rangeText(depositRange(f))}</span>
              </span>
            </span>
          </button>
        )
      })}
    </div>
  </nav>
)
