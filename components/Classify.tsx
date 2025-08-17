"use client";

import { WorkflowStep } from "../enums/hts";
import { useEffect, useState } from "react";
import { Explore } from "./Explore";
import { ClassificationStep } from "./workflow/ClassificationStep";
import { ClassificationNavigation } from "./workflow/ClassificationNavigation";
import { DescriptionStep } from "./workflow/DescriptionStep";
import { useClassifyTab } from "../contexts/ClassifyTabContext";
import { ClassifyPage, ClassifyTab } from "../enums/classify";
import { LoadingIndicator } from "./LoadingIndicator";
import { useHtsSections } from "../contexts/HtsSectionsContext";
import { Loader } from "../interfaces/ui";
import { useHts } from "../contexts/HtsContext";
import { ClassificationResultPage } from "./ClassificationResultPage";
import Modal from "./Modal";
import ConversionPricing from "./ConversionPricing";
import { useClassification } from "../contexts/ClassificationContext";
import { classNames } from "../utilities/style";
import toast from "react-hot-toast";

interface Props {
  page: ClassifyPage;
  setPage: (page: ClassifyPage) => void;
}

export const Classify = ({ page, setPage }: Props) => {
  const [fetchingOptionsOrSuggestions, setFetchingOptionsOrSuggestions] =
    useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [loading, setLoading] = useState<Loader>({
    isLoading: true,
    text: "",
  });
  const { activeTab } = useClassifyTab();
  const { fetchElements, htsElements, isFetching, revision } = useHts();
  const { getSections, sections } = useHtsSections();
  const { classification, setClassification, setClassificationId } =
    useClassification();
  const [classificationLevel, setClassificationLevel] = useState<
    number | undefined
  >(() => {
    if (classification?.levels.length) {
      return classification.levels.length - 1;
    }
    return undefined;
  });

  const [workflowStep, setWorkflowStep] = useState(() => {
    if (classification?.isComplete) {
      return WorkflowStep.RESULT;
    }
    if (classification?.levels.length) {
      return WorkflowStep.CLASSIFICATION;
    }
    return WorkflowStep.DESCRIPTION;
  });

  useEffect(() => {
    return () => {
      setClassification(null);
      setClassificationId(null);
    };
  }, []);

  useEffect(() => {
    const loadAllData = async () => {
      setLoading({ isLoading: true, text: "Fetching All Data" });
      try {
        const revisionToLoad = revision ? revision.name : "latest";
        await Promise.all([fetchElements(revisionToLoad), getSections()]);
        setLoading({ isLoading: false, text: "" });
      } catch (error) {
        toast.error("Failed to fetch data. Please try again.");
        console.error("Error fetching data:", error);
      } finally {
        setLoading({ isLoading: false, text: "" });
      }
    };

    if (!sections.length || !htsElements.length) {
      loadAllData();
    } else {
      setLoading({ isLoading: false, text: "" });
    }
  }, [page]);

  if (loading.isLoading || isFetching) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <LoadingIndicator text={loading.text} />
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-base-300 grid grid-cols-12">
      {/* Sidebar Navigation */}
      {classification &&
        !(
          workflowStep === WorkflowStep.DESCRIPTION &&
          !classification.articleDescription
        ) && (
          <div className="h-full bg-base-100 overflow-hidden border-r border-base-content/30 col-span-4">
            <ClassificationNavigation
              setPage={setPage}
              workflowStep={workflowStep}
              setWorkflowStep={setWorkflowStep}
              classificationLevel={classificationLevel}
              setClassificationLevel={setClassificationLevel}
              fetchingOptionsOrSuggestions={fetchingOptionsOrSuggestions}
            />
          </div>
        )}

      {/* Classify Tab */}
      <div
        className={classNames(
          "h-full grow overflow-hidden",
          workflowStep === WorkflowStep.DESCRIPTION && !classification
            ? "col-span-12"
            : "col-span-8"
        )}
      >
        {activeTab === ClassifyTab.CLASSIFY && (
          <>
            {workflowStep === WorkflowStep.DESCRIPTION && (
              <DescriptionStep
                setPage={setPage}
                setWorkflowStep={setWorkflowStep}
                setClassificationLevel={setClassificationLevel}
                setShowPricing={setShowPricing}
              />
            )}
            {/* {workflowStep === WorkflowStep.ANALYSIS && (
              <AnalysisStep
                setWorkflowStep={setWorkflowStep}
                setClassificationLevel={setClassificationLevel}
              />
            )} */}
            {workflowStep === WorkflowStep.CLASSIFICATION && (
              <ClassificationStep
                key={`classification-step-${classificationLevel}`}
                setWorkflowStep={setWorkflowStep}
                classificationLevel={classificationLevel}
                setClassificationLevel={setClassificationLevel}
                setFetchingOptionsOrSuggestions={
                  setFetchingOptionsOrSuggestions
                }
              />
            )}
            {workflowStep === WorkflowStep.RESULT && (
              <ClassificationResultPage />
            )}
          </>
        )}
        {/* Explore Tab */}
        {activeTab === ClassifyTab.EXPLORE && <Explore />}
      </div>
      {showPricing && (
        <Modal isOpen={showPricing} setIsOpen={setShowPricing}>
          <ConversionPricing />
        </Modal>
      )}
    </div>
  );
};
