import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import { getFirstChapterOfSection } from "@/libs/hts";
import type { HtsDutySummary } from "@/libs/hts-duty-summary";
import {
  CENSUS_TRADE_DATA_URL,
  cbpRulingsUrl,
  headingSources,
  htsChapterPdfUrl,
  htsEntryUrl,
  legalSources,
  type OfficialSource,
} from "@/libs/official-sources";
import { SectionHeader } from "@/components/ui/SectionHeader";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";

// The primary sources behind this page, linked straight to the publisher: the line in the USITC's
// schedule, its chapter (and section) notes, the legal documents behind each Chapter 99 duty shown,
// CBP's rulings and the Census import data
export function Sources({
  htsno,
  chapter,
  sectionNumber,
  summaries,
  hasImports,
}: {
  htsno: string;
  chapter?: number | null;
  sectionNumber?: number | null;
  summaries: (HtsDutySummary | null | undefined)[];
  hasImports: boolean;
}) {
  const asOf = summaries.find(Boolean)?.asOf ?? new Date().toISOString().slice(0, 10);
  const revision = summaries.find(Boolean)?.revision.title;
  const sectionNoteChapter = sectionNumber ? getFirstChapterOfSection(sectionNumber) : null;
  const ownHeading = htsno.startsWith("99") ? headingSources(htsno, asOf) : [];

  const sources: OfficialSource[] = [
    { publisher: "USITC", label: `Harmonized Tariff Schedule of the United States: ${htsno}${revision ? `, ${revision}` : ""}`, url: htsEntryUrl(htsno) },
    ...(chapter
      ? [{ publisher: "USITC", label: `HTS Chapter ${chapter}, with its notes (PDF)`, url: htsChapterPdfUrl(chapter) }]
      : []),
    ...(sectionNumber && sectionNoteChapter && sectionNoteChapter !== chapter
      ? [{ publisher: "USITC", label: `HTS Section ${sectionNumber} notes, printed with Chapter ${sectionNoteChapter} (PDF)`, url: htsChapterPdfUrl(sectionNoteChapter) }]
      : []),
    ...ownHeading.map((s) => ({ ...s, label: `Heading ${htsno}: ${s.label}` })),
    ...legalSources(summaries.flatMap((s) => s?.rows.flatMap((r) => r.additional) ?? [])),
    ...(htsno.startsWith("99") ? [] : [{ publisher: "CBP", label: `CROSS classification rulings for ${htsno}`, url: cbpRulingsUrl(htsno) }]),
    ...(hasImports ? [{ publisher: "U.S. Census Bureau", label: "U.S. general imports by HTS code and country", url: CENSUS_TRADE_DATA_URL }] : []),
  ];

  return (
    <section id="sources" className="scroll-mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-12">
      <SectionHeader kicker="Sources" title="Primary Sources">
        The official documents behind the rates and tariffs on this page. Duties are worked out from them
        {revision ? ` as of ${revision}` : ""}; check the legal text before you file.
      </SectionHeader>
      <ul className={`${tt.panel} m-0 list-none divide-y divide-base-300 p-0`}>
        {sources.map((source) => (
          <li key={`${source.publisher}-${source.label}`} className="flex items-start gap-3 px-5 py-3.5">
            <span className="min-w-0 flex-1">
              <span className={`${ui.caption} block`}>{source.publisher}</span>
              {source.url ? (
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-base-content underline decoration-base-content/20 underline-offset-2 hover:text-primary hover:decoration-primary/40"
                >
                  {source.label}
                </a>
              ) : (
                <span className="text-sm font-medium text-base-content">{source.label}</span>
              )}
            </span>
            {source.url && <ArrowTopRightOnSquareIcon className="mt-5 h-4 w-4 shrink-0 text-base-content/50" aria-hidden />}
          </li>
        ))}
      </ul>
    </section>
  );
}
