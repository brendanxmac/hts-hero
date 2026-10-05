import { FaqList } from "@/components/ui/FaqList";
import { SectionHeader } from "@/components/ui/SectionHeader";
import * as ui from "@/components/ui/styles";
import type { FaqEntry } from "./types";

export function HtsFaq({ htsno, faqs }: { htsno: string; faqs: FaqEntry[] }) {
  return (
    <section id="faq" className="scroll-mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-12">
      <SectionHeader kicker="Questions" title={`HTS ${htsno} FAQ`} className="lg:sticky lg:top-6 lg:self-start">
        Something else? <a href="mailto:support@htshero.com" className={ui.link}>Ask us</a>.
      </SectionHeader>
      <FaqList faqs={faqs.map(([question, answer]) => ({ question, answer }))} openFirst />
    </section>
  );
}
