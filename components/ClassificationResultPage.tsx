import { useEffect, useState } from "react";
import { useClassification } from "../contexts/ClassificationContext";
import { downloadClassificationReport } from "../libs/hts";
import { PDFProps } from "../interfaces/ui";
import PDF from "./PDF";
import { ArrowDownTrayIcon, BeakerIcon } from "@heroicons/react/16/solid";
import { useUser } from "../contexts/UserContext";
import { fetchUser, UserProfile } from "../libs/supabase/user";
import { LoadingIndicator } from "./LoadingIndicator";
import { Element } from "./Element";
import {
  fetchImportersForUser,
  createImporter,
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

  const canUpdateStatus =
    userProfile.admin || userProfile.id === classificationRecord?.user_id;

  // State for classifiers and importers
  const [importers, setImporters] = useState<Importer[]>([]);
  const [selectedImporterId, setSelectedImporterId] = useState<string>("");
  const [isLoadingImporters, setIsLoadingImporters] = useState(true);
  const [newImporter, setNewImporter] = useState("");
  const [isCreatingImporter, setIsCreatingImporter] = useState(false);

  // Fetch classifiers and importers on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedImporters] = await Promise.all([
          userProfile.team_id
            ? fetchImportersForTeam(classificationRecord.team_id)
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
      const newImporterData = await createImporter(newImporter.trim());
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
    <div className="h-full w-full max-w-6xl mx-auto flex flex-col">
      <div className="px-8 py-6 flex-1 flex flex-col gap-6 overflow-y-auto">
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <h2 className="text-xl md:text-2xl font-bold text-white">
              Classification Overview
            </h2>
            <div className="flex gap-2 items-center">
              {classificationRecord && (
                <div className="relative">
                  <select
                    className="select select-sm"
                    value={classificationRecord.status}
                    disabled={updatingClassificationStatus || !canUpdateStatus}
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
                className="btn btn-xs btn-primary"
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
        </div>

        <div className="flex flex-col gap-2">
          <SecondaryLabel value="Item Description" />
          <input
            className="input input-bordered w-full text-xl disabled:text-gray-300"
            value={classification.articleDescription}
            disabled
          />
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex flex-col gap-2 flex-1">
            <div className="flex flex-col gap-1">
              <SecondaryLabel value="Importer" />
              <TertiaryText value="Select the importer or client that you are providing this advisory to" />
            </div>
            <select
              className="select w-full"
              value={selectedImporterId}
              disabled={isLoadingImporters}
              onChange={(e) => {
                setSelectedImporterId(e.target.value);
                updateClassification(
                  classificationId,
                  undefined,
                  e.target.value,
                  undefined
                );
              }}
            >
              <option value="" disabled>
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
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add new importer"
                value={newImporter}
                className="input input-sm input-bordered flex-1"
                onChange={(e) => setNewImporter(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddImporter();
                  }
                }}
              />
              <button
                className="btn btn-primary btn-sm"
                onClick={handleAddImporter}
                disabled={isCreatingImporter || !newImporter.trim()}
              >
                {isCreatingImporter ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  "Add"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* NOTES */}
        <div className="w-full flex flex-col gap-2">
          <SecondaryLabel value="Notes" />
          <textarea
            className="min-h-36 textarea textarea-bordered text-white placeholder:text-white/20 text-base w-full"
            placeholder="Add any notes about your classification here. They will be included in your classification advisory."
            value={classification.notes || ""}
            onChange={(e) => {
              setClassification({
                ...classification,
                notes: e.target.value,
              });
            }}
          />
        </div>

        <div className="flex flex-col gap-2">
          <SecondaryLabel value="HTS Code & Tariff Details" />
          <Element element={element} />
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
