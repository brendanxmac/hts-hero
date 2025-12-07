import { useEffect, useState } from "react";
import { useClassification } from "../contexts/ClassificationContext";
import { downloadClassificationReport } from "../libs/hts";
import { PDFProps } from "../interfaces/ui";
import PDF from "./PDF";
import {
  ArrowDownTrayIcon,
  TrashIcon,
  CheckCircleIcon,
  TagIcon,
  DocumentTextIcon,
} from "@heroicons/react/16/solid";
import { UserProfile, UserRole } from "../libs/supabase/user";
import { LoadingIndicator } from "./LoadingIndicator";
import { Element } from "./Element";
import {
  fetchImportersForUser,
  fetchImportersForTeam,
  createImporter,
} from "../libs/supabase/importers";
import { ClassificationStatus, Importer } from "../interfaces/hts";
import { useClassifications } from "../contexts/ClassificationsContext";
import {
  updateClassification,
  deleteClassification,
} from "../libs/classification";
import Modal from "./Modal";
import ImporterDropdown from "./ImporterDropdown";
import toast from "react-hot-toast";
import { ClassifyPage } from "../enums/classify";

interface Props {
  userProfile: UserProfile;
  setPage: (page: ClassifyPage) => void;
}

export const ClassificationResultPage = ({ userProfile, setPage }: Props) => {
  const { classification, setClassification, classificationId } =
    useClassification();
  const { classifications, refreshClassifications } = useClassifications();
  const { levels } = classification;
  const [showPDF, setShowPDF] = useState<PDFProps | null>(null);
  const element = classification.levels[levels.length - 1].selection;
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updatingClassificationStatus, setUpdatingClassificationStatus] =
    useState(false);
  let classificationRecord = classifications.find(
    (c) => c.id === classificationId
  );

  const canUpdateDetails =
    userProfile.role === UserRole.ADMIN ||
    userProfile.id === classificationRecord?.user_id;

  // State for classifiers and importers
  const [importers, setImporters] = useState<Importer[]>([]);
  const [selectedImporterId, setSelectedImporterId] = useState<string>("");
  const [isLoadingImporters, setIsLoadingImporters] = useState(true);
  const [newImporter, setNewImporter] = useState("");
  const [isCreatingImporter, setIsCreatingImporter] = useState(false);
  const [showCreateImporterModal, setShowCreateImporterModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // User can delete if they are the owner and the classification is in draft status
  const canDelete =
    userProfile.id === classificationRecord?.user_id &&
    classificationRecord?.status === ClassificationStatus.DRAFT;

  const handleDeleteClassification = async () => {
    if (!classificationRecord) return;
    try {
      setIsDeleting(true);
      await deleteClassification(classificationRecord.id);
      toast.success("Classification deleted");
      await refreshClassifications();
      setPage(ClassifyPage.CLASSIFICATIONS);
    } catch (error) {
      // Error is already handled by apiClient
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Fetch classifiers and importers on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedImporters] = await Promise.all([
          userProfile.team_id
            ? fetchImportersForTeam(userProfile.team_id)
            : fetchImportersForUser(),
          refreshClassifications(),
        ]);
        setImporters(fetchedImporters);
        setIsLoadingImporters(false);

        if (classificationRecord) {
          setSelectedImporterId(classificationRecord.importer_id || "");
        }
      } catch (error) {
        console.error("Error fetching classifiers and importers:", error);
        setIsLoadingImporters(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (copied) {
      setTimeout(() => {
        setCopied(false);
      }, 1500);
    }
  }, [copied]);

  const handleAddImporter = async () => {
    if (!newImporter.trim()) return;

    setIsCreatingImporter(true);
    try {
      const newImporterData = await createImporter(
        newImporter.trim(),
        userProfile.team_id || undefined
      );
      setImporters((prev) => [...prev, newImporterData]);
      setNewImporter("");
      // Automatically select the newly created importer
      setSelectedImporterId(newImporterData.id);
      updateClassification(
        classificationId,
        undefined,
        newImporterData.id,
        undefined
      );
    } catch (error) {
      console.error("Failed to create importer:", error);
    } finally {
      setIsCreatingImporter(false);
    }
  };

  return (
    <div className="w-full min-h-full flex flex-col bg-base-100">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-base-200 via-base-100 to-base-200 border-b border-base-content/5">
        {/* Subtle animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-success/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-8 md:py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Left side - Main headline */}
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                <span className="bg-gradient-to-r from-base-content via-base-content to-base-content/80 bg-clip-text">
                  Classification Overview
                </span>
              </h1>
              <p className="text-base-content/60 text-sm md:text-base max-w-lg mt-1">
                Add context and supporting information for your classification
              </p>
            </div>

            {/* Right side - Action buttons */}
            <div className="flex flex-wrap gap-2 items-center">
              {classificationRecord && (
                <div className="relative">
                  <select
                    className="h-[42px] px-4 bg-base-100/80 rounded-xl border border-base-content/10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30 hover:border-primary/30 hover:bg-base-100 cursor-pointer font-semibold text-sm"
                    value={classificationRecord.status}
                    disabled={updatingClassificationStatus || !canUpdateDetails}
                    onChange={async (e) => {
                      const newStatus = e.target.value as ClassificationStatus;
                      setUpdatingClassificationStatus(true);
                      await updateClassification(
                        classificationId,
                        undefined,
                        undefined,
                        undefined,
                        newStatus
                      );
                      await refreshClassifications();
                      classificationRecord = classifications.find(
                        (c) => c.id === classificationId
                      );
                      setUpdatingClassificationStatus(false);
                    }}
                  >
                    <option value={ClassificationStatus.DRAFT}>Draft</option>
                    <option value={ClassificationStatus.REVIEW}>Review</option>
                    <option value={ClassificationStatus.FINAL}>Final</option>
                  </select>
                  {updatingClassificationStatus && (
                    <span className="loading loading-spinner loading-xs absolute right-10 top-1/2 -translate-y-1/2 text-primary"></span>
                  )}
                </div>
              )}
              <button
                className="group relative overflow-hidden px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 bg-gradient-to-r from-primary to-primary/90 text-primary-content hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || isLoadingImporters}
                onClick={async () => {
                  setLoading(true);
                  const importer = importers.find(
                    (i) => i.id === selectedImporterId
                  );

                  await downloadClassificationReport(
                    classificationRecord,
                    userProfile,
                    importer
                  );
                  setLoading(false);
                }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  {loading || isLoadingImporters ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    <ArrowDownTrayIcon className="w-4 h-4" />
                  )}
                  {loading ? "Downloading..." : "Download Report"}
                </span>
              </button>
              {canDelete && (
                <button
                  className="group flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 bg-error/10 border border-error/20 text-error hover:bg-error/20 hover:border-error/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setShowDeleteModal(true)}
                  disabled={isDeleting}
                  title="Delete classification"
                >
                  {isDeleting ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    <TrashIcon className="w-4 h-4" />
                  )}
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full max-w-5xl mx-auto px-6 py-8 flex flex-col gap-8">
        {/* Classification Details Card */}
        <div className="relative overflow-hidden rounded-2xl border border-base-content/10 bg-gradient-to-br from-base-200/60 via-base-100 to-base-200/40 p-6">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 flex flex-col gap-6">
            {/* Importer Section */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <TagIcon className="w-5 h-5 text-primary/70" />
                <span className="text-sm font-semibold uppercase tracking-wider text-base-content/70">
                  Importer
                </span>
              </div>
              <p className="text-sm text-base-content/50">
                Select the importer or client that you are providing this
                advisory to (optional)
              </p>
              <div className="flex gap-2">
                <ImporterDropdown
                  importers={importers}
                  selectedImporterId={selectedImporterId}
                  onSelectionChange={(value) => {
                    setSelectedImporterId(value);
                    updateClassification(
                      classificationId,
                      undefined,
                      value || null,
                      undefined
                    );
                  }}
                  onCreateSelected={() => setShowCreateImporterModal(true)}
                  isLoading={isLoadingImporters}
                  disabled={!canUpdateDetails}
                  showCreateOption={canUpdateDetails}
                />
                {selectedImporterId && (
                  <button
                    className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 bg-base-content/5 border border-base-content/10 hover:border-primary/30 hover:bg-primary/5 disabled:opacity-50"
                    onClick={() => {
                      setSelectedImporterId("");
                      updateClassification(
                        classificationId,
                        undefined,
                        null,
                        undefined
                      );
                    }}
                    disabled={isLoadingImporters || !canUpdateDetails}
                    title="Clear selected importer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-base-content/10 to-base-content/10"></div>
            </div>

            {/* Notes Section */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <DocumentTextIcon className="w-5 h-5 text-primary/70" />
                <span className="text-sm font-semibold uppercase tracking-wider text-base-content/70">
                  Basis for Classification
                </span>
              </div>
              <p className="text-sm text-base-content/50">
                Add any notes about your classification here. They will be
                included in your classification advisory.
              </p>
              <textarea
                className="min-h-36 w-full px-4 py-3 rounded-xl bg-base-100/80 border border-base-content/10 transition-all duration-200 placeholder:text-base-content/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30 hover:border-primary/30 hover:bg-base-100 resize-none text-base"
                placeholder="Add any notes about your classification here..."
                value={classification.notes || ""}
                disabled={!canUpdateDetails}
                onChange={(e) => {
                  setClassification({
                    ...classification,
                    notes: e.target.value,
                  });
                }}
              />
            </div>
          </div>
        </div>

        {/* HTS Code Section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="inline-block w-8 h-px bg-primary/40" />
            <span className="text-xs font-semibold uppercase tracking-widest text-primary/80">
              HTS Code & Tariff Details
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-base-content">
            Complete Tariff Information
          </h2>
          <p className="text-base-content/60 text-sm max-w-lg">
            View the complete tariff information for your classified item
          </p>

          <div className="relative overflow-hidden rounded-2xl border border-base-content/10 bg-gradient-to-br from-base-200/60 via-base-100 to-base-200/40 p-6">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-secondary/5 rounded-full blur-3xl" />
            </div>
            <div className="relative z-10">
              <Element element={element} />
            </div>
          </div>
        </div>
      </div>
      {showPDF && (
        <PDF
          title={showPDF.title}
          bucket={showPDF.bucket}
          filePath={showPDF.filePath}
          isOpen={showPDF !== null}
          setIsOpen={(isOpen) => {
            if (!isOpen) {
              setShowPDF(null);
            }
          }}
        />
      )}
      <Modal
        isOpen={showCreateImporterModal}
        setIsOpen={setShowCreateImporterModal}
      >
        <div className="p-6 flex flex-col gap-4 min-w-80">
          <h3 className="text-lg font-semibold">Create New Importer</h3>
          <input
            type="text"
            placeholder="Importer name"
            value={newImporter}
            className="input input-bordered w-full"
            onChange={(e) => setNewImporter(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && newImporter.trim()) {
                handleAddImporter();
                setShowCreateImporterModal(false);
                setNewImporter("");
              }
            }}
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <button
              className="btn btn-ghost"
              onClick={() => {
                setShowCreateImporterModal(false);
                setNewImporter("");
              }}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                handleAddImporter();
                setShowCreateImporterModal(false);
                setNewImporter("");
              }}
              disabled={isCreatingImporter || !newImporter.trim()}
            >
              {isCreatingImporter ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                "Create"
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowDeleteModal(false)}
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
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded-xl font-semibold text-sm bg-error text-error-content hover:bg-error/90 hover:shadow-lg hover:shadow-error/25 transition-all duration-200"
                  onClick={handleDeleteClassification}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
