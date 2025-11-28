import { useEffect, useState } from "react";
import { useClassification } from "../contexts/ClassificationContext";
import { downloadClassificationReport } from "../libs/hts";
import { PDFProps } from "../interfaces/ui";
import PDF from "./PDF";
import { ArrowDownTrayIcon } from "@heroicons/react/16/solid";
import { UserProfile, UserRole } from "../libs/supabase/user";
import { LoadingIndicator } from "./LoadingIndicator";
import { Element } from "./Element";
import {
  fetchImportersForUser,
  fetchImportersForTeam,
} from "../libs/supabase/importers";
import { ClassificationStatus, Importer } from "../interfaces/hts";
import { useClassifications } from "../contexts/ClassificationsContext";
import { updateClassification } from "../libs/classification";
import { SecondaryLabel } from "./SecondaryLabel";
import { TertiaryText } from "./TertiaryText";

interface Props {
  userProfile: UserProfile;
}

export const ClassificationResultPage = ({ userProfile }: Props) => {
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

  return (
    <div className="h-full w-full max-w-6xl mx-auto flex flex-col">
      <div className="px-8 py-6 flex-1 flex flex-col gap-6 overflow-y-auto">
        {/* Header Section */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-start gap-4">
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl md:text-3xl font-bold text-base-content">
                Classification Overview
              </h1>
              <p className="text-sm text-base-content/60">
                Add context and supporting information for your classification
              </p>
            </div>
            <div className="flex gap-2 items-center flex-shrink-0">
              {classificationRecord && (
                <div className="relative">
                  <select
                    className="select select-sm select-bordered"
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
                    <span className="loading loading-spinner loading-xs absolute right-8 top-1/2 -translate-y-1/2"></span>
                  )}
                </div>
              )}
              <button
                className="btn btn-sm btn-primary"
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
                {loading || isLoadingImporters ? (
                  <LoadingIndicator
                    text={loading ? "Downloading" : "Loading"}
                  />
                ) : (
                  <>
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    Download Report
                  </>
                )}
              </button>
            </div>
          </div>
          {/* Classification Details Card */}
          <div className="flex flex-col gap-4">
            <div className="bg-base-200/50 border border-base-content/10 rounded-xl p-6 flex flex-col gap-6">
              {/* Importer Section */}
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <SecondaryLabel value="Importer" />
                  <TertiaryText value="Select the importer or client that you are providing this advisory to (optional)" />
                </div>
                <div className="flex gap-2">
                  <select
                    className="select select-bordered w-full flex-1 bg-base-100"
                    value={selectedImporterId}
                    disabled={isLoadingImporters || !canUpdateDetails}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSelectedImporterId(value);
                      updateClassification(
                        classificationId,
                        undefined,
                        value || null,
                        undefined
                      );
                    }}
                  >
                    <option value="">
                      {isLoadingImporters
                        ? "Loading importers..."
                        : importers.length === 0
                          ? "No importers available"
                          : "Select importer"}
                    </option>
                    {!isLoadingImporters &&
                      importers.map((importer) => (
                        <option key={importer.id} value={importer.id}>
                          {importer.name}
                        </option>
                      ))}
                  </select>
                  {selectedImporterId && (
                    <button
                      className="btn btn-outline"
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
              <div className="w-full h-px bg-base-content/10" />

              {/* Notes Section */}
              <div className="w-full flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <SecondaryLabel value="Basis for Classification" />
                  <TertiaryText value="Add any notes about your classification here. They will be included in your classification advisory." />
                </div>
                <textarea
                  className="min-h-36 textarea textarea-bordered w-full bg-base-100"
                  placeholder="Add any notes about your classification here. They will be included in your classification advisory."
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
        </div>

        {/* HTS Code Section */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl md:text-3xl font-bold text-base-content">
              HTS Code & Tariff Details
            </h2>
            <p className="text-sm text-base-content/60">
              Complete tariff information for your classified item
            </p>
          </div>
          <div className="bg-base-200/50 border border-base-content/10 rounded-xl p-6">
            <Element element={element} />
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
    </div>
  );
};
