import { useState } from "react";
import { useClassification } from "../contexts/ClassificationContext";
import { useHts } from "../contexts/HtsContext";
import { useUser } from "../contexts/UserContext";
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
import {
  DocumentTextIcon,
  FlagIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import { TagIcon, UserIcon } from "@heroicons/react/16/solid";

interface Props {
  classificationRecord: ClassificationRecord;
  setPage: (page: ClassifyPage) => void;
  user: UserProfile;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
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
  onDelete,
  isDeleting = false,
}: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { setClassification, setClassificationId } = useClassification();
  const { fetchElements, revision } = useHts();
  const { user: currentUser } = useUser();
  const classification = classificationRecord.classification;

  // User can delete if they are the owner and the classification is in draft status
  const canDelete =
    currentUser?.id === classificationRecord.user_id &&
    classificationRecord.status === ClassificationStatus.DRAFT;

  return (
    <div
      className="bg-base-100 p-4 rounded-xl cursor-pointer flex flex-col gap-3 border border-base-content/40 transition-all duration-200 relative shadow-sm hover:shadow-lg hover:border-primary hover:bg-primary/[0.05]"
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

      {isDeleting && (
        <div className="absolute inset-0 bg-error/10 flex items-center justify-center rounded-xl z-10 animate-pulse">
          <div className="flex items-center gap-2 text-error">
            <span className="loading loading-spinner loading-sm"></span>
            <span className="text-sm font-medium">Deleting...</span>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 justify-between">
          <div className="text-sm font-semibold text-primary">
            {getFinalClassificationElement(classification.levels)
              ? getFinalClassificationElement(classification.levels).htsno
              : "Incomplete"}
          </div>
          <div className="flex items-center gap-2">
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
            {canDelete && onDelete && (
              <button
                className="p-1.5 rounded-lg hover:bg-error/10 transition-colors group"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteModal(true);
                }}
                title="Delete classification"
              >
                <TrashIcon className="h-4 w-4 text-base-content/40 group-hover:text-error transition-colors" />
              </button>
            )}
          </div>
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={(e) => {
            e.stopPropagation();
            setShowDeleteModal(false);
          }}
        >
          <div
            className="bg-base-100 rounded-xl p-6 max-w-md w-full mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-2">Delete Classification</h3>
            <p className="text-base-content/70 mb-6">
              Are you sure you want to delete this classification? This action
              cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="btn btn-ghost btn-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteModal(false);
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-error btn-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteModal(false);
                  onDelete?.(classificationRecord.id);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
