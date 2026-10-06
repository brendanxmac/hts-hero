import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { COMPETITORS, HTS_HERO, ROUNDUP_SLUG, vsSlug } from "@/libs/compare/pages";
import { SectionHeader } from "@/components/ui/SectionHeader";
import * as ui from "@/components/ui/styles";
import { IntegrationCta } from "../cta/IntegrationCta";
import { SelfServeCta } from "../cta/SelfServeCta";
import { CompareHero } from "../layout/CompareHero";
import { FeatureMatrix } from "../matrix/FeatureMatrix";
import { ComparisonLinks } from "../shared/ComparisonLinks";
import { ROUNDUP_TITLE } from "./RoundupPage";

// /compare: the roundup first, then every head-to-head and alternatives page
export function CompareHub() {
  const checkedAt = COMPETITORS.map((t) => t.checkedAt).sort()[0];
  const vsTools = COMPETITORS.filter((t) => t.vs);
  const altTools = COMPETITORS.filter((t) => t.alternatives);
  return (
    <>
      <CompareHero
        kicker="Compare"
        title="How HTS Hero compares"
        lead="Side-by-side comparisons of HTS Hero and the other US tariff calculators: what each one covers, what it costs, and who it suits. Every claim is checked against the tool's own website and dated."
        checkedAt={checkedAt}
      />

      <div className={`${ui.container} ${ui.bandPadding} flex flex-col gap-16 sm:gap-20`}>
        <section className={ui.section}>
          <SectionHeader kicker="Start here" title={ROUNDUP_TITLE}>
            Every tool we compared, ranked, with quick picks for each kind of importer.
          </SectionHeader>
          <FeatureMatrix tools={[HTS_HERO, ...vsTools.slice(0, 3)]} linkFor={(t) => (t.vs ? `/compare/${vsSlug(t)}` : undefined)} />
          <div>
            <Link href={`/compare/${ROUNDUP_SLUG}`} className={ui.button({ variant: "primary", size: "lg" })}>
              See all {COMPETITORS.length + 1} tools ranked
              <ArrowRightIcon className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </section>

        <section className={ui.section}>
          <SectionHeader kicker="Head to head" title="HTS Hero vs other tariff calculators" />
          <ComparisonLinks
            links={vsTools.map((t) => ({ href: `/compare/${vsSlug(t)}`, title: `HTS Hero vs ${t.name}`, caption: t.kind }))}
          />
        </section>

        <section className={ui.section}>
          <SectionHeader kicker="Alternatives" title="Looking for an alternative?" />
          <ComparisonLinks
            links={altTools.map((t) => ({
              href: `/compare/${t.alternatives!.slug}`,
              title: t.alternatives!.title,
              caption: t.kind,
            }))}
          />
        </section>

        <IntegrationCta />
      </div>

      <div className={ui.band}>
        <div className={`${ui.container} ${ui.bandPadding}`}>
          <SelfServeCta />
        </div>
      </div>
    </>
  );
}
