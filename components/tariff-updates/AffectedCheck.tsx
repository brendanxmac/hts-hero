"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRightIcon, CheckCircleIcon, MagnifyingGlassIcon, PlusIcon } from "@heroicons/react/20/solid"
import Modal from "@/components/Modal"
import { useUser } from "@/contexts/UserContext"
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel"
import { entryHref, TRACKER_WELCOME_PARAM } from "@/libs/signup-onboarding"
import { TRACKER_PATH } from "@/components/tariff-tracker/sections"
import { THEME } from "@/components/ui/theme"
import { trackerSans } from "@/components/ui/font"
import * as ui from "@/components/ui/styles"
import * as tt from "@/components/ui/styles/tracker"
import type { AffectedCheck as Result } from "@/app/api/tariff-updates/affected/route"

// "Check if you or your clients are affected", beside the codes a tariff update names. Signed out:
// sign-up and the onboarding, then Duty Guard's alerts welcome (into adding imports). Signed in, it
// checks their imports (/api/tariff-updates/affected): any it affects open the update in Duty
// Guard's Tariff Updates, with what it does to each, on the affected import list (one per client,
// say; several affected lists: a popup lists them, each opening its own); none, a popup says
// they're likely not affected.

const LABEL = "See if you or your clients are affected"
const ADD_IMPORTS = `${TRACKER_PATH}?tab=catalog&add=paste`
const ALERTS_WELCOME = `${TRACKER_PATH}?${TRACKER_WELCOME_PARAM}=alerts`

const plural = (n: number, one: string) => `${n.toLocaleString()} ${one}${n === 1 ? "" : "s"}`

export const AffectedCheck = ({ slug, size = "md" }: { slug: string; size?: "md" | "lg" }) => {
  const { user } = useUser()
  const router = useRouter()
  const [checking, setChecking] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [failed, setFailed] = useState(false)
  const inDutyGuard = `${TRACKER_PATH}?tab=changes&update=${encodeURIComponent(slug)}`
  const className = `${ui.button({ variant: "primary", size })} w-full sm:w-auto`

  if (!user) {
    return (
      <Link
        href={entryHref("update_page", ALERTS_WELCOME)}
        onClick={() => trackEvent(MixpanelEvent.SIGNUP_CTA_CLICKED, { page: "tariff-update", entry: "update_page", section: "codes", label: LABEL, signed_in: false })}
        className={className}
      >
        {LABEL}
        <ArrowRightIcon className="h-4 w-4" aria-hidden />
      </Link>
    )
  }

  const check = async () => {
    setChecking(true)
    setFailed(false)
    try {
      const res = await fetch(`/api/tariff-updates/affected?slug=${encodeURIComponent(slug)}`)
      if (!res.ok) throw new Error(String(res.status))
      const found = (await res.json()) as Result
      const outcome = found.affected ? "affected" : found.imports ? "not_affected" : "no_imports"
      trackEvent(MixpanelEvent.TARIFF_UPDATE_AFFECTED_CHECKED, { slug, result: outcome, imports: found.imports, affected: found.affected })
      const hit = (found.lists ?? []).filter((l) => l.affected > 0)
      if (found.affected && hit.length <= 1) {
        router.push(hit[0] ? `${inDutyGuard}&list=${encodeURIComponent(hit[0].id)}` : inDutyGuard)
        return
      }
      setResult(found)
    } catch {
      trackEvent(MixpanelEvent.TARIFF_UPDATE_AFFECTED_CHECKED, { slug, result: "error" })
      setFailed(true)
    }
    setChecking(false)
  }

  return (
    <>
      <button type="button" onClick={check} disabled={checking} className={className}>
        {checking ? "Checking your imports…" : LABEL}
        <ArrowRightIcon className="h-4 w-4" aria-hidden />
      </button>
      {failed && (
        <p className="text-xs text-error">
          Couldn&apos;t check just now.{" "}
          <Link href={inDutyGuard} className="underline underline-offset-2">
            Open it in Duty Guard
          </Link>
        </p>
      )}
      <Modal isOpen={!!result} setIsOpen={(open) => !open && setResult(null)}>
        {result && (result.affected ? <AffectedLists result={result} inDutyGuard={inDutyGuard} /> : <NotAffected result={result} inDutyGuard={inDutyGuard} onClose={() => setResult(null)} />)}
      </Modal>
    </>
  )
}

