"use client";

import { useCallback, useEffect, useState } from "react";
import type { CrossRuling, CrossRulingDetail } from "../../../interfaces/cross-rulings";
import {
  fetchCrossRulingsBySearchTerm,
  formatCrossSearchQuery,
  trimHtsTo8Digits,
} from "../../../libs/cross-rulings";
import { BackButton } from "../../cross-rulings/BackButton";
import { CenteredSpinner } from "../../cross-rulings/CenteredSpinner";
import { CrossRulingsSearchBar } from "../../cross-rulings/CrossRulingsSearchBar";
import { EmptyState } from "../../cross-rulings/EmptyState";
import { ErrorBanner } from "../../cross-rulings/ErrorBanner";
import { IncompleteView } from "../../cross-rulings/IncompleteView";
import { RulingCard } from "../../cross-rulings/RulingCard";
import { RulingDetailView } from "../../cross-rulings/RulingDetailView";

interface Props {
  latestHtsCode: string | null;
  isComplete: boolean;
}

function TermSection({
  title,
  subtitle,
  rulings,
  onRulingClick,
}: {
  title: string;
  subtitle?: string;
  rulings: CrossRuling[];
  onRulingClick: (ruling: CrossRuling) => void;
}) {
  return (
    <div className="rounded-xl border border-base-content/10 bg-base-100 overflow-hidden shadow-sm">
      <div className="bg-base-200/40 px-4 py-3 border-b border-base-content/10">
        <p className="text-xs font-semibold uppercase tracking-wide text-base-content/45">
          Search term
        </p>
        <p className="text-base font-mono font-semibold text-primary mt-0.5">
          {title}
        </p>
        {subtitle && (
          <p className="text-sm text-base-content/55 mt-1">{subtitle}</p>
        )}
      </div>
      <div className="p-4 flex flex-col gap-4">
        {rulings.length === 0 ? (
          <p className="text-sm text-base-content/45">
            No rulings for this term.
          </p>
        ) : (
          rulings.map((ruling) => (
            <RulingCard
              key={ruling.id}
              ruling={ruling}
              onClick={() => onRulingClick(ruling)}
            />
          ))
        )}
      </div>
    </div>
  );
}

export const CrossRulingsTab = ({ latestHtsCode, isComplete }: Props) => {
  const [baselineRulings, setBaselineRulings] = useState<CrossRuling[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [customSearch, setCustomSearch] = useState<{
    term: string;
    rulings: CrossRuling[];
  } | null>(null);
  const [customLoading, setCustomLoading] = useState(false);
  const [customError, setCustomError] = useState<string | null>(null);

  const [selectedRuling, setSelectedRuling] =
    useState<CrossRulingDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const baselineTerm =
    latestHtsCode && latestHtsCode.replace(/\D/g, "").length >= 4
      ? trimHtsTo8Digits(latestHtsCode)
      : null;

  useEffect(() => {
    if (!isComplete || !latestHtsCode || !baselineTerm) return;

    const fetchRulings = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchCrossRulingsBySearchTerm(baselineTerm);
        setBaselineRulings(data);
      } catch (err) {
        console.error("Error fetching CROSS rulings:", err);
        setError("Unable to load CROSS rulings. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    void fetchRulings();
  }, [isComplete, latestHtsCode, baselineTerm]);

  useEffect(() => {
    setCustomSearch(null);
    setCustomError(null);
    setSearchInput("");
  }, [baselineTerm]);

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

  const runCustomSearch = useCallback(async () => {
    const term = formatCrossSearchQuery(searchInput);
    if (!term) {
      return;
    }
    setCustomError(null);
    setCustomLoading(true);
    try {
      const rulings = await fetchCrossRulingsBySearchTerm(term);
      setCustomSearch({ term, rulings });
    } catch (err) {
      console.error("Error in custom CROSS search:", err);
      setCustomError("Unable to load CROSS rulings. Please try again later.");
      setCustomSearch(null);
    } finally {
      setCustomLoading(false);
    }
  }, [searchInput]);

  const clearCustomSearch = useCallback(() => {
    setCustomSearch(null);
    setCustomError(null);
    setSearchInput("");
  }, []);

  if (!isComplete) return <IncompleteView />;

  if (loadingDetail) {
    return (
      <div className="max-w-6xl mx-auto">
        <CenteredSpinner label="Loading ruling text..." />
      </div>
    );
  }

  if (detailError) {
    return (
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        <BackButton onClick={handleBack} />
        <ErrorBanner message={detailError} />
      </div>
    );
  }

  if (selectedRuling) {
    return <RulingDetailView ruling={selectedRuling} onBack={handleBack} />;
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-base-content">
          CROSS Ruling Validation
        </h1>
        <p className="text-sm text-base-content/50 mt-1">
          See rulings associated with your code and search CROSS with any other query.
        </p>
      </div>

      <CrossRulingsSearchBar
        value={searchInput}
        onChange={setSearchInput}
        onSubmitSearch={() => void runCustomSearch()}
        onClear={clearCustomSearch}
        canClear={customSearch !== null}
        searching={customLoading}
        placeholder="Search CROSS (HTS code, ruling #, keywords…)"
      />

      {customError && <ErrorBanner message={customError} />}

      {customLoading && (
        <CenteredSpinner label="Searching CBP CROSS rulings..." />
      )}

      {!customLoading && customSearch && (
        <>
          {customSearch.rulings.length === 0 ? (
            <EmptyState
              title="No Rulings Found"
              description={`No CROSS classification rulings were found for “${customSearch.term}”.`}
            />
          ) : (
            <TermSection
              title={customSearch.term}
              subtitle="Results for your search"
              rulings={customSearch.rulings}
              onRulingClick={handleRulingClick}
            />
          )}
        </>
      )}

      {!customLoading && !customSearch && (
        <>
          {!baselineTerm && (
            <p className="text-sm text-base-content/50">
              No HTS code on this classification for automatic loading. Use the
              search bar for any CROSS query.
            </p>
          )}

          {baselineTerm && loading && (
            <CenteredSpinner label="Searching CBP CROSS rulings..." />
          )}

          {baselineTerm && error && <ErrorBanner message={error} />}

          {baselineTerm && !loading && !error && (
            <TermSection
              title={baselineTerm}
              subtitle="Based on the latest selected HTS from this classification"
              rulings={baselineRulings}
              onRulingClick={handleRulingClick}
            />
          )}
        </>
      )}
    </div>
  );
};
