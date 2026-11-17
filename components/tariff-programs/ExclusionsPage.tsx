import Link from "next/link";
import { ArrowRightIcon, BellAlertIcon } from "@heroicons/react/20/solid";
import { longDate, sinceLabel } from "@/libs/tariff-programs/heading";
import { hubBySlug, hubPath } from "@/libs/tariff-programs/hubs";
import { exclusionsLead, noteOf, type ExclusionsPage as Page } from "@/libs/tariff-programs/exclusions";
import type { CodeInfo } from "@/libs/tariff-programs/codeLinks";
import type { PublicUpdate } from "@/libs/tariff-updates/public";
import { trackerDisplay, trackerSans } from "@/components/ui/font";
import { THEME } from "@/components/ui/theme";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { RowHeader, Table, TBody, Td, Th, THead, Tr } from "@/components/ui/table/Table";
import * as mk from "@/components/ui/marketing/styles";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { DigestButton } from "@/components/tariff-digest/DigestButton";
import { CodeChip, FactGrid, SourceLinks, StatusPill } from "./shared";

// /tariffs/section-301-exclusions: the USTR product exclusions from the Section 301 China duties,
// from the engine's data. The answer first (how many, until when), then the two exclusion headings
// and the headings they switch off, every excluded HTS code, the extension history (the headings'
// dated text plus the published tariff updates about them), an email sign-up, questions and
// sources. In Duty Guard's look, like the /tariffs program pages.

const DIGEST_SOURCE = "section-301-exclusions";
const CALCULATOR_HREF = "/duty-calculator/china";

const day = (iso: string) => longDate(iso.slice(0, 10));

