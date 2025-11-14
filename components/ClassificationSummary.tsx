import { useState } from "react";
import { useClassification } from "../contexts/ClassificationContext";
import { useHts } from "../contexts/HtsContext";
import { ClassifyPage } from "../enums/classify";
import { Color } from "../enums/style";
import {
  ClassificationProgression,
  ClassificationRecord,
} from "../interfaces/hts";
import { formatHumanReadableDate } from "../libs/date";
import { LoadingIndicator } from "./LoadingIndicator";
import { TertiaryLabel } from "./TertiaryLabel";
import { PrimaryLabel } from "./PrimaryLabel";
import { TertiaryText } from "./TertiaryText";
import { UserProfile } from "../libs/supabase/user";

interface Props {
  classificationRecord: ClassificationRecord;
  setPage: (page: ClassifyPage) => void;
  user: UserProfile;
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
  user,
}: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const { setClassification, setClassificationId } = useClassification();
  const { fetchElements, revision } = useHts();
  const classification = classificationRecord.classification;

  return (
    <div
      className="bg-base-100 p-4 rounded-lg cursor-pointer flex flex-col gap-2 border border-base-content/30 hover:bg-base-200 transition-all relative"
      onClick={async () => {
        // Get the classifications revision and see if we need to use useHts to fetch the elements
        const classificationRevision = classificationRecord.revision;

        if (classificationRevision !== revision) {
          console.log(`Fetching ${classificationRevision} Revision`);
          setIsLoading(true);
          await fetchElements(classificationRevision);
          setIsLoading(false);
        }

        setClassification(classification);
        setClassificationId(classificationRecord.id);
        setPage(ClassifyPage.CLASSIFY);
      }}
    >
      {isLoading && (
        <div className="absolute inset-0 bg-base-300/80 flex items-center justify-center rounded-lg z-10">
          <LoadingIndicator text="Loading..." />
        </div>
      )}

      <div className="flex flex-col gap-2">
        {/* Article Description - Most prominent */}
        <PrimaryLabel value={classification.articleDescription} />
      </div>

      {/* Metadata - Less prominent but clear */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-base-content/60 pt-2 border-t border-base-content/10">
        <div className="flex items-center gap-2">
          <TertiaryText value="HTS Code:" color={Color.DARK_GRAY} />
          <TertiaryLabel
            value={
              getFinalClassificationElement(classification.levels)
                ? getFinalClassificationElement(classification.levels).htsno
                : "Incomplete"
            }
            color={Color.DARK_GRAY}
          />
        </div>
        {user && user.team_id && (
          <div className="flex items-center gap-2">
            <TertiaryText value="Classifier:" color={Color.DARK_GRAY} />
            <TertiaryText
              value={
                classificationRecord.classifier
                  ? classificationRecord.classifier?.name ||
                    classificationRecord.classifier.email
                  : "Unknown"
              }
              color={Color.DARK_GRAY}
            />
          </div>
        )}
        <div className="flex items-center gap-2">
          <TertiaryText value="Created:" color={Color.DARK_GRAY} />
          <TertiaryText
            value={formatHumanReadableDate(classificationRecord.created_at)}
            color={Color.DARK_GRAY}
          />
        </div>
        <div className="flex items-center gap-2">
          <TertiaryText value="Updated:" color={Color.DARK_GRAY} />
          <TertiaryText
            value={formatHumanReadableDate(classificationRecord.updated_at)}
            color={Color.DARK_GRAY}
          />
        </div>
      </div>
    </div>
  );
};
