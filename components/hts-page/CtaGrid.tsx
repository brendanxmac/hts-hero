import Link from "next/link";
import { CheckIcon } from "@heroicons/react/16/solid";

interface CtaGridProps {
  htsCode?: string;
  contextLabel?: string;
}

export function CtaGrid({ htsCode, contextLabel }: CtaGridProps) {
  const label = contextLabel || htsCode || "Codes";

  return (
    <>
      <div className="mb-4">
        <h3 className="text-lg font-bold text-base-content">
          Tools for Importers &amp; Brokers Working with HTS {label}
        </h3>
        <p className="text-sm text-base-content/50 mt-1">
          Everything you need to classify, calculate duties, and stay compliant.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <section className="relative rounded-2xl overflow-hidden border-2 border-secondary/20 bg-base-100 shadow-sm flex flex-col">
          <div className="bg-gradient-to-br from-secondary/10 to-secondary/[0.03] px-6 py-5 border-b border-secondary/10">
            <div className="flex items-center gap-3 mb-2">
              <span className="w-10 h-10 rounded-xl bg-secondary/15 flex items-center justify-center text-xl">
                <svg className="w-5 h-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </span>
              <h3 className="text-base font-bold text-base-content">Classification Assistant</h3>
            </div>
          </div>
          <div className="p-6 flex flex-col flex-1">
            <p className="text-sm text-base-content/60 leading-relaxed mb-5 flex-1">
              Produce <strong className="text-base-content/80">audit-ready classifications</strong> in minutes — AI-powered candidate discovery, Legal Note &amp; GRI analysis, CROSS
              validation, and one-click professional reports.
            </p>
            <Link
              href="/about"
              className="block text-center px-6 py-3 rounded-xl bg-secondary text-secondary-content font-bold text-sm hover:bg-secondary/90 transition-all shadow-lg shadow-secondary/20 hover:shadow-xl hover:shadow-secondary/25"
            >
              Classify a Product Now
            </Link>
          </div>
        </section>

        <section className="relative rounded-2xl overflow-hidden border-2 border-primary/20 bg-base-100 shadow-sm flex flex-col">
          <div className="bg-gradient-to-br from-primary/10 to-primary/[0.03] px-6 py-5 border-b border-primary/10">
            <div className="flex items-center gap-3 mb-2">
              <span className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <h3 className="text-base font-bold text-base-content">Duty &amp; Tariff Calculator</h3>
            </div>
          </div>
          <div className="p-6 flex flex-col flex-1">
            <p className="text-sm text-base-content/60 leading-relaxed mb-5 flex-1">
              See the <strong className="text-base-content/80">full import cost breakdown</strong> for
              any HTS code from any country — base duties, Section 122 / 232 / 301 tariffs,
              exemptions, and trade programs.
            </p>
            <Link
              href={htsCode ? `/duty-calculator?code=${htsCode}` : "/duty-calculator"}
              className="block text-center px-6 py-3 rounded-xl bg-primary text-primary-content font-bold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25"
            >
              Calculate Duty Rates
            </Link>
          </div>
        </section>

        <section className="relative rounded-2xl overflow-hidden border-2 border-accent/20 bg-base-100 shadow-sm flex flex-col">
          <div className="bg-gradient-to-br from-accent/10 to-accent/[0.03] px-6 py-5 border-b border-accent/10">
            <div className="flex items-center gap-3 mb-2">
              <span className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center">
                <CheckIcon className="text-accent w-5 h-5" />
              </span>
              <h3 className="text-base font-bold text-base-content">Tariff Impact Checker</h3>
            </div>
          </div>
          <div className="p-6 flex flex-col flex-1">
            <p className="text-sm text-base-content/60 leading-relaxed mb-5 flex-1">
              Instantly see if new tariffs or HTS updates affect your imports and get notified when they do!
            </p>
            <Link
              href={htsCode ? `/tariffs/impact-checker?codes=${htsCode}` : "/tariffs/impact-checker"}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center px-6 py-3 rounded-xl bg-accent text-accent-content font-bold text-sm hover:bg-accent/90 transition-all shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/25"
            >
              Check Your Imports
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
