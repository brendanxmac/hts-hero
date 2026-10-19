"use client";

import { ReactNode, useMemo, useState } from "react";
import { ArrowTopRightOnSquareIcon, CheckBadgeIcon } from "@heroicons/react/20/solid";
import { useUser } from "@/contexts/UserContext";
import { AccountGate } from "@/components/tariff-tracker/access/AccountGate";
import { useTariffUpdates, type TrackerUpdate } from "@/components/tariff-tracker/overview/useTariffUpdates";
import { NEWS_DOTS, newsToneOf } from "@/components/tariff-tracker/news/tone";
import { authorityLabel, kindLabel, STAGE_LABELS } from "@/components/tariff-updates/labels";
import { lookupOf, useAdcvdLookup } from "@/components/adcvd/useAdcvd";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { Countries } from "@/constants/countries";
import { htsCodeDigitsOnly } from "@/libs/hts-code";
import { matchCatalog } from "@/libs/tariff-updates/match";

// The calculator's News tab (and an import's page in the Tracker): every published tariff update
// (/tariff-updates) that may touch this import, the ones naming its product first, then the ones
// naming only its country; and, from the AD/CVD lookup, the notices on cases that may cover it.
// Newest first, each with what kind of action it is, where it stands and a link to the full
// update. A free account: signed out, a stand-in behind the sign-up, with how many there are.

type Filter = "all" | "product" | "country";

interface Item {
  key: string;
  date: string;
  title: string;
  summary: string;
  href: string;
  external: boolean;
  dot: string;
  tags: string[];
  level: "product" | "country";
  // An AD/CVD action (a notice from the lookup that day is the same news)
  adcvd?: boolean;
}

const day = (iso: string) =>
  new Date(`${iso.slice(0, 10)}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

const fromUpdate = (u: TrackerUpdate, level: Item["level"]): Item => ({
  key: u.slug,
  date: u.effective_on && u.effective_on <= new Date().toISOString().slice(0, 10) ? u.effective_on : u.last_activity_at.slice(0, 10),
  title: u.title,
  summary: u.summary,
  href: `/tariff-updates/${u.slug}`,
  external: false,
  dot: NEWS_DOTS[newsToneOf(u.kind)],
  tags: Array.from(new Set([kindLabel(u.kind), authorityLabel(u.authority), STAGE_LABELS[u.stage]].filter(Boolean))),
  adcvd: u.authority === "ad_cvd" || u.kind === "ad_cvd",
  level,
});

// The updates that may touch this import, worked out from the public list (so the count can tease)
const useMatchedUpdates = (code: string, country: string) => {
  const updates = useTariffUpdates("all");
  return useMemo(() => {
    if (!updates) return null;
    const item = { code: htsCodeDigitsOnly(code), country };
    const matched = matchCatalog(updates, [item]);
    return updates.flatMap((u): Item[] => {
      const m = matched.get(u.slug);
      return m?.likely.length ? [fromUpdate(u, "product")] : m?.possible.length ? [fromUpdate(u, "country")] : [];
    });
  }, [updates, code, country]);
};

const Row = ({ item }: { item: Item }) => (
  <li className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-4 border-t border-base-300 py-4 first:border-t-0 first:pt-0">
    <span className="pt-0.5 text-xs tabular-nums text-base-content/55">{day(item.date)}</span>
    <div className="flex min-w-0 flex-col gap-1.5">
      <div className="flex items-start gap-2.5">
        <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${item.dot}`} aria-hidden />
        <a
          href={item.href}
          target="_blank"
          rel="noopener"
          className="inline-flex min-w-0 items-start gap-1 text-[0.9375rem] font-semibold leading-snug text-base-content hover:text-primary hover:underline"
        >
          <span>{item.title}</span>
          {item.external && <ArrowTopRightOnSquareIcon className="mt-1 h-3 w-3 shrink-0 text-base-content/50" aria-hidden />}
        </a>
      </div>
      {item.summary && <p className="m-0 line-clamp-2 pl-4.5 text-sm text-base-content/70">{item.summary}</p>}
      <div className="flex flex-wrap gap-1.5 pl-4.5">
        <span className={tt.chip(item.level === "product" ? "primary" : "neutral")}>{item.level === "product" ? "Names this product" : "Names its country"}</span>
        {item.tags.map((t) => (
          <span key={t} className={tt.chip()}>
            {t}
          </span>
        ))}
      </div>
    </div>
  </li>
);

const StandIn = () => (
  <div className="flex flex-col gap-5 p-6">
    {[0, 1, 2, 3, 4].map((i) => (
      <div key={i} className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-4">
        <div className="h-4 rounded-sm bg-base-300/70" />
        <div className="flex flex-col gap-2">
          <div className="h-5 w-3/4 rounded-sm bg-base-300/70" />
          <div className="h-4 w-full rounded-sm bg-tt-soft" />
          <div className="h-4 w-1/3 rounded-sm bg-tt-soft" />
        </div>
      </div>
    ))}
  </div>
);

