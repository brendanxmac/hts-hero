import config from "../config";
import { FaqItem, FAQItem } from "./FAQItem";

interface Props {
  faqItems: FAQItem[];
}

export const FAQ = ({ faqItems }: Props) => {
  return (
    <section
      className="relative overflow-hidden bg-base-100 py-16 lg:py-24"
      id="faq"
    >
      {/* Background elements matching page theme */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-24 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-24 w-72 h-72 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header matching page theme */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="w-8 h-px bg-primary/40" />
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">
              FAQ
            </span>
            <span className="w-8 h-px bg-primary/40" />
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-base-content">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-base md:text-lg text-base-content/60 max-w-2xl mx-auto">
            Everything you need to know about HTS Hero
          </p>
        </div>

        {/* FAQ Items Container */}
        <div className="bg-base-100 rounded-2xl border border-base-content/10 shadow-lg overflow-hidden">
          <ul className="divide-y divide-base-content/10">
            {faqItems.map((item, i) => (
              <FaqItem key={i} item={item} />
            ))}
          </ul>
        </div>

        {/* Contact section */}
        <div className="mt-10 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-4 bg-base-100 rounded-xl border border-base-content/10 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-sm text-base-content/60">
                Still have questions?
              </p>
              <a
                href={`mailto:${config.resend.supportEmail}`}
                className="text-primary font-medium hover:text-primary/80 transition-colors"
              >
                {config.resend.supportEmail}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
