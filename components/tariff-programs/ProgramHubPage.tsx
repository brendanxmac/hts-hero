import { TRY_FREE_HREF } from "@/components/tariff-tracker/access/signup";
import { TRY_IT_FREE } from "@/components/pricing-calculator/lib/pricing";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { longDate, sinceLabel, type HeadingProfile } from "@/libs/tariff-programs/heading";
import { hubPath, PROGRAM_HUBS } from "@/libs/tariff-programs/hubs";
import { countriesLabel, hubLead, type ProgramPage } from "@/libs/tariff-programs/program";
import type { CodeInfo } from "@/libs/tariff-programs/codeLinks";
import { mono, trackerDisplay, trackerSans } from "@/components/ui/font";
import { THEME } from "@/components/ui/theme";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { RowHeader, Table, TBody, Td, Th, THead, Tr } from "@/components/ui/table/Table";
import * as mk from "@/components/ui/marketing/styles";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { NewsAlertsBox } from "@/components/tariff-updates/NewsAlertsBox";
import { CodeChip, FactGrid, SourceLinks } from "./shared";
import { CodeCheck } from "./CodeCheck";

// /tariffs/[slug]: one tariff program, from the engine's data. The answer first (what it is, how
// many headings and codes, the rates, the latest change), then every Chapter 99 heading in force,
// every HTS code covered, exemptions, the change log, ended headings,
// questions and sources. In the Tariff Tracker's look, like the /hts pages.

// Up to this many code-and-heading pairs, each listed code shows its product name; past it the codes
// are bare links, to keep the page light
export const DETAILED_PAIR_LIMIT = 1500;

export const showsCodeNames = (page: ProgramPage) => page.codes.reduce((n, r) => n + r.headings.length, 0) <= DETAILED_PAIR_LIMIT;


const coversText = (p: HeadingProfile) =>
  p.coverage.all
    ? "Every product"
    : p.coverage.codes.length === 0
      ? "See legal text"
      : `${p.coverage.codes.length.toLocaleString("en-US")} code${p.coverage.codes.length === 1 ? "" : "s"}`;

const HeadingTable = ({ headings, ended = false, codeInfo }: { headings: HeadingProfile[]; ended?: boolean; codeInfo: Record<string, CodeInfo> }) => (
  <div className={`${tt.panel} overflow-hidden`}>
    <Table framed={false} valign="top">
      <THead>
        <Tr>
          <Th>Heading</Th>
          <Th>Name</Th>
          <Th>Rate</Th>
          <Th>Applies to</Th>
          <Th>Covers</Th>
          <Th>{ended ? "Applied" : "Since"}</Th>
        </Tr>
      </THead>
      <TBody>
        {headings.map((p) => (
          <Tr key={p.code}>
            <Td>
              <CodeChip code={p.code} href={codeInfo[p.code]?.href ?? null} />
            </Td>
            <RowHeader className="text-base-content">
              <span className="block font-medium">{p.name}</span>
              <span className="mt-1 block">
                <SourceLinks sources={p.sources} />
              </span>
            </RowHeader>
            <Td className="whitespace-nowrap font-semibold text-base-content">
              {p.rate}
              {p.basis && <span className="block text-xs font-normal text-base-content/60">{p.basis}</span>}
            </Td>
            <Td className="text-base-content/80">{countriesLabel(p)}</Td>
            <Td className="whitespace-nowrap text-base-content/80">{coversText(p)}</Td>
            <Td className="whitespace-nowrap tabular-nums text-base-content/80">
              {ended ? `${sinceLabel(p)} – ${longDate(p.endsOn!)}` : sinceLabel(p)}
            </Td>
          </Tr>
        ))}
      </TBody>
    </Table>
  </div>
);

