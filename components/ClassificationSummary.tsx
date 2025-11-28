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
      className="bg-base-100 p-4 rounded-xl cursor-pointer flex flex-col gap-3 border border-primary/70 transition-all duration-200 relative shadow-sm hover:shadow-lg hover:border-primary hover:bg-primary/[0.05]"
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
        <div className="absolute inset-0 bg-base-300/80 flex items-center justify-center rounded-xl z-10">
          <LoadingIndicator text="Loading..." />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 justify-between">
          <div className="text-sm font-semibold text-primary">
            {getFinalClassificationElement(classification.levels)
              ? getFinalClassificationElement(classification.levels).htsno
              : "Incomplete"}
          </div>
          {classificationRecord.status === ClassificationStatus.REVIEW && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary">
              <FlagIcon className="h-3.5 w-3.5 text-base-300" />
              <p className="text-xs font-semibold text-base-300">
                Needs Review
              </p>
            </div>
          )}
          {classificationRecord.status === ClassificationStatus.FINAL && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10">
              <CheckCircleIcon className="h-4 w-4 text-success" />
              <p className="text-xs font-semibold text-success">Finalized</p>
            </div>
          )}
          {classificationRecord.status === ClassificationStatus.DRAFT && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-base-content/5">
              <DocumentTextIcon className="h-3.5 w-3.5 text-base-content/60" />
              <p className="text-xs font-semibold text-base-content/60">
                Draft
              </p>
            </div>
          )}
        </div>
        {/* Article Description - Most prominent */}
        <SecondaryLabel value={classification.articleDescription} />
      </div>

      {/* Metadata - Less prominent but clear */}
      <div className="flex flex-wrap justify-between gap-x-3 gap-y-2 text-sm pt-2 border-t border-base-content/10 text-base-content/60">
        <div className="flex flex-wrap gap-3">
          {user && user.team_id && (
            <div className="flex items-center gap-1.5">
              <UserIcon className="h-3.5 w-3.5 text-base-content/40" />
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

          <div className="flex items-center gap-1.5">
            <TagIcon className="h-3.5 w-3.5 text-base-content/40" />
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
