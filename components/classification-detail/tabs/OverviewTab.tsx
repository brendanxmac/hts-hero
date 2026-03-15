"use client";

import {
  useEffect,
  useState,
  useCallback,
  useRef,
  useLayoutEffect,
} from "react";
import { useClassification } from "../../../contexts/ClassificationContext";
import { useClassifications } from "../../../contexts/ClassificationsContext";
import { UserProfile, UserRole } from "../../../libs/supabase/user";
import {
  ClassificationI,
  ClassificationRecord,
  ClassificationStatus,
  Importer,
} from "../../../interfaces/hts";
import { updateClassification } from "../../../libs/classification";
import {
  fetchImportersForUser,
  fetchImportersForTeam,
  createImporter,
} from "../../../libs/supabase/importers";
import { generateBasisForClassification } from "../../../libs/hts";
import ImporterDropdown from "../../ImporterDropdown";
import Modal from "../../Modal";
import { ClassificationHierarchy } from "../ClassificationHierarchy";
import { StatusDropdown } from "../../classification-ui/StatusDropdown";
import { DownloadReportButton } from "../../classification-ui/DownloadReportButton";
import { Country } from "../../../constants/countries";
import {
  DocumentTextIcon,
  TrashIcon,
  ArrowRightIcon,
  ShareIcon,
  LinkIcon,
  ClipboardDocumentCheckIcon,
  TagIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolid } from "@heroicons/react/16/solid";
import apiClient from "../../../libs/api";
import config from "@/config";

interface Props {
  classification: ClassificationI;
  classificationRecord?: ClassificationRecord;
  userProfile: UserProfile | null;
  importers: Importer[];
  isLoadingImporters: boolean;
  canUpdateDetails: boolean;
  canDelete: boolean;
  updatingStatus: boolean;
  downloadingReport: boolean;
  isDeleting: boolean;
  latestHtsCode: string;
  countryOfOrigin: Country | null;
  onStatusChange: (status: ClassificationStatus) => void;
  onDownloadReport: () => void;
  onDeleteClick: () => void;
  onNavigateToDuty: () => void;
}

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-base-300 bg-base-100 shadow-sm overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
}

function CardHeader({
  title,
  icon,
  action,
}: {
  title: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-b border-base-300 bg-base-200/30">
      <div className="flex items-center gap-2.5">
        {icon && (
          <span className="text-base-content/50">{icon}</span>
        )}
        <h3 className="text-sm font-semibold text-base-content">{title}</h3>
      </div>
      {action}
    </div>
  );
}

