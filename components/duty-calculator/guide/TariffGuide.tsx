import { ReactNode } from "react";
import { DutyCalculatorContent } from "@/libs/duty-calculator-content";
import { formatSummaryDate } from "@/libs/hts-duty-summary";
import { SectionIntro } from "@/components/ui/marketing";
import * as mk from "@/components/ui/marketing/styles";
import { CountryLinks } from "../country";
import { DataSources } from "./DataSources";
import { FindHtsCode } from "./FindHtsCode";
import { GuideFaq } from "./GuideFaq";
import { HowDutyIsCalculated } from "./HowDutyIsCalculated";
import { RatesByCountry } from "./RatesByCountry";

// Below the calculator on /duty-calculator: how a duty is worked out, where the data comes from,
// today's rates for common imports, the host's pricing (beforeFaq), the FAQ and the country pages. Server-rendered so
// search engines and AI crawlers can read it; the calculator itself runs in the browser.
// Full-width marketing bands, one per section, alternating white and slate with a dark band for
// the classification call to action.
export const TariffGuide = ({
  content,
  faqs,
  beforeFaq,
}: {
  content: DutyCalculatorContent;
  faqs: { question: string; answer: string }[];
  beforeFaq?: ReactNode;
}) => (
  <>
    {/* The guide's own intro, then the method */}
    <div className={`${mk.band} ${mk.bandMuted}`}>
      <div className={`${mk.container} flex flex-col gap-14`}>
        <header className="flex max-w-3xl flex-col gap-4">
          <span className={mk.eyebrow}>Tariff guide · Updated {formatSummaryDate(content.asOf)}</span>
          <p className={mk.h2}>The US Import Tariff Guide</p>
          <p className={mk.lead}>
            See how a duty is calculated, where every number comes from, and find current rates on popular products.
          </p>
        </header>
        <HowDutyIsCalculated content={content} />
      </div>
    </div>

    <DataSources revisionTitle={content.revisionTitle} asOf={content.asOf} />
    <FindHtsCode />
    {content.matrix.rows.length > 0 && <RatesByCountry content={content} />}

    {beforeFaq}

    <GuideFaq faqs={faqs} />

    <section className={`${mk.band} ${mk.bandMuted}`}>
      <div className={`${mk.container} flex flex-col gap-10`}>
        <SectionIntro eyebrow="By country" title="Tariff calculators by country of origin">
          What goods from these countries pay, with the calculator set to that country.
        </SectionIntro>
        <CountryLinks />
      </div>
    </section>
  </>
);
