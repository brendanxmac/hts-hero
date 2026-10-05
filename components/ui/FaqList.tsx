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
          className="collapse collapse-arrow rounded-lg border border-base-300 bg-base-100 open:border-primary/30"
        >
          <summary className="collapse-title text-base font-semibold text-base-content">
            <h3>{question}</h3>
          </summary>
          <div className="collapse-content">
            <p className="max-w-prose text-base leading-relaxed text-base-content/70">{answer}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
