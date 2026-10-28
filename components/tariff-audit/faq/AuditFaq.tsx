import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { SectionIntro } from "@/components/ui/marketing";
import * as mk from "@/components/ui/marketing/styles";
import { AUDIT_FAQS } from "../lib/copy";

// The questions, as disclosures. The text matches the page's FAQPage schema exactly.
export const AuditFaq = () => (
  <section id="faq" className={`${mk.band} ${mk.bandMuted} scroll-mt-6`} aria-labelledby="faq-title">
    <div className={`${mk.container} grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)]`}>
      <div className="lg:sticky lg:top-8 lg:self-start">
        <SectionIntro eyebrow="Questions" title="Tariff Audits FAQ" id="faq-title" />
      </div>
      <div className="flex flex-col gap-3">
        {AUDIT_FAQS.map(({ question, answer }, i) => (
          <details key={question} open={i === 0} className={`${mk.card} group`}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 [&::-webkit-details-marker]:hidden">
              <h3 className="text-lg font-semibold text-base-content">{question}</h3>
              <ChevronDownIcon className="h-5 w-5 shrink-0 text-base-content/60 transition-transform group-open:rotate-180" aria-hidden />
            </summary>
            <p className={`${mk.body} px-6 pb-6`}>{answer}</p>
          </details>
        ))}
      </div>
    </div>
  </section>
);
