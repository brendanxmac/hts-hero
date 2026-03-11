import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getHtsElementsServer,
  getHtsSectionsServer,
  getSectionAndChapterForElement,
} from "../../../libs/hts-server";
import { HtsElement, HtsSection } from "../../../interfaces/hts";
import config from "@/config";
import { HtsPageShell } from "../../../components/hts-page/HtsPageShell";
import { PlaybookBanner } from "../../../components/hts-page/PlaybookBanner";
import { CtaGrid } from "../../../components/hts-page/CtaGrid";
import { ChildrenList } from "../../../components/hts-page/ChildrenList";

interface ChapterPageProps {
  params: { chapterNumber: string };
}

export async function generateStaticParams() {
  const sections = await getHtsSectionsServer();
  const params: { chapterNumber: string }[] = [];
  for (const section of sections) {
    for (const chapter of section.chapters) {
      params.push({ chapterNumber: String(chapter.number) });
    }
  }
  return params;
}

export async function generateMetadata({ params }: ChapterPageProps): Promise<Metadata> {
  const sections = await getHtsSectionsServer();
  const chapterNum = Number(params.chapterNumber);
  const { section, chapter } = findChapter(sections, chapterNum) || {};

  if (!section || !chapter) {
    return { title: "HTS Chapter Not Found | HTS Hero" };
  }

  const title = `HTS Chapter ${chapter.number}: ${chapter.description} | US Tariff Classification`;
  const description = `Browse HTS Chapter ${chapter.number} (${chapter.description}) in Section ${toRoman(section.number)} (${section.description}) of the US Harmonized Tariff Schedule. Find HTS codes, duty rates, and tariff classifications.`;

  return {
    title,
    description,
    keywords: [
      `HTS Chapter ${chapter.number}`,
      `Chapter ${chapter.number} tariff`,
      chapter.description,
      `${chapter.description} HTS codes`,
      `Section ${section.number}`,
      "harmonized tariff schedule",
      "HTS classification",
      "US tariff code",
    ],
    openGraph: {
      title: `HTS Chapter ${chapter.number}: ${chapter.description}`,
      description,
      url: `https://${config.domainName}/chapter/${chapter.number}`,
      siteName: "HTS Hero",
      type: "website",
    },
    alternates: { canonical: `/chapter/${chapter.number}` },
  };
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const sections = await getHtsSectionsServer();
  const elements = await getHtsElementsServer();
  const chapterNum = Number(params.chapterNumber);
  const found = findChapter(sections, chapterNum);

  if (!found) notFound();

  const { section, chapter } = found;
  const chapterElements = elements.filter((el) => el.chapter === chapterNum);
  const topLevelElements = chapterElements.filter((el) => el.indent === "0");
  const siblingChapters = section.chapters.filter((c) => c.number !== chapterNum);

  return (
    <main className="w-full min-h-screen bg-base-100">
      <HtsPageShell
        bannerMessage="Looking for the right HTS code for your product?"
        breadcrumbs={[
          { label: `Section ${toRoman(section.number)}`, href: `/section/${section.number}` },
          { label: `Chapter ${chapter.number}` },
        ]}
      >
        <ChapterContent
          section={section}
          chapter={chapter}
          topLevelElements={topLevelElements}
          siblingChapters={siblingChapters}
        />
      </HtsPageShell>
    </main>
  );
}

function ChapterContent({
  section,
  chapter,
  topLevelElements,
  siblingChapters,
}: {
  section: HtsSection;
  chapter: { number: number; description: string };
  topLevelElements: HtsElement[];
  siblingChapters: { number: number; description: string }[];
}) {
  const roman = toRoman(section.number);

  return (
    <>
      {/* Hero */}
      <section className="relative rounded-2xl bg-gradient-to-br from-primary/[0.07] via-base-200/60 to-secondary/[0.05] border border-primary/15 p-6 sm:p-8 md:p-10 mb-8">
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-3">
          <h1 className="flex flex-col gap-1.5">
            <span className="text-primary text-2xl md:text-3xl lg:text-4xl font-bold tracking-wide">
              Chapter {chapter.number}
            </span>
            <span className="text-lg md:text-xl lg:text-2xl text-base-content font-semibold leading-snug max-w-4xl">
              {chapter.description}
            </span>
            <span className="text-[11px] text-base-content/25 font-medium tracking-wider uppercase mt-0.5">
              US Harmonized Tariff Schedule
            </span>
          </h1>

          <h2 className="text-xs sm:text-sm text-base-content/40 font-medium">
            U.S. Import Duty, Tariffs, and Classification Details for Chapter {chapter.number}
          </h2>

          <h3 className="text-sm text-base-content/50 leading-relaxed max-w-4xl">
            {chapter.description}, classified under{" "}
            <Link href={`/section/${section.number}`} className="text-primary/70 hover:text-primary hover:underline transition-colors">
              Section {roman}
            </Link>
            <span className="text-base-content/40"> ({section.description})</span>
            {" "}in the Harmonized Tariff Schedule
            {topLevelElements.length > 0 && (
              <> — covering {topLevelElements.length} heading{topLevelElements.length !== 1 ? "s" : ""}</>
            )}
            .
          </h3>

          {siblingChapters.length > 0 && (
            <div className="mt-2">
              <h2 className="text-xs font-bold text-base-content/40 uppercase tracking-wider mb-2">
                Other Chapters in Section {roman}
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {siblingChapters.map((c) => (
                  <Link
                    key={c.number}
                    href={`/chapter/${c.number}`}
                    className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-base-100/80 border border-base-content/10 hover:border-primary/30 hover:bg-primary/5 transition-all"
                    title={c.description}
                  >
                    <span className="text-xs font-bold text-primary group-hover:underline">Ch. {c.number}</span>
                    <span className="text-xs text-base-content/40 max-w-[180px] truncate">{c.description}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Top-level headings */}
      <ChildrenList
        title={`HTS Headings in Chapter ${chapter.number}`}
        items={topLevelElements.map((el) => ({
          uuid: el.uuid,
          code: el.htsno || undefined,
          label: el.htsno ? undefined : "—",
          description: el.description,
          href: el.htsno ? `/hts/${el.htsno}` : `/explore`,
        }))}
      />

      <PlaybookBanner />
      <CtaGrid contextLabel={`Chapter ${chapter.number} Codes`} />
    </>
  );
}

function findChapter(sections: HtsSection[], chapterNumber: number) {
  for (const section of sections) {
    const chapter = section.chapters.find((c) => c.number === chapterNumber);
    if (chapter) return { section, chapter };
  }
  return null;
}

function toRoman(num: number): string {
  const romanNumerals: [number, string][] = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
    [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let result = "";
  let remaining = num;
  for (const [value, symbol] of romanNumerals) {
    while (remaining >= value) {
      result += symbol;
      remaining -= value;
    }
  }
  return result;
}
