"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CrossRuling, CrossRulingDetail } from "@/interfaces/cross-rulings";
import type { HtsElement } from "@/interfaces/hts";
import {
  fetchCrossRulingsBySearchTerm,
  formatCrossSearchQuery,
  trimHtsTo8Digits,
} from "@/libs/cross-rulings";
import { BackButton } from "@/components/cross-rulings/BackButton";
import { CenteredSpinner } from "@/components/cross-rulings/CenteredSpinner";
import { CrossRulingsSearchBar } from "@/components/cross-rulings/CrossRulingsSearchBar";
import { EmptyState } from "@/components/cross-rulings/EmptyState";
import { ErrorBanner } from "@/components/cross-rulings/ErrorBanner";
import { RulingCard } from "@/components/cross-rulings/RulingCard";
import { RulingDetailView } from "@/components/cross-rulings/RulingDetailView";

export interface VerticalCandidateCrossRulingsTabProps {
  candidates: HtsElement[];
  /** Prefills the search field (e.g. product description). */
  articleDescription?: string;
}

type TermGroup = {
  term: string;
  htsnos: string[];
  rulings: CrossRuling[];
};

function CrossRulingsByTermBlock({
  term,
  htsnos,
  rulings,
  onRulingClick,
}: {
  term: string;
  htsnos: string[];
  rulings: CrossRuling[];
  onRulingClick: (r: CrossRuling) => void;
}) {
  return (
    <div className="rounded-lg border border-base-300 overflow-hidden">
      <div className="px-3 py-2.5 bg-base-200/40 border-b border-base-300">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-base-content/45">
          Search term
        </p>
        <p className="text-sm font-mono font-semibold text-primary mt-0.5">
          {term}
        </p>
      </div>
      <div className="p-3 flex flex-col gap-2">
        {rulings.length === 0 ? (
          <p className="text-xs text-base-content/45 py-2">
            No rulings for this term.
          </p>
        ) : (
          rulings.map((ruling) => (
            <RulingCard
              key={ruling.id}
              ruling={ruling}
              // associatedHtsCodes={htsnos.length > 0 ? htsnos : undefined}
              onClick={() => onRulingClick(ruling)}
            />
          ))
        )}
      </div>
    </div>
  );
}