// Each heading's codes, linked, the way the U.S. notes list them: with each code's product name
// for smaller programs, as bare links for programs with thousands. Plain elements styled from the
// list, so the page stays light.
const CodesByHeading = ({
  headings,
  codeInfo,
  withNames,
}: {
  headings: HeadingProfile[];
  codeInfo: Record<string, CodeInfo>;
  withNames: boolean;
}) => (
  <div className={`${tt.panel} divide-y divide-base-300`}>
    {headings
      .filter((p) => p.coverage.codes.length > 0)
      .map((p, i) => (
        <details key={p.code} className="group px-5 py-3" open={withNames && i === 0}>
          <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-1 text-sm text-base-content">
            <span className={`${mono.className} font-semibold text-primary`}>{p.code}</span>
            <span className="min-w-0 flex-1 font-medium">{p.name}</span>
            <span className="font-semibold">{p.rate}</span>
            <span className="text-base-content/60">
              {countriesLabel(p)} · {p.coverage.codes.length.toLocaleString("en-US")} code{p.coverage.codes.length === 1 ? "" : "s"}
            </span>
          </summary>
          {withNames ? (
            <ul className={`m-0 mt-3 grid list-none gap-x-6 gap-y-1.5 p-0 text-sm md:grid-cols-2 [&_a]:font-semibold [&_a]:text-primary [&_a:hover]:underline [&_b]:font-semibold [&_code]:font-mono [&_span]:text-base-content/70`}>
              {p.coverage.codes.map((code) => {
                const info = codeInfo[code];
                return (
                  <li key={code}>
                    <code>{info?.href ? <a href={info.href}>{code}</a> : <b>{code}</b>}</code> <span>{info?.name ?? ""}</span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className={`${mono.className} mt-3 mb-1 flex flex-wrap gap-x-3 gap-y-1 text-xs [&_a]:text-primary [&_a:hover]:underline`}>
              {p.coverage.codes.map((code) => {
                const href = codeInfo[code]?.href;
                return href ? (
                  <a key={code} href={href}>
                    {code}
                  </a>
                ) : (
                  <span key={code}>{code}</span>
                );
              })}
            </p>
          )}
        </details>
      ))}
  </div>
);

export function ProgramHubPage({
  page,
  codeInfo,
  faqs,
}: {
  page: ProgramPage;
  codeInfo: Record<string, CodeInfo>;
  faqs: [string, string][];
}) {
  const { hub, inForce, exemptions, scheduled, ended, codes, changes } = page;
  const facts = [
    { label: "Headings in force", value: inForce.length.toString() },
    { label: "HTS codes covered", value: codes.length > 0 ? codes.length.toLocaleString("en-US") : inForce.length > 0 ? "Every product from the countries named" : "None in force" },
    { label: "Rates", value: page.rateRange ?? "None in force" },
    { label: "Latest change", value: page.lastChange ? longDate(page.lastChange) : "None recorded" },
  ];
  const others = PROGRAM_HUBS.filter((h) => h.slug !== hub.slug);

  return (
    <div className={`${THEME} hts-tracker ${trackerSans.className} ${trackerDisplay.variable} w-full flex-1 flex flex-col bg-base-200 **:[[id]]:scroll-mt-24`}>
      <div className={`${mk.container} pt-8 pb-6`}>
        <nav aria-label="Breadcrumb" className="text-sm text-base-content/60">
          <Link href="/tariffs" className="hover:text-primary">
            US Tariff Programs
          </Link>{" "}
          / <span className="text-base-content">{hub.title}</span>
        </nav>

        <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_21rem]">
          <div className="flex min-w-0 flex-col gap-5">
            <div className={`${tt.panel} flex flex-col gap-3 p-6 lg:p-7`}>
              <span className={tt.eyebrow("primary")}>US Tariff Program · Updated {longDate(page.asOf)}</span>
              <h1 className={`${tt.display} m-0 text-3xl font-semibold leading-tight tracking-tight text-base-content lg:text-4xl`}>{hub.title}</h1>
              <p className="m-0 text-base leading-relaxed text-base-content/80">{hubLead(page)}</p>
              <p className={`${ui.bodySm} m-0`}>{hub.law}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <Link href="/duty-calculator" className={ui.button({ variant: "primary" })}>
                  Check a product&apos;s total duty
                  <ArrowRightIcon className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            </div>
            <FactGrid facts={facts} />
          </div>
          <div className="flex min-w-0 flex-col gap-4">
            <div className={`${tt.panel} flex flex-col gap-3 p-5`}>
              <span className={tt.eyebrow("primary")}>Tariff Tracker</span>
              <p className="m-0 text-sm text-base-content/80">
                No surprises: get alerted when a change to the {hub.short} hits one of your imports, and catch duty you may have overpaid.
              </p>
              <Link href={TRY_FREE_HREF} className={ui.button({ variant: "primary" })}>
                {TRY_IT_FREE}
                <ArrowRightIcon className="h-4 w-4" aria-hidden />
              </Link>
            </div>
            <NewsAlertsBox source="tariff-program-page" />
          </div>
        </div>

        <div id="check" className="mt-4">
          <CodeCheck program={{ slug: hub.slug, short: hub.short, country: hub.country }} />
        </div>
      </div>

      <div className={`${mk.container} flex flex-col gap-16 py-12 sm:gap-20 sm:py-16`}>
        {inForce.length > 0 && (
          <section id="headings" className={ui.section}>
            <SectionHeader wide kicker="In force" title="Chapter 99 Headings in Force">
              Each heading the {hub.short} use on {longDate(page.asOf)}, with the rate it adds, the countries it applies to and the documents behind it.
            </SectionHeader>
            <HeadingTable headings={inForce} codeInfo={codeInfo} />
          </section>
        )}

        {codes.length > 0 && (
          <section id="codes" className={ui.section}>
            <SectionHeader wide kicker="Coverage" title={`Every HTS Code Covered (${codes.length.toLocaleString("en-US")})`}>
              The codes the in-force headings list, from the U.S. notes to Chapter 99. A code covers every line under it, and a heading that takes
              precedence (an exemption, a deal rate) can switch it off for some goods. Whether a product is in scope also depends on the note&apos;s
              written description, which the importer or their customs broker decides.
            </SectionHeader>
            <CodesByHeading headings={inForce} codeInfo={codeInfo} withNames={showsCodeNames(page)} />
          </section>
        )}

        {exemptions.length > 0 && (
          <section id="exemptions" className={ui.section}>
            <SectionHeader wide kicker="Exemptions" title="Exemptions and Reporting Headings">
              Headings that add no {hub.short.replace(/ tariffs?$| surcharge$/, "")} duty: exemptions, reliefs and lines reported alongside another heading.
            </SectionHeader>
            <HeadingTable headings={exemptions} codeInfo={codeInfo} />
          </section>
        )}

        {scheduled.length > 0 && (
          <section id="scheduled" className={ui.section}>
            <SectionHeader wide kicker="Coming" title="Scheduled Headings" />
            <HeadingTable headings={scheduled} codeInfo={codeInfo} />
          </section>
        )}

        {changes.length > 0 && (
          <section id="changes" className={ui.section}>
            <SectionHeader wide kicker="Change log" title={`Changes to the ${hub.title.replace(/:.*$/, "")}`}>
              When each heading started or stopped applying, newest first, from our tariff data.
            </SectionHeader>
            <ol className={`${tt.panel} m-0 list-none divide-y divide-base-300 p-0`}>
              {changes.slice(0, 40).map((c, i) => (
                <li key={i} className="flex flex-col gap-1 px-5 py-3 sm:flex-row sm:items-baseline sm:gap-5">
                  <span className="w-44 shrink-0 text-sm font-medium tabular-nums text-base-content">{longDate(c.date)}</span>
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="flex flex-wrap items-center gap-2 text-sm text-base-content">
                      <CodeChip code={c.heading} href={codeInfo[c.heading]?.href ?? null} />
                      <span>
                        {c.kind === "start" ? "Started" : "Ended"}: {c.name}
                        {c.kind === "start" && <span className="font-semibold"> ({c.rate})</span>}
                      </span>
                    </span>
                    <SourceLinks sources={c.sources} />
                  </span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {ended.length > 0 && (
          <section id="ended" className={ui.section}>
            <SectionHeader wide kicker="History" title="Ended Headings">
              Headings no longer in force, with the dates they applied to goods entered. Duty on entries made while they were in force is still owed
              {hub.slug === "ieepa" ? ", unless it's refunded" : ""}.
            </SectionHeader>
            <HeadingTable headings={ended} ended codeInfo={codeInfo} />
          </section>
        )}

        {hub.slug === "ieepa" && ended[0]?.refund && (
          <section id="refunds" className={ui.section}>
            <SectionHeader kicker="Refunds" title="IEEPA Duty Refunds">
              {ended[0].refund.text}
            </SectionHeader>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/tariff-audit" className={ui.button({ variant: "primary" })}>
                Check your past entries
                <ArrowRightIcon className="h-4 w-4" aria-hidden />
              </Link>
              {ended[0].refund.links.map((link) => (
                <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" className={ui.link}>
                  {link.label}
                </a>
              ))}
            </div>
          </section>
        )}

        <section id="faq" className={ui.section}>
          <SectionHeader kicker="FAQ" title="Questions" />
          <div className={`${tt.panel} divide-y divide-base-300`}>
            {faqs.map(([q, a]) => (
              <div key={q} className="flex flex-col gap-2 px-5 py-4">
                <h3 className={`${tt.title} m-0 text-base`}>{q}</h3>
                <p className="m-0 text-sm leading-relaxed text-base-content/80">{a}</p>
              </div>
            ))}
          </div>
        </section>

        {page.sources.length > 0 && (
          <section id="sources" className={ui.section}>
            <SectionHeader kicker="Sources" title="Primary Sources">
              The legal documents behind the headings in force. Check the legal text before you file.
            </SectionHeader>
            <ul className={`${tt.panel} m-0 list-none divide-y divide-base-300 p-0`}>
              {page.sources.map((s) => (
                <li key={s.url ?? s.label} className="px-5 py-3 text-sm">
                  <span className="text-base-content/60">{s.publisher}: </span>
                  {s.url ? (
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className={ui.link}>
                      {s.label}
                    </a>
                  ) : (
                    s.label
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section id="other-programs" className={ui.section}>
          <SectionHeader wide kicker="More programs" title="Other US Tariff Programs" />
          <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((h) => (
              <li key={h.slug}>
                <Link href={hubPath(h)} className={`${tt.panel} flex h-full items-center justify-between gap-3 px-5 py-4 text-sm font-medium text-base-content transition-colors hover:text-primary`}>
                  {h.title}
                  <ArrowRightIcon className="h-4 w-4 shrink-0" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