function ShareSectionInline({
  classificationRecord,
}: {
  classificationRecord: ClassificationRecord;
}) {
  const [isShared, setIsShared] = useState(
    classificationRecord.is_shared ?? false
  );
  const [shareToken, setShareToken] = useState(
    classificationRecord.share_token ?? null
  );
  const [isToggling, setIsToggling] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = shareToken
    ? `${typeof window !== "undefined" ? window.location.origin : `https://${config.domainName}`}/c/${shareToken}`
    : null;

  const handleToggleShare = async () => {
    setIsToggling(true);
    try {
      const response: { share_token: string | null; is_shared: boolean } =
        await apiClient.post("/classification/share", {
          id: classificationRecord.id,
          enable: !isShared,
        });
      setIsShared(response.is_shared);
      setShareToken(response.share_token);
    } catch (error) {
      console.error("Error toggling share:", error);
    } finally {
      setIsToggling(false);
    }
  };

  const handleCopyLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-base-content">
            Share Classification
          </p>
          <p className="text-xs text-base-content/50 mt-0.5">
            Generate a public read-only link
          </p>
        </div>
        <label className="flex items-center cursor-pointer gap-2">
          <input
            type="checkbox"
            className="toggle toggle-primary toggle-sm"
            checked={isShared}
            onChange={handleToggleShare}
            disabled={isToggling}
          />
          {isToggling && (
            <span className="loading loading-spinner loading-xs" />
          )}
        </label>
      </div>

      {isShared && shareUrl && (
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-base-200 border border-base-300 text-xs text-base-content/60 truncate">
            <LinkIcon className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{shareUrl}</span>
          </div>
          <button
            className="btn btn-sm btn-primary gap-1.5 shrink-0"
            onClick={handleCopyLink}
          >
            {copied ? (
              <>
                <ClipboardDocumentCheckIcon className="w-3.5 h-3.5" />
                Copied
              </>
            ) : (
              <>
                <LinkIcon className="w-3.5 h-3.5" />
                Copy
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export const OverviewTab = ({
  classification,
  classificationRecord,
  userProfile,
  importers: initialImporters,
  isLoadingImporters: initialLoadingImporters,
  canUpdateDetails,
  canDelete,
  updatingStatus,
  downloadingReport,
  isDeleting,
  latestHtsCode,
  countryOfOrigin,
  onStatusChange,
  onDownloadReport,
  onDeleteClick,
  onNavigateToDuty,
}: Props) => {
  const { classification: ctxClassification, setClassification, classificationId, flushAndSave } =
    useClassification();
  const { refreshClassifications } = useClassifications();

  const liveClassification = ctxClassification || classification;

  const basisTextareaRef = useRef<HTMLTextAreaElement>(null);

  const resizeBasisTextarea = useCallback(() => {
    const textarea = basisTextareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, []);

  useLayoutEffect(() => {
    resizeBasisTextarea();
  }, [liveClassification.notes, liveClassification.levels, resizeBasisTextarea]);

  useEffect(() => {
    if (
      liveClassification.isComplete &&
      (liveClassification.notes === undefined || liveClassification.notes === null)
    ) {
      setClassification({
        ...liveClassification,
        notes: generateBasisForClassification(liveClassification),
      });
    }
  }, [liveClassification.isComplete]);

  const [importers, setImporters] = useState<Importer[]>(initialImporters);
  const [selectedImporterId, setSelectedImporterId] = useState<string>(
    classificationRecord?.importer_id || ""
  );
  const [isLoadingImporters, setIsLoadingImporters] = useState(
    initialLoadingImporters
  );
  const [newImporter, setNewImporter] = useState("");
  const [isCreatingImporter, setIsCreatingImporter] = useState(false);
  const [showCreateImporterModal, setShowCreateImporterModal] = useState(false);

  useEffect(() => {
    if (!userProfile) return;
    const fetchData = async () => {
      try {
        const fetchedImporters = userProfile.team_id
          ? await fetchImportersForTeam(userProfile.team_id)
          : await fetchImportersForUser();
        setImporters(fetchedImporters);
        setIsLoadingImporters(false);
        if (classificationRecord) {
          setSelectedImporterId(classificationRecord.importer_id || "");
        }
      } catch (error) {
        console.error("Error fetching importers:", error);
        setIsLoadingImporters(false);
      }
    };
    fetchData();
  }, [userProfile]);

  const handleAddImporter = async () => {
    if (!newImporter.trim() || !userProfile) return;
    setIsCreatingImporter(true);
    try {
      const newImporterData = await createImporter(
        newImporter.trim(),
        userProfile.team_id || undefined
      );
      setImporters((prev) => [...prev, newImporterData]);
      setNewImporter("");
      setSelectedImporterId(newImporterData.id);
      await updateClassification(
        classificationId,
        undefined,
        newImporterData.id,
        undefined
      );
      await refreshClassifications();
    } catch (error) {
      console.error("Failed to create importer:", error);
    } finally {
      setIsCreatingImporter(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-base-content">Overview</h2>
        <p className="text-sm text-base-content/60 mt-1">
          Summary of your classification details and actions.
        </p>
      </div>

      {/* Item Description */}
      <Card>
        <CardHeader
          title="Item Description"
          icon={<DocumentTextIcon className="w-4 h-4" />}
        />
        <div className="p-5">
          <p className="text-sm text-base-content leading-relaxed">
            {liveClassification?.articleDescription || "No description available."}
          </p>
        </div>
      </Card>

      {/* HTS Code & Status */}
      <Card>
        <CardHeader
          title="HTS Code & Status"
          icon={<CheckCircleIcon className="w-4 h-4" />}
          action={
            classificationRecord &&
            liveClassification.isComplete && (
              <StatusDropdown
                status={classificationRecord.status}
                isUpdating={updatingStatus}
                disabled={!canUpdateDetails}
                onChange={onStatusChange}
              />
            )
          }
        />
        <div className="p-5">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-base-content/40 mb-1">
                Classified HTS Code
              </p>
              <p className="text-2xl font-mono font-bold text-primary">
                {latestHtsCode || "Pending..."}
              </p>
            </div>
            {liveClassification.isComplete && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/10 border border-success/20">
                <CheckCircleSolid className="w-4 h-4 text-success" />
                <span className="text-xs font-semibold text-success">
                  Complete
                </span>
              </div>
            )}
          </div>
          {countryOfOrigin && (
            <p className="text-xs text-base-content/50 mt-2">
              Country of Origin: {countryOfOrigin.name} ({countryOfOrigin.code})
            </p>
          )}
        </div>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader
          title="Actions"
        />
        <div className="divide-y divide-base-300">
          {/* Report Download */}
          {liveClassification.isComplete && userProfile && (
            <div className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-base-content">
                  Classification Report
                </p>
                <p className="text-xs text-base-content/50 mt-0.5">
                  Download a branded, audit-ready PDF report.
                </p>
              </div>
              <DownloadReportButton
                isDownloading={downloadingReport}
                disabled={downloadingReport || isLoadingImporters}
                onClick={onDownloadReport}
              />
            </div>
          )}

          {/* Share */}
          {classificationRecord && userProfile && (
            <ShareSectionInline classificationRecord={classificationRecord} />
          )}

          {/* Delete */}
          {canDelete && classificationRecord && (
            <div className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-base-content">
                  Delete Classification
                </p>
                <p className="text-xs text-base-content/50 mt-0.5">
                  Permanently remove this classification.
                </p>
              </div>
              <button
                className="btn btn-sm btn-outline btn-error gap-1.5"
                onClick={onDeleteClick}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  <TrashIcon className="w-4 h-4" />
                )}
                Delete
              </button>
            </div>
          )}
        </div>
      </Card>

      {/* Tariff Summary */}
      {liveClassification.isComplete && (
        <Card>
          <CardHeader
            title="Tariff Summary"
            icon={<CurrencyDollarIcon className="w-4 h-4" />}
            action={
              <button
                onClick={onNavigateToDuty}
                className="btn btn-xs btn-ghost gap-1 text-primary"
              >
                View Details
                <ArrowRightIcon className="w-3 h-3" />
              </button>
            }
          />
          <div className="p-5">
            <p className="text-sm text-base-content/60">
              Navigate to the Duty / Tariffs tab to calculate import duties and
              see applicable tariff rates for any country of origin.
            </p>
          </div>
        </Card>
      )}

      {/* Classification Hierarchy */}
      <Card>
        <CardHeader
          title="Classification Hierarchy"
          icon={<CheckCircleIcon className="w-4 h-4" />}
        />
        <div className="p-5">
          <ClassificationHierarchy classification={liveClassification} />
        </div>
      </Card>

      {/* Importer */}
      {userProfile && (
        <Card>
          <CardHeader
            title="Importer"
            icon={<TagIcon className="w-4 h-4" />}
          />
          <div className="p-5">
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
                  ).then(() => refreshClassifications());
                }}
                onCreateSelected={() => setShowCreateImporterModal(true)}
                isLoading={isLoadingImporters}
                disabled={!canUpdateDetails}
                showCreateOption={canUpdateDetails}
              />
              {selectedImporterId && canUpdateDetails && (
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => {
                    setSelectedImporterId("");
                    updateClassification(
                      classificationId,
                      undefined,
                      null,
                      undefined
                    ).then(() => refreshClassifications());
                  }}
                  disabled={isLoadingImporters}
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Basis for Classification */}
      <Card>
        <CardHeader
          title="Basis for Classification"
          icon={<DocumentTextIcon className="w-4 h-4" />}
        />
        <div className="p-5">
          <textarea
            ref={basisTextareaRef}
            className={`whitespace-pre-wrap min-h-36 w-full px-4 py-3 rounded-lg border transition-all duration-200 placeholder:text-base-content/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/40 resize-none overflow-hidden text-sm ${
              canUpdateDetails
                ? "bg-base-100 border-base-300 hover:border-primary/40"
                : "bg-base-200/50 border-base-300 cursor-not-allowed opacity-60"
            }`}
            placeholder="Add any notes about your classification here"
            value={liveClassification.notes ?? ""}
            disabled={!canUpdateDetails}
            onChange={(e) => {
              setClassification({
                ...liveClassification,
                notes: e.target.value,
              });
              resizeBasisTextarea();
            }}
            onBlur={() => {
              flushAndSave();
            }}
          />
        </div>
      </Card>

      {/* Create Importer Modal */}
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
                <span className="loading loading-spinner loading-xs" />
              ) : (
                "Create"
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
