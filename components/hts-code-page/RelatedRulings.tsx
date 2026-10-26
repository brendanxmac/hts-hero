import { RelatedCrossRulingsSection } from "@/components/RelatedCrossRulingsSection";
import { mono } from "@/components/ui/font";
import { CardSection } from "./CardSection";
import { trimHtsTo8Digits } from "@/libs/cross-rulings";
import { rulingsForPage } from "@/libs/cross-rulings-server";

// CBP's CROSS rulings related to this line, fetched on the server so they're in the page's HTML
// (in the browser instead when CBP is slow to answer)
export async function RelatedRulings({ htsno }: { htsno: string }) {
  const initialRulings = htsno.replace(/\D/g, "").length >= 4 ? await rulingsForPage(trimHtsTo8Digits(htsno)) : null;
  return (
    <CardSection
      id="rulings"
      kicker="CBP rulings"
      title={`Related CROSS Rulings for HTS ${htsno}`}
      padded
      lead={<>
        CBP classification rulings related to{" "}
        <span className={`${mono.className} font-medium text-base-content`}>{htsno}</span>.
        Open a ruling to read how Customs classified a similar product.
      </>}
    >
      <RelatedCrossRulingsSection htsno={htsno} bare initialCount={6} initialRulings={initialRulings} />
    </CardSection>
  );
}
