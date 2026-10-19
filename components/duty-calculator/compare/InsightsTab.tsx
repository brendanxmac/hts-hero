"use client";

import { ReactNode, useMemo } from "react";
import { barWidth, Sparkline, time } from "@/components/ui/charts/kit";
import { CardRow, useCardClass } from "@/components/ui/Card";
import * as ui from "@/components/ui/styles";
import { PRIMARY_MARK } from "@/components/ui/theme";
import { analysisFacts, rateKey, rateOf, rateTiers } from "@/components/tariff-tracker/product/analysis/analysis";
import { volatility } from "@/components/tariff-tracker/product/analysis/history";
import { formatRate } from "@/components/tariff-tracker/formatRate";
import { shortDate } from "../rate-history/format";
import { todayIso } from "../lib/format";
import { formatImportValue } from "../lib/usImports";
import { basisFor, CompareOption, optionsFor, optionsOf, ProgramMode, shortAgreement } from "./options";
import { Origins } from "./useOrigins";

// Compare's insights, as a report read top to bottom: nothing to open. The verdict first, with
// the three numbers behind it, then two sections. Where you stand (your rank on the field's
// range, how the rates group, your own rate over time), cheaper options (the cheapest, the biggest
// and the fastest-growing cheaper suppliers, how much of US imports already comes from cheaper
// countries, what trade agreements could cut), each as a panel with its answer and a short list or a
// small chart; then the Tariff Time Lapse, with every change. Read-only: the lists name countries, nothing to select. The
// control bar applies: the rates are those on its date, and trade
// programs count unless it says without them. Savings are always potential ("could", "up to").

const TOP = 5;

// One of a group's three columns: a card on its own, a column of the Compare box here
const Panel = ({ title, answer, tone, children, className = "" }: { title: string; answer?: ReactNode; tone?: "success" | "error"; children: ReactNode; className?: string }) => {
  const cardClass = useCardClass();
  return (
  <section className={`${cardClass} flex flex-col gap-3 p-5 sm:p-6 ${className}`} aria-label={title}>
    <div>
      <h5 className={ui.label}>{title}</h5>
      {answer && <p className={`${ui.metric.secondary} m-0 mt-1.5 ${tone === "success" ? "text-success" : tone === "error" ? "text-error" : ""}`}>{answer}</p>}
    </div>
    {children}
  </section>
  );
};

// A country in a list: its flag and name (and agreement), then the figures
const Row = ({ option, children }: { option: CompareOption; children: ReactNode }) => (
  <li className="flex w-full items-center gap-2.5 px-2 py-1.5 text-sm">
    <span aria-hidden>{option.origin.country.flag}</span>
    <span className="min-w-0 flex-1 truncate">
      <span className="font-medium text-base-content">{option.origin.country.name}</span>
      {option.agreement && <span className="ml-1.5 text-xs text-success">with {shortAgreement(option.agreement.name)}</span>}
    </span>
    {children}
  </li>
);

const List = ({ children, empty }: { children: ReactNode[]; empty: string }) =>
  children.length ? <ul className="-mx-2 m-0 flex list-none flex-col p-0">{children}</ul> : <p className="m-0 text-sm text-base-content/60">{empty}</p>;

