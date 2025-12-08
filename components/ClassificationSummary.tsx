import { useState } from "react";
import { createPortal } from "react-dom";
import { useClassification } from "../contexts/ClassificationContext";
import { useHts } from "../contexts/HtsContext";
import { useUser } from "../contexts/UserContext";
import { ClassifyPage } from "../enums/classify";
import {
  ClassificationProgression,
  ClassificationRecord,
  ClassificationStatus,
} from "../interfaces/hts";
import { Countries } from "../constants/countries";
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

const getLatestHtsNo = (levels: ClassificationProgression[]): string | null => {
  // Iterate from the end to find the latest level with a valid htsno
  for (let i = levels.length - 1; i >= 0; i--) {
    const selection = levels[i].selection;
    if (selection?.htsno) {
      return selection.htsno;
    }
  }
  return null;
};

const isFull10DigitHtsNo = (htsno: string | null): boolean => {
  if (!htsno) return false;
  // Remove periods and check if we have 10 digits
  const digitsOnly = htsno.replace(/\./g, "");
  return digitsOnly.length === 10;
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

  const latestHtsNo = getLatestHtsNo(classification.levels);

  // Get country of origin info
  const countryOfOrigin = classificationRecord.country_of_origin
    ? Countries.find((c) => c.code === classificationRecord.country_of_origin)
    : null;

  return (
    <>
      <div
        className="group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 bg-base-100 border border-base-content/15 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 hover:scale-[1.01]"
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
        <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

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
            <div className="flex items-center">
              {/* HTS Code Badge */}

              <p className="text-sm font-bold text-primary">
                {latestHtsNo ?? "Not Started"}
              </p>

              {/* Country of Origin Badge */}
              {countryOfOrigin && (
                <div className="flex items-center gap-1.5 px-2 py-1">
                  <p className="text-xs text-base-content/40">|</p>
                  <p className="text-base">{countryOfOrigin.flag}</p>
                  <p className="text-sm font-semibold">
                    {countryOfOrigin.name}
                  </p>
                </div>
              )}

              {/* Incomplete indicator */}
              {!isFull10DigitHtsNo(latestHtsNo) && (
                <span className="text-xs font-medium text-base-content/60 italic">
                  Incomplete
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Status Badges */}
              {classificationRecord.status === ClassificationStatus.REVIEW && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-warning/25 border border-warning/40">
                  <FlagIcon className="h-3.5 w-3.5 text-warning" />
                  <span className="text-xs font-bold text-warning">
                    Needs Review
                  </span>
                </div>
              )}
              {classificationRecord.status === ClassificationStatus.FINAL && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-success/25 border border-success/40">
                  <CheckCircleIcon className="h-4 w-4 text-success" />
                  <span className="text-xs font-bold text-success">
                    Finalized
                  </span>
                </div>
              )}
              {classificationRecord.status === ClassificationStatus.DRAFT && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-base-content/10 border border-base-content/20">
                  <DocumentTextIcon className="h-3.5 w-3.5 text-base-content/60" />
                  <span className="text-xs font-semibold text-base-content/60">
                    Draft
                  </span>
                </div>
              )}

              {/* Delete Button */}
              {canDelete && onDelete && (
                <button
                  className="p-2 rounded-lg bg-base-content/10 hover:bg-error/20 border border-transparent hover:border-error/40 transition-all duration-200 group/delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteModal(true);
                  }}
                  title="Delete classification"
                >
                  <TrashIcon className="h-4 w-4 text-base-content/50 group-hover/delete:text-error transition-colors" />
                </button>
              )}

              {/* Chevron indicator */}
              <ChevronRightIcon className="h-5 w-5 text-base-content/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200" />
            </div>
          </div>

          {/* Article Description */}
          <div className="mb-4">
            <p className="text-base font-semibold text-base-content leading-relaxed line-clamp-2">
              {classification.articleDescription}
            </p>
          </div>

          {/* Metadata Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-base-content/10">
            <div className="flex flex-wrap items-center gap-4">
              {/* Classifier */}
              {user && user.team_id && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-base-content/10">
                    <UserIcon className="h-3 w-3 text-base-content/60" />
                  </div>
                  <span className="text-xs font-medium text-base-content/70">
                    {classificationRecord.classifier
                      ? classificationRecord.classifier?.name ||
                        classificationRecord.classifier.email
                      : "Unknown"}
                  </span>
                </div>
              )}

              {/* Importer */}
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-base-content/10">
                  <TagIcon className="h-3 w-3 text-base-content/60" />
                </div>
                <span className="text-xs font-medium text-base-content/70">
                  {classificationRecord.importer
                    ? classificationRecord.importer.name
                    : "Unassigned"}
                </span>
              </div>
            </div>

            {/* Last Updated */}
            <div className="flex items-center gap-2 text-xs text-base-content/50">
              <ClockIcon className="h-3.5 w-3.5" />
              <span>
                Updated{" "}
                {formatHumanReadableDate(classificationRecord.updated_at)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal - rendered via portal to escape overflow:hidden */}
      {showDeleteModal &&
        createPortal(
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteModal(false);
            }}
          >
            <div
              className="relative overflow-hidden bg-base-100 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border border-base-content/15"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Decorative background */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-error/15 rounded-full blur-3xl" />
              </div>

              <div className="relative z-10">
                {/* Icon */}
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-error/20 border border-error/30 mb-4">
                  <TrashIcon className="h-6 w-6 text-error" />
                </div>

                <h3 className="text-xl font-bold text-base-content mb-2">
                  Delete Classification
                </h3>
                <p className="text-base-content/70 mb-6 leading-relaxed">
                  Are you sure you want to delete this classification? This
                  action cannot be undone.
                </p>

                <div className="flex justify-end gap-3">
                  <button
                    className="px-4 py-2 rounded-xl font-semibold text-sm text-base-content/80 hover:text-base-content hover:bg-base-content/10 transition-all duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteModal(false);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 rounded-xl font-semibold text-sm bg-error text-error-content hover:bg-error/90 hover:shadow-lg hover:shadow-error/30 transition-all duration-200"
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
          </div>,
          document.body
        )}
    </>
  );
};
