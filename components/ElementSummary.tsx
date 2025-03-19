import { HtsElement } from "../interfaces/hts";
import { PrimaryInformation } from "./PrimaryInformation";

interface Props {
  number?: string;
  description: string;
  childrenElements?: HtsElement[];
  showDetails: boolean;
  setShowDetails: (show: boolean) => void;
}

export const ElementSummary = ({
  number,
  description,
  childrenElements: children,
  showDetails,
  setShowDetails,
}: Props) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        {number && (
          <PrimaryInformation value={number} loud={true} copyable={false} />
        )}
        <button
          onClick={() => setShowDetails(!showDetails)}
          type="button"
          className="shrink-0 p-2 bg-neutral-700 h-6 rounded-md flex items-center justify-center text-sm text-neutral-400 hover:text-black hover:bg-neutral-200"
        >
          {children && children.length > 0 ? "Hide Children" : "Show Children"}
        </button>
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-white font-bold">{description}</h3>
      </div>
    </div>
  );
};
