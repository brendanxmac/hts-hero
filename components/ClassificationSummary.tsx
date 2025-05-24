import { useClassification } from "../contexts/ClassificationContext";
import { ClassifyPage } from "../enums/classify";
import { Color } from "../enums/style";
import {
  ClassificationProgression,
  FetchedClassification,
} from "../interfaces/hts";
import { formatHumanReadableDate } from "../libs/date";
import { mapFetchedClassificationToClassification } from "../libs/hts";
import { PrimaryText } from "./PrimaryText";
import { SecondaryLabel } from "./SecondaryLabel";
import { TertiaryLabel } from "./TertiaryLabel";

interface Props {
  classification: FetchedClassification;
  setPage: (page: ClassifyPage) => void;
}

const getLastDecision = (decisions: ClassificationProgression[]) => {
  return decisions[decisions.length - 1];
};

const getFinalClassificationElement = (
  decisions: ClassificationProgression[]
) => {
  return getLastDecision(decisions).selection;
};

export const ClassificationSummary = ({ classification, setPage }: Props) => {
  const { setClassification } = useClassification();

  return (
    <div
      className="bg-base-300 p-4 rounded-md hover:bg-base-200 cursor-pointer flex flex-col gap-2"
      onClick={() => {
        setClassification(
          mapFetchedClassificationToClassification(classification)
        );
        setPage(ClassifyPage.CLASSIFY);
      }}
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