export function VerticalCandidateCrossRulingsTab({
  candidates,
  articleDescription = "",
}: VerticalCandidateCrossRulingsTabProps) {
  const [termGroups, setTermGroups] = useState<TermGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState(articleDescription);
  const [customSearch, setCustomSearch] = useState<{
    term: string;
    rulings: CrossRuling[];
  } | null>(null);
  const [customLoading, setCustomLoading] = useState(false);
  const [customError, setCustomError] = useState<string | null>(null);

  const [selectedRuling, setSelectedRuling] = useState<CrossRulingDetail | null>(
    null
  );
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const searchJobs = useMemo(() => {
    const termToHtsnos = new Map<string, Set<string>>();
    for (const c of candidates) {
      const raw = c.htsno?.trim() ?? "";
      if (raw.replace(/\D/g, "").length < 4) continue;
      const term = trimHtsTo8Digits(raw);
      if (!termToHtsnos.has(term)) termToHtsnos.set(term, new Set());
      termToHtsnos.get(term)!.add(raw);
    }
    return Array.from(termToHtsnos.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([term, set]) => ({
        term,
        htsnos: Array.from(set).sort(),
      }));
  }, [candidates]);

  const fetchKey = searchJobs
    .map((j) => `${j.term}:${j.htsnos.join("\u001f")}`)
    .join("|");

  useEffect(() => {
    setCustomSearch(null);
    setCustomError(null);
    setSearchInput(articleDescription);
  }, [fetchKey]); // eslint-disable-line react-hooks/exhaustive-deps -- preset when candidate terms change, not on every description edit

  useEffect(() => {
    if (searchJobs.length === 0) {
      setTermGroups([]);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const jobsSnapshot = searchJobs;

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const settled = await Promise.all(
          jobsSnapshot.map(async ({ term, htsnos }) => {
            const rulings = await fetchCrossRulingsBySearchTerm(term);
            return { term, htsnos, rulings };
          })
        );

        if (cancelled) return;
        setTermGroups(settled);
      } catch (err) {
        console.error("Error fetching CROSS rulings for candidates:", err);
        if (!cancelled) {
          setError("Unable to load CROSS rulings. Please try again later.");
          setTermGroups([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [fetchKey, searchJobs]);

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
    setSearchInput(articleDescription);
  }, [articleDescription]);

  const showIntro = !loadingDetail && !selectedRuling;

  if (candidates.length === 0) {
    return (
      <div className="rounded-lg border border-base-300 overflow-hidden">
        <div className="flex">
          <div className="w-1 bg-base-300 shrink-0" />
          <div className="p-4 flex-1">
            <p className="text-xs text-base-content/40 italic">
              Add candidates to load related CROSS rulings.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (searchJobs.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <CrossRulingsSearchBar
          compact
          value={searchInput}
          onChange={setSearchInput}
          onSubmitSearch={() => void runCustomSearch()}
          onClear={clearCustomSearch}
          canClear={customSearch !== null}
          searching={customLoading}
          placeholder="Search CROSS (HTS code, ruling #, keywords…)"
        />
        {customError && <ErrorBanner message={customError} />}

        {loadingDetail && (
          <CenteredSpinner label="Loading ruling text..." />
        )}
        {!loadingDetail && detailError && (
          <div className="flex flex-col gap-3">
            <BackButton onClick={handleBack} />
            <ErrorBanner message={detailError} />
          </div>
        )}
        {!loadingDetail && !detailError && selectedRuling && (
          <RulingDetailView ruling={selectedRuling} onBack={handleBack} />
        )}

        {!loadingDetail && !detailError && !selectedRuling && (
          <>
            {customLoading && (
              <CenteredSpinner label="Searching CBP CROSS rulings..." />
            )}
            {!customLoading && customSearch && (
              <>
                {customSearch.rulings.length === 0 ? (
                  <EmptyState
                    title="No Rulings Found"
                    description={`No CROSS rulings matched “${customSearch.term}”.`}
                  />
                ) : (
                  <CrossRulingsByTermBlock
                    term={customSearch.term}
                    htsnos={[]}
                    rulings={customSearch.rulings}
                    onRulingClick={handleRulingClick}
                  />
                )}
              </>
            )}
            {!customLoading && !customSearch && (
              <p className="text-[12px] text-base-content/70">
                No candidate HTS codes met the threshold for automatic loads. Use
                the search bar for any CROSS query.
              </p>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <CrossRulingsSearchBar
        compact
        value={searchInput}
        onChange={setSearchInput}
        onSubmitSearch={() => void runCustomSearch()}
        onClear={clearCustomSearch}
        canClear={customSearch !== null}
        searching={customLoading}
        placeholder="Search CROSS (HTS code, ruling #, keywords…)"
      />

      {customError && <ErrorBanner message={customError} />}

      {loadingDetail && (
        <CenteredSpinner label="Loading ruling text..." />
      )}

      {!loadingDetail && detailError && (
        <div className="flex flex-col gap-3">
          <BackButton onClick={handleBack} />
          <ErrorBanner message={detailError} />
        </div>
      )}

      {!loadingDetail && !detailError && selectedRuling && (
        <RulingDetailView ruling={selectedRuling} onBack={handleBack} />
      )}

      {showIntro && !loadingDetail && !detailError && !selectedRuling && (
        <>
          <p className="text-[12px] text-base-content/70">
            {customSearch
              ? "Showing results for your search. Clear to return to rulings grouped by each candidate search term."
              : "Rulings are grouped by the search term used for each candidate. The same ruling may appear under multiple terms."}
          </p>

          {customLoading && (
            <CenteredSpinner label="Searching CBP CROSS rulings..." />
          )}

          {!customLoading && customSearch && (
            <>
              {customSearch.rulings.length === 0 ? (
                <EmptyState
                  title="No Rulings Found"
                  description={`No CROSS rulings matched “${customSearch.term}”.`}
                />
              ) : (
                <CrossRulingsByTermBlock
                  term={customSearch.term}
                  htsnos={[]}
                  rulings={customSearch.rulings}
                  onRulingClick={handleRulingClick}
                />
              )}
            </>
          )}

          {!customLoading && !customSearch && (
            <>
              {loading && (
                <CenteredSpinner label="Searching CBP CROSS rulings..." />
              )}

              {error && <ErrorBanner message={error} />}

              {!loading && !error && termGroups.length > 0 && (
                <>
                  {termGroups.every((g) => g.rulings.length === 0) ? (
                    <EmptyState
                      title="No Rulings Found"
                      description="No CROSS classification rulings matched the candidate codes for this step."
                    />
                  ) : (
                    <div className="flex flex-col gap-3">
                      {termGroups.map((g) => (
                        <CrossRulingsByTermBlock
                          key={g.term}
                          term={g.term}
                          htsnos={g.htsnos}
                          rulings={g.rulings}
                          onRulingClick={handleRulingClick}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
