import { useEffect, useState } from "react";
import { useClassification } from "../contexts/ClassificationContext";
import { Color } from "../enums/style";
import { downloadClassificationReport } from "../libs/hts";
import { PDFProps } from "../interfaces/ui";
import PDF from "./PDF";
import { ArrowDownTrayIcon } from "@heroicons/react/16/solid";
import { useUser } from "../contexts/UserContext";
import { fetchUser } from "../libs/supabase/user";
import { LoadingIndicator } from "./LoadingIndicator";
import { Element } from "./Element";
import { TertiaryLabel } from "./TertiaryLabel";
import { fetchClassifiersForUser } from "../libs/supabase/classifiers";
import { fetchImportersForUser } from "../libs/supabase/importers";
import { Classifier, Importer } from "../interfaces/hts";
import { useClassifications } from "../contexts/ClassificationsContext";

export const ClassificationResultPage = () => {
  const { user } = useUser();
  const { classification, setClassification } = useClassification();
  const { classifications } = useClassifications();
  const { levels } = classification;
  const [showPDF, setShowPDF] = useState<PDFProps | null>(null);
  const element = classification.levels[levels.length - 1].selection;
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const classificationRecord = classifications.find(
    (c) => c.classification.id === classification.id
  );

  // State for classifiers and importers
  const [classifiers, setClassifiers] = useState<Classifier[]>([]);
  const [importers, setImporters] = useState<Importer[]>([]);
  const [selectedClassifierId, setSelectedClassifierId] = useState<string>("");
  const [selectedImporterId, setSelectedImporterId] = useState<string>("");

  // Fetch classifiers and importers on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedClassifiers, fetchedImporters] = await Promise.all([
          fetchClassifiersForUser(),
          fetchImportersForUser(),
        ]);
        setClassifiers(fetchedClassifiers);
        setImporters(fetchedImporters);
      } catch (error) {
        console.error("Error fetching classifiers and importers:", error);
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
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <h2 className="text-xl md:text-2xl font-bold text-white">
              Classification Details
            </h2>
            <div className="flex gap-2">
              <button
                className="btn btn-xs btn-primary"
                onClick={async () => {
                  setLoading(true);
                  const userProfile = await fetchUser(user.id);
                  await downloadClassificationReport(
                    classification,
                    userProfile
                  );
                  setLoading(false);
                }}
              >
                {loading ? (
                  <LoadingIndicator text="Downloading" color={Color.WHITE} />
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
          <TertiaryLabel value="Item Description" />
          <input
            className="input input-bordered w-full text-xl disabled:text-gray-300"
            value={classification.articleDescription}
            disabled
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex flex-col gap-2 flex-1">
            <TertiaryLabel value="Classifier" />
            <select
              className="select w-full"
              value={selectedClassifierId}
              onChange={(e) => setSelectedClassifierId(e.target.value)}
            >
              <option value="" disabled>
                {classifiers.length === 0
                  ? "No classifiers available"
                  : "Select classifier"}
              </option>
              {classifiers.map((classifier) => (
                <option key={classifier.id} value={classifier.id}>
                  {classifier.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2 flex-1">
            <TertiaryLabel value="Importer" />
            <select
              className="select w-full"
              value={selectedImporterId}
              onChange={(e) => setSelectedImporterId(e.target.value)}
            >
              <option value="" disabled>
                {importers.length === 0
                  ? "No importers available"
                  : "Select importer"}
              </option>
              {importers.map((importer) => (
                <option key={importer.id} value={importer.id}>
                  {importer.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* NOTES */}
        <div className="w-full flex flex-col gap-2">
          <TertiaryLabel value="Notes" />
          <textarea
            className="min-h-36 textarea textarea-bordered border-2 focus:outline-none text-white placeholder:text-white/20 text-base w-full"
            placeholder="Add any final notes here. They will be included in your classification advisory."
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
          <TertiaryLabel value="HTS Code & Tariff Details" />
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