export function ExclusionsPage({
  page,
  codeInfo,
  updates,
  faqs,
}: {
  page: Page;
  codeInfo: Record<string, CodeInfo>;
  updates: PublicUpdate[];
  faqs: [string, string][];
}) {
  const hub = hubBySlug("section-301-china");
  const inForce = page.headings.filter((p) => p.status === "in-force");
  const codeCount = new Set(page.rows.map((r) => r.code)).size;
  const described = page.rows.filter((r) => r.described).length;
  const notCurrent = page.rows.filter((r) => codeInfo[r.code]?.href !== `/hts/${r.code}`).length;
  const first = page.history.find((s) => !s.from);
  const subdivision = (heading: string) => noteOf(page.headings.find((p) => p.code === heading) ?? { legalText: "" });

  const facts = [
    { label: "Apply through", value: page.through ? `Goods entered by ${longDate(page.through)}` : "None in force" },
    { label: "Exclusions in force", value: page.exclusionCount && page.through ? page.exclusionCount.toString() : page.through ? "See the headings" : "None" },
    {
      label: "HTS codes covered",
      value: codeCount > 0 ? `${codeCount}${described > 0 ? ` (${described} for a described product only)` : ""}` : "None in force",
    },
    { label: "Exclusion headings", value: page.headings.map((p) => p.code).join(" and ") },
  ];

  return (
    <div className={`${THEME} hts-tracker ${trackerSans.className} ${trackerDisplay.variable} w-full flex-1 flex flex-col bg-base-200 **:[[id]]:scroll-mt-24`}>
      <div className={`${mk.container} pt-8 pb-6`}>
        <nav aria-label="Breadcrumb" className="text-sm text-base-content/60">
          <Link href="/tariffs" className="hover:text-primary">
            US Tariff Programs
          </Link>{" "}
          /{" "}
          {hub && (
            <>
              <Link href={hubPath(hub)} className="hover:text-primary">
                Section 301 China
              </Link>{" "}
              /{" "}
            </>
          )}
          <span className="text-base-content">Exclusions</span>
        </nav>

        <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_21rem]">
          <div className="flex min-w-0 flex-col gap-5">
            <div className={`${tt.panel} flex flex-col gap-3 p-6 lg:p-7`}>
              <span className={tt.eyebrow("primary")}>Section 301 China · Updated {longDate(page.asOf)}</span>
              <h1 className={`${tt.display} m-0 text-3xl font-semibold leading-tight tracking-tight text-base-content lg:text-4xl`}>
                Section 301 China Exclusions: Every HTS Code, Deadline &amp; Extension History
              </h1>
              <p className="m-0 text-base leading-relaxed text-base-content/80">{exclusionsLead(page)}</p>
              {hub && <p className={`${ui.bodySm} m-0`}>{hub.law}</p>}
              <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-3">
                <Link href={CALCULATOR_HREF} className={ui.button({ variant: "primary" })}>
                  Check a product&apos;s duty from China
                  <ArrowRightIcon className="h-4 w-4" aria-hidden />
                </Link>
                {hub && (
                  <Link href={hubPath(hub)} className={ui.link}>
                    Every Section 301 China heading and code
                  </Link>
                )}
              </div>
            </div>
            <FactGrid facts={facts} />
          </div>
          <div className="flex min-w-0 flex-col gap-4">
            <div className={`${tt.panel} flex flex-col gap-3 p-5`}>
              <span className={tt.eyebrow("primary")}>Deadline Alerts</span>
              <p className="m-0 flex items-start gap-3 text-base font-semibold leading-snug text-base-content">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary" aria-hidden>
                  <BellAlertIcon className="h-4.5 w-4.5" />
                </span>
                Get an Email if These Exclusions Are Extended or Expire
              </p>
              <p className="m-0 text-sm text-base-content/80">Free tariff news by email, including every USTR notice on the Section 301 exclusions.</p>
              <DigestButton source={DIGEST_SOURCE} />
            </div>
          </div>
        </div>
      </div>

      <div className={`${mk.container} flex flex-col gap-16 py-12 sm:gap-20 sm:py-16`}>
        <section id="headings" className={ui.section}>
          <SectionHeader wide kicker="Headings" title="The Two Exclusion Headings">
            Goods of China entered under one of these Chapter 99 headings owe no added Section 301 duty. Each heading&apos;s legal text, as it reads on{" "}
            {longDate(page.asOf)}.
          </SectionHeader>
          <div className={`${tt.panel} overflow-hidden`}>
            <Table framed={false} valign="top">
              <THead>
                <Tr>
                  <Th>Heading</Th>
                  <Th>What It Covers</Th>
                  <Th>Codes</Th>
                  <Th>Applies</Th>
                </Tr>
              </THead>
              <TBody>
                {page.headings.map((p) => (
                  <Tr key={p.code}>
                    <Td>
                      <span className="flex flex-col items-start gap-2">
                        <CodeChip code={p.code} href={codeInfo[p.code]?.href ?? null} />
                        <StatusPill status={p.status} />
                      </span>
                    </Td>
                    <RowHeader className="text-base-content">
                      <span className="block font-medium">{p.name}</span>
                      <span className="mt-1 block text-sm text-base-content/80">{p.legalText}</span>
                      <span className="mt-1 block">
                        <SourceLinks sources={p.sources} />
                      </span>
                    </RowHeader>
                    <Td className="whitespace-nowrap text-base-content/80">{p.coverage.codes.length}</Td>
                    <Td className="whitespace-nowrap tabular-nums text-base-content/80">
                      {sinceLabel(p)}
                      {p.endsOn && <> – {longDate(page.through && p.status === "in-force" ? page.through : p.endsOn)}</>}
                    </Td>
                  </Tr>
                ))}
              </TBody>
            </Table>
          </div>
          {page.overridden.length > 0 && (
            <>
              <h3 className={`${tt.title} m-0 mt-4`}>The Section 301 Duties They Switch Off</h3>
              <p className={`${ui.bodySm} m-0`}>
                Each of these headings applies &quot;except as provided in&quot; the exclusion headings named next to it, so an excluded product doesn&apos;t owe its rate.
              </p>
              <div className={`${tt.panel} overflow-hidden`}>
                <Table framed={false}>
                  <THead>
                    <Tr>
                      <Th>Heading</Th>
                      <Th>Name</Th>
                      <Th>Rate Excluded</Th>
                      <Th>Switched Off By</Th>
                    </Tr>
                  </THead>
                  <TBody>
                    {page.overridden.map((o) => (
                      <Tr key={o.code}>
                        <Td>
                          <CodeChip code={o.code} href={codeInfo[o.code]?.href ?? null} />
                        </Td>
                        <RowHeader className="font-medium text-base-content">{o.name}</RowHeader>
                        <Td className="whitespace-nowrap font-semibold text-base-content">{o.rate}</Td>
                        <Td className="text-base-content/80">{o.exceptedBy.join(", ")}</Td>
                      </Tr>
                    ))}
                  </TBody>
                </Table>
              </div>
            </>
          )}
        </section>

        {page.rows.length > 0 && (
          <section id="codes" className={ui.section}>
            <SectionHeader wide kicker="Exclusion list" title={`Every Excluded HTS Code (${codeCount})`}>
              The statistical numbers the U.S. notes list for each exclusion heading, in HTS order.
              {described > 0 &&
                ` For ${described} of them the exclusion covers only the product the note describes, which is part of the goods under that line: the goods must match the description to qualify.`}
              {notCurrent > 0 &&
                ` ${notCurrent} ${notCurrent === 1 ? "is a number" : "are numbers"} the note still lists that ${notCurrent === 1 ? "is" : "are"} no longer a line in the current HTS; ${notCurrent === 1 ? "it links" : "they link"} to the nearest current line.`}
            </SectionHeader>
            <div className={`${tt.panel} overflow-hidden`}>
              <Table framed={false} valign="top">
                <THead>
                  <Tr>
                    <Th>HTS Code</Th>
                    <Th>Product</Th>
                    <Th>Heading</Th>
                    <Th>Excluded</Th>
                  </Tr>
                </THead>
                <TBody>
                  {page.rows.map((r) => {
                    const info = codeInfo[r.code];
                    const note = subdivision(r.heading);
                    return (
                      <Tr key={`${r.code}-${r.heading}`}>
                        <Td>
                          <CodeChip code={r.code} href={info?.href ?? null} />
                        </Td>
                        <RowHeader className="text-base-content">
                          {info?.name ?? <span className="text-base-content/60">No current HTS line</span>}
                          {info?.href && info.href !== `/hts/${r.code}` && (
                            <span className="mt-0.5 block text-xs text-base-content/60">Not a line in the current HTS</span>
                          )}
                        </RowHeader>
                        <Td className="whitespace-nowrap text-base-content/80">{r.heading}</Td>
                        <Td className="text-base-content/80">
                          {r.described ? `Only the product described in U.S. note ${note ?? "20"}, part of this line` : "The whole statistical line"}
                        </Td>
                      </Tr>
                    );
                  })}
                </TBody>
              </Table>
            </div>
          </section>
        )}

        {page.history.length > 0 && (
          <section id="history" className={ui.section}>
            <SectionHeader wide kicker="Extension history" title="When the Exclusions Were Extended">
              Each version of the headings&apos; text in our tariff data, newest first, with the notice behind it.
              {first?.revision && ` Our data starts with HTS ${first.revision}; extensions before it aren't recorded here.`}
              {inForce.length > 0 &&
                ` ${inForce.map((p) => `${p.code} has applied since ${p.startedOn ? longDate(p.startedOn) : sinceLabel(p)}`).join("; ")}.`}
            </SectionHeader>
            <ol className={`${tt.panel} m-0 list-none divide-y divide-base-300 p-0`}>
              {page.history.map((s) => (
                <li key={`${s.from ?? "first"}-${s.through}`} className="flex flex-col gap-1 px-5 py-3 sm:flex-row sm:items-baseline sm:gap-5">
                  <span className="w-56 shrink-0 text-sm font-medium tabular-nums text-base-content">
                    {s.from ? `From ${longDate(s.from)}` : s.revision ? `In HTS ${s.revision}` : "Earliest recorded"}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="text-sm text-base-content">
                      {s.from ? "Extended: the headings read " : "The headings read "}
                      <span className="font-semibold">&quot;through {s.textDate ?? longDate(s.through)}&quot;</span>
                      {` (${s.headings.join(" and ")})`}
                      {s.through === page.through && " · In force now"}
                    </span>
                    <SourceLinks sources={s.sources} />
                  </span>
                </li>
              ))}
            </ol>
            {updates.length > 0 && (
              <>
                <h3 className={`${tt.title} m-0 mt-4`}>Tariff Updates on These Exclusions</h3>
                <ul className={`${tt.panel} m-0 list-none divide-y divide-base-300 p-0`}>
                  {updates.map((u) => (
                    <li key={u.slug}>
                      <Link href={`/tariff-updates/${u.slug}`} className="flex flex-col gap-1 px-5 py-3 transition-colors hover:bg-tt-soft sm:flex-row sm:items-baseline sm:gap-5">
                        <span className="w-56 shrink-0 text-sm tabular-nums text-base-content/70">{day(u.first_seen_at)}</span>
                        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <span className="text-sm font-semibold text-base-content">{u.title}</span>
                          {u.effective_on && <span className="text-xs text-base-content/60">Effective {day(u.effective_on)}</span>}
                        </span>
                        <ArrowRightIcon className="hidden h-4 w-4 shrink-0 self-center text-base-content/60 sm:block" aria-hidden />
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        )}

        <section id="alerts" className={`${tt.panel} flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between lg:p-7`}>
          <div className="flex flex-col gap-1">
            <h2 className={`${tt.title} m-0`}>Get an Email if These Exclusions Are Extended or Expire</h2>
            <p className="m-0 text-sm text-base-content/80">
              {page.through
                ? `They apply through ${longDate(page.through)}. We send the USTR notice as soon as it is published, free.`
                : "We send every USTR notice on Section 301 exclusions as soon as it is published, free."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <DigestButton source={DIGEST_SOURCE} />
            <Link href={CALCULATOR_HREF} className={ui.link}>
              Check a product&apos;s duty from China
            </Link>
          </div>
        </section>

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
              The legal documents behind the exclusions in force. Check the legal text before you file.
            </SectionHeader>
            <ul className={`${tt.panel} m-0 list-none divide-y divide-base-300 p-0`}>
              {page.sources.map((s, i) => (
                <li key={`${i}-${s.url ?? s.label}`} className="px-5 py-3 text-sm">
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
      </div>
    </div>
  );
}
