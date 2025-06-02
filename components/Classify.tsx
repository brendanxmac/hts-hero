"use client";

import { WorkflowStep } from "../enums/hts";
import { useEffect, useState } from "react";
import { Explore } from "./Explore";
import { ClassificationStep } from "./workflow/ClassificationStep";
import { ClassificationNavigation } from "./workflow/ClassificationNavigation";
import { DescriptionStep } from "./workflow/DescriptionStep";
import { AnalysisStep } from "./workflow/AnalysisStep";
import { useClassifyTab } from "../contexts/ClassifyTabContext";
import { ClassifyTab } from "../enums/classify";
import { ClassifyPage } from "../enums/classify";
import { LoadingIndicator } from "./LoadingIndicator";
import { useHtsSections } from "../contexts/HtsSectionsContext";
import { Loader } from "../interfaces/ui";
import { useHts } from "../contexts/HtsContext";

// interface Props {
//   setPage: (page: ClassifyPage) => void;
// }

export const Classify = () => {
  // TODO: do not need to fetch all chapter, or at least change the language...
  const [loading, setLoading] = useState<Loader>({
    isLoading: true,
    text: "",
  });
  const { activeTab } = useClassifyTab();
  // const { classification } = useClassification();
  const [workflowStep, setWorkflowStep] = useState(WorkflowStep.DESCRIPTION);
  const [classificationLevel, setClassificationLevel] = useState<
    number | undefined
  >(undefined);
  const { fetchElements, htsElements } = useHts();
  const { getSections, sections } = useHtsSections();

  useEffect(() => {
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
    <div className="h-full w-full bg-base-300 flex">
      {/* Sidebar Navigation */}
      <div className="h-full bg-base-100 max-w-[450px] min-w-[400px] overflow-hidden">
        <ClassificationNavigation
          workflowStep={workflowStep}
          setWorkflowStep={setWorkflowStep}
          classificationLevel={classificationLevel}
          setClassificationLevel={setClassificationLevel}
          // setPage={setPage}
        />
      </div>

      {/* Classify Tab */}

      <div className="h-full grow overflow-hidden">
        {activeTab === ClassifyTab.CLASSIFY && (
          <>
            {workflowStep === WorkflowStep.DESCRIPTION && (
              <DescriptionStep setWorkflowStep={setWorkflowStep} />
            )}
            {workflowStep === WorkflowStep.ANALYSIS && (
              <AnalysisStep
                setWorkflowStep={setWorkflowStep}
                setClassificationLevel={setClassificationLevel}
              />
            )}
            {workflowStep === WorkflowStep.CLASSIFICATION && (
              <ClassificationStep
                setWorkflowStep={setWorkflowStep}
                classificationLevel={classificationLevel}
                setClassificationLevel={setClassificationLevel}
              />
            )}
          </>
        )}
        {/* Explore Tab */}
        {activeTab === ClassifyTab.EXPLORE && <Explore />}
      </div>
    </div>
  );
};
