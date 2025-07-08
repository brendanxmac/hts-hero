import { useClassification } from "../contexts/ClassificationContext";
import { ClassifyPage } from "../enums/classify";
import { Color } from "../enums/style";
import {
  ClassificationProgression,
  ClassificationRecord,
} from "../interfaces/hts";
import { formatHumanReadableDate } from "../libs/date";
import { PrimaryText } from "./PrimaryText";
import { SecondaryLabel } from "./SecondaryLabel";
import { TertiaryLabel } from "./TertiaryLabel";

interface Props {
  classificationRecord: ClassificationRecord;
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

export const ClassificationSummary = ({
  classificationRecord,
  setPage,
}: Props) => {
  const { setClassification, setClassificationId } = useClassification();
  const classification = classificationRecord.classification;

  return (
    <div
      className="bg-base-300 p-4 rounded-md cursor-pointer flex flex-col gap-2 border-2 border-base-content/30 transition duration-100 ease-in-out scale-[0.99] hover:scale-[1]"
      onClick={() => {
        setClassification(classification);
        setClassificationId(classificationRecord.id);
        setPage(ClassifyPage.CLASSIFY);
      }}
    >
      <div className="flex justify-between">
        {getFinalClassificationElement(classification.levels) && (
          <SecondaryLabel
            value={getFinalClassificationElement(classification.levels).htsno}
            color={Color.PRIMARY}
          />
        )}
        <div className="flex items-center gap-2">
          <TertiaryLabel
            value={formatHumanReadableDate(classificationRecord.created_at)}
          />
          {/* <TertiaryLabel
            value={classification.isComplete ? "Complete" : "Incomplete"}
            color={classification.isComplete ? Color.ACCENT : Color.SECONDARY}
          /> */}
        </div>
      </div>
      <PrimaryText
        value={classification.articleDescription}
        color={Color.WHITE}
      />
    </div>
  );
};
