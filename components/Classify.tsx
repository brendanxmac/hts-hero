"use client";

import { DescriptionStep } from "./workflow/DescriptionStep";
import { AnalysisStep } from "./workflow/AnalysisStep";
import { ClassificationStep } from "./workflow/ClassificationStep";
import { WorkflowStep } from "../enums/hts";
import { useState } from "react";
import { useEffect } from "react";
import { classNames } from "../utilities/style";
import { Explore } from "./Explore";

export const Classify = () => {
  const [showExplore, setShowExplore] = useState(false);
  const [workflowStep, setWorkflowStep] = useState(WorkflowStep.DESCRIPTION);

  useEffect(() => {
    if (workflowStep === WorkflowStep.CLASSIFICATION) {
      setShowExplore(true);
    } else {
      setShowExplore(false);
    }
  }, [workflowStep]);

  return (
    <div className="flex h-screen w-full items-start justify-center overflow-hidden gap-2">
      <div
        className={classNames(
          "h-full w-full overflow-auto p-4 mx-auto rounded-md",
          workflowStep === WorkflowStep.DESCRIPTION
            ? "bg-base-100 max-w-3xl"
            : "bg-base-300 max-w-4xl"
        )}
      >
        {workflowStep === WorkflowStep.DESCRIPTION && (
          <DescriptionStep setWorkflowStep={setWorkflowStep} />
        )}
        {workflowStep === WorkflowStep.ANALYSIS && (
          <AnalysisStep
            showExplore={showExplore}
            setShowExplore={setShowExplore}
            setWorkflowStep={setWorkflowStep}
          />
        )}
        {workflowStep === WorkflowStep.CLASSIFICATION && (
          <ClassificationStep
            showExplore={showExplore}
            setShowExplore={setShowExplore}
            setWorkflowStep={setWorkflowStep}
          />
        )}
      </div>

      <div
        className={classNames(
          "h-full px-4 bg-base-300 p-4 rounded-md overflow-auto",
          showExplore ? "grow block" : "hidden"
        )}
      >
        <Explore />
      </div>
    </div>
  );
};
