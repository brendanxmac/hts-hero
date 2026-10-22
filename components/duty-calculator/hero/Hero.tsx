import Link from "next/link";
import { ArrowRightIcon, BellAlertIcon } from "@heroicons/react/20/solid";
import type { PublicUpdate } from "@/libs/tariff-updates/public";
import { AUTHORITIES } from "@/libs/tariff-updates/types";
import * as mk from "@/components/ui/marketing/styles";
import * as tt from "@/components/ui/styles/tracker";
import { NEWS_DOTS, newsToneOf } from "@/components/tariff-tracker/news/tone";
import { CHANGELOG_PATH } from "../changelog/constants";

// The top of /duty-calculator, in the Tariff Tracker's look (DESIGN_SYSTEM.md §15): a short
// headline so the calculator sits high on the page, a line saying the rates are current (with the
// data changelog), and beside it the latest US tariff actions from /tariff-updates, as a Tariff
// News box. Server-rendered so crawlers see the copy and the links. Follows light and dark with
// the site.

const day = (iso: string) => new Date(`${iso.slice(0, 10)}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

// The two newest tariff actions, each opening its update (color is meaning: red a new or higher
// tariff, green one lifted, amber a heads-up), and the way to the news page to sign up for them,
// in the brand color so it stands out from the page
const SHOWN = 2;
const TariffNews = ({ updates, today }: { updates: PublicUpdate[]; today: string }) => (
  <section aria-labelledby="dc-news" className={`${tt.panel} flex w-full flex-col lg:max-w-md`}>
    <div className="flex items-center justify-between gap-3 px-5 pb-1 pt-4">
      <h2 id="dc-news" className={`${tt.title} m-0 flex items-center gap-2.5`}>
        <span className="relative flex h-2 w-2" aria-hidden>
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
        </span>
        Tariff News
      </h2>
      <Link href="/tariff-updates" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
        All news
        <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden />
      </Link>
    </div>
    <ul className="m-0 flex list-none flex-col px-2 pb-1.5">
      {updates.slice(0, SHOWN).map((u) => (
        <li key={u.slug}>
          <Link href={`/tariff-updates/${u.slug}`} className="flex items-start gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-tt-soft">
            <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${NEWS_DOTS[newsToneOf(u.kind)]}`} aria-hidden />
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="line-clamp-2 text-sm font-semibold leading-snug text-base-content">{u.title}</span>
              <span className="text-xs text-base-content/60">
                {AUTHORITIES[u.authority] ?? u.authority} · {day(u.last_activity_at)}
                {u.effective_on && u.effective_on > today && <span className="font-semibold text-warning"> · From {day(u.effective_on)}</span>}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
    <Link
      href="/tariff-updates"
      className="group mt-auto flex items-center justify-between gap-2 rounded-b-lg border-t border-base-300 bg-primary/5 px-5 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
    >
      <span className="flex items-center gap-2">
        <BellAlertIcon className="h-4 w-4" aria-hidden />
        Want tariff news alerts in your inbox?
      </span>
      <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
    </Link>
  </section>
);

export const Hero = ({ latestNews, revisionTitle }: { latestNews: PublicUpdate[]; revisionTitle: string }) => {
  const today = new Date().toISOString().slice(0, 10);
  return (
    <header className={`${mk.container} flex flex-col gap-8 pb-8 pt-10 lg:flex-row lg:items-center lg:justify-between`}>
      <div className="flex max-w-3xl flex-col gap-4">
        <h1 className="m-0 flex flex-col gap-3">
          <span className={tt.eyebrow("primary")}>Free US Import Duty &amp; Tariff Calculator</span>
          <span className={`${tt.display} text-4xl font-semibold leading-tight tracking-tight text-base-content sm:text-5xl sm:leading-none`}>
            Know what you owe on every import. <span className="text-primary">And why.</span>
          </span>
        </h1>
        <p className="m-0 text-base leading-relaxed text-base-content/70 sm:text-lg sm:leading-7">
          Every tariff, exemption, and fee in effect for your imports, line by line with its legal source.
        </p>
        <p className="m-0 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-base-content/60">
          <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden />
          Up to date with {revisionTitle}.
          <Link href={CHANGELOG_PATH} className="inline-flex items-center gap-1 font-semibold text-primary hover:underline">
            Track our updates
            <ArrowRightIcon className="h-3 w-3" aria-hidden />
          </Link>
        </p>
      </div>
      {latestNews.length > 0 && <TariffNews updates={latestNews} today={today} />}
    </header>
  );
};
