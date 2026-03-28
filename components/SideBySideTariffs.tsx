"use client";

import Link from "next/link";
import { QuestionMarkCircleIcon } from "@heroicons/react/20/solid";
import type { HtsElement } from "../interfaces/hts";
import { Tariffs } from "./Tariffs";

export interface SideBySideTariffsProps {
  isPayingUser: boolean;
  isTariffImpactTrialUser: boolean;
  htsElement: HtsElement;
  tariffElement: HtsElement;
}

/**
 * Legacy explorer duty UI: gradient card wrapping the multi-country {@link Tariffs} component.
 * Kept for reuse; the explorer now uses {@link DutyTariffExplorerSection} by default.
 */
export function SideBySideTariffs({
  isPayingUser,
  isTariffImpactTrialUser,
  htsElement,
  tariffElement,
}: SideBySideTariffsProps) {
  return (
    <div className="relative rounded-2xl bg-gradient-to-br from-base-200/50 via-base-100 to-base-200/30 border border-base-content/10 p-5 sm:p-6">
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-lg">📊</span>
              <span className="text-lg font-bold text-base-content">
                Duty Simulator
              </span>
              <Link
                href="/tariffs/coverage"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-70 transition-opacity"
              >
                <QuestionMarkCircleIcon className="w-5 h-5 text-base-content/40" />
              </Link>
            </div>
            <p className="text-sm text-base-content/60">
              Simulate tariff scenarios for any country of origin and find
              potential exemptions
            </p>
          </div>
        </div>

        <Tariffs
          isPayingUser={isPayingUser}
          isTariffImpactTrialUser={isTariffImpactTrialUser}
          htsElement={htsElement}
          tariffElement={tariffElement}
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
    </div>
  );
}
