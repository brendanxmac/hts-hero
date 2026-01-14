import { useState } from "react";
import { PrimaryLabel } from "./PrimaryLabel";
import { TertiaryLabel } from "./TertiaryLabel";
import { TertiaryText } from "./TertiaryText";

interface Props {
  searchTerm: string;
}

export const SearchCrossRulings = ({ searchTerm }: Props) => {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  const handleSearch = (searchTerm?: string) => {
    window.open(
      `https://rulings.cbp.gov/search?term=${encodeURIComponent(
        searchTerm || localSearchTerm
      )}`,
      "_blank"
    );
  };

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col gap-2">
      <div className="w-full bg-base-100 rounded-lg p-6 flex flex-col gap-6">
        <div className="flex flex-col">
          <PrimaryLabel value="Search CROSS Rulings" />
          <TertiaryText value="Search for customs rulings and interpretations from The U.S. Customs and Border Protection (CBP)" />
        </div>

        <div className="w-full flex flex-col gap-2">
          <TertiaryLabel value="Search Term" />
          <div className="w-full flex flex-col gap-3">
            <input
              className="w-full p-3 bg-base-200 border-2 border-base-content/20 rounded-lg text-base-content placeholder-base-content/50 focus:outline-none focus:ring-2 focus:ring-primary"
              type="text"
              placeholder="Enter search term..."
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />
            <div className="flex items-center gap-3 w-full justify-end">
              <button
                className="btn btn-primary btn-sm transition-colors"
                onClick={() => handleSearch()}
                disabled={!localSearchTerm.trim()}
              >
                Search Rulings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
