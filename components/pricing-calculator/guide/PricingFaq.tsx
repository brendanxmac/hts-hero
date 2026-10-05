import { FaqList } from "@/components/ui/FaqList";
import { SectionHeader } from "@/components/ui/SectionHeader";
import * as ui from "@/components/ui/styles";
import { LINKS } from "../lib/links";
import { PRICING_FAQS } from "./faqs";

// The page's FAQ, with its header in a sticky left column
export const PricingFaq = () => (
  <section id="faq" className="scroll-mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-12">
    <SectionHeader kicker="Questions" title="Pricing questions" className="lg:sticky lg:top-6 lg:self-start">
      Something else? <a href={LINKS.contact} className={ui.link}>Ask us</a>.
    </SectionHeader>
    <FaqList faqs={PRICING_FAQS} />
  </section>
);
