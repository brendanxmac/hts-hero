"use client";

import { useEffect, useState, useCallback } from "react";
import { CrossRuling, CrossRulingDetail } from "../../../interfaces/cross-rulings";
import { trimHtsTo8Digits } from "../../../libs/cross-rulings";
import { BackButton } from "../../cross-rulings/BackButton";
import { CenteredSpinner } from "../../cross-rulings/CenteredSpinner";
import { ErrorBanner } from "../../cross-rulings/ErrorBanner";
import { IncompleteView } from "../../cross-rulings/IncompleteView";
import { RulingDetailView } from "../../cross-rulings/RulingDetailView";
import { RulingsListView } from "../../cross-rulings/RulingsListView";

interface Props {
  latestHtsCode: string | null;
  isComplete: boolean;
}

export const CrossRulingsTab = ({ latestHtsCode, isComplete }: Props) => {
  const [rulings, setRulings] = useState<CrossRuling[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedRuling, setSelectedRuling] =
    useState<CrossRulingDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  useEffect(() => {
    if (!isComplete || !latestHtsCode) return;

    const fetchRulings = async () => {
      setLoading(true);
      setError(null);
      try {
        const searchTerm = trimHtsTo8Digits(latestHtsCode);
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
  }, [isComplete, latestHtsCode]);

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
    <RulingsListView
      rulings={rulings}
      latestHtsCode={latestHtsCode!}
      loading={loading}
      error={error}
      onRulingClick={handleRulingClick}
    />
  );
};
