import { ChevronDownIcon } from "@heroicons/react/20/solid";
import config from "@/config";
import { bundleFaqList } from "@/constants/faq";
import { SectionIntro } from "@/components/ui/marketing";
import * as mk from "@/components/ui/marketing/styles";

// The page's questions as disclosures, with the header in a sticky left column (the same layout as
// /pricing-calculator's). Anything else goes to a demo call.
export const ClassifyFaq = () => (
  <section id="faq" className={`${mk.band} ${mk.bandMuted} scroll-mt-20`} aria-labelledby="faq-title">
    <div className={`${mk.container} grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)]`}>
      <div className="lg:sticky lg:top-6 lg:self-start">
        <SectionIntro eyebrow="Questions" title="Frequently asked questions" id="faq-title">
          Something else?{" "}
          <a href={config.bookCallUrl} target="_blank" rel="noopener noreferrer" className={mk.link}>
            Book a quick demo
          </a>{" "}
          and we&apos;ll walk you through it.
        </SectionIntro>
      </div>
      <div className="flex flex-col gap-3">
        {bundleFaqList.map(({ question, answer }, i) => (
          <details key={question} open={i === 0} className={`${mk.card} group`}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 [&::-webkit-details-marker]:hidden">
              <h3 className="text-lg font-semibold text-base-content">{question}</h3>
              <ChevronDownIcon className="h-5 w-5 shrink-0 text-base-content/50 transition-transform group-open:rotate-180" aria-hidden />
            </summary>
            <div className={`${mk.body} px-6 pb-6 [&_a]:font-semibold [&_a]:text-primary [&_p+p]:mt-3`}>{answer}</div>
          </details>
        ))}
      </div>
    </div>
  </section>
);
