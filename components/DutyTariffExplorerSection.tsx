"use client";

import Link from "next/link";
import { QuestionMarkCircleIcon } from "@heroicons/react/20/solid";
import type { HtsElement } from "../interfaces/hts";
import { SingleCountryDutyTariffCard } from "./SingleCountryDutyTariffCard";
import { Countries } from "../constants/countries";

export interface DutyTariffExplorerSectionProps {
  element: HtsElement;
  tariffElement: HtsElement;
  htsElements: HtsElement[];
}

export function DutyTariffExplorerSection({
  element,
  tariffElement,
  htsElements,
}: DutyTariffExplorerSectionProps) {
  const calculatorHref = `/duty-calculator?code=${encodeURIComponent(element.htsno)}`;

  return (
    <section className="rounded-2xl border-2 border-base-content/10 bg-base-100 overflow-hidden shadow-sm mb-8">
      <div className="bg-base-200/40 px-6 py-4 border-b border-base-content/10">
        <h2 className="text-base font-bold text-base-content flex items-center gap-2">
          <span className="text-lg shrink-0" aria-hidden>
            📊
          </span>
          <span>Duty Simulator</span>
          <Link
            href="/tariffs/coverage"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-70 transition-opacity shrink-0"
            aria-label="Tariff coverage help"
          >
            <QuestionMarkCircleIcon className="w-5 h-5 text-base-content/40" />
          </Link>
        </h2>
        <p className="text-sm text-base-content/60 mt-1">
          Simulate import duties for{" "}
          <span className="font-mono font-semibold text-primary">
            {element.htsno}
          </span>{" "}
          by country of origin and customs value.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <SingleCountryDutyTariffCard
          element={element}
          htsElements={htsElements}
          tariffElementOverride={tariffElement}
          initialSelectedCountry={Countries.find((c) => c.code === "CN")}
        />

        <p className="px-6 pb-2 text-xs text-base-content/40">
          We can make mistakes and do not guarantee complete nor correct
          calculations. If you see any issues please{" "}
          <a
            href="mailto:support@htshero.com"
            className="text-primary hover:underline"
          >
            notify us
          </a>{" "}
          and we will quickly correct them for everyone&apos;s benefit.
        </p>
      </div>

      <div className="border-t border-base-content/10 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-base-content">
            Want a dedicated Tariff Simulator View?
          </p>
          <p className="text-xs text-base-content/50">
            Open the dedicated duty simulator with this code prefilled to remove some of the noise.
          </p>
        </div>
        <Link href={calculatorHref} className="btn btn-primary">
          Launch Duty Simulator
          <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>
    </section>
  );
}
