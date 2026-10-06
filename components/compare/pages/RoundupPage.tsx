import { COMPETITORS, HTS_HERO, ROUNDUP_SLUG, vsSlug } from "@/libs/compare/pages";
import type { Tool } from "@/libs/compare/types";
import { SourceList } from "@/components/blog";
import { FaqList } from "@/components/ui/FaqList";
import { SectionHeader } from "@/components/ui/SectionHeader";
import * as ui from "@/components/ui/styles";
import { IntegrationCta } from "../cta/IntegrationCta";
import { SelfServeCta } from "../cta/SelfServeCta";
import { CompareHero } from "../layout/CompareHero";
import { FeatureMatrix } from "../matrix/FeatureMatrix";
import { RankedToolCard } from "../ranked/RankedToolCard";
import { CompareStructuredData } from "../shared/CompareStructuredData";
import { Disclosure } from "../shared/Disclosure";
import { CRITERIA, QUICK_PICKS, ROUNDUP_FAQS, ROUNDUP_LEAD } from "../roundup/roundupContent";
import { QuickPicks } from "../roundup/QuickPicks";

export const ROUNDUP_TITLE = "The Best US Tariff Calculators in 2026";

// /compare/best-us-tariff-calculators: quick picks, how we ranked, every tool ranked, the
// feature table for the leaders, and questions
export function RoundupPage() {
  const ranked = [HTS_HERO, ...COMPETITORS];
  const checkedAt = ranked.map((t) => t.checkedAt).sort()[0];
  const vsHref = (t: Tool) => (t.vs ? `/compare/${vsSlug(t)}` : undefined);
  const sources = ranked.flatMap((t) => t.sources).filter((s, i, all) => all.findIndex((o) => o.url === s.url) === i);
  const picks = QUICK_PICKS.map((p) => ({ ...p, tool: ranked.find((t) => t.slug === p.slug) })).filter(
    (p): p is typeof p & { tool: Tool } => !!p.tool
  );
  return (
    <>
      <CompareStructuredData
        slug={ROUNDUP_SLUG}
        title={ROUNDUP_TITLE}
        description={ROUNDUP_LEAD}
        dateModified={checkedAt}
        faqs={ROUNDUP_FAQS}
        ranked={ranked}
      />
      <CompareHero
        crumb="Best US tariff calculators"
        kicker={`${ranked.length} tools compared`}
        title={ROUNDUP_TITLE}
        lead={ROUNDUP_LEAD}
        checkedAt={checkedAt}
        aside={<QuickPicks picks={picks} />}
      />

      <div className={`${ui.container} ${ui.bandPadding} flex flex-col gap-16 sm:gap-20`}>
        <section className={ui.section}>
          <SectionHeader kicker="How we ranked" title="What makes a tariff calculator good">
            Five questions decide whether a calculator&apos;s number is one you can price, file or audit against.
          </SectionHeader>
          <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {CRITERIA.map((c, i) => (
              <li key={c.title} className={`${ui.card} flex flex-col gap-2 p-5`}>
                <span className={`${ui.label} tabular-nums`}>{String(i + 1).padStart(2, "0")}</span>
                <h3 className={ui.cardTitle}>{c.title}</h3>
                <p className={ui.bodySm}>{c.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className={ui.section}>
          <SectionHeader kicker="The rankings" title={`${ranked.length} US tariff calculators, ranked`} />
          <div className="flex flex-col gap-6">
            {ranked.map((t, i) => (
              <RankedToolCard key={t.slug} tool={t} rank={i + 1} vsHref={vsHref(t)} />
            ))}
          </div>
        </section>

        <section className={ui.section}>
          <SectionHeader kicker="Side by side" title="The leaders, feature by feature" />
          <FeatureMatrix tools={ranked.slice(0, 5)} linkFor={vsHref} />
        </section>

        <IntegrationCta />
      </div>

      <div className={ui.band}>
        <div className={`${ui.container} ${ui.bandPadding}`}>
          <SelfServeCta />
        </div>
      </div>

      <div className={ui.band}>
        <div className={`${ui.container} ${ui.bandPadding} flex flex-col gap-16 sm:gap-20`}>
          <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-12">
            <div className="lg:sticky lg:top-6 lg:self-start">
              <SectionHeader kicker="FAQ" title="Questions" />
            </div>
            <FaqList faqs={ROUNDUP_FAQS} openFirst />
          </section>

          <div className="flex max-w-4xl flex-col gap-5">
            <Disclosure checkedAt={checkedAt} />
            <SourceList sources={sources} />
          </div>
        </div>
      </div>
    </>
  );
}
