import { DutyCalculatorContent } from "@/libs/duty-calculator-content";
import { formatSummaryDate } from "@/libs/hts-duty-summary";
import * as ui from "@/components/ui/styles";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CountryLinks } from "../country";
import { DataSources } from "./DataSources";
import { FindHtsCode } from "./FindHtsCode";
import { GuideFaq } from "./GuideFaq";
import { HowDutyIsCalculated } from "./HowDutyIsCalculated";
import { RatesByCountry } from "./RatesByCountry";

// Below the calculator on /duty-calculator: today's rates for common imports, how a duty is
// worked out, where the data comes from and the FAQ. Server-rendered so
// search engines and AI crawlers can read it; the calculator itself runs in the browser.
// A band of its own, on a different surface from the calculator, so it reads as a guide.
export const TariffGuide = ({
  content,
  faqs,
}: {
  content: DutyCalculatorContent;
  faqs: { question: string; answer: string }[];
}) => (
  <div className={ui.band}>
    <div className={`${ui.container} pt-14 pb-20 sm:pt-20 flex flex-col gap-6 sm:gap-10 md:gap-20`}>
      {/* The guide's own intro */}
      <header className="flex flex-col gap-4">
        <span className={ui.kicker}>Tariff guide · Updated {formatSummaryDate(content.asOf)}</span>
        <div className="flex flex-col gap-2">
          <p className="text-3xl sm:text-4xl font-semibold leading-tight tracking-tight text-base-content">
            The US Import Tariff Guide
          </p>
          <p className={`${ui.lead} max-w-3xl`}>
            See how a duty is calculated, where every number comes from, and find current rates on popular products.
          </p>
        </div>
      </header>

      <HowDutyIsCalculated content={content} />
      <DataSources revisionTitle={content.revisionTitle} asOf={content.asOf} />
      <FindHtsCode />
      {content.matrix.rows.length > 0 && <RatesByCountry content={content} />}
      <section className={ui.section}>
        <SectionHeader kicker="By country" title="Tariff calculators by country of origin">
          What goods from these countries pay, with the calculator set to that country.
        </SectionHeader>
        <CountryLinks />
      </section>
      <GuideFaq faqs={faqs} />
    </div>
  </div>
);
