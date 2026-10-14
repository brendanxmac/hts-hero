import Link from "next/link";
import { CalculatorIcon, ShieldCheckIcon } from "@heroicons/react/20/solid";
import * as tt from "@/components/ui/styles/tracker";

// The tools for a section or chapter page: the classification assistant and the duty calculator
interface CtaGridProps {
  htsCode?: string;
  contextLabel?: string;
}

export function CtaGrid({ htsCode, contextLabel }: CtaGridProps) {
  const label = contextLabel || htsCode || "Codes";

  return (
    <div className="mt-12 flex flex-col gap-4">
      <div>
        <h3 className={`${tt.display} text-2xl font-semibold tracking-tight text-base-content`}>
          Tools for Importers &amp; Brokers Working with HTS {label}
        </h3>
        <p className="mt-1 text-sm text-base-content/70">
          Everything you need to classify, calculate duties, and stay compliant.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className={`${tt.panel} ${tt.panelPad} flex flex-col gap-4`}>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 text-success" aria-hidden>
              <ShieldCheckIcon className="h-5 w-5" />
            </span>
            <h3 className={tt.title}>Classification Assistant</h3>
          </div>
          <p className="flex-1 text-sm leading-relaxed text-base-content/70">
            Produce <strong className="font-semibold text-base-content">audit-ready classifications</strong> in minutes — AI-powered candidate discovery, Legal Note &amp; GRI analysis, CROSS
            validation, and one-click professional reports.
          </p>
          <Link href="/classify" className={`${tt.button("secondary")} self-start`}>
            Classify a Product Now
          </Link>
        </section>

        <section className={`${tt.panel} ${tt.panelPad} flex flex-col gap-4`}>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary" aria-hidden>
              <CalculatorIcon className="h-5 w-5" />
            </span>
            <h3 className={tt.title}>Duty &amp; Tariff Calculator</h3>
          </div>
          <p className="flex-1 text-sm leading-relaxed text-base-content/70">
            See the <strong className="font-semibold text-base-content">full import cost breakdown</strong> for
            any HTS code from any country — base duties, Section 122, 232, and 301 tariffs,
            exemptions, and trade programs.
          </p>
          <Link href={htsCode ? `/duty-calculator?code=${htsCode}` : "/duty-calculator"} className={`${tt.button("primary")} self-start`}>
            Calculate Duty Rates
          </Link>
        </section>
      </div>
    </div>
  );
}
