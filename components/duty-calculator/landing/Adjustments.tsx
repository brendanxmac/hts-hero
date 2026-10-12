"use client";

import { ReactNode, useRef, useState } from "react";
import { mono } from "@/components/ui/font";
import * as tt from "@/components/ui/styles/tracker";
import { CalculationResult, DutyLine, Question } from "@/tariffs/engine-v2/types";
import { formatMoney } from "../lib/format";
import { sortBySpecificity } from "../lib/questions";
import { TariffFinder } from "../lib/useTariffFinder";
import { LegalPanel } from "../results/LegalPanel";
import { whatClaimingDoes, whatItWouldDo } from "../lib/explain";

// The Possible Adjustments tab's list: the trade preferences, then every provision the engine
// asks about, each a checkbox with what it changes. The list holds still while answering: every
// provision always shows (those of the import before any answer, plus any an answer brings up),
// in one fixed order, and each row keeps its shape, with the amount in a fixed column on the right.

const Amount = ({ amount, checked }: { amount?: number; checked: boolean }) => {
  // Always two lines, so a row keeps its height whatever it says
  if (amount === undefined || Math.abs(amount) < 0.005)
    return (
      <span className="flex flex-col items-end leading-tight">
        <span className="text-[0.7rem] text-base-content/40">{checked ? "Applied" : "Would make"}</span>
        <span className="text-sm text-base-content/40">No change</span>
      </span>
    );
  const lower = amount < 0;
  return (
    <span className="flex flex-col items-end leading-tight">
      <span className="text-[0.7rem] text-base-content/50">{checked ? "Applied" : lower ? "Could save" : "Would add"}</span>
      <span className={`text-sm font-semibold tabular-nums ${lower ? "text-success" : "text-error"}`}>
        {lower ? "−" : "+"}
        {formatMoney(Math.abs(amount))}
      </span>
    </span>
  );
};

const Row = ({
  checked,
  onChange,
  code,
  label,
  amount,
  note,
  help,
  legal,
  muted = false,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  code?: string;
  label: ReactNode;
  amount?: number;
  // What checking it would do, in plain English
  note?: string;
  help?: string;
  legal?: ReactNode;
  // Doesn't apply with the other answers as they stand
  muted?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <li className={`border-t border-base-300 first:border-0 ${checked ? "bg-primary/[0.04]" : ""}`}>
      <div className="grid grid-cols-[1.25rem_minmax(0,1fr)_8rem] items-start gap-4 px-4 py-3.5">
        <input type="checkbox" className="mt-0.5 h-4 w-4 cursor-pointer accent-primary" checked={checked} onChange={(e) => onChange(e.target.checked)} aria-label={typeof label === "string" ? label : code} />
        <div className="flex min-w-0 flex-col gap-1">
          <button type="button" className={`text-left text-sm leading-snug ${muted ? "text-base-content/50" : "text-base-content"}`} onClick={() => onChange(!checked)}>
            {code && <span className={`${mono.className} mr-2 text-xs font-semibold text-primary`}>{code}</span>}
            {label}
          </button>
          {note && <span className="text-xs leading-snug text-base-content/60">{note}</span>}
          {help && (
            <button type="button" className="self-start text-xs font-medium text-base-content/50 hover:text-base-content" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
              {open ? "Hide legal text" : "Legal text"}
            </button>
          )}
        </div>
        <div className="flex justify-end pt-0.5 text-right">
          <Amount amount={amount} checked={checked} />
        </div>
      </div>
      {open && legal && <div className="px-4 pb-4 pl-12">{legal}</div>}
    </li>
  );
};

const Section = ({ title, description, children }: { title: string; description: string; children: ReactNode }) => (
  <section className="flex flex-col gap-2">
    <div className="flex items-baseline justify-between gap-3 px-1">
      <h3 className={`${tt.display} m-0 text-sm font-semibold text-base-content`}>{title}</h3>
      <span className="text-xs text-base-content/50">{description}</span>
    </div>
    <ul className="m-0 list-none overflow-hidden rounded-2xl border border-base-300 p-0">{children}</ul>
  </section>
);

