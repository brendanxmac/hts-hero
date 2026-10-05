import { ArrowRightIcon, CheckCircleIcon, SparklesIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import { formatMoney } from "../lib/format";

// Why to open the full calculator: this estimate's own numbers first, then what's there
export const CalculatorCta = ({
  href,
  bestSaving,
  openQuestions,
  onOpen,
}: {
  href: string;
  bestSaving: number;
  openQuestions: number;
  onOpen: () => void;
}) => {
  const headline =
    bestSaving >= 0.5
      ? `This could be up to ${formatMoney(bestSaving).replace(/\.00$/, "")} lower`
      : openQuestions > 0
        ? `${openQuestions} ${openQuestions === 1 ? "detail" : "details"} could change this estimate`
        : "See exactly how this duty is calculated";
  const benefits = [
    "Every tariff, line by line, with the legal reason it applies",
    openQuestions > 0
      ? `${openQuestions} ${openQuestions === 1 ? "exemption" : "exemptions and adjustments"} to check, with what each would save`
      : "Exemptions, adjustments and partial-value rates checked for you",
    "Compare up to 3 countries of origin side by side",
    "Any entry date, transport mode and trade preference",
  ];
  return (
    <div className={`${ui.card} p-5 sm:p-6`}>
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-5 md:items-center">
        <div>
          <div className={`${ui.kicker} inline-flex items-center gap-1.5`}>
            <SparklesIcon className="w-4 h-4" aria-hidden />
            Full analysis
          </div>
          <h4 className="mt-1.5 text-xl sm:text-2xl font-semibold tracking-tight text-base-content">
            {headline}
          </h4>
          <p className="mt-1 text-sm text-base-content/70">
            Open this estimate in the Tariff Calculator to get:
          </p>
          <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-2">
            {benefits.map((b) => (
              <li
                key={b}
                className="flex items-start gap-2 text-sm leading-snug text-base-content"
              >
                <CheckCircleIcon
                  className="mt-0.5 w-4 h-4 shrink-0 text-primary"
                  aria-hidden
                />
                {b}
              </li>
            ))}
          </ul>
        </div>
        <a
          href={href}
          onClick={onOpen}
          className={`${ui.button({ variant: "primary", size: "lg" })} whitespace-nowrap`}
        >
          Open full analysis
          <ArrowRightIcon className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};
