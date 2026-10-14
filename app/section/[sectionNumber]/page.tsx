import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getHtsSectionsServer } from "../../../libs/hts-server";
import { HtsSection } from "../../../interfaces/hts";
import config from "@/config";
import { HtsPageShell } from "../../../components/hts-page/HtsPageShell";
import { PlaybookCard } from "@/components/hts-code-page/PlaybookCard";
import { CtaGrid } from "../../../components/hts-page/CtaGrid";
import { ChildrenList } from "../../../components/hts-page/ChildrenList";

interface SectionPageProps {
  params: { sectionNumber: string };
}

export async function generateStaticParams() {
  const sections = await getHtsSectionsServer();
  return sections.map((s) => ({ sectionNumber: String(s.number) }));
}

export async function generateMetadata({ params }: SectionPageProps): Promise<Metadata> {
  const sections = await getHtsSectionsServer();
  const section = sections.find((s) => s.number === Number(params.sectionNumber));

  if (!section) {
    return { title: "HTS Section Not Found | HTS Hero" };
  }

  const title = `HTS Section ${toRoman(section.number)}: ${section.description} | US Tariff Classification`;
  const description = `Browse HTS Section ${toRoman(section.number)} (${section.description}) of the US Harmonized Tariff Schedule. Covers ${section.chapters.length} chapter${section.chapters.length !== 1 ? "s" : ""} including ${section.chapters.slice(0, 3).map((c) => c.description).join(", ")}${section.chapters.length > 3 ? ", and more" : ""}.`;

  return {
    title,
    description,
    keywords: [
      `HTS Section ${section.number}`,
      `HTS Section ${toRoman(section.number)}`,
      section.description,
      "harmonized tariff schedule",
      "HTS classification",
      "US tariff code",
      ...section.chapters.slice(0, 5).map((c) => c.description),
    ],
    openGraph: {
      title: `HTS Section ${toRoman(section.number)}: ${section.description}`,
      description,
      url: `https://${config.domainName}/section/${section.number}`,
      siteName: "HTS Hero",
      type: "website",
    },
    alternates: { canonical: `/section/${section.number}` },
  };
}

export default async function SectionPage({ params }: SectionPageProps) {
  const sections = await getHtsSectionsServer();
  const sectionNum = Number(params.sectionNumber);
  const section = sections.find((s) => s.number === sectionNum);

  if (!section) notFound();

  const siblings = sections.filter((s) => s.number !== sectionNum);

  return (
    <main className="w-full flex-1 bg-base-200">
      <HtsPageShell
        breadcrumbs={[
          { label: `Section ${toRoman(section.number)}` },
        ]}
      >
        <SectionContent section={section} siblings={siblings} />
      </HtsPageShell>
    </main>
  );
}

function SectionContent({ section, siblings }: { section: HtsSection; siblings: HtsSection[] }) {
  const roman = toRoman(section.number);

  return (
    <>
      {/* Hero */}
      <section className="rounded-[28px] border border-base-300 bg-base-100 p-7 sm:p-10 mb-4">
        <div className="flex flex-col gap-3">
          <h1 className="flex flex-col gap-1.5">
            <span className="text-primary text-3xl lg:text-4xl font-semibold tracking-tight [font-family:var(--font-tracker-display)]">
              Section {roman}
            </span>
            <span className="text-lg md:text-xl lg:text-2xl text-base-content font-semibold leading-snug max-w-4xl [font-family:var(--font-tracker-display)]">
              {section.description}
            </span>
            <span className="text-xs text-base-content/60 font-bold tracking-wider uppercase mt-1">
              US Harmonized Tariff Schedule
            </span>
          </h1>

          <h2 className="text-sm text-base-content/60 font-medium">
            U.S. Import Tariff Classifications for HTS Section {roman}
          </h2>

          <h3 className="text-sm text-base-content/70 leading-relaxed max-w-4xl">
            {section.description}, covering {section.chapters.length} chapter{section.chapters.length !== 1 ? "s" : ""} (
            {section.chapters.slice(0, 4).map((c, i, arr) => (
              <span key={c.number}>
                <Link href={`/chapter/${c.number}`} className="text-primary hover:underline">
                  Chapter {c.number}
                </Link>
                {i < arr.length - 1 ? ", " : ""}
              </span>
            ))}
            {section.chapters.length > 4 && <>, and {section.chapters.length - 4} more</>}
            ) in the Harmonized Tariff Schedule.
          </h3>

          {siblings.length > 0 && (
            <div className="mt-2">
              <h2 className="text-xs font-bold text-base-content/60 uppercase tracking-wider mb-2">
                Other HTS Sections
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {siblings.map((s) => (
                  <Link
                    key={s.number}
                    href={`/section/${s.number}`}
                    className="group inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-tt-soft hover:bg-primary/10 transition-colors"
                    title={s.description}
                  >
                    <span className="text-xs font-bold text-primary group-hover:underline">Section {toRoman(s.number)}</span>
                    <span className="text-xs text-base-content/60 max-w-[180px] truncate">{s.description}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Chapters list */}
      <ChildrenList
        title={`Chapters in Section ${roman}`}
        items={section.chapters.map((ch) => ({
          uuid: `ch-${ch.number}`,
          code: `Ch. ${ch.number}`,
          description: ch.description,
          href: `/chapter/${ch.number}`,
        }))}
      />

      <div className="mt-12"><PlaybookCard /></div>
      <CtaGrid contextLabel={`Section ${roman} Codes`} />
    </>
  );
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