export const InsightsTab = ({
  origins,
  mode,
}: {
  origins: Origins;
  mode: ProgramMode;
}) => {
  const { rates, imports, histories, range, progress } = origins;
  const basis = basisFor(mode);
  const facts = useMemo(() => analysisFacts(rates, basis), [rates, basis]);
  const tiers = useMemo(() => rateTiers(rates, basis), [rates, basis]);
  const options = useMemo(() => rates.flatMap((r) => optionsFor(r, mode)), [rates, mode]);
  const today = time(todayIso());
  const working = `Working out every rate's history… ${Math.round(progress * 100)}%`;

  const yours = facts.origin;
  // Yours on the same footing: its standard rate, unless the choice is "with"
  const yourPct = yours ? rateOf(yours, basis) : 0;
  const value = (code: string) => imports?.byCountry.get(code)?.value ?? 0;
  // How much lower an option's rate is than yours: a rate, true at any shipment value
  const saving = (o: CompareOption) => yourPct - o.pct;

  // Each cheaper country at its best option (its agreement, when that's lower)
  const best = new Map<string, CompareOption>();
  options
    .filter((o) => !(o.origin.isOrigin && !o.agreement) && rateKey(o.pct) < rateKey(yourPct))
    .forEach((o) => {
      const was = best.get(o.origin.country.code);
      if (!was || o.pct < was.pct) best.set(o.origin.country.code, o);
    });
  const cheaper = Array.from(best.values());
  const byRate = [...cheaper].sort((a, b) => a.pct - b.pct || value(b.origin.country.code) - value(a.origin.country.code));
  const suppliers = cheaper.filter((o) => value(o.origin.country.code) > 0).sort((a, b) => value(b.origin.country.code) - value(a.origin.country.code));
  const growth = (o: CompareOption) => {
    const row = imports?.byCountry.get(o.origin.country.code);
    return row && row.prior > 0 ? (row.value - row.prior) / row.prior : null;
  };
  // Growing fastest among the cheaper suppliers big enough to matter (at least 1% of US imports)
  const growing = suppliers
    .filter((o) => growth(o) !== null && imports && value(o.origin.country.code) >= imports.totalValue * 0.01)
    .sort((a, b) => (growth(b) ?? 0) - (growth(a) ?? 0));
  const cheaperValue = suppliers.reduce((sum, o) => sum + value(o.origin.country.code), 0);
  const yoursValue = yours ? value(yours.country.code) : 0;
  const total = imports?.totalValue ?? 0;
  const cheaperShare = total > 0 ? cheaperValue / total : null;
  // Every agreement option, whatever the choice: this panel is about them
  const agreementCuts = useMemo(
    () =>
      rates
        .flatMap(optionsOf)
        .filter((o) => o.agreement)
        .map((o) => ({ option: o, cut: o.origin.pct - o.pct }))
        .sort((a, b) => b.cut - a.cut),
    [rates]
  );
  const yourHistory = yours ? histories.get(yours.country.code) : undefined;
  const yourSwing = yourHistory ? volatility(yourHistory, "standard") : null;
  const sortedPcts = rates.map((r) => rateOf(r, basis)).sort((a, b) => a - b);
  const median = sortedPcts[Math.floor(sortedPcts.length / 2)] ?? 0;
  const highest = sortedPcts[sortedPcts.length - 1] ?? 1;
  const topTiers = [...tiers].sort((a, b) => b.origins.length - a.origins.length).slice(0, 6).sort((a, b) => a.pct - b.pct);
  const tierMax = Math.max(...topTiers.map((t) => t.origins.length), 1);
  const lead = suppliers[0] ?? byRate[0];

  return (
    <>
      {/* The verdict, and the three numbers behind it */}
      <section className="flex flex-col gap-4 p-5 sm:p-6" aria-label="The answer">
        <p className="m-0 text-lg leading-relaxed text-base-content/80">
          {lead ? (
            <>
              {lead.origin.country.flag} <span className="font-semibold text-base-content">{lead.origin.country.name}</span>
              {lead.agreement ? ` with ${shortAgreement(lead.agreement.name)}` : ""} could lower your duty rate by up to{" "}
              <span className="font-semibold text-success">{formatRate(saving(lead))}</span>
              {value(lead.origin.country.code) > 0 && (
                <>
                  , and the US already imports <span className="font-semibold text-base-content">{formatImportValue(value(lead.origin.country.code))}</span> of this
                  from there a year
                </>
              )}
              {lead.agreement ? ", if the goods meet the agreement's rules of origin." : "."}
            </>
          ) : (
            <>
              {yours?.country.name} already pays among the lowest duty on this of all {facts.total} countries.
            </>
          )}
        </p>
        <dl className="-mx-5 -mb-5 grid gap-px border-t border-base-300 bg-base-300 sm:-mx-6 sm:-mb-6 sm:grid-cols-3">
          <div className="bg-base-100 px-5 py-4 sm:px-6">
            <dt className={ui.label}>Countries that pay less</dt>
            <dd className={`${ui.metric.secondary} m-0 mt-1`}>{best.size}</dd>
            <dd className="m-0 mt-1 text-xs text-base-content/60">
              Of {facts.total}, than {yours?.country.name}
              {mode === "without" ? " at standard rates" : ""}
            </dd>
          </div>
          <div className="bg-base-100 px-5 py-4 sm:px-6">
            <dt className={ui.label}>Already supplied by them</dt>
            <dd className={`${ui.metric.secondary} m-0 mt-1`}>{cheaperShare !== null ? `${Math.round(cheaperShare * 100)}%` : "—"}</dd>
            <dd className="m-0 mt-1 text-xs text-base-content/60">{imports ? `Of US imports of this in ${imports.year}` : "No US import figures for this code"}</dd>
          </div>
          <div className="bg-base-100 px-5 py-4 sm:px-6">
            <dt className={ui.label}>Most an option could lower it</dt>
            <dd className={`${ui.metric.secondary} m-0 mt-1 ${byRate[0] ? "text-success" : ""}`}>{byRate[0] ? `−${formatRate(saving(byRate[0]))}` : "—"}</dd>
            <dd className="m-0 mt-1 text-xs text-base-content/60">{byRate[0] ? "Off your rate, at most, at the lowest rate" : "No option pays less than yours"}</dd>
          </div>
        </dl>
      </section>


      <section className="flex flex-col" aria-label="Where you stand">
        <h4 className={`${ui.cardTitle} px-5 pt-5 sm:px-6`}>Where you stand</h4>
        <CardRow className="lg:grid-cols-3">
          <Panel title="Your rank" answer={`#${facts.rank} of ${facts.total}`}>
            {/* The field's range, with the middle and yours on it */}
            <div className="relative mt-2 h-10" aria-label={`${yours?.country.name} pays ${formatRate(yourPct)}; the middle country pays ${formatRate(median)}`}>
              <div className="absolute inset-x-0 top-4 h-2 rounded-full bg-base-200" />
              <div className="absolute top-4 h-2 rounded-l-full bg-success/30" style={{ width: barWidth(yourPct, highest) }} />
              <span className="absolute top-2 h-6 w-0.5 bg-base-content/40" style={{ left: barWidth(median, highest) }} title={`Median ${formatRate(median)}`} />
              <span className="absolute top-2.5 h-5 w-5 -translate-x-1/2 rounded-full border-2 border-base-100 bg-primary" style={{ left: barWidth(yourPct, highest) }} />
            </div>
            <p className="m-0 flex justify-between text-xs text-base-content/60">
              <span>{formatRate(sortedPcts[0] ?? 0)}</span>
              <span>
                Middle {formatRate(median)} · yours <span className="font-semibold text-primary">{formatRate(yourPct)}</span>
              </span>
              <span>{formatRate(highest)}</span>
            </p>
          </Panel>
          <Panel title="Rate tiers" answer={`${tiers.length} ${tiers.length === 1 ? "rate" : "rates"}`}>
            <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
              {topTiers.map((t) => {
                const isYours = Math.abs(t.pct - yourPct) < 0.005;
                return (
                  <li key={t.pct} className="grid grid-cols-[3.5rem_minmax(0,1fr)_2.5rem] items-center gap-2 text-xs">
                    <span className={`tabular-nums ${isYours ? "font-semibold text-primary" : "text-base-content/70"}`}>{formatRate(t.pct)}</span>
                    <span className="h-2 overflow-hidden rounded-full bg-base-200" aria-hidden>
                      <span className={`block h-full rounded-full ${isYours ? "bg-primary" : t.pct < yourPct ? "bg-success/60" : "bg-base-content/30"}`} style={{ width: barWidth(t.origins.length, tierMax) }} />
                    </span>
                    <span className="text-right tabular-nums text-base-content/70">{t.origins.length}</span>
                  </li>
                );
              })}
            </ul>
          </Panel>
          <Panel title={`${yours?.country.name ?? "Your origin"} over time`} answer={yourSwing ? (yourSwing.changes ? `${yourSwing.changes} ${yourSwing.changes === 1 ? "change" : "changes"}` : "Steady") : "…"}>
            {yourHistory ? (
              <>
                <Sparkline points={yourHistory.standard.map((s) => ({ x: time(s.from), y: s.pct }))} color={PRIMARY_MARK} step to={today} height={56} label="Your rate over time" />
                <p className="m-0 text-xs text-base-content/60">
                  From {formatRate(yourSwing!.min)} to {formatRate(yourSwing!.max)} since {shortDate(range.from, true)}
                </p>
              </>
            ) : (
              <p className="m-0 text-sm text-base-content/60">{working}</p>
            )}
          </Panel>
        </CardRow>
      </section>

      <section className="flex flex-col" aria-label="Cheaper options">
        <h4 className={`${ui.cardTitle} px-5 pt-5 sm:px-6`}>Cheaper options</h4>
        <CardRow className="lg:grid-cols-3">
          <Panel title="Cheapest" answer={byRate[0] ? formatRate(byRate[0].pct) : "None"} tone={byRate[0] ? "success" : undefined}>
            <List empty="No option pays less than yours">
              {byRate.slice(0, TOP).map((o) => (
                <Row key={o.key} option={o}>
                  <span className="tabular-nums font-semibold text-success">{formatRate(o.pct)}</span>
                  <span className="w-16 text-right text-xs tabular-nums text-base-content/60">−{formatRate(saving(o))}</span>
                </Row>
              ))}
            </List>
          </Panel>
          <Panel title="Biggest cheaper suppliers" answer={suppliers[0] ? suppliers[0].origin.country.name : "None"}>
            <List empty={imports ? "No cheaper country ships this to the US yet" : "No US import figures for this code"}>
              {suppliers.slice(0, TOP).map((o) => (
                <Row key={o.key} option={o}>
                  <span className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-base-200 sm:block" aria-hidden>
                    <span className="block h-full rounded-full bg-base-content/40" style={{ width: barWidth(value(o.origin.country.code), value(suppliers[0].origin.country.code)) }} />
                  </span>
                  <span className="w-14 text-right tabular-nums font-semibold">{formatImportValue(value(o.origin.country.code))}</span>
                </Row>
              ))}
            </List>
          </Panel>
          <Panel title="Growing fastest" answer={growing[0] ? growing[0].origin.country.name : "None"} tone={growing[0] ? "success" : undefined}>
            <List empty="No cheaper supplier with a big enough share to call">
              {growing.slice(0, TOP).map((o) => {
                const g = growth(o) ?? 0;
                // Each bar against the fastest shown, so the growth compares at a glance
                const fastest = Math.max(...growing.slice(0, TOP).map((x) => Math.abs(growth(x) ?? 0)), 0.01);
                return (
                  <Row key={o.key} option={o}>
                    <span className="h-2 w-24 shrink-0 overflow-hidden rounded-full bg-base-200" aria-hidden>
                      <span
                        className={`block h-full rounded-full ${g >= 0 ? "bg-success" : "bg-base-content/30"}`}
                        style={{ width: `${Math.max((Math.abs(g) / fastest) * 100, 3)}%` }}
                      />
                    </span>
                    <span className={`w-14 text-right tabular-nums font-semibold ${g >= 0 ? "text-success" : "text-base-content/70"}`}>
                      {g >= 0 ? "+" : "−"}
                      {Math.abs(Math.round(g * 100))}%
                    </span>
                  </Row>
                );
              })}
            </List>
          </Panel>
          <Panel title="Where US imports of this come from" answer={cheaperShare !== null ? `${Math.round(cheaperShare * 100)}% from cheaper countries` : "—"} className="lg:col-span-2">
            {imports && total > 0 ? (
              <>
                <div className="flex h-4 w-full overflow-hidden rounded-full bg-base-200" aria-hidden>
                  <span className="h-full bg-success" style={{ width: `${(cheaperValue / total) * 100}%` }} />
                  <span className="h-full bg-primary" style={{ width: `${(yoursValue / total) * 100}%` }} />
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-base-content/70">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-xs bg-success" aria-hidden />
                    Cheaper than {yours?.country.name} <span className="font-semibold tabular-nums text-base-content">{formatImportValue(cheaperValue)}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-xs bg-primary" aria-hidden />
                    {yours?.country.name} <span className="font-semibold tabular-nums text-base-content">{formatImportValue(yoursValue)}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-xs bg-base-200" aria-hidden />
                    The rest <span className="font-semibold tabular-nums text-base-content">{formatImportValue(Math.max(0, total - cheaperValue - yoursValue))}</span>
                  </span>
                </div>
                <p className="m-0 text-xs text-base-content/60">
                  US general imports in {imports.year}. Source: U.S. Census Bureau.
                </p>
              </>
            ) : (
              <p className="m-0 text-sm text-base-content/60">No US import figures for this code.</p>
            )}
          </Panel>
          <Panel title="What trade agreements could cut" answer={`${agreementCuts.length} ${agreementCuts.length === 1 ? "option" : "options"}`}>
            <List empty="No country can lower this with an agreement">
              {agreementCuts.slice(0, TOP).map(({ option: o, cut }) => (
                <Row key={o.key} option={o}>
                  <span className="tabular-nums text-xs text-base-content/60">{formatRate(o.origin.pct)} →</span>
                  <span className="w-12 text-right tabular-nums font-semibold text-success">{formatRate(o.pct)}</span>
                  <span className="sr-only">, {formatRate(cut)} off</span>
                </Row>
              ))}
            </List>
          </Panel>
        </CardRow>
      </section>


    </>
  );
};
