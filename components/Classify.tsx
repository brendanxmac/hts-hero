"use client";

import { WorkflowStep } from "../enums/hts";
import { useState } from "react";
import { Explore } from "./Explore";
import { ClassificationStep } from "./workflow/ClassificationStep";
import {
  ClassificationNavigation,
  ClassifyTab,
} from "./workflow/ClassificationNavigation";
import { DescriptionStep } from "./workflow/DescriptionStep";
import { AnalysisStep } from "./workflow/AnalysisStep";
import { useClassifyTab } from "../contexts/ClassifyTabContext";

export const Classify = () => {
  const { activeTab } = useClassifyTab();
  const [workflowStep, setWorkflowStep] = useState(WorkflowStep.DESCRIPTION);
  const [classificationLevel, setClassificationLevel] = useState<
    number | undefined
  >(undefined);

  return (
    <div className="h-full w-full bg-base-300 grid grid-cols-3">
      {/* Sidebar Navigation */}
      <div className="h-full bg-base-100 col-span-1">
        <ClassificationNavigation
          workflowStep={workflowStep}
          setWorkflowStep={setWorkflowStep}
          classificationLevel={classificationLevel}
          setClassificationLevel={setClassificationLevel}
        />
      </div>

      {/* Classify Tab */}

      <div className="h-full col-span-2 overflow-hidden">
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
