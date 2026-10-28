import Link from "next/link";
import {
  ArrowRightIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/20/solid";
import { SectionIntro } from "@/components/ui/marketing";
import * as mk from "@/components/ui/marketing/styles";
import {
  STAGE_LABELS,
  authorityColor,
  authorityLabel,
} from "@/components/tariff-updates/labels";
import type { PublicUpdate } from "@/libs/tariff-updates/public";

// The proof we're current: the official sources we check, each linked and each feeding (an
// animated line across the gap) the newest real tariff actions beside them. Every action links to
// its /tariff-updates page.

// The official pages the feed watches (libs/tariff-sources), in the order an action moves through them
const SOURCES = [
  {
    name: "USTR",
    what: "Section 301 actions and hearings",
    href: "https://ustr.gov/about/policy-offices/press-office/press-releases",
  },
  {
    name: "The White House",
    what: "Proclamations and executive orders",
    href: "https://www.whitehouse.gov/presidential-actions/",
  },
  {
    name: "Federal Register",
    what: "Notices, before and after publication",
    href: "https://www.federalregister.gov/public-inspection/current",
  },
  {
    name: "CBP CSMS",
    what: "Guidance to filers on each change",
    href: "https://www.cbp.gov/trade/automated/cargo-systems-messaging-service",
  },
  {
    name: "USITC HTS",
    what: "Every HTS revision",
    href: "https://hts.usitc.gov/",
  },
  {
    name: "Commerce AD/CVD",
    what: "AD/CVD cases and orders",
    href: "https://www.trade.gov/us-antidumping-and-countervailing-duties",
  },
];

const shortDay = (iso: string) =>
  new Date(`${iso.slice(0, 10)}T12:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

const longDay = (iso: string) =>
  new Date(`${iso.slice(0, 10)}T12:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

export const LatestActions = ({ updates }: { updates: PublicUpdate[] }) => {
  if (updates.length === 0) return null;
  return (
    <section
      id="sources"
      className={`${mk.band} ${mk.bandMuted}`}
      aria-labelledby="latest-title"
    >
      <style>{`
        .la-flow { background: linear-gradient(90deg, currentColor 50%, transparent 0) 0 0 / 8px 2px repeat-x; }
        .la-pulse { opacity: 0; }
        @media (prefers-reduced-motion: no-preference) {
          .la-flow { animation: la-flow 0.8s linear infinite; }
          .la-pulse { animation: la-pulse 2.7s ease-in-out infinite; }
        }
        @keyframes la-flow { to { background-position: 8px 0; } }
        @keyframes la-pulse {
          0% { opacity: 0; transform: translateX(0); }
          10% { opacity: 1; }
          45% { opacity: 1; transform: translateX(3.5rem); }
          55%, 100% { opacity: 0; transform: translateX(3.5rem); }
        }
      `}</style>
      <div
        className={`${mk.container} grid grid-cols-1 items-start gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]`}
      >
        <div className="flex flex-col gap-10">
          <SectionIntro
            eyebrow="Our Sources"
            title="We Watch Tariffs 24/7 So You Don't Have To"
            id="latest-title"
          >
            You can finally stop refreshing LinkedIn and 6+ news sources every hour. We track every source, summarize the updates, and filter based on your preferences.
          </SectionIntro>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/50">
              Official sources we check every hour
            </h3>
            <ul className="mt-3 flex flex-col gap-2">
              {SOURCES.map((s, i) => (
                <li key={s.name} className="relative">
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener"
                    className="group flex items-center justify-between gap-3 rounded-xl bg-base-100 px-4 py-2.5 ring-1 ring-base-300 transition hover:shadow-sm hover:ring-primary/50"
                  >
                    <span className="flex min-w-0 items-baseline gap-3">
                      <span className="w-36 shrink-0 text-sm font-semibold text-base-content group-hover:text-primary">
                        {s.name}
                      </span>
                      <span className="truncate text-xs text-base-content/60">
                        {s.what}
                      </span>
                    </span>
                    <ArrowTopRightOnSquareIcon
                      className="h-4 w-4 shrink-0 text-base-content/35 group-hover:text-primary"
                      aria-hidden
                    />
                  </a>
                  {/* The line feeding the latest actions, across the gap to the list */}
                  <span
                    className="la-flow pointer-events-none absolute left-full top-1/2 hidden h-0.5 w-14 -translate-y-1/2 text-primary/60 lg:block"
                    aria-hidden
                  >
                    <span
                      className="la-pulse absolute -top-[3px] left-0 h-2 w-2 rounded-full bg-primary shadow-[0_0_0_3px] shadow-primary/20"
                      style={{ animationDelay: `${i * 0.45}s` }}
                    />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          className={`${mk.card} overflow-hidden shadow-2xl shadow-base-content/5`}
        >
          <div className="flex items-center justify-between gap-3 border-b border-base-300 px-6 py-4">
            <p className="flex items-center gap-2.5 text-sm font-semibold text-base-content">
              <span
                className="h-2.5 w-2.5 rounded-full bg-success"
                aria-hidden
              />
              Latest Tariff Updates
            </p>
            <p className="text-xs text-base-content/50">
              Newest first · updated hourly
            </p>
          </div>
          <ol className="relative px-6 py-2">
            <span
              className="absolute bottom-8 left-[6.625rem] top-8 w-px bg-base-300"
              aria-hidden
            />
            {updates.map((u) => (
              <li key={u.slug}>
                <Link
                  href={`/tariff-updates/${u.slug}`}
                  className="group relative flex gap-5 rounded-2xl py-4 transition-colors"
                >
                  <time
                    dateTime={u.last_activity_at.slice(0, 10)}
                    className="w-14 shrink-0 pt-0.5 text-right text-xs font-semibold tabular-nums text-base-content/50"
                  >
                    {shortDay(u.last_activity_at)}
                  </time>
                  {/* Program color is data */}
                  <span
                    className="relative z-10 mt-1 h-3 w-3 shrink-0 rounded-full ring-4 ring-base-100"
                    style={{ backgroundColor: authorityColor(u.authority) }}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold leading-snug text-base-content underline-offset-4 group-hover:text-primary group-hover:underline">
                      {u.title}
                    </span>
                    <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-base-content/60">
                      <span className="font-semibold text-base-content/70">
                        {authorityLabel(u.authority)}
                      </span>
                      <span className="rounded-full bg-tt-soft px-2 py-0.5 font-semibold ring-1 ring-base-300">
                        {STAGE_LABELS[u.stage]}
                      </span>
                      {u.effective_on && (
                        <span>Effective {longDay(u.effective_on)}</span>
                      )}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
          <Link
            href="/tariff-updates"
            className="flex items-center justify-between border-t border-base-300 bg-tt-soft px-6 py-4 text-sm font-semibold text-base-content hover:text-primary"
          >
            See every US tariff update{" "}
            <ArrowRightIcon className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
};
