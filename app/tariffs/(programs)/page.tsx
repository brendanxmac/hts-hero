import { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import config from "@/config";
import { hubPath, PROGRAM_HUBS } from "@/libs/tariff-programs/hubs";
import { programPage } from "@/libs/tariff-programs/program";
import { longDate } from "@/libs/tariff-programs/heading";
import { renderSchemaJsonLd } from "@/libs/seo";
import { THEME } from "@/components/ui/theme";
import { trackerDisplay, trackerSans } from "@/components/ui/font";
import * as mk from "@/components/ui/marketing/styles";
import * as tt from "@/components/ui/styles/tracker";
import { CodeCheck } from "@/components/tariff-programs/CodeCheck";

// /tariffs: every US tariff program with a page of its own, grouped by the law behind it, with what
// each has in force today
export const revalidate = 86400;

const title = "US Tariff Programs: Every Section 232, 301, 338 and IEEPA Tariff (2026)";
const description =
  "Every US tariff program in one place: Section 232, Section 301, Section 338, Section 122, Section 201 and IEEPA, with the Chapter 99 headings, HTS codes and rates each covers today.";

export const metadata: Metadata = {
  title: `${title}`,
  description,
  alternates: { canonical: "/tariffs" },
  openGraph: { title, description, url: `https://${config.domainName}/tariffs`, siteName: "HTS Hero", type: "website" },
};

const GROUPS: { title: string; prefix: string }[] = [
  { title: "Section 232 (national security)", prefix: "section-232" },
  { title: "Section 301 (unfair trade practices)", prefix: "section-301" },
  { title: "Other programs", prefix: "" },
];

export default function TariffProgramsIndex() {
  const pages = PROGRAM_HUBS.map((hub) => ({ hub, page: programPage(hub) }));
  const asOf = pages[0]?.page.asOf ?? new Date().toISOString().slice(0, 10);
  return (
    <main className={`${THEME} hts-tracker ${trackerSans.className} ${trackerDisplay.variable} flex w-full flex-1 flex-col bg-base-200`}>
      {renderSchemaJsonLd({
        "@type": "CollectionPage",
        name: title,
        description,
        url: `https://${config.domainName}/tariffs`,
        dateModified: asOf,
        mainEntity: {
          "@type": "ItemList",
          itemListElement: pages.map(({ hub }, i) => ({ "@type": "ListItem", position: i + 1, url: `https://${config.domainName}${hubPath(hub)}`, name: hub.title })),
        },
      })}
      <div className={`${mk.container} flex flex-col gap-10 py-10 sm:py-14`}>
        <header className="flex max-w-3xl flex-col gap-3">
          <span className={tt.eyebrow("primary")}>Updated {longDate(asOf)}</span>
          <h1 className={`${tt.display} m-0 text-3xl font-semibold leading-tight tracking-tight text-base-content sm:text-4xl`}>US Tariff Programs</h1>
          <p className="m-0 text-base leading-relaxed text-base-content/80">
            Every US tariff program on top of the regular duty, with the Chapter 99 headings, HTS codes and rates each one covers today, the dates
            they changed and the documents behind them. Built from the same data as the HTS Hero tariff calculator.
          </p>
        </header>
        <CodeCheck />
        {GROUPS.map((group) => {
          const members = pages.filter(({ hub }) =>
            group.prefix ? hub.slug.startsWith(group.prefix) : !GROUPS.some((g) => g.prefix && hub.slug.startsWith(g.prefix))
          );
          return (
            <section key={group.title} className="flex flex-col gap-4">
              <h2 className={`${tt.title} m-0 text-xl`}>{group.title}</h2>
              <ul className="m-0 grid list-none gap-3 p-0 md:grid-cols-2">
                {members.map(({ hub, page }) => (
                  <li key={hub.slug}>
                    <Link href={hubPath(hub)} className={`${tt.panel} group flex h-full flex-col gap-2 px-5 py-4 transition-colors hover:border-primary/40`}>
                      <span className="flex items-center justify-between gap-3 text-base font-semibold text-base-content group-hover:text-primary">
                        {hub.title}
                        <ArrowRightIcon className="h-4 w-4 shrink-0" aria-hidden />
                      </span>
                      <span className="text-sm text-base-content/70">
                        {page.inForce.length > 0
                          ? `${page.inForce.length} heading${page.inForce.length === 1 ? "" : "s"} in force · ${page.rateRange}${page.codes.length > 0 ? ` · ${page.codes.length.toLocaleString("en-US")} HTS codes` : " · every product from the countries named"}`
                          : `Ended · ${page.ended.length} past headings`}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </main>
  );
}
