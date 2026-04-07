"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ScaleIcon } from "@heroicons/react/16/solid";
import type { CrossRuling, CrossRulingDetail } from "../interfaces/cross-rulings";
import {
  fetchCrossRulingsBySearchTerm,
  trimHtsTo8Digits,
} from "../libs/cross-rulings";
import { BackButton } from "./cross-rulings/BackButton";
import { CenteredSpinner } from "./cross-rulings/CenteredSpinner";
import { EmptyState } from "./cross-rulings/EmptyState";
import { ErrorBanner } from "./cross-rulings/ErrorBanner";
import { RulingCard } from "./cross-rulings/RulingCard";
import { RulingDetailView } from "./cross-rulings/RulingDetailView";
import { ExplorerDetailSection } from "./ExplorerDetailSection";

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
  const canFetch = digitCount >= 4;
  const searchTermDisplay = canFetch ? trimHtsTo8Digits(htsno) : null;

  useEffect(() => {
    if (!canFetch) return;

    const fetchRulings = async () => {
      setLoading(true);
      setError(null);
      try {
        const searchTerm = trimHtsTo8Digits(htsno);
        const data = await fetchCrossRulingsBySearchTerm(searchTerm);
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
    <ExplorerDetailSection
      title="CROSS Rulings"
      icon={<ScaleIcon className="h-4 w-4" />}
      description={
        <>
          CBP classification rulings related to{" "}
          <span className="font-mono font-semibold text-primary">{htsno}</span>
          .
        </>
      }
    // footer={
    //   rulings.length > 0 ? (
    //     <>
    //       <div>
    //         <p className="text-sm font-semibold text-base-content">
    //           Unsure if these rulings might affect your product?
    //         </p>
    //         <p className="text-xs text-base-content/50">
    //           Run a quick analysis to see if these might affect your product.
    //         </p>
    //       </div>
    //       <Link
    //         href="/classifications/new"
    //         target="_blank"
    //         rel="noopener noreferrer"
    //         className="btn btn-primary"
    //       >
    //         Run analysis
    //         <span aria-hidden="true">&rarr;</span>
    //       </Link>
    //     </>
    //   ) : undefined
    // }
    >
      {showIntro && !canFetch && (
        <p className="text-sm text-base-content/60 mb-4">
          CROSS search needs at least a 4-digit HTS code.
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
              title="No rulings found"
              description={`No CROSS classification rulings were found for HTS code "${searchTermDisplay}".`}
            />
          )}

          {!loading && !error && rulings.length > 0 && (
            <div className="flex flex-col gap-4">
              {rulings.map((ruling) => (
                <RulingCard
                  key={ruling.id}
                  ruling={ruling}
                  onClick={() => handleRulingClick(ruling)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </ExplorerDetailSection>
  );
}
