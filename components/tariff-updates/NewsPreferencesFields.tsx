"use client"

import { useMemo, useState } from "react"
import { XMarkIcon } from "@heroicons/react/20/solid"
import { Countries } from "@/constants/countries"
import * as ui from "@/components/ui/styles"
import * as tt from "@/components/ui/styles/tracker"
import { AUTHORITIES } from "@/libs/tariff-updates/types"

// What a subscriber gets: how often, how much of each action, and which laws and countries (none
// picked means all). Shared by the subscribe form, the manage page and the Tracker's Alerts.

export interface NewsPreferencesValue {
  frequency: "instant" | "weekly" | "off"
  scope: "actions" | "all_steps"
  authorities: string[]
  countries: string[]
}

export const DEFAULT_NEWS_PREFERENCES: NewsPreferencesValue = { frequency: "weekly", scope: "actions", authorities: [], countries: [] }

const LAWS = (Object.keys(AUTHORITIES) as (keyof typeof AUTHORITIES)[]).filter((a) => a !== "other")

const Choice = <T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string; hint: string }[]
  value: T
  onChange: (v: T) => void
  label: string
}) => (
  <fieldset className="flex flex-col gap-2">
    <legend className={`${tt.eyebrow()} mb-2`}>{label}</legend>
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((o) => (
        <label
          key={o.value}
          className={`flex cursor-pointer flex-col gap-0.5 rounded-2xl border px-4 py-3 transition-colors ${
            value === o.value ? "border-primary bg-primary/5" : "border-base-300 hover:bg-tt-soft"
          }`}
        >
          <span className="flex items-center gap-2 text-sm font-semibold text-base-content">
            <input type="radio" className="radio radio-primary radio-xs" checked={value === o.value} onChange={() => onChange(o.value)} />
            {o.label}
          </span>
          <span className="pl-6 text-xs text-base-content/60">{o.hint}</span>
        </label>
      ))}
    </div>
  </fieldset>
)

export function NewsPreferencesFields({
  value,
  onChange,
  allowOff = false,
}: {
  value: NewsPreferencesValue
  onChange: (v: NewsPreferencesValue) => void
  allowOff?: boolean
}) {
  const [countryPick, setCountryPick] = useState("")
  const countries = useMemo(() => [...Countries].sort((a, b) => a.name.localeCompare(b.name)), [])
  const set = (patch: Partial<NewsPreferencesValue>) => onChange({ ...value, ...patch })
  const toggleLaw = (law: string) =>
    set({ authorities: value.authorities.includes(law) ? value.authorities.filter((a) => a !== law) : [...value.authorities, law] })

  return (
    <div className="flex flex-col gap-5">
      <Choice
        label="How often"
        value={value.frequency}
        onChange={(frequency) => set({ frequency })}
        options={[
          { value: "weekly", label: "Weekly digest", hint: "One email every Monday with the week's actions" },
          { value: "instant", label: "As it happens", hint: "An email for each new action, the day it's out" },
          ...(allowOff ? [{ value: "off" as const, label: "Off", hint: "No tariff news emails" }] : []),
        ]}
      />
      {value.frequency !== "off" && (
        <>
          <Choice
            label="How much"
            value={value.scope}
            onChange={(scope) => set({ scope })}
            options={[
              { value: "actions", label: "New actions", hint: "When an action is announced, and when it becomes law" },
              { value: "all_steps", label: "Every step", hint: "Also each Federal Register filing, CBP guidance and HTS revision" },
            ]}
          />
          <fieldset className="flex flex-col gap-2">
            <legend className={`${tt.eyebrow()} mb-2`}>Laws {value.authorities.length ? "" : "(all)"}</legend>
            <div className="flex flex-wrap gap-2">
              {LAWS.map((law) => {
                const on = value.authorities.includes(law)
                return (
                  <button
                    key={law}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleLaw(law)}
                    className={`${ui.button({ variant: on ? "primary" : "secondary", size: "sm" })} ${on ? "" : "font-medium"}`}
                  >
                    {AUTHORITIES[law]}
                  </button>
                )
              })}
            </div>
          </fieldset>
          <fieldset className="flex flex-col gap-2">
            <legend className={`${tt.eyebrow()} mb-2`}>Countries {value.countries.length ? "" : "(all)"}</legend>
            <div className="flex flex-wrap items-center gap-2">
              {value.countries.map((code) => {
                const c = countries.find((x) => x.code === code)
                return (
                  <span key={code} className={`${tt.chip("primary")} gap-1`}>
                    {c ? `${c.flag} ${c.name}` : code}
                    <button type="button" aria-label={`Remove ${c?.name ?? code}`} onClick={() => set({ countries: value.countries.filter((x) => x !== code) })}>
                      <XMarkIcon className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  </span>
                )
              })}
              <select
                aria-label="Add a country"
                value={countryPick}
                onChange={(e) => {
                  const code = e.target.value
                  setCountryPick("")
                  if (code && !value.countries.includes(code)) set({ countries: [...value.countries, code] })
                }}
                className="h-8 rounded-full border border-base-300 bg-base-100 px-3 text-xs text-base-content focus:border-primary focus:outline-none"
              >
                <option value="">Add a country…</option>
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-base-content/60">Actions that apply to every country always come through.</p>
          </fieldset>
        </>
      )}
    </div>
  )
}
