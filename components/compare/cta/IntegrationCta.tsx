import { ArrowTopRightOnSquareIcon, CheckIcon } from "@heroicons/react/20/solid";
import config from "@/config";
import * as ui from "@/components/ui/styles";

const POINTS = [
  "Tariff results by API, for your ERP, TMS or internal tools",
  "An MCP server, so AI assistants can calculate duty",
  "The same line-by-line results as the calculator",
];

// For teams that want HTS Hero inside their own systems. Unlike the plans, this is set up with
// us, so it books a call instead of starting a sign-up.
export function IntegrationCta() {
  return (
    <section className={`${ui.card} grid grid-cols-1 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]`}>
      <div className="flex flex-col gap-3 p-6 sm:p-8">
        <span className={ui.kicker}>API and MCP</span>
        <h2 className={ui.sectionTitle}>Plug HTS Hero into your ERP, TMS and internal systems</h2>
        <p className={`${ui.body} max-w-prose`}>
          Get every tariff, exemption and fee for an import wherever you price, plan or file: in your ERP, your TMS, your
          own tools or an AI assistant. We&apos;ll set it up with you.
        </p>
        <div className="mt-2">
          <a href={config.bookCallUrl} target="_blank" rel="noopener" className={ui.button({ variant: "primary", size: "lg" })}>
            Book a call
            <ArrowTopRightOnSquareIcon className="h-4 w-4" aria-hidden />
          </a>
        </div>
      </div>
      <div className="flex flex-col justify-center border-t border-base-300 bg-base-200 p-6 sm:p-8 lg:border-l lg:border-t-0">
        <ul className="flex flex-col gap-3">
          {POINTS.map((point) => (
            <li key={point} className="flex items-start gap-2.5 text-base text-base-content">
              <CheckIcon className="mt-1 h-4 w-4 shrink-0 text-success" aria-hidden />
              {point}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