export const Adjustments = ({ f, result }: { f: TariffFinder; result: CalculationResult }) => {
  const country = f.country;
  // What each row last said it would change, so a checked row keeps showing its amount (the
  // engine only says what each unchecked one would do)
  const remembered = useRef<Record<string, number>>({});
  if (!country) return null;

  // Every provision: the import's before any answer, then any an answer brought up, in one order
  const base = f.unadjustedResult?.questions ?? [];
  const byId = new Map<string, Question>();
  [...base, ...result.questions].forEach((q) => byId.set(q.input.id, result.questions.find((r) => r.input.id === q.input.id) ?? q));
  const questions = sortBySpecificity(Array.from(byId.values()), result.asOf);
  const current = new Set(result.questions.map((q) => q.input.id));
  const lineFor = (q: Question): DutyLine | undefined =>
    [...result.lines, ...(f.unadjustedResult?.lines ?? [])].find((l) => `confirm:${l.code}` === q.input.id);

  const prefs = f.unadjustedResult?.availablePreferences.length ? f.unadjustedResult.availablePreferences : result.availablePreferences;
  const claimed = f.preferences[country.code] ?? "";

  const amountOf = (key: string, live: number | undefined) => {
    if (live !== undefined && Math.abs(live) >= 0.005) remembered.current[key] = live;
    return live ?? remembered.current[key];
  };

  return (
    <div className="flex flex-col gap-6">
      {prefs.length > 0 && (
        <Section title="Trade programs" description="Free trade agreements and preference programs your goods may qualify for">
          {prefs.map((p) => {
            const on = claimed === p.symbol;
            // The claimed one has no live amount: it shows what claiming it did
            const live = on ? undefined : f.preferenceChanges[p.symbol];
            return (
              <Row
                key={p.symbol}
                checked={on}
                onChange={(checked) => f.setPreference(country.code, checked ? p.symbol : "")}
                code={p.symbol}
                label={p.name}
                note={whatClaimingDoes(p.name)}
                amount={on ? remembered.current[`pref:${p.symbol}`] : amountOf(`pref:${p.symbol}`, live)}
              />
            );
          })}
        </Section>
      )}
      {questions.length > 0 && (
        <Section title="Tariff provisions" description="Exemptions and conditions that may apply to your goods">
          {questions.map((q) => {
            const id = q.input.id;
            const heading = lineFor(q);
            if (q.input.type !== "boolean") {
              return (
                <li key={id} className="border-t border-base-300 px-4 py-3.5 first:border-0">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-sm text-base-content">{q.input.label}</span>
                    <input
                      type={q.input.type === "date" ? "date" : "number"}
                      className="h-9 max-w-xs rounded-xl border border-base-300 bg-base-100 px-3 text-sm text-base-content outline-none focus:border-primary"
                      value={(f.answers[id] as string | number) ?? ""}
                      onChange={(e) => f.answer(id, q.input.type === "date" || e.target.value === "" ? e.target.value || undefined : Number(e.target.value))}
                    />
                    {q.input.help && <span className="text-xs text-base-content/60">{q.input.help}</span>}
                  </label>
                </li>
              );
            }
            const checked = f.answers[id] === true;
            return (
              <Row
                key={id}
                checked={checked}
                onChange={(on) => f.answer(id, on || undefined)}
                code={heading?.code}
                label={heading ? heading.name : q.input.label}
                amount={current.has(id) ? amountOf(id, f.impacts[id]) : undefined}
                muted={!current.has(id)}
                note={whatItWouldDo(q, result, f.unadjustedResult)}
                help={q.input.help}
                legal={q.input.help ? <LegalPanel text={q.input.help} citations={q.input.citations} notesFor={{ asOf: result.asOf, htsCode: result.htsCode }} /> : undefined}
              />
            );
          })}
        </Section>
      )}
    </div>
  );
};
