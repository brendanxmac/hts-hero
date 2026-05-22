import { CrossRulingDetail } from "../../interfaces/cross-rulings";
import { normalizeRulingText, rulingIsRevoked, formatRulingDate } from "../../libs/cross-rulings";
import { DashboardCard } from "../classification-detail/DashboardCard";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { PlusIcon } from "@heroicons/react/16/solid";
import { BackButton } from "./BackButton";
import { RulingMeta } from "./RulingMeta";
import { TariffBadges } from "./TariffBadges";
import { TextSelectionPopover } from "../TextSelectionPopover";

interface Props {
  ruling: CrossRulingDetail;
  onBack: () => void;
  onAddToNotes?: (text: string) => void;
}

function formatRulingReference(ruling: CrossRulingDetail): string {
  const id = ruling.collection
    ? `${ruling.collection.toUpperCase()}${ruling.rulingNumber}`
    : ruling.rulingNumber;
  const parts = [id, `— ${ruling.subject}`];
  if (ruling.rulingDate) parts.push(`(${formatRulingDate(ruling.rulingDate)})`);
  return `${parts.join(" ")}\nhttps://rulings.cbp.gov/ruling/${ruling.rulingNumber}`;
}

export const RulingDetailView = ({ ruling, onBack, onAddToNotes }: Props) => {
  const isRevoked = rulingIsRevoked(ruling);
  const paragraphs = normalizeRulingText(ruling.text)
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between gap-2">
        <BackButton onClick={onBack} />
        {onAddToNotes && (
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-base-300 bg-base-100 px-2.5 py-1.5 text-xs font-semibold text-base-content/70 hover:border-primary hover:text-primary transition-colors"
            onClick={() => onAddToNotes(formatRulingReference(ruling))}
          >
            <PlusIcon className="w-3.5 h-3.5" />
            Add Ruling to Notes
          </button>
        )}
      </div>

      <div>
        <RulingMeta ruling={ruling} isRevoked={isRevoked} />
        <h1 className="text-2xl font-bold text-base-content mt-1">
          {ruling.subject}
        </h1>
        {ruling.tariffs.length > 0 && (
          <div className="mt-3">
            <TariffBadges tariffs={ruling.tariffs} />
          </div>
        )}
      </div>

      <DashboardCard>
        <div className="p-6">
          {onAddToNotes ? (
            <TextSelectionPopover
              onAddToNotes={onAddToNotes}
              className="relative"
            >
              <div className="text-sm leading-[1.7] text-base-content/80 space-y-2.5">
                {paragraphs.map((paragraph, i) => (
                  <p key={i} className="whitespace-pre-line">
                    {paragraph}
                  </p>
                ))}
              </div>
            </TextSelectionPopover>
          ) : (
            <div className="text-sm leading-[1.7] text-base-content/80 space-y-2.5">
              {paragraphs.map((paragraph, i) => (
                <p key={i} className="whitespace-pre-line">
                  {paragraph}
                </p>
              ))}
            </div>
          )}
        </div>
      </DashboardCard>

      <div className="flex justify-center">
        <a
          href={`https://rulings.cbp.gov/ruling/${ruling.rulingNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-sm btn-outline gap-1.5"
        >
          <ArrowTopRightOnSquareIcon className="w-4 h-4" />
          View on CROSS
        </a>
      </div>
    </div>
  );
};
