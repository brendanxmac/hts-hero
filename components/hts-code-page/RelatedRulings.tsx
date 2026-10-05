import { RelatedCrossRulingsSection } from "@/components/RelatedCrossRulingsSection";
import { mono } from "@/components/ui/font";
import { SectionHeader } from "@/components/ui/SectionHeader";
import * as ui from "@/components/ui/styles";

// CBP's CROSS rulings related to this line
export function RelatedRulings({ htsno }: { htsno: string }) {
  return (
    <section id="rulings" className={ui.section}>
      <SectionHeader kicker="CBP rulings" title={`Related CROSS Rulings for HTS ${htsno}`}>
        CBP classification rulings related to{" "}
        <span className={`${mono.className} font-medium text-base-content`}>{htsno}</span>.
        Open a ruling to read how Customs classified a similar product.
      </SectionHeader>
      <RelatedCrossRulingsSection htsno={htsno} bare initialCount={6} />
    </section>
  );
}
