"use client";

import { useCallback, useEffect, useState } from "react";
import type { CrossRuling, CrossRulingDetail } from "../interfaces/cross-rulings";
import { trimHtsTo8Digits } from "../libs/cross-rulings";
import { isFullHTSCode } from "../libs/hts";
import { BackButton } from "./cross-rulings/BackButton";
import { CenteredSpinner } from "./cross-rulings/CenteredSpinner";
import { EmptyState } from "./cross-rulings/EmptyState";
import { ErrorBanner } from "./cross-rulings/ErrorBanner";
import { RulingCard } from "./cross-rulings/RulingCard";
import { RulingDetailView } from "./cross-rulings/RulingDetailView";
import Link from "next/link";

function crossSearchTermForUrl(htsno: string): string {
  const digits = htsno.replace(/\D/g, "");
  if (digits.length >= 8) return trimHtsTo8Digits(htsno);
  if (isFullHTSCode(htsno)) return htsno.slice(0, -3);
  return htsno;
}

function crossSearchUrl(htsno: string): string {
  return `https://rulings.cbp.gov/search?term=${encodeURIComponent(
    crossSearchTermForUrl(htsno)
  )}`;
}

interface RelatedCrossRulingsSectionProps {
  htsno: string;
}

export function RelatedCrossRulingsSection({ htsno }: RelatedCrossRulingsSectionProps) {
  const [rulings, setRulings] = useState<CrossRuling[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedRuling, setSelectedRuling] = useState<CrossRulingDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const digitCount = htsno.replace(/\D/g, "").length;
  const canFetch = digitCount >= 8;
  const searchTermDisplay = canFetch ? trimHtsTo8Digits(htsno) : null;

  useEffect(() => {
    if (!canFetch) return;

    const fetchRulings = async () => {
      setLoading(true);
      setError(null);
      try {
        const searchTerm = trimHtsTo8Digits(htsno);
        const res = await fetch(
          `/api/cross-rulings?term=${encodeURIComponent(searchTerm)}`
        );
        if (!res.ok) throw new Error("Failed to fetch rulings");
        const data: CrossRuling[] = await res.json();
        setRulings(data);
      } catch (err) {
        console.error("Error fetching CROSS rulings:", err);
        setError("Unable to load CROSS rulings. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchRulings();
  }, [canFetch, htsno]);

  const handleRulingClick = useCallback(async (ruling: CrossRuling) => {
    setLoadingDetail(true);
    setDetailError(null);
    try {
      const res = await fetch(
        `/api/cross-rulings/${encodeURIComponent(ruling.rulingNumber)}`
      );
      if (!res.ok) throw new Error("Failed to fetch ruling detail");
      const data: CrossRulingDetail = await res.json();
      setSelectedRuling(data);
    } catch (err) {
      console.error("Error fetching ruling detail:", err);
      setDetailError("Unable to load ruling text. Please try again.");
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  const handleBack = useCallback(() => {
    setSelectedRuling(null);
    setDetailError(null);
  }, []);

  const showIntro = !loadingDetail && !selectedRuling;

  return (
    <section className="rounded-2xl border-2 border-base-content/10 bg-base-100 overflow-hidden shadow-sm mb-8">
      <div className="bg-base-200/40 px-6 py-4 border-b border-base-content/10">
        <h2 className="text-base font-bold text-base-content flex items-center gap-2">
          <svg
            className="w-5 h-5 text-base-content/50 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
            />
          </svg>
          Related CROSS Rulings
        </h2>
      </div>

      <div className="p-6">
        {showIntro && searchTermDisplay && (
          <p className="text-sm text-base-content/60 mb-4">
            CBP classification rulings directly related to HTS code{" "}
            <span className="font-mono font-semibold text-primary">
              {searchTermDisplay}
            </span>
            . These may help validate how this code is applied in practice.
          </p>
        )}

        {showIntro && !canFetch && (
          <p className="text-sm text-base-content/60 mb-4">
            CROSS search is most useful once you have at least an 8-digit HTS
            code.
          </p>
        )}

        {loadingDetail && (
          <CenteredSpinner label="Loading ruling text..." />
        )}

        {!loadingDetail && detailError && (
          <div className="flex flex-col gap-4">
            <BackButton onClick={handleBack} />
            <ErrorBanner message={detailError} />
          </div>
        )}

        {!loadingDetail && !detailError && selectedRuling && (
          <RulingDetailView ruling={selectedRuling} onBack={handleBack} />
        )}

        {!loadingDetail && !detailError && !selectedRuling && canFetch && (
          <>
            {loading && <CenteredSpinner label="Searching CBP CROSS rulings..." />}

            {error && <ErrorBanner message={error} />}

            {!loading && !error && rulings.length === 0 && (
              <EmptyState
                title="No Rulings Found"
                description={`No CROSS classification rulings were found for HTS code "${searchTermDisplay}".`}
              />
            )}

            {!loading && !error && rulings.length > 0 && (
              <>
                <p className="text-xs font-semibold text-base-content/40 uppercase tracking-wider mb-3">
                  {rulings.length} relevant ruling{rulings.length !== 1 ? "s" : ""}{" "}
                  found:
                </p>
                <div className="flex flex-col gap-4">
                  {rulings.map((ruling) => (
                    <RulingCard
                      key={ruling.id}
                      ruling={ruling}
                      onClick={() => handleRulingClick(ruling)}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {rulings && rulings.length > 0 && <div className="border-t border-base-content/10 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-base-content">
            Unsure if these ruling affect your classification?
          </p>
          <p className="text-xs text-base-content/50">
            Run a quick analysis to see if these might affect a product classification
          </p>
        </div>
        <Link
          href={'/classifications/new'}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
        >
          Run Analysis
          <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>}
    </section>
  );
}
