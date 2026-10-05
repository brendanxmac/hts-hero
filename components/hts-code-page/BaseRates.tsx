import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import type { HtsElement } from "@/interfaces/hts";
import { mono } from "@/components/ui/font";
import * as ui from "@/components/ui/styles";
import { specialRates } from "./specialRates";

// The line's rates from the schedule itself (general, special, Column 2), in the hero's rail
export function BaseRates({
  element,
  tariffElement,
  hasDutyData,
  showCalculatorLink,
}: {
  element: HtsElement;
  tariffElement: HtsElement;
  hasDutyData: boolean;
  showCalculatorLink: boolean;
}) {
  const special = tariffElement.special ? specialRates(tariffElement.special) : null;
  const details = [
    { label: "Units of Quantity", value: element.units.join(", ") || null },
    { label: "Quota Quantity", value: element.quotaQuantity },
    { label: "Additional Duties", value: element.additionalDuties },
  ].filter((d) => d.value);
  const inherited = tariffElement !== element && tariffElement.htsno;

  return (
    <section id="base-rates" aria-labelledby="base-rates-title" className={`${ui.card} scroll-mt-6 overflow-hidden`}>
      <div className="px-4 pt-3.5 pb-3 border-b border-base-300">
        <h2 id="base-rates-title" className={ui.cardTitle}>
          Base Duty Rates for {element.htsno}
        </h2>
        <p className={`${ui.caption} mt-0.5`}>
          {inherited ? (
            <>
              Set at{" "}
              <Link href={`/hts/${tariffElement.htsno}`} className={`${mono.className} hover:underline hover:text-primary`}>
                {tariffElement.htsno}
              </Link>{" "}
              in the Harmonized Tariff Schedule
            </>
          ) : (
            "From the Harmonized Tariff Schedule"
          )}
        </p>
      </div>

      {/* One row per rate: label on the left, rate on the right; long rates (Chapter 99 sentences) wrap below */}
      <dl className="divide-y divide-base-300 text-sm tabular-nums">
        {hasDutyData && (
          <>
            <RateRow label="General Rate of Duty" value={tariffElement.general} strong />
            <div className="px-4 py-2.5">
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-base-content/70">Special Rate of Duty</dt>
                <dd className="font-semibold text-right">
                  {special ? (
                    <span className="text-success">{special.map((s) => s.rate).join(" / ")}</span>
                  ) : (
                    <RateValue value={tariffElement.special} />
                  )}
                </dd>
              </div>
              {special && (
                <dd className="mt-1.5 flex flex-wrap gap-1">
                  {special.flatMap((s) => s.programs).map((p, i) => (
                    <span
                      key={`${p}-${i}`}
                      className={`${ui.badge("neutral")} ${mono.className}`}
                    >
                      {p}
                    </span>
                  ))}
                </dd>
              )}
            </div>
            <RateRow label="Column 2 (Non-NTR)" value={tariffElement.other} />
          </>
        )}
        {details.map((d) => (
          <RateRow key={d.label} label={d.label} value={d.value} />
        ))}
      </dl>

      {showCalculatorLink && element.htsno && !element.htsno.startsWith("99") && (
        <div className="border-t border-base-300 px-5 py-4 flex flex-col gap-1">
          <p className={ui.cardTitle}>Importing under {element.htsno}?</p>
          <p className={ui.bodySm}>
            Calculate total import duties, tariffs, and trade agreement exemptions for your shipment.
          </p>
          <Link href={`/duty-calculator?code=${element.htsno}`} className={`${ui.link} mt-1 inline-flex items-center gap-1 text-sm`}>
            Calculate Total Duty
            <ArrowRightIcon className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      )}
    </section>
  );
}

function RateRow({ label, value, strong = false }: { label: string; value: string | null; strong?: boolean }) {
  // Chapter 99 lines carry sentences in the rate columns
  const long = (value?.length ?? 0) > 24;
  return (
    <div className={`px-4 py-2.5 ${long ? "" : "flex items-baseline justify-between gap-3"}`}>
      <dt className="text-base-content/70">{label}</dt>
      <dd className={`font-semibold ${long ? "mt-1" : "text-right"} ${strong && !long ? "text-lg leading-none" : ""}`}>
        <RateValue value={value} />
      </dd>
    </div>
  );
}

function RateValue({ value }: { value: string | null }) {
  return value ? (
    <span className="text-base-content">{value}</span>
  ) : (
    <span className="text-base-content/60">—</span>
  );
}
