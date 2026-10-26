import { FaqList } from "@/components/ui/FaqList";
import { CardSection } from "./CardSection";
import * as ui from "@/components/ui/styles";
import type { FaqEntry } from "./types";

export function HtsFaq({ htsno, faqs }: { htsno: string; faqs: FaqEntry[] }) {
  return (
    <CardSection
      id="faq"
      kicker="Questions"
      title={`HTS ${htsno} FAQ`}
      lead={<>Something else? <a href="mailto:support@htshero.com" className={ui.link}>Ask us</a>.</>}
    >
      {/* The shared list, flattened into the card: no card of its own inside this one */}
      <div className="[&>div]:rounded-none [&>div]:border-0 [&>div]:shadow-none">
        <FaqList faqs={faqs.map(([question, answer]) => ({ question, answer }))} openFirst />
      </div>
    </CardSection>
  );
}
