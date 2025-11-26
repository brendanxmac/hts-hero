import { useState } from "react";
import { useClassification } from "../contexts/ClassificationContext";
import { useHts } from "../contexts/HtsContext";
import { ClassifyPage } from "../enums/classify";
import { Color } from "../enums/style";
import {
  ClassificationProgression,
  ClassificationRecord,
  ClassificationStatus,
} from "../interfaces/hts";
import { formatHumanReadableDate } from "../libs/date";
import { LoadingIndicator } from "./LoadingIndicator";
import { TertiaryText } from "./TertiaryText";
import { UserProfile } from "../libs/supabase/user";
import { CheckCircleIcon } from "@heroicons/react/20/solid";
import { SecondaryLabel } from "./SecondaryLabel";
import { DocumentTextIcon, FlagIcon } from "@heroicons/react/24/solid";
import { TagIcon, UserIcon } from "@heroicons/react/16/solid";
import SquareIconButton from "./SqaureIconButton";

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
      className="bg-base-100 p-3 rounded-lg cursor-pointer flex flex-col gap-1 border border-base-content transition-all duration-100 relative shadow-sm hover:shadow-md hover:scale-[1.01]"
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

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3 justify-between">
          <TertiaryText
            value={
              getFinalClassificationElement(classification.levels)
                ? getFinalClassificationElement(classification.levels).htsno
                : "Incomplete"
            }
          />
          {classificationRecord.status === ClassificationStatus.REVIEW && (
            <div className="flex items-center gap-1">
              <FlagIcon className="h-4 w-4 text-warning" />
              <p className="text-xs font-bold text-warning">Needs Review</p>
            </div>
          )}
          {classificationRecord.status === ClassificationStatus.FINAL && (
            <div className="flex items-center gap-1">
              <CheckCircleIcon className="h-5 w-5 text-success" />
              <p className="text-xs font-bold text-success">Finalized</p>
            </div>
          )}
          {classificationRecord.status === ClassificationStatus.DRAFT && (
            <div className="flex items-center gap-1">
              <DocumentTextIcon className="h-4 w-4" />
              <p className="text-xs font-bold">Draft</p>
            </div>
          )}
        </div>
        {/* Article Description - Most prominent */}
        <SecondaryLabel value={classification.articleDescription} />
      </div>

      {/* Metadata - Less prominent but clear */}
      <div className="flex flex-wrap justify-between gap-x-3 gap-y-2 text-sm pt-1 border-t border-base-content/20 text-base-content/60">
        <div className="flex flex-wrap gap-3">
          {user && user.team_id && (
            <div className="flex items-center gap-1">
              <UserIcon className="h-4 w-4" />
              {/* <SquareIconButton
                onClick={() => {}}
                transparent
                iconOnly
                icon={<UserIcon className="h-4 w-4" />}
                tooltip="Classifier"
              /> */}
              {/* <UserIcon className="h-4 w-4" /> */}
              {/* <TertiaryText value="Classifier:" color={Color.DARK_GRAY} /> */}
              <TertiaryText
                value={
                  classificationRecord.classifier
                    ? classificationRecord.classifier?.name ||
                      classificationRecord.classifier.email
                    : "Unknown"
                }
              />
            </div>
          )}

          <div className="flex items-center gap-1">
            <TagIcon className="h-4 w-4" />
            {/* <SquareIconButton
              onClick={() => {}}
              transparent
              iconOnly
              icon={<TagIcon className="h-4 w-4" />}
              tooltip="Importer"
            /> */}
            {/* <TertiaryText value="Importer:" color={Color.DARK_GRAY} /> */}
            <TertiaryText
              value={
                classificationRecord.importer
                  ? classificationRecord.importer.name
                  : "Unassigned"
              }
            />
          </div>
        </div>

        <div className="flex items-center gap-1">
          <TertiaryText value="Last updated:" color={Color.DARK_GRAY} />
          <TertiaryText
            value={formatHumanReadableDate(classificationRecord.updated_at)}
          />
        </div>
      </div>
    </div>
  );
};
