import { ChapterI } from "./Chapter";
import { PrimaryInformation } from "./PrimaryInformation";

interface Props {
  chapter: ChapterI;
  showDetails: boolean;
  setShowDetails: (show: boolean) => void;
}

export const ChapterSummary = ({
  chapter,
  showDetails,
  setShowDetails,
}: Props) => {
  const { number, description, headings } = chapter;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        {number && (
          <PrimaryInformation
            value={number.toString()}
            loud={true}
            copyable={false}
          />
        )}
        <button
          onClick={() => {
            console.log("headings", headings);
            setShowDetails(!showDetails);
          }}
          type="button"
          className="shrink-0 p-2 bg-neutral-700 h-6 rounded-md flex items-center justify-center text-sm text-neutral-400 hover:text-black hover:bg-neutral-200"
        >
          {showDetails ? "Hide Details" : "Show Details"}
        </button>
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-white font-bold">{description}</h3>
      </div>
    </div>
  );
};
