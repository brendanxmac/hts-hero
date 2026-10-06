import { HTS_HERO, ROUNDUP_SLUG, alternativesTo, vsSlug } from "@/libs/compare/pages";
import type { AlternativesContent, Tool } from "@/libs/compare/types";
import { SourceList } from "@/components/blog";
import { FaqList } from "@/components/ui/FaqList";
import { SectionHeader } from "@/components/ui/SectionHeader";
import * as ui from "@/components/ui/styles";
import { IntegrationCta } from "../cta/IntegrationCta";
import { SelfServeCta } from "../cta/SelfServeCta";
import { CompareHero } from "../layout/CompareHero";
import { FeatureMatrix } from "../matrix/FeatureMatrix";
import { RankedToolCard } from "../ranked/RankedToolCard";
import { ComparisonLinks } from "../shared/ComparisonLinks";
import { CompareStructuredData } from "../shared/CompareStructuredData";
import { Disclosure } from "../shared/Disclosure";
import { ReasonsList } from "../ranked/ReasonsList";

// /compare/[tool]-alternatives: why people switch, the alternatives ranked with HTS Hero
// first, how they compare with the tool itself, and questions
export function AlternativesPage({
  slug,
  title,
  tool,
  content,
}: {
  slug: string;
  title: string;
  tool: Tool;
  content: AlternativesContent;
}) {
  const ranked = [HTS_HERO, ...alternativesTo(tool)];
  const vsHref = (t: Tool) => (t.vs ? `/compare/${vsSlug(t)}` : undefined);
  const sources = [...tool.sources, ...ranked.flatMap((t) => t.sources)].filter(
    (s, i, all) => all.findIndex((o) => o.url === s.url) === i
  );
  return (
    <>
      <CompareStructuredData
        slug={slug}
        title={title}
        description={content.intro}
        dateModified={tool.checkedAt}
        faqs={content.faqs}
        ranked={ranked}
      />
      <CompareHero crumb={title} kicker="Alternatives" title={title} lead={content.intro} checkedAt={tool.checkedAt} />

      <div className={`${ui.container} ${ui.bandPadding} flex flex-col gap-16 sm:gap-20`}>
        <section className={`${ui.section} max-w-4xl`}>
          <SectionHeader kicker="Why switch" title={`Why people look for ${tool.name} alternatives`} />
          <ReasonsList reasons={content.reasons} />
        </section>

        <section className={ui.section}>
          <SectionHeader kicker="The list" title={`${ranked.length} ${tool.name} alternatives, ranked`}>
            Ranked by how completely each one answers a US importer&apos;s real question: what does this import owe,
            and why.
          </SectionHeader>
          <div className="flex flex-col gap-6">
            {ranked.map((t, i) => (
              <RankedToolCard key={t.slug} tool={t} rank={i + 1} vsHref={vsHref(t)} />
            ))}
          </div>
        </section>

        <section className={ui.section}>
          <SectionHeader kicker="Side by side" title={`How they compare with ${tool.name}`} />
          <FeatureMatrix tools={[HTS_HERO, tool, ...alternativesTo(tool, 3)]} linkFor={vsHref} />
        </section>

        <IntegrationCta />
      </div>

      <div className={ui.band}>
        <div className={`${ui.container} ${ui.bandPadding}`}>
          <SelfServeCta title={`Looking past ${tool.name}? Try HTS Hero free.`} />
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
            <SectionHeader kicker="More comparisons" title="Keep comparing" />
            <ComparisonLinks
              links={[
                {
                  href: `/compare/${ROUNDUP_SLUG}`,
                  title: "The best US tariff calculators in 2026",
                  caption: "Every tool, ranked and compared",
                },
                ...(tool.vs
                  ? [{ href: `/compare/${vsSlug(tool)}`, title: `HTS Hero vs ${tool.name}`, caption: "Head-to-head comparison" }]
                  : []),
              ]}
            />
          </section>

          <div className="flex max-w-4xl flex-col gap-5">
            <Disclosure checkedAt={tool.checkedAt} />
            <SourceList sources={sources} />
          </div>
        </div>
      </div>
    </>
  );
}
