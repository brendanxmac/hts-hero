"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronDownIcon,
  ExclamationTriangleIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import { Country } from "../../constants/countries";
import { HtsElement } from "../../interfaces/hts";
import { formatCurrency } from "../../tariffs/tariff-calculations";
import { calculate } from "../../tariffs/engine-v2/calculate";
import { AllRules } from "../../tariffs/engine-v2/data";
import { confirmInputId } from "../../tariffs/engine-v2/data/confirmations";
import {
  getLatestVerifiedRevision,
  getVerifiedRevisions,
  isVerifiedDate,
} from "../../tariffs/engine-v2/revisions";
import { todayIsoDate } from "../../tariffs/engine-v2/dates";
import { Answers, DutyLine, Question } from "../../tariffs/engine-v2/types";
import { classNames } from "../../utilities/style";

interface Props {
  htsCode: string;
  tariffElement: HtsElement;
  country: Country;
  customsValue: number;
  units: number;
}

const TODAY = "today";

// "2026-04-08" -> "Apr 8, 2026"
const formatDate = (isoDate: string) =>
  new Date(`${isoDate}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const formatPct = (pct: number) =>
  `${Math.round(pct * 1000) / 1000}%`;

export const TariffResultsV2 = ({
  htsCode,
  tariffElement,
  country,
  customsValue,
  units,
}: Props) => {
  const [revisionName, setRevisionName] = useState<string>(
    () => getLatestVerifiedRevision().name
  );
  const [answers, setAnswers] = useState<Answers>({});
  const [claimedPreference, setClaimedPreference] = useState<string>("");
  const [showNotApplied, setShowNotApplied] = useState(false);

  // Answers and claims belong to one entry
  useEffect(() => {
    setAnswers({});
    setClaimedPreference("");
  }, [htsCode, country.code]);

  const asOf =
    revisionName === TODAY
      ? todayIsoDate()
      : getVerifiedRevisions().find((r) => r.name === revisionName).from;

  const result = useMemo(
    () =>
      calculate(AllRules, {
        htsCode,
        country: country.code,
        asOf,
        customsValue,
        quantity: units,
        baseRates: {
          general: tariffElement.general,
          special: tariffElement.special,
          other: tariffElement.other,
        },
        claimedPreference: claimedPreference || undefined,
        answers,
      }),
    [htsCode, country.code, asOf, customsValue, units, tariffElement, claimedPreference, answers]
  );

  const applied = result.lines.filter((l) => l.status === "applies");
  const notApplied = result.lines.filter((l) => l.status !== "applies");
  const totalCost = result.totalDuty + result.totalFees;
  const effectiveRate = customsValue > 0 ? (result.totalDuty / customsValue) * 100 : 0;

  const setAnswer = (id: string, value: unknown) =>
    setAnswers((prev) => {
      const next = { ...prev };
      if (value === undefined || value === "" || value === null) delete next[id];
      else next[id] = value;
      return next;
    });

  const confirmations = result.questions.filter((q) => q.input.id.startsWith("confirm:"));
  const namedQuestions = result.questions.filter((q) => !q.input.id.startsWith("confirm:"));
  const openConfirmations = confirmations.filter((q) => !q.answered).length;

  return (
    <div className="flex flex-col gap-4">
      {/* Engine controls */}
      <div className="card bg-base-100 border border-base-300 shadow-lg rounded-xl">
        <div className="px-3 sm:px-5 py-3 sm:py-4 bg-base-200/50 border-b border-base-300 rounded-t-xl flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base sm:text-lg font-bold text-base-content">
            Duty for {htsCode} from {country.flag} {country.name}
          </h3>
          <span className="badge badge-secondary badge-outline">New engine (beta)</span>
        </div>
        <div className="p-3 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-base-content/80">Tariffs as of</span>
            <select
              className="select select-bordered w-full"
              value={revisionName}
              onChange={(e) => setRevisionName(e.target.value)}
            >
              {getVerifiedRevisions()
                .slice()
                .reverse()
                .map((r) => (
                  <option key={r.name} value={r.name}>
                    {r.title} · {formatDate(r.from)} – {r.to ? formatDate(r.to) : "present"}
                  </option>
                ))}
              <option value={TODAY}>Today ({formatDate(todayIsoDate())})</option>
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-base-content/80">Trade preference claimed</span>
            <select
              className="select select-bordered w-full"
              value={claimedPreference}
              onChange={(e) => setClaimedPreference(e.target.value)}
              disabled={result.availablePreferences.length === 0}
            >
              <option value="">
                {result.availablePreferences.length === 0 ? "None available for this entry" : "None"}
              </option>
              {result.availablePreferences.map((p) => (
                <option key={p.symbol} value={p.symbol}>
                  {p.symbol} · {p.name}
                </option>
              ))}
            </select>
          </label>
          {!isVerifiedDate(asOf) && (
            <div className="md:col-span-2 alert alert-warning py-2">
              <ExclamationTriangleIcon className="w-5 h-5 shrink-0" />
              <span className="text-sm">
                Tariff data is verified through {getLatestVerifiedRevision().title}. Changes after{" "}
                {formatDate(getLatestVerifiedRevision().to ?? getLatestVerifiedRevision().from)} aren&apos;t
                entered yet, so this result may be missing tariffs.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryTile label="Total duty" value={formatCurrency(result.totalDuty)} emphasis />
        <SummaryTile label="Effective duty rate" value={formatPct(effectiveRate)} />
        <SummaryTile label="Fees (MPF + HMF)" value={formatCurrency(result.totalFees)} />
        <SummaryTile label="Landed cost" value={formatCurrency(customsValue + totalCost)} />
      </div>

      {result.warnings.length > 0 && (
        <div className="alert alert-warning">
          <ExclamationTriangleIcon className="w-5 h-5 shrink-0" />
          <ul className="text-sm list-disc pl-4">
            {result.warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Duty lines */}
      <div className="card bg-base-100 border border-base-300 shadow-lg rounded-xl">
        <div className="px-3 sm:px-5 py-3 sm:py-4 bg-base-200/50 border-b border-base-300 rounded-t-xl">
          <h3 className="text-base sm:text-lg font-bold text-base-content">Duties that apply</h3>
          <p className="text-sm text-base-content/60">
            Each line shows the value it applies to, its rate, and why it applies.
          </p>
        </div>
        <div className="divide-y divide-base-300">
          <DutyRow line={result.base} />
          {applied.map((line) => (
            <DutyRow key={line.code} line={line} />
          ))}
          {result.fees.map((fee) => (
            <div key={fee.id} className="px-3 sm:px-5 py-3 flex justify-between gap-3 text-sm">
              <span className="text-base-content/70">
                {fee.name} ({formatPct(fee.ratePct)}){fee.note && ` · ${fee.note}`}
              </span>
              <span className="font-semibold tabular-nums">{formatCurrency(fee.amount)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Questions */}
      {result.questions.length > 0 && (
        <div className="card bg-base-100 border border-base-300 shadow-lg rounded-xl">
          <div className="px-3 sm:px-5 py-3 sm:py-4 bg-base-200/50 border-b border-base-300 rounded-t-xl">
            <h3 className="text-base sm:text-lg font-bold text-base-content flex items-center gap-2">
              <QuestionMarkCircleIcon className="w-5 h-5" />
              Questions that can change this result
            </h3>
            <p className="text-sm text-base-content/60">
              Unanswered questions count as &quot;no&quot;, so exemptions don&apos;t apply until you
              confirm them.
            </p>
          </div>
          <div className="p-3 sm:p-5 flex flex-col gap-4">
            {namedQuestions.map((q) => (
              <QuestionField
                key={q.input.id}
                question={q}
                value={answers[q.input.id]}
                onChange={(v) => setAnswer(q.input.id, v)}
              />
            ))}
            {confirmations.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-base-content/80">
                  Confirm any headings that apply to your goods
                  {openConfirmations > 0 && (
                    <span className="font-normal text-base-content/60">
                      {" "}
                      ({openConfirmations} unconfirmed)
                    </span>
                  )}
                </span>
                {confirmations.map((q) => {
                  const code = q.input.id.replace("confirm:", "");
                  const line = result.lines.find((l) => l.code === code);
                  return (
                    <label
                      key={q.input.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-base-200/50 hover:bg-base-200 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary checkbox-sm mt-0.5"
                        checked={answers[confirmInputId(code)] === true}
                        onChange={(e) => setAnswer(q.input.id, e.target.checked || undefined)}
                      />
                      <span className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-sm font-medium">
                          <span className="font-mono text-primary">{code}</span> {line?.name}
                        </span>
                        {q.input.help && (
                          <span className="text-xs text-base-content/60 line-clamp-2">{q.input.help}</span>
                        )}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Not applied */}
      {notApplied.length > 0 && (
        <div className="card bg-base-100 border border-base-300 shadow-lg rounded-xl">
          <button
            type="button"
            className="px-3 sm:px-5 py-3 sm:py-4 flex items-center justify-between gap-2 text-left"
            onClick={() => setShowNotApplied((v) => !v)}
          >
            <span>
              <span className="text-base sm:text-lg font-bold text-base-content">
                Considered but not applied ({notApplied.length})
              </span>
              <span className="block text-sm text-base-content/60">
                Headings that match this code and country but were excluded, need an answer, or
                have conditions that aren&apos;t met.
              </span>
            </span>
            <ChevronDownIcon
              className={classNames("w-5 h-5 shrink-0 transition-transform", showNotApplied ? "rotate-180" : "")}
            />
          </button>
          {showNotApplied && (
            <div className="divide-y divide-base-300 border-t border-base-300">
              {notApplied.map((line) => (
                <DutyRow key={line.code} line={line} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const SummaryTile = ({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) => (
  <div
    className={classNames(
      "rounded-xl border p-3 sm:p-4 flex flex-col gap-1",
      emphasis ? "border-primary/40 bg-primary/5" : "border-base-300 bg-base-100"
    )}
  >
    <span className="text-xs font-semibold uppercase tracking-wide text-base-content/60">{label}</span>
    <span
      className={classNames(
        "text-xl sm:text-2xl font-black tabular-nums",
        emphasis ? "text-primary" : "text-base-content"
      )}
    >
      {value}
    </span>
  </div>
);

const STATUS_LABELS: Record<DutyLine["status"], { label: string; className: string }> = {
  applies: { label: "Applies", className: "badge-success" },
  excluded: { label: "Excluded", className: "badge-ghost" },
  notApplicable: { label: "Not applicable", className: "badge-ghost" },
  needsAnswer: { label: "Needs an answer", className: "badge-warning" },
};

const DutyRow = ({ line }: { line: DutyLine }) => {
  const status = STATUS_LABELS[line.status];
  const isApplied = line.status === "applies";
  return (
    <div className="px-3 sm:px-5 py-3 flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4">
      <div className="flex flex-col gap-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          {line.code !== "BASE" && <span className="font-mono text-sm font-bold text-primary">{line.code}</span>}
          <span className="text-sm font-medium text-base-content">{line.name}</span>
          {line.code !== "BASE" && (
            <span className={classNames("badge badge-sm", status.className)}>{status.label}</span>
          )}
        </div>
        {line.reasons.length > 0 && (
          <span className="text-xs text-base-content/60">{line.reasons.join(" · ")}</span>
        )}
      </div>
      {isApplied && (
        <div className="flex sm:flex-col items-baseline sm:items-end gap-2 sm:gap-0 shrink-0 text-sm">
          <span className="font-semibold tabular-nums">{formatCurrency(line.amount)}</span>
          <span className="text-xs text-base-content/60 tabular-nums">
            {line.ratePct !== undefined && `${formatPct(line.ratePct)} of `}
            {formatCurrency(line.basisValue)}
          </span>
        </div>
      )}
    </div>
  );
};

const QuestionField = ({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: unknown;
  onChange: (value: unknown) => void;
}) => {
  const { input } = question;
  const hint = (
    <span className="text-xs text-base-content/60">
      Affects {question.headings.join(", ")}
      {input.help && ` · ${input.help}`}
    </span>
  );

  if (input.type === "boolean") {
    return (
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          className="checkbox checkbox-primary checkbox-sm mt-0.5"
          checked={value === true}
          onChange={(e) => onChange(e.target.checked || undefined)}
        />
        <span className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">{input.label}</span>
          {hint}
        </span>
      </label>
    );
  }

  return (
    <label className="flex flex-col gap-1.5 max-w-md">
      <span className="text-sm font-medium">{input.label}</span>
      <input
        type={input.type === "date" ? "date" : "number"}
        className="input input-bordered w-full"
        value={(value as string | number) ?? ""}
        min={input.type === "percent" ? 0 : undefined}
        max={input.type === "percent" ? 100 : undefined}
        onChange={(e) =>
          onChange(
            input.type === "date" || e.target.value === "" ? e.target.value : Number(e.target.value)
          )
        }
      />
      {hint}
    </label>
  );
};
