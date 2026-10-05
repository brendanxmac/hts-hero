import { ChevronDownIcon } from "@heroicons/react/20/solid";
import styles from "./theme.module.css";

// A page's questions as a stack of disclosures. Keep the text identical to the page's
// FAQPage schema: search engines require the schema to match what's visible.
export function FaqList({
  faqs,
  openFirst = false,
}: {
  faqs: { question: string; answer: string }[];
  openFirst?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3">
      {faqs.map(({ question, answer }, i) => (
        <details
          key={question}
          open={openFirst && i === 0}
          className={`${styles.card} group px-5 py-4 open:border-[var(--dc-accent-border)]`}
        >
          <summary
            className={`${styles.h3} cursor-pointer list-none flex items-center justify-between gap-4 [&::-webkit-details-marker]:hidden`}
          >
            <h3>{question}</h3>
            <ChevronDownIcon
              className="h-5 w-5 shrink-0 text-[var(--dc-text-3)] transition-transform group-open:rotate-180"
              aria-hidden
            />
          </summary>
          <p className={`${styles.body} mt-3 max-w-[80ch]`}>{answer}</p>
        </details>
      ))}
    </div>
  );
}
