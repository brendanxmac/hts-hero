import { Dispatch, SetStateAction } from "react";
import { PrimaryLabel } from "./PrimaryLabel";
import { Tariff } from "../app/classes/tariff";

interface Props {
  tariff: Tariff | undefined;
  showDetails: boolean;
  setShowDetails: Dispatch<SetStateAction<boolean>>;
}

export const TariffSummary = ({
  tariff,
  showDetails,
  setShowDetails,
}: Props) => {
  return (
    <div className="flex justify-between items-center">
      <PrimaryLabel value="Total Tariff" />
      {tariff && tariff.temporaryAdjustments.length ? (
        <button
          onClick={() => setShowDetails(!showDetails)}
          type="button"
          className="shrink-0 p-2 bg-neutral-700 h-6 rounded-md flex items-center justify-center text-sm text-neutral-400 hover:text-black hover:bg-neutral-200"
        >
          {showDetails ? "Hide Details" : "Show Details"}
        </button>
      ) : undefined}
    </div>
  );
};
