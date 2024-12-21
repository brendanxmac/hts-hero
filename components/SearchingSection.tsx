import { LabelledLoader } from "./LabelledLoader";
import { ProductDescriptionHeader } from "./ProductDescriptionHeader";
import SearchInput from "./SearchInput";
import { SearchResultSummary } from "./SearchResultSummary";

export const SearchingSection = () => {
  return (
    <section className="h-[calc(100vh-8rem)]">
      <div className="mt-4 md:mt-12 w-full items-center flex flex-col gap-4 overflow-y-auto">
        <div className="w-full px-4 justify-items-center">
          <ProductDescriptionHeader description="Stainless Steel water bottle for dogs to drink from on the go" />
        </div>
        <LabelledLoader text={"Thinking"} />
        <div className="w-full justify-items-center px-4">
          <SearchResultSummary
            htsCode="7323"
            htsDescription="Household goods > Made of Metal"
            // loader={{ isLoading: false, text: "" }}
            loader={{ isLoading: true, text: "Fetching Heading" }}
          />
        </div>
      </div>
      <div className="z-10 absolute bottom-0 w-full">
        <SearchInput />
      </div>
    </section>
  );
};
