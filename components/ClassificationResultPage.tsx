import { useEffect, useState, useRef } from "react";
import { useClassification } from "../contexts/ClassificationContext";
import { useHts } from "../contexts/HtsContext";
import { Color } from "../enums/style";
import {
  downloadClassificationReport,
  generateBreadcrumbsForHtsElement,
  getChapterFromHtsElement,
  getHtsElementParents,
  getSectionAndChapterFromChapterNumber,
} from "../libs/hts";
import { PrimaryLabel } from "./PrimaryLabel";
import { SecondaryLabel } from "./SecondaryLabel";
import { PDFProps } from "../interfaces/ui";
import PDF from "./PDF";
import { TertiaryText } from "./TertiaryText";
import {
  CheckCircleIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/16/solid";
import { ArrowDownTrayIcon } from "@heroicons/react/16/solid";
import { useHtsSections } from "../contexts/HtsSectionsContext";
import { useBreadcrumbs } from "../contexts/BreadcrumbsContext";
import { useClassifyTab } from "../contexts/ClassifyTabContext";
import { ClassifyTab } from "../enums/classify";
import { Square2StackIcon } from "@heroicons/react/24/outline";
import { copyToClipboard } from "../utilities/data";
import { useUser } from "../contexts/UserContext";
import { fetchUser } from "../libs/supabase/user";
import { LoadingIndicator } from "./LoadingIndicator";
import { PencilSquareIcon } from "@heroicons/react/24/solid";
import { XMarkIcon } from "@heroicons/react/16/solid";
import { Element } from "./Element";

export const ClassificationResultPage = () => {
  const { user } = useUser();
  const { classification, setClassification } = useClassification();
  const { levels } = classification;
  const [showPDF, setShowPDF] = useState<PDFProps | null>(null);
  const element = classification.levels[levels.length - 1].selection;
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showNotes, setShowNotes] = useState(Boolean(classification.notes));
  const notesRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (copied) {
      setTimeout(() => {
        setCopied(false);
      }, 1500);
    }
  }, [copied]);

  useEffect(() => {
    if (showNotes && notesRef.current) {
      // Add a small delay to ensure the DOM has updated
      setTimeout(() => {
        notesRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        // Auto-focus the textarea after scrolling
        textareaRef.current?.focus();
      }, 100);
    }
  }, [showNotes]);

  return (
    <div className="h-full w-full max-w-6xl mx-auto flex flex-col">
      <div className="px-8 py-6 flex-1 flex flex-col gap-4 overflow-y-auto">
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <h2 className="text-xl md:text-2xl font-bold text-white">
              Your Classificaiton Result
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
              {!showNotes && (
                <button
                  className="mx-auto btn btn-xs btn-primary"
                  onClick={() => {
                    setShowNotes(true);
                  }}
                >
                  <PencilSquareIcon className="w-4 h-4" />
                  Add Notes
                </button>
              )}
            </div>
          </div>
          <div className="flex flex-col">
            <TertiaryText value="Below are details for the code you found during your classification." />
          </div>
        </div>

        <Element element={element} />

        {/* NOTES */}
        {showNotes && (
          <div ref={notesRef} className="w-full flex flex-col gap-2">
            <div className="flex flex-col">
              <div className="flex items-center justify-between gap-1">
                <PrimaryLabel value="Final Notes" color={Color.WHITE} />
                <button
                  className="btn btn-xs btn-primary"
                  onClick={() => {
                    setShowNotes(false);
                    setClassification({
                      ...classification,
                      notes: "",
                    });
                  }}
                >
                  <XMarkIcon className="w-4 h-4" />
                  Remove Notes
                </button>
              </div>
            </div>

            <textarea
              ref={textareaRef}
              className="min-h-36 textarea textarea-bordered border-2 focus:outline-none text-white placeholder:text-white/20 placeholder:italic text-base w-full"
              placeholder="Add any final notes here. These notes will be included in your classification report."
              value={classification.notes || ""}
              onChange={(e) => {
                setClassification({
                  ...classification,
                  notes: e.target.value,
                });
              }}
            />
          </div>
        )}
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
