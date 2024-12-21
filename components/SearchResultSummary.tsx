import { HorizontalAlignment } from "../enums/style";
import { Loader } from "../interfaces/ui";
import { PrimaryInformation } from "./PrimaryInformation";
import { SecondaryInformation } from "./SecondaryInformation";

interface Props {
  htsCode: string;
  htsDescription: string;
  loader: Loader;
}

export const SearchResultSummary = ({
  htsCode,
  htsDescription,
  loader,
}: Props) => {
  return (
    <div className="w-full max-w-2xl flex flex-col gap-5 bg-neutral-900 rounded-md p-4">
      <div className="flex-col lg:flex lg:justify-between">
        <PrimaryInformation label="Best HTS Code" heading={htsCode} />
        {!loader.isLoading && (
          <PrimaryInformation
            label="Tariff"
            heading={"7.5%"}
            textAlign={HorizontalAlignment.RIGHT}
          />
        )}
      </div>
      <SecondaryInformation label="Code Description" heading={htsDescription} />
    </div>
  );
};
