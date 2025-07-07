"use client";

import { WorkflowStep } from "../enums/hts";
import { useEffect, useState } from "react";
import { Explore } from "./Explore";
import { ClassificationStep } from "./workflow/ClassificationStep";
import { ClassificationNavigation } from "./workflow/ClassificationNavigation";
import { DescriptionStep } from "./workflow/DescriptionStep";
import { useClassifyTab } from "../contexts/ClassifyTabContext";
import { ClassifyTab } from "../enums/classify";
import { LoadingIndicator } from "./LoadingIndicator";
import { useHtsSections } from "../contexts/HtsSectionsContext";
import { Loader } from "../interfaces/ui";
import { useHts } from "../contexts/HtsContext";
import { ClassificationResultPage } from "./ClassificationResultPage";
import Modal from "./Modal";
import ConversionPricing from "./ConversionPricing";
import { useClassification } from "../contexts/ClassificationContext";
import { useSearchParams } from "next/navigation";

export const Classify = () => {
  const [fetchingOptionsOrSuggestions, setFetchingOptionsOrSuggestions] =
    useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [loading, setLoading] = useState<Loader>({
    isLoading: true,
    text: "",
  });
  const { activeTab } = useClassifyTab();
  const [workflowStep, setWorkflowStep] = useState(WorkflowStep.DESCRIPTION);
  const [classificationLevel, setClassificationLevel] = useState<
    number | undefined
  >(undefined);
  const { fetchElements, htsElements } = useHts();
  const { getSections, sections } = useHtsSections();
  const { classification, setArticleDescription } = useClassification();
  const searchParams = useSearchParams();

  useEffect(() => {
    const productDescription = searchParams.get("productDescription");
    if (productDescription) {
      setArticleDescription(productDescription);
    }

    const loadAllData = async () => {
      setLoading({ isLoading: true, text: "Fetching All Data" });
      await Promise.all([fetchElements(), getSections()]);
      setLoading({ isLoading: false, text: "" });
    };

    if (!sections.length || !htsElements.length) {
      loadAllData();
    } else {
      setLoading({ isLoading: false, text: "" });
    }
  }, []);

  if (loading.isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <LoadingIndicator text={loading.text} />
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-base-300 flex border-t border-base-content/30">
      {/* Sidebar Navigation */}
      {!(
        workflowStep === WorkflowStep.DESCRIPTION &&
        !classification.articleDescription
      ) && (
        <div className="hidden md:block h-full bg-base-100 min-w-[350px] max-w-[450px] lg:min-w-[500px] overflow-hidden border-r border-base-content/30">
          <ClassificationNavigation
            workflowStep={workflowStep}
            setWorkflowStep={setWorkflowStep}
            classificationLevel={classificationLevel}
            setClassificationLevel={setClassificationLevel}
            fetchingOptionsOrSuggestions={fetchingOptionsOrSuggestions}
          />
        </div>
      )}

      {/* Classify Tab */}
      <div className="h-full grow overflow-hidden">
        {activeTab === ClassifyTab.CLASSIFY && (
          <>
            {workflowStep === WorkflowStep.DESCRIPTION && (
              <DescriptionStep
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
