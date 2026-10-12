import { ChevronDownIcon } from "@heroicons/react/20/solid";
import * as mk from "@/components/ui/marketing/styles";

// A page's questions as marketing disclosure cards, the first one open. Keep the text identical to
// the page's FAQPage schema: search engines require the schema to match what's visible.
export function FaqDisclosures({ faqs }: { faqs: { question: string; answer: string }[] }) {
  return (
    <div className="flex min-w-0 flex-col gap-3">
      {faqs.map(({ question, answer }, i) => (
        <details key={question} open={i === 0} className={`${mk.card} group`}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 [&::-webkit-details-marker]:hidden">
            <h3 className="text-lg font-semibold text-slate-900 skin:text-base-content">{question}</h3>
            <ChevronDownIcon className="h-5 w-5 shrink-0 text-slate-400 skin:text-base-content/50 transition-transform group-open:rotate-180" aria-hidden />
          </summary>
          <p className={`${mk.body} max-w-prose px-6 pb-6`}>{answer}</p>
        </details>
      ))}
    </div>
  );
}
