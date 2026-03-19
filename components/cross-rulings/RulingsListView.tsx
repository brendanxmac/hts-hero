import { CrossRuling } from "../../interfaces/cross-rulings";
import { CenteredSpinner } from "./CenteredSpinner";
import { ErrorBanner } from "./ErrorBanner";
import { EmptyState } from "./EmptyState";
import { RulingCard } from "./RulingCard";

interface Props {
  rulings: CrossRuling[];
  latestHtsCode: string;
  loading: boolean;
  error: string | null;
  onRulingClick: (ruling: CrossRuling) => void;
}

export const RulingsListView = ({
  rulings,
  latestHtsCode,
  loading,
  error,
  onRulingClick,
}: Props) => (
  <div className="max-w-6xl mx-auto flex flex-col gap-6">
    <div>
      <h1 className="text-2xl font-bold text-base-content">
        CROSS Ruling Validation
      </h1>
      <p className="text-sm text-base-content/50 mt-1">
        CROSS rulings related to HTS code{" "}
        <span className="font-mono font-semibold text-primary">
          {latestHtsCode}
        </span>
        . You can use these to help validate your classification decision.
      </p>
    </div>

    {loading && <CenteredSpinner label="Searching CBP CROSS rulings..." />}

    {error && <ErrorBanner message={error} />}

    {!loading && !error && rulings.length === 0 && (
      <EmptyState
        title="No Rulings Found"
        description={`No CROSS classification rulings were found for HTS code ${latestHtsCode}. This doesn't necessarily indicate an issue with your classification.`}
      />
    )}

    {!loading && !error && rulings.length > 0 && (
      <>
        <p className="text-xs font-semibold text-base-content/40 uppercase tracking-wider">
          {rulings.length} relevant ruling{rulings.length !== 1 ? "s" : ""} found:
        </p>
        <div className="flex flex-col gap-4">
          {rulings.map((ruling) => (
            <RulingCard
              key={ruling.id}
              ruling={ruling}
              onClick={() => onRulingClick(ruling)}
            />
          ))}
        </div>
      </>
    )}
  </div>
);
