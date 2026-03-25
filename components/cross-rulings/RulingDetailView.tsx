import { CrossRulingDetail } from "../../interfaces/cross-rulings";
import { normalizeRulingText, rulingIsRevoked } from "../../libs/cross-rulings";
import { DashboardCard } from "../classification-detail/DashboardCard";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { BackButton } from "./BackButton";
import { RulingMeta } from "./RulingMeta";
import { TariffBadges } from "./TariffBadges";

interface Props {
  ruling: CrossRulingDetail;
  onBack: () => void;
}

export const RulingDetailView = ({ ruling, onBack }: Props) => {
  const isRevoked = rulingIsRevoked(ruling);
  const paragraphs = normalizeRulingText(ruling.text)
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6">
      <BackButton onClick={onBack} />

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
          <div className="text-sm leading-[1.7] text-base-content/80 space-y-2.5">
            {paragraphs.map((paragraph, i) => (
              <p key={i} className="whitespace-pre-line">
                {paragraph}
              </p>
            ))}
          </div>
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
