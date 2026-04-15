import { CrossRuling } from "../../interfaces/cross-rulings";
import { formatRulingDate } from "../../libs/cross-rulings";
import { classNames } from "../../utilities/style";

interface Props {
  ruling: CrossRuling;
  isRevoked?: boolean;
}

export const RulingMeta = ({ ruling, isRevoked }: Props) => (
  <div className="w-full flex items-center gap-1 mb-1">

    {ruling.collection && (
      <span className={classNames("text-[10px] font-semibold uppercase tracking-wider text-base-content/50 bg-base-200 px-1.5 py-0.5 rounded", isRevoked ? "text-error bg-error/10" : "text-base-content/30 bg-base-200")}>
        {ruling.collection} {ruling.rulingNumber}
      </span>
    )}
    {isRevoked && (
      <span className="text-[10px] font-semibold uppercase tracking-wider text-error bg-error/10 px-1.5 py-0.5 rounded">
        Revoked
      </span>
    )}

    <span
      className={classNames(
        "text-xs",
        isRevoked ? "text-base-content/35" : "text-base-content/40"
      )}
    >
      {formatRulingDate(ruling.rulingDate)}
    </span>
  </div>
);
