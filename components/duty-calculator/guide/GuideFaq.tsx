import Link from "next/link";
import { ArrowRightIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import { SectionIntro } from "@/components/ui/marketing";
import * as mk from "@/components/ui/marketing/styles";

// The page's top questions, with its header in a sticky left column and a link to the full FAQ.
// The text matches the page's FAQPage schema exactly.
export const GuideFaq = ({ faqs }: { faqs: { question: string; answer: string }[] }) => (
  <section id="faq" className={`${mk.band} scroll-mt-6`}>
    <div className={`${mk.container} grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)]`}>
      <div className="lg:sticky lg:top-24 lg:self-start">
        <SectionIntro eyebrow="Questions" title="Frequently asked questions">
          Something else? <a href="mailto:support@htshero.com" className={mk.link}>Ask us</a>.
        </SectionIntro>
      </div>
      <div className="flex min-w-0 flex-col gap-3">
        {faqs.map(({ question, answer }, i) => (
          <details key={question} open={i === 0} className={`${mk.card} group`}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 [&::-webkit-details-marker]:hidden">
              <h3 className="text-lg font-semibold text-slate-900 skin:text-base-content">{question}</h3>
              <ChevronDownIcon className="h-5 w-5 shrink-0 text-slate-400 skin:text-base-content/60 transition-transform group-open:rotate-180" aria-hidden />
            </summary>
            <p className={`${mk.body} px-6 pb-6`}>{answer}</p>
          </details>
        ))}
        <Link href="/duty-calculator/faq" className={`${mk.link} mt-3 inline-flex w-fit items-center gap-1`}>
          See all questions
          <ArrowRightIcon className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </div>
  </section>
);
