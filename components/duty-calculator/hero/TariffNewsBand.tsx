import Link from "next/link";
import { ArrowRightIcon, BellAlertIcon } from "@heroicons/react/20/solid";
import type { PublicUpdate } from "@/libs/tariff-updates/public";
import { AUTHORITIES } from "@/libs/tariff-updates/types";
import * as mk from "@/components/ui/marketing/styles";
import * as tt from "@/components/ui/styles/tracker";
import { NEWS_DOTS, newsToneOf } from "@/components/tariff-tracker/news/tone";
import { SubscribeForm } from "@/components/tariff-updates/SubscribeForm";

// Between the calculator and the guide on /duty-calculator: the newest US tariff actions from
// /tariff-updates, each opening its update (color is meaning: red a new or higher tariff, green one
// lifted, amber a heads-up), and the email sign-up, right here. Server-rendered, so crawlers see the links.

const day = (iso: string) => new Date(`${iso.slice(0, 10)}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

const SHOWN = 3;

export const TariffNewsBand = ({ updates }: { updates: PublicUpdate[] }) => {
  if (!updates.length) return null;
  const today = new Date().toISOString().slice(0, 10);
  return (
    <section aria-labelledby="dc-news" className={`${mk.container} pb-14 pt-6`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="dc-news" className={`${tt.title} m-0 flex items-center gap-2.5`}>
          <span className="relative flex h-2 w-2" aria-hidden>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          Latest Tariff News
        </h2>
        <Link href="/tariff-updates" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
          All news
          <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
      <ul className="m-0 mt-4 grid list-none grid-cols-1 gap-3 p-0 md:grid-cols-3">
        {updates.slice(0, SHOWN).map((u) => (
          <li key={u.slug}>
            <Link href={`/tariff-updates/${u.slug}`} className={`${tt.panel} flex h-full items-start gap-3 p-4 transition-colors hover:border-primary/40`}>
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${NEWS_DOTS[newsToneOf(u.kind)]}`} aria-hidden />
              <span className="flex min-w-0 flex-col gap-1">
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
      <div className={`${tt.panel} mt-3 grid grid-cols-1 items-center gap-x-8 gap-y-3 p-4 lg:grid-cols-2`}>
        <p className="m-0 flex items-center gap-3 text-base font-semibold text-base-content">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary" aria-hidden>
            <BellAlertIcon className="h-4.5 w-4.5" />
          </span>
          Get tariff news by email, free
        </p>
        <SubscribeForm source="duty-calculator" inline />
      </div>
    </section>
  );
};
