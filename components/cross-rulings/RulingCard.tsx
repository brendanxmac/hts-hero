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
  /** In a grid of cards all one size: fills its cell, the subject to three lines, the codes at the foot */
  uniform?: boolean;
}

export const RulingCard = ({
  ruling,
  onClick,
  associatedHtsCodes,
  uniform = false,
}: Props) => {
  const isRevoked = rulingIsRevoked(ruling);

  return (
    <button onClick={onClick} className={classNames("text-left w-full", uniform && "h-full")}>
      <DashboardCard
        className={classNames(
          "transition-colors cursor-pointer",
          uniform && "h-full",
          isRevoked
            ? "border-error/30 hover:border-error/50"
            : "hover:border-primary/30"
        )}
      >
        <div className={classNames("p-5 flex flex-col gap-3", uniform && "h-full")}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <RulingMeta ruling={ruling} isRevoked={isRevoked} />
              <h3
                className={classNames("text-sm font-semibold text-base-content leading-snug", uniform && "line-clamp-3")}
                title={uniform ? ruling.subject : undefined}
              >
                {ruling.subject}
              </h3>
            </div>
            <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg text-base-content/30">
              <ChevronRightIcon className="w-5 h-5" />
            </div>
          </div>
          <div className={uniform ? "mt-auto" : undefined}>
            <TariffBadges tariffs={ruling.tariffs} />
          </div>
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
