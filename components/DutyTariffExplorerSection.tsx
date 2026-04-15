"use client";

import Link from "next/link";
import { ChartBarIcon, QuestionMarkCircleIcon } from "@heroicons/react/16/solid";
import type { HtsElement } from "../interfaces/hts";
import { SingleCountryDutyTariffCard } from "./SingleCountryDutyTariffCard";
import { Countries } from "../constants/countries";
import { ExplorerDetailSection } from "./ExplorerDetailSection";

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
    <ExplorerDetailSection
      title="Duty / Tariffs"
      icon={<ChartBarIcon className="h-4 w-4" />}
      action={
        <Link
          href="/tariffs/coverage"
          target="_blank"
          rel="noopener noreferrer"
          className="text-base-content/40 transition-opacity hover:opacity-70"
          aria-label="Tariff coverage help"
        >
          <QuestionMarkCircleIcon className="h-4 w-4" />
        </Link>
      }
      description={
        <>
          Simulate import duties for{" "}
          <span className="font-mono font-semibold text-primary">
            {element.htsno}
          </span>{" "}
          by country of origin and customs value.
        </>
      }
      footer={
        <>
          <div>
            <p className="text-sm font-semibold text-base-content">
              See Duty Rates for any HTS Code
            </p>
            <p className="text-xs text-base-content/50">
              Open the dedicated duty simulator to explore duty rates for any HTS Code.
            </p>
          </div>
          <Link href={calculatorHref} className="btn btn-primary">
            Launch duty simulator
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <SingleCountryDutyTariffCard
          element={element}
          htsElements={htsElements}
          tariffElementOverride={tariffElement}
          initialSelectedCountry={Countries.find((c) => c.code === "CN")}
        />

        <p className="text-xs text-base-content/40">
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
    </ExplorerDetailSection>
  );
}
