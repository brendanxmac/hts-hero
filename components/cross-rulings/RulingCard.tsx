import { CrossRuling } from "../../interfaces/cross-rulings";
import { rulingIsRevoked } from "../../libs/cross-rulings";
import { DashboardCard } from "../classification-detail/DashboardCard";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { RulingMeta } from "./RulingMeta";
import { TariffBadges } from "./TariffBadges";
import { classNames } from "../../utilities/style";

interface Props {
  ruling: CrossRuling;
  onClick: () => void;
  /** HTS codes from classification candidates that returned this ruling in a merged search. */
  associatedHtsCodes?: string[];
}

export const RulingCard = ({
  ruling,
  onClick,
  associatedHtsCodes,
}: Props) => {
  const isRevoked = rulingIsRevoked(ruling);

  return (
    <button onClick={onClick} className="text-left w-full">
      <DashboardCard
        className={classNames(
          "transition-colors cursor-pointer",
          isRevoked
            ? "border-error/30 hover:border-error/50"
            : "hover:border-primary/30"
        )}
      >
        <div className="p-5 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <RulingMeta ruling={ruling} isRevoked={isRevoked} />
              <h3 className="text-sm font-semibold text-base-content leading-snug">
                {ruling.subject}
              </h3>
            </div>
            <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg text-base-content/30">
              <ChevronRightIcon className="w-5 h-5" />
            </div>
          </div>
          <TariffBadges tariffs={ruling.tariffs} />
          {associatedHtsCodes && associatedHtsCodes.length > 0 && (
            <div className="flex flex-wrap gap-1.5 items-center pt-0.5 border-t border-base-content/5">
              <span className="text-[11px] text-base-content/45 shrink-0">
                Candidates
              </span>
              {associatedHtsCodes.map((code) => (
                <span
                  key={code}
                  className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-base-200/80 text-base-content/70"
                >
                  {code}
                </span>
              ))}
            </div>
          )}
        </div>
      </DashboardCard>
    </button>
  );
}
