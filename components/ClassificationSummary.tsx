import { useState } from "react";
import { useClassification } from "../contexts/ClassificationContext";
import { useHts } from "../contexts/HtsContext";
import { useUser } from "../contexts/UserContext";
import { ClassifyPage } from "../enums/classify";
import {
  ClassificationProgression,
  ClassificationRecord,
  ClassificationStatus,
} from "../interfaces/hts";
import { formatHumanReadableDate } from "../libs/date";
import { LoadingIndicator } from "./LoadingIndicator";
import { UserProfile } from "../libs/supabase/user";
import { CheckCircleIcon, ClockIcon } from "@heroicons/react/20/solid";
import {
  DocumentTextIcon,
  FlagIcon,
  TrashIcon,
  ChevronRightIcon,
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

  const finalElement = getFinalClassificationElement(classification.levels);

  return (
    <div
      className="group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 bg-gradient-to-br from-base-100 via-base-100 to-base-200/30 border border-base-content/10 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 hover:scale-[1.01]"
      onClick={async () => {
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
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-base-100/90 backdrop-blur-sm flex items-center justify-center rounded-2xl z-10">
          <LoadingIndicator text="Loading..." />
        </div>
      )}

      {/* Deleting overlay */}
      {isDeleting && (
        <div className="absolute inset-0 bg-error/10 backdrop-blur-sm flex items-center justify-center rounded-2xl z-10">
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-base-100 shadow-lg">
            <span className="loading loading-spinner loading-sm text-error"></span>
            <span className="text-sm font-semibold text-error">
              Deleting...
            </span>
          </div>
        </div>
      )}

      <div className="relative z-[1] p-5">
        {/* Top Row: HTS Code + Status Badges */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            {/* HTS Code Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-primary/15 to-primary/5 border border-primary/20">
              <span className="text-sm font-bold text-primary">
                {finalElement ? finalElement.htsno : "Incomplete"}
              </span>
            </div>

            {/* Incomplete indicator */}
            {!finalElement && (
              <span className="text-xs font-medium text-base-content/50 italic">
                Incomplete
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Status Badges */}
            {classificationRecord.status === ClassificationStatus.REVIEW && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-warning/20 to-warning/10 border border-warning/30">
                <FlagIcon className="h-3.5 w-3.5 text-warning" />
                <span className="text-xs font-semibold text-warning">
                  Needs Review
                </span>
              </div>
            )}
            {classificationRecord.status === ClassificationStatus.FINAL && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-success/20 to-success/10 border border-success/30">
                <CheckCircleIcon className="h-4 w-4 text-success" />
                <span className="text-xs font-semibold text-success">
                  Finalized
                </span>
              </div>
            )}
            {classificationRecord.status === ClassificationStatus.DRAFT && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-base-content/5 border border-base-content/10">
                <DocumentTextIcon className="h-3.5 w-3.5 text-base-content/50" />
                <span className="text-xs font-semibold text-base-content/50">
                  Draft
                </span>
              </div>
            )}

            {/* Delete Button */}
            {canDelete && onDelete && (
              <button
                className="p-2 rounded-lg bg-base-content/5 hover:bg-error/15 border border-transparent hover:border-error/30 transition-all duration-200 group/delete"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteModal(true);
                }}
                title="Delete classification"
              >
                <TrashIcon className="h-4 w-4 text-base-content/40 group-hover/delete:text-error transition-colors" />
              </button>
            )}

            {/* Chevron indicator */}
            <ChevronRightIcon className="h-5 w-5 text-base-content/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200" />
          </div>
        </div>

        {/* Article Description */}
        <div className="mb-4">
          <p className="text-base font-semibold text-base-content leading-relaxed line-clamp-2 group-hover:text-base-content/90 transition-colors">
            {classification.articleDescription}
          </p>
        </div>

        {/* Metadata Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-base-content/5">
          <div className="flex flex-wrap items-center gap-4">
            {/* Classifier */}
            {user && user.team_id && (
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-base-content/5">
                  <UserIcon className="h-3 w-3 text-base-content/50" />
                </div>
                <span className="text-xs font-medium text-base-content/60">
                  {classificationRecord.classifier
                    ? classificationRecord.classifier?.name ||
                      classificationRecord.classifier.email
                    : "Unknown"}
                </span>
              </div>
            )}

            {/* Importer */}
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-base-content/5">
                <TagIcon className="h-3 w-3 text-base-content/50" />
              </div>
              <span className="text-xs font-medium text-base-content/60">
                {classificationRecord.importer
                  ? classificationRecord.importer.name
                  : "Unassigned"}
              </span>
            </div>
          </div>

          {/* Last Updated */}
          <div className="flex items-center gap-2 text-xs text-base-content/40">
            <ClockIcon className="h-3.5 w-3.5" />
            <span>
              Updated {formatHumanReadableDate(classificationRecord.updated_at)}
            </span>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={(e) => {
            e.stopPropagation();
            setShowDeleteModal(false);
          }}
        >
          <div
            className="relative overflow-hidden bg-base-100 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border border-base-content/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative background */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-error/10 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10">
              {/* Icon */}
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-error/10 border border-error/20 mb-4">
                <TrashIcon className="h-6 w-6 text-error" />
              </div>

              <h3 className="text-xl font-bold text-base-content mb-2">
                Delete Classification
              </h3>
              <p className="text-base-content/60 mb-6 leading-relaxed">
                Are you sure you want to delete this classification? This action
                cannot be undone.
              </p>

              <div className="flex justify-end gap-3">
                <button
                  className="px-4 py-2 rounded-xl font-semibold text-sm text-base-content/70 hover:text-base-content hover:bg-base-content/5 transition-all duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteModal(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded-xl font-semibold text-sm bg-error text-error-content hover:bg-error/90 hover:shadow-lg hover:shadow-error/25 transition-all duration-200"
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
        </div>
      )}
    </div>
  );
};
