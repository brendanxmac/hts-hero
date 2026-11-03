"use client";

import { ArrowRightIcon, ReceiptPercentIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { formatDate } from "../../../duty-calculator/lib/format";
import { formatRate } from "../../formatRate";
import { SavingKind } from "../../insights/savings";
import { ReviewState } from "../../opportunities/review";
import { TrackedProduct } from "../../report";
import { rateWith } from "./SavingCard";
import { ReviewStart } from "./SavingsReview";
import { itemName, KIND_ORDER, ListItem, undecided } from "./useSavingsItems";

// The top of the Savings tab once the review is under way or done: where it stands and what it
// found (the rate today against the rate with what's being pursued, and how the answers fell), the
// way back in, then everything the review checked, by group, with each one's answer. A row opens
// the review at that question. Savings are only ever potential; rates in %.

const GROUP_LABELS: Record<SavingKind, string> = {
  program: "Trade Programs",
  exemption: "Exemptions",
  origin: "Other Countries",
};

const kindOf = (i: ListItem) => i.option?.kind ?? i.opportunity!.kind;
const status = (i: ListItem) => i.opportunity?.status;
export const pursued = (i: ListItem) =>
  status(i) === "researching" || status(i) === "in_progress";

const ANSWER: Record<
  string,
  { label: string; tone: Parameters<typeof tt.chip>[0] }
> = {
  researching: { label: "Pursuing", tone: "primary" },
  in_progress: { label: "In progress", tone: "primary" },
  secured: { label: "Secured", tone: "success" },
  not_eligible: { label: "Ruled out", tone: "neutral" },
  open: { label: "Not answered", tone: "warning" },
};

const countWords = (n: number, one: string, many: string) =>
  `${n} ${n === 1 ? one : many}`;

// "3 trade programs, 5 exemptions and 2 other countries"
const coverage = (items: ListItem[]) => {
  const words: Record<SavingKind, [string, string]> = {
    program: ["trade program", "trade programs"],
    exemption: ["exemption", "exemptions"],
    origin: ["other country", "other countries"],
  };
  const parts = KIND_ORDER.map(
    (k) => [items.filter((i) => kindOf(i) === k).length, k] as const,
  )
    .filter(([n]) => n > 0)
    .map(([n, k]) => countWords(n, ...words[k]));
  return parts.length > 1
    ? `${parts.slice(0, -1).join(", ")} and ${parts.at(-1)}`
    : (parts[0] ?? "");
};

// The rate today, and with what's being pursued (or secured), as two bars
const RateBars = ({ today, best }: { today: number; best: number }) => {
  const width = (r: number) =>
    `${today > 0 ? Math.max(2, (r / today) * 100) : 0}%`;
  const saving = today - best > 0.005;
  return (
    <dl className="m-0 flex flex-col gap-4">
      {[
        {
          label: "Duty rate today",
          rate: today,
          bar: "bg-base-content/25",
          tone: "",
        },
        {
          label: saving ? "If you qualify" : "With your answers",
          rate: best,
          bar: saving ? "bg-success" : "bg-base-content/25",
          tone: saving ? "!text-success" : "",
        },
      ].map((r) => (
        <div key={r.label} className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-sm text-base-content/65">{r.label}</dt>
            <dd className={`m-0 ${tt.metricSm} ${r.tone}`}>
              {formatRate(r.rate)}
            </dd>
          </div>
          <span
            className="h-2 overflow-hidden rounded-full bg-base-300/60"
            aria-hidden
          >
            <span
              className={`block h-full rounded-full ${r.bar}`}
              style={{ width: width(r.rate) }}
            />
          </span>
        </div>
      ))}
    </dl>
  );
};

export const ReviewOverview = ({
  product,
  state,
  items,
  onOpen,
}: {
  product: TrackedProduct;
  state: ReviewState;
  items: ListItem[];
  onOpen: (open: ReviewStart) => void;
}) => {
  const done = state === "reviewed";
  const reviewable = items.filter((i) => i.option);
  const left = reviewable.filter(undecided);
  const pursuing = items.filter(pursued);
  const secured = items.filter((i) => status(i) === "secured");
  const ruledOut = items.filter((i) => status(i) === "not_eligible");
  const best = Math.max(0, ...pursuing.map((i) => rateWith(product, i).off));
  const saving = best > 0.005;
  const firstKind = KIND_ORDER.find((k) =>
    reviewable.some((i) => i.option!.kind === k),
  );
  const lastAnswer = items
    .map((i) => i.opportunity?.updatedAt)
    .filter(Boolean)
    .sort()
    .at(-1);

  const headline = saving ? (
    <>
      You could take up to{" "}
      <span className="text-success">−{formatRate(best)}</span> off the duty
      rate
    </>
  ) : secured.length ? (
    "Your savings on this import are secured"
  ) : done ? (
    "Nothing to pursue on this import right now"
  ) : (
    `${reviewable.length - left.length} of ${reviewable.length} answered so far`
  );

  const lead = saving
    ? `${countWords(pursuing.length, "saving", "savings")} to pursue, if your goods qualify. Each one below has its next step. Confirm it with your supplier or broker before you claim it.`
    : secured.length
      ? "What you've secured is applied to this import. We'll keep checking as tariffs change and tell you if another way to save opens up."
      : done
        ? `You checked ${coverage(reviewable)}, and none fit your goods today. We'll keep checking as tariffs change and tell you if a new way to save opens up.`
        : `Answer the rest to see everything you could save on this import: ${coverage(left)} still to go.`;

  const counts = [
    { label: "Checked", value: reviewable.length - left.length },
    { label: "Pursuing", value: pursuing.length + secured.length },
    { label: "Ruled out", value: ruledOut.length },
    ...(left.length ? [{ label: "Not answered", value: left.length }] : []),
  ];

  return (
    <section
      className={`${tt.panel} grid overflow-hidden lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]`}
      aria-labelledby="tt-savings-overview"
    >
      <div className="flex flex-col gap-4 p-6 lg:p-8">
        <span className="flex flex-wrap items-center gap-2">
          <span className={tt.eyebrow("success")}>Savings Review</span>
          <span className={tt.chip(done ? "success" : "warning")}>
            {done ? "Complete" : "In progress"}
          </span>
          {done && lastAnswer && (
            <span className="text-xs text-base-content/55">
              Last answered {formatDate(lastAnswer.slice(0, 10))}
            </span>
          )}
        </span>
        <h2
          id="tt-savings-overview"
          className={`${tt.display} m-0 text-[1.75rem] font-semibold leading-tight tracking-tight text-base-content`}
        >
          {headline}
        </h2>
        <p className={`${tt.subtitle} m-0 max-w-xl`}>{lead}</p>
        <div className="mt-auto flex flex-wrap items-center gap-3 pt-2">
          {done ? (
            <>
              <button
                type="button"
                className={ui.button({ variant: "primary", size: "sm" })}
                onClick={() => onOpen({ step: "summary" })}
              >
                See Summary
              </button>
              {firstKind && (
                <button
                  type="button"
                  className={ui.button({ variant: "secondary", size: "sm" })}
                  onClick={() => onOpen({ step: firstKind, at: 0 })}
                >
                  Change Answers
                </button>
              )}
            </>
          ) : (
            <>
              <button
                type="button"
                className={ui.button({ variant: "primary", size: "sm" })}
                onClick={() =>
                  onOpen(
                    left[0]
                      ? { step: left[0].option!.kind, id: left[0].id }
                      : { step: "summary" },
                  )
                }
              >
                Continue Savings Review
                <ArrowRightIcon className="h-4 w-4" aria-hidden />
              </button>
              <button
                type="button"
                className={ui.button({ variant: "ghost", size: "sm" })}
                onClick={() => onOpen({ step: "summary" })}
              >
                Summary So Far
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col justify-center gap-6 border-t border-base-300 bg-tt-soft/50 p-6 lg:border-l lg:border-t-0 lg:p-8">
        <RateBars today={product.totalPct} best={product.totalPct - best} />
        <dl className="m-0 grid grid-cols-[repeat(auto-fit,minmax(5rem,1fr))] gap-3 border-t border-base-300 pt-5">
          {counts.map((c) => (
            <div key={c.label} className="flex flex-col gap-0.5">
              <dt className="text-xs text-base-content/60">{c.label}</dt>
              <dd className={`m-0 ${tt.metricSm}`}>{c.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
};

// Everything the review checked, by group, with each one's answer
export const WhatWeChecked = ({
  product,
  items,
  onOpen,
}: {
  product: TrackedProduct;
  items: ListItem[];
  onOpen: (open: ReviewStart) => void;
}) => {
  const groups = KIND_ORDER.map((kind) => ({
    kind,
    rows: items.filter((i) => kindOf(i) === kind),
  })).filter((g) => g.rows.length);
  const answerOf = (i: ListItem) =>
    ANSWER[undecided(i) ? "open" : (status(i) ?? "open")] ?? ANSWER.open;

  return (
    <section className="flex flex-col gap-3" aria-labelledby="tt-checked">
      <h2 id="tt-checked" className={`${tt.sectionTitle} px-1`}>
        What We Checked
      </h2>
      <div className={`${tt.panel} flex flex-col divide-y divide-base-300`}>
        {groups.map((g) => {
          const fit = g.rows.filter(
            (i) => pursued(i) || status(i) === "secured",
          ).length;
          return (
            <div key={g.kind} className="flex flex-col">
              <div className="flex items-center justify-between gap-3 bg-tt-soft/40 px-5 py-2.5">
                <h3 className={`${tt.eyebrow()} m-0`}>
                  {GROUP_LABELS[g.kind]}
                </h3>
                <span className="text-xs text-base-content/55">
                  {g.rows.length} checked{fit ? ` · ${fit} could fit` : ""}
                </span>
              </div>
              <ul className="m-0 flex list-none flex-col divide-y divide-base-300/70 p-0">
                {g.rows.map((i) => {
                  const { after, off } = rateWith(product, i);
                  const answer = answerOf(i);
                  const note =
                    status(i) === "not_eligible" ? i.opportunity?.note : null;
                  const row = (
                    <>
                      <span className="flex min-w-0 items-center gap-3">
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${i.option?.kind === "origin" ? "bg-tt-soft text-base" : "bg-success/10 text-success"}`}
                          aria-hidden
                        >
                          {i.option?.kind === "origin" ? (
                            i.option.setup.country.flag
                          ) : (
                            <ReceiptPercentIcon className="h-4 w-4" />
                          )}
                        </span>
                        <span className="flex min-w-0 flex-col">
                          <span className="truncate text-sm font-medium text-base-content">
                            {itemName(i)}
                          </span>
                          {note && (
                            <span className="truncate text-xs text-base-content/55">
                              {note}
                            </span>
                          )}
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-4">
                        {off > 0.005 && (
                          <span className="hidden text-sm tabular-nums text-base-content/60 sm:inline">
                            {formatRate(after)}{" "}
                            <span className="text-success">
                              −{formatRate(off)}
                            </span>
                          </span>
                        )}
                        <span
                          className={`${tt.chip(answer.tone)} w-24 justify-center`}
                        >
                          {answer.label}
                        </span>
                      </span>
                    </>
                  );
                  return (
                    <li key={i.id}>
                      {i.option ? (
                        <button
                          type="button"
                          className="flex w-full items-center justify-between gap-4 px-5 py-3 text-left transition-colors hover:bg-tt-soft/60 focus-visible:bg-tt-soft/60 focus-visible:outline-hidden"
                          onClick={() =>
                            onOpen({ step: i.option!.kind, id: i.id })
                          }
                          aria-label={`${itemName(i)}: ${answer.label}. Open in the review`}
                        >
                          {row}
                        </button>
                      ) : (
                        <div className="flex items-center justify-between gap-4 px-5 py-3">
                          {row}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
};
