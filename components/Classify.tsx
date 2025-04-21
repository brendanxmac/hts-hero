"use client";

import { WorkflowStep } from "../enums/hts";
import { useState } from "react";
import { useEffect } from "react";
import { classNames } from "../utilities/style";
import { Explore } from "./Explore";
import { ArticleDetailsStep } from "./workflow/ArticleDetailsStep";
import { ClassificationStep } from "./workflow/ClassificationStep";

export const Classify = () => {
  const [showExplore, setShowExplore] = useState(false);
  const [workflowStep, setWorkflowStep] = useState(WorkflowStep.DETAILS);

  useEffect(() => {
    if (workflowStep === WorkflowStep.CLASSIFICATION) {
      setShowExplore(true);
    } else {
      setShowExplore(false);
    }
  }, [workflowStep]);

  return (
    <div className="flex h-screen w-full items-start justify-center overflow-hidden gap-2">
      <div className="h-full w-full overflow-auto p-4 mx-auto rounded-md bg-base-300 min-w-[50%] max-w-4xl">
        {workflowStep === WorkflowStep.DETAILS && (
          <ArticleDetailsStep
            workflowStep={workflowStep}
            setWorkflowStep={setWorkflowStep}
            showExplore={showExplore}
            setShowExplore={setShowExplore}
          />
        )}
        {workflowStep === WorkflowStep.CLASSIFICATION && (
          <ClassificationStep
            setWorkflowStep={setWorkflowStep}
            showExplore={showExplore}
            setShowExplore={setShowExplore}
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
