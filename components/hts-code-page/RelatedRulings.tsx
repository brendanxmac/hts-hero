import { mono } from "@/components/ui/font";
import { CrossSearchLink } from "@/components/cross-rulings/CrossSearchLink";
import { CardSection } from "./CardSection";
import { trimHtsTo8Digits } from "@/libs/cross-rulings";

// CBP's CROSS rulings for this line: a search on CBP's own site, in a new tab. CBP put its search
// behind reCAPTCHA, so we don't search CROSS ourselves.
export function RelatedRulings({ htsno }: { htsno: string }) {
  const term = trimHtsTo8Digits(htsno);
  return (
    <CardSection
      id="rulings"
      kicker="CBP rulings"
      title={`Search CROSS Rulings for HTS ${htsno}`}
      padded
      lead={<>
        See how Customs classified similar products. CBP&apos;s CROSS database holds the classification
        rulings that cite <span className={`${mono.className} font-medium text-base-content`}>{term}</span>.
      </>}
    >
      <div className="flex flex-col items-start gap-2">
        <CrossSearchLink term={term} surface="hts" variant="primary" size="md" />
        <p className="text-xs text-base-content/60">Opens rulings.cbp.gov in a new tab.</p>
      </div>
    </CardSection>
  );
}
