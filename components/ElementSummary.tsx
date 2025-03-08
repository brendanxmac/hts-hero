import { PrimaryHeading } from "./PrimaryLabel";

interface Props {
  number?: string;
  description: string;
}

export const ElementSummary = ({ number, description }: Props) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        {number && <PrimaryHeading value={number} />}
        {/* <button
          onClick={() => setShowDetails(!showDetails)}
          type="button"
          className="shrink-0 p-2 bg-neutral-700 h-6 rounded-md flex items-center justify-center text-sm text-neutral-400 hover:text-black hover:bg-neutral-200"
        >
          {showDetails ? "Hide Details" : "Show Details"}
        </button> */}
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-white text-sm md:text-base">{description}</h3>
      </div>
    </div>
  );
};