const NotAffected = ({ result, inDutyGuard, onClose }: { result: Result; inDutyGuard: string; onClose: () => void }) => {
  const none = result.imports === 0
  return (
    <div className={`${THEME} hts-tracker ${trackerSans.className} flex w-[min(30rem,calc(100vw-2rem))] flex-col gap-5 bg-base-100 p-7`}>
      <span className={`flex h-11 w-11 items-center justify-center rounded-full ${none ? "bg-tt-soft text-base-content/70" : "bg-success/15 text-success"}`}>
        {none ? <PlusIcon className="h-6 w-6" aria-hidden /> : <CheckCircleIcon className="h-6 w-6" aria-hidden />}
      </span>
      <div className="flex flex-col gap-2">
        <h2 className={`${tt.display} m-0 text-xl font-semibold text-base-content`}>{none ? "Add your imports to check" : "Likely not affected"}</h2>
        {none ? (
          <p className="m-0 text-sm leading-relaxed text-base-content/70">
            Your Duty Guard has no imports yet. Add the HTS codes and countries of origin you or your clients import, and we&apos;ll check this
            update, and every new one, against them.
          </p>
        ) : (
          <>
            <p className="m-0 text-sm leading-relaxed text-base-content/70">
              None of your {plural(result.imports, "import")} match the HTS codes and countries this update names.
              {result.possible > 0 && ` ${plural(result.possible, "import")} ${result.possible === 1 ? "is" : "are"} from a country it names, but not under a code it lists.`}
            </p>
            <p className="m-0 text-xs text-base-content/60">
              Based on what the update names. Have your customs broker confirm before you rely on it.
            </p>
          </>
        )}
      </div>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {none ? (
          <button type="button" onClick={onClose} className={ui.button({ variant: "secondary" })}>
            Not now
          </button>
        ) : (
          <Link href={inDutyGuard} className={ui.button({ variant: "secondary" })}>
            Open in Duty Guard
          </Link>
        )}
        <Link href={ADD_IMPORTS} className={ui.button({ variant: "primary" })}>
          {none ? "Add imports" : "Add more imports"}
          <ArrowRightIcon className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </div>
  )
}

// It affects imports in several lists (a brokerage's clients): each list, opening Duty Guard on it
const AffectedLists = ({ result, inDutyGuard }: { result: Result; inDutyGuard: string }) => {
  const hit = result.lists.filter((l) => l.affected > 0)
  return (
    <div className={`${THEME} hts-tracker ${trackerSans.className} flex w-[min(32rem,calc(100vw-2rem))] flex-col gap-5 bg-base-100 p-7`}>
      <div className="flex flex-col gap-2">
        <span className={tt.eyebrow("error")}>{plural(result.affected, "import")} affected</span>
        <h2 className={`${tt.display} m-0 text-xl font-semibold text-base-content`}>This Update Affects {hit.length} of Your Lists</h2>
        <p className="m-0 text-sm leading-relaxed text-base-content/70">Open a list to see what it does to each import, with the rate before and after.</p>
      </div>
      <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
        {hit.map((l) => (
          <li key={l.id}>
            <Link
              href={`${inDutyGuard}&list=${encodeURIComponent(l.id)}`}
              className="flex items-center gap-3 rounded-xl border border-base-300 px-3.5 py-3 transition-colors hover:border-primary/50 hover:bg-primary/5"
            >
              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-base-content">{l.name}</span>
              <span className="shrink-0 text-xs font-semibold tabular-nums text-error">
                {l.affected} of {plural(l.imports, "import")}
              </span>
              <ArrowRightIcon className="h-4 w-4 shrink-0 text-base-content/50" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
      <p className="m-0 text-xs text-base-content/60">Based on what the update names and the duty engine. Have your customs broker confirm before you rely on it.</p>
    </div>
  )
}
