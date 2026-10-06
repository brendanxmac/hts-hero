import { HTS_HERO, ROUNDUP_SLUG, COMPETITORS, vsSlug } from "@/libs/compare/pages";
import type { Tool, VsContent } from "@/libs/compare/types";
import { SourceList } from "@/components/blog";
import { FaqList } from "@/components/ui/FaqList";
import { SectionHeader } from "@/components/ui/SectionHeader";
import * as ui from "@/components/ui/styles";
import { IntegrationCta } from "../cta/IntegrationCta";
import { SelfServeCta } from "../cta/SelfServeCta";
import { CompareHero } from "../layout/CompareHero";
import { FeatureMatrix } from "../matrix/FeatureMatrix";
import { ComparisonLinks } from "../shared/ComparisonLinks";
import { CompareStructuredData } from "../shared/CompareStructuredData";
import { Disclosure } from "../shared/Disclosure";
import { AtAGlance } from "../vs/AtAGlance";
import { PricingSideBySide } from "../vs/PricingSideBySide";
import { VerdictCards } from "../vs/VerdictCards";

// /compare/hts-hero-vs-[tool]: the verdict, who each suits, the feature table, the
// differences that matter, pricing, questions, and the self-serve call to action
export function VsPage({ slug, tool, content }: { slug: string; tool: Tool; content: VsContent }) {
  const title = `HTS Hero vs ${tool.name}`;
  const others = COMPETITORS.filter((t) => t.vs && t.slug !== tool.slug);
  return (
    <>
      <CompareStructuredData
        slug={slug}
        title={title}
        description={content.verdict}
        dateModified={tool.checkedAt}
        faqs={content.faqs}
      />
      <CompareHero
        crumb={title}
        kicker="Comparison"
        title={title}
        lead={content.verdict}
        checkedAt={tool.checkedAt}
        aside={<AtAGlance ours={HTS_HERO} theirs={tool} />}
      />

      <div className={`${ui.container} ${ui.bandPadding} flex flex-col gap-16 sm:gap-20`}>
        <section className={ui.section}>
          <SectionHeader kicker="The short answer" title={`Which should you use?`} />
          <VerdictCards theirName={tool.name} chooseUs={content.chooseHtsHero} chooseThem={content.chooseThem} />
        </section>

        <section className={ui.section}>
          <SectionHeader kicker="Features" title={`HTS Hero and ${tool.name}, feature by feature`}>
            What each tool offers a US importer, from its public website.
          </SectionHeader>
          <FeatureMatrix tools={[HTS_HERO, tool]} />
        </section>

        <section className={`${ui.section} max-w-4xl`}>
          <SectionHeader kicker="Key differences" title="What actually sets them apart" />
          <div className="flex flex-col gap-8">
            {content.differences.map((d) => (
              <div key={d.title} className="flex flex-col gap-2">
                <h3 className={ui.subsectionTitle}>{d.title}</h3>
                <p className={`${ui.body} max-w-prose`}>{d.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={ui.section}>
          <SectionHeader kicker="Pricing" title="What each one costs" />
          <PricingSideBySide tools={[HTS_HERO, tool]} />
        </section>

        <IntegrationCta />
      </div>

      <div className={ui.band}>
        <div className={`${ui.container} ${ui.bandPadding}`}>
          <SelfServeCta title={`Switching from ${tool.name}? Try HTS Hero free.`} />
        </div>
      </div>

      <div className={ui.band}>
        <div className={`${ui.container} ${ui.bandPadding} flex flex-col gap-16 sm:gap-20`}>
          <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-12">
            <div className="lg:sticky lg:top-6 lg:self-start">
              <SectionHeader kicker="FAQ" title="Questions" />
            </div>
            <FaqList faqs={content.faqs} openFirst />
          </section>

          <section className={ui.section}>
            <SectionHeader kicker="More comparisons" title="Compare HTS Hero with other tools" />
            <ComparisonLinks
              links={[
                {
                  href: `/compare/${ROUNDUP_SLUG}`,
                  title: "The best US tariff calculators in 2026",
                  caption: `${COMPETITORS.length + 1} tools, ranked and compared`,
                },
                ...others.map((t) => ({ href: `/compare/${vsSlug(t)}`, title: `HTS Hero vs ${t.name}`, caption: t.kind })),
              ]}
            />
          </section>

          <div className="flex max-w-4xl flex-col gap-5">
            <Disclosure checkedAt={tool.checkedAt} />
            <SourceList sources={[...tool.sources, ...HTS_HERO.sources]} />
          </div>
        </div>
      </div>
    </>
  );
}
