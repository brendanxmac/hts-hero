import { useClassification } from "../contexts/ClassificationContext";
import { useHts } from "../contexts/HtsContext";
import { ClassifyPage } from "../enums/classify";
import { Color } from "../enums/style";
import {
  ClassificationProgression,
  ClassificationRecord,
} from "../interfaces/hts";
import { formatHumanReadableDate } from "../libs/date";
import { PrimaryText } from "./PrimaryText";
import { SecondaryLabel } from "./SecondaryLabel";
import { TertiaryText } from "./TertiaryText";

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
  if (decisions.length === 0) {
    return null;
  }

  const lastDecision = getLastDecision(decisions);

  if (!lastDecision) {
    return null;
  }
  return lastDecision.selection;
};

export const ClassificationSummary = ({
  classificationRecord,
  setPage,
}: Props) => {
  const { setClassification, setClassificationId } = useClassification();
  const { fetchElements } = useHts();
  const classification = classificationRecord.classification;

  return (
    <div
      className="bg-base-100 p-4 rounded-md cursor-pointer flex flex-col gap-2 border-2 border-base-content/30 transition duration-100 ease-in-out hover:scale-[1.02] hover:bg-base-300"
      onClick={() => {
        // Get the classifications revision and see if we need to use useHts to fetch the elements
        const revision = classificationRecord.revision;
        if (revision !== "latest") {
          fetchElements(revision);
        }
        setClassification(classification);
        setClassificationId(classificationRecord.id);
        setPage(ClassifyPage.CLASSIFY);
      }}
    >
      <div className="flex justify-between">
        {getFinalClassificationElement(classification.levels) ? (
          <SecondaryLabel
            value={getFinalClassificationElement(classification.levels).htsno}
            color={Color.PRIMARY}
          />
        ) : (
          <SecondaryLabel value="In Progress" color={Color.SECONDARY} />
        )}
        <div className="flex items-center gap-2">
          <TertiaryText
            value={formatHumanReadableDate(classificationRecord.created_at)}
          />
        </div>
      </div>
      <PrimaryText
        value={classification.articleDescription}
        color={Color.WHITE}
      />
    </div>
  );
};
