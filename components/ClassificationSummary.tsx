import { ClassifyPage } from "../enums/classify";
import { Color } from "../enums/style";
import {
  ClassificationProgression,
  FetchedClassification,
} from "../interfaces/hts";
import { formatHumanReadableDate } from "../libs/date";
import { PrimaryText } from "./PrimaryText";
import { SecondaryLabel } from "./SecondaryLabel";
import { TertiaryLabel } from "./TertiaryLabel";

interface Props {
  classification: FetchedClassification;
  setPage: (page: ClassifyPage) => void;
}

// Create a helper function to get the last decision
const getLastDecision = (decisions: ClassificationProgression[]) => {
  return decisions[decisions.length - 1];
};

const getFinalClassificationElement = (
  decisions: ClassificationProgression[]
) => {
  return getLastDecision(decisions).selection;
};

export const ClassificationSummary = ({ classification, setPage }: Props) => {
  return (
    <div
      className="bg-base-300 p-4 rounded-md hover:bg-base-200 cursor-pointer flex flex-col gap-2"
      onClick={() => setPage(ClassifyPage.CLASSIFY)}
    >
      <div className="flex justify-between">
        {getFinalClassificationElement(classification.decisions) && (
          <SecondaryLabel
            value={
              getFinalClassificationElement(classification.decisions).htsno
            }
            color={Color.PRIMARY}
          />
        )}
        <TertiaryLabel
          value={formatHumanReadableDate(classification.created_at)}
        />
      </div>
      <PrimaryText value={classification.description} color={Color.WHITE} />
    </div>
  );
};