const LOCKED_POINTS = [
  "Every tariff action that names this product or its country",
  "AD/CVD notices on cases that may cover it",
  "Where each action stands, with the full update a click away",
];

export const NewsTab = ({ code, country, page, action }: { code: string; country: string; page: string; action?: ReactNode }) => {
  const { user, isLoading } = useUser();
  const updates = useMatchedUpdates(code, country);
  const adcvd = lookupOf(useAdcvdLookup(code, country));
  const [filter, setFilter] = useState<Filter>("all");
  const countryLabel = Countries.find((c) => c.code === country)?.name ?? country;

  // The AD/CVD notices on cases that may cover it, and new petitions: news about this product
  const items = useMemo(() => {
    if (!updates) return null;
    // A notice already published as a tariff update (the same action, that day) is the same news
    const seen = new Set<string>();
    const covered = updates.filter((u) => u.adcvd).map((u) => ({ date: u.date, title: u.title.toLowerCase() }));
    const isCovered = (date: string, label: string) => covered.some((u) => u.date === date && u.title.includes(label.toLowerCase()));
    const notices: Item[] = adcvd
      ? [...adcvd.flags.flatMap((f) => f.events.map((e) => ({ e, product: f.product }))), ...adcvd.petitions.map((e) => ({ e, product: "" }))].flatMap(({ e, product }) =>
        seen.has(e.document_number) || isCovered(e.date, e.label)
          ? []
          : (seen.add(e.document_number),
            [
              {
                key: `adcvd-${e.document_number}`,
                date: e.date,
                title: product ? `${e.label}: ${product}` : e.label,
                summary: e.summary !== e.label ? e.summary : "",
                href: e.url,
                external: true,
                dot: NEWS_DOTS.warning,
                tags: ["AD/CVD", "Federal Register"],
                level: "product" as const,
              },
            ]),
      )
      : [];
    return [...updates, ...notices].sort((a, b) => b.date.localeCompare(a.date));
  }, [updates, adcvd]);

  if (isLoading || !items) return <div className={`${ui.skeleton} m-5 h-96`} />;

  const product = items.filter((i) => i.level === "product");
  const shown = filter === "all" ? items : items.filter((i) => i.level === filter);

  if (!user) {
    return (
      <AccountGate
        feature="news"
        page={page}
        title="See the News About This Import, Free"
        teaser={
          items.length
            ? `${items.length} tariff ${items.length === 1 ? "update" : "updates"} may touch this import${product.length ? `, ${product.length} naming this product` : ""}.`
            : "Know the moment tariff news touches this import."
        }
        points={LOCKED_POINTS}
        preview={<StandIn />}
        minHeight="min-h-96"
        framed={false}
      >
        {null}
      </AccountGate>
    );
  }

  return (
    <section className={`${ui.cardSection} flex flex-col gap-5 py-6!`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className={tt.title}>News About This Import</h3>
          <p className={tt.subtitle}>Every tariff action that names this product or {countryLabel}, newest first</p>
        </div>
        <div className="flex items-center gap-3">
          {items.length > 0 && (
            <SegmentedControl
              label="Show"
              size="sm"
              options={[
                { id: "all", label: "All", count: items.length },
                { id: "product", label: "This product", count: product.length },
                { id: "country", label: `Only ${countryLabel}`, count: items.length - product.length },
              ]}
              value={filter}
              onChange={(v) => setFilter(v as Filter)}
            />
          )}
          {action}
        </div>
      </div>
      {shown.length ? (
        <ol className="m-0 flex list-none flex-col p-0">
          {shown.map((i) => (
            <Row key={i.key} item={i} />
          ))}
        </ol>
      ) : (
        <div className="flex items-center gap-3 rounded-xl bg-success/10 px-4 py-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-success text-success-content" aria-hidden>
            <CheckBadgeIcon className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-base-content">All quiet: no news about this import</span>
            <span className="block text-xs text-base-content/70">
              {filter === "all" ? "No tariff action we track names this product or its country of origin." : "Nothing here; try All."}
            </span>
          </span>
        </div>
      )}
      <p className={`${ui.caption} m-0`}>
        Matched on what each update names (HTS codes and countries); an update that names only the country may not reach this product.{" "}
        <a href="/tariff-updates" target="_blank" rel="noopener" className={ui.link}>
          All tariff news
        </a>
      </p>
    </section>
  );
};

// How many updates may touch the import, for the tab's count (public data)
export const useNewsCount = (code: string | undefined, country: string | undefined) => {
  const items = useMatchedUpdates(code ?? "", country ?? "");
  return code && country && items ? items.length : undefined;
};
