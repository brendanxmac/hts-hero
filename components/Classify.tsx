"use client";

import { WorkflowStep } from "../enums/hts";
import { useState } from "react";
import { useEffect } from "react";
import { classNames } from "../utilities/style";
import { Explore } from "./Explore";
import { ArticleDetailsStep } from "./workflow/ArticleDetailsStep";
import { ClassificationStep } from "./workflow/ClassificationStep";
import {
  ClassificationNavigation,
  ClassifyTab,
  tabs,
} from "./workflow/ClassificationNavigation";
import { DescriptionStep } from "./workflow/DescriptionStep";
import { AnalysisStep } from "./workflow/AnalysisStep";

export const Classify = () => {
  const [showExplore, setShowExplore] = useState(false);
  const [workflowStep, setWorkflowStep] = useState(WorkflowStep.DESCRIPTION);
  const [activeTab, setActiveTab] = useState<ClassifyTab>(ClassifyTab.CLASSIFY);

  useEffect(() => {
    if (workflowStep === WorkflowStep.CLASSIFICATION) {
      setShowExplore(true);
    } else {
      setShowExplore(false);
    }
  }, [workflowStep]);

  return (
    <div className="h-screen bg-base-300 gap-2">
      <div className="h-full w-full grid grid-cols-3 items-center">
        <div className="h-full bg-base-100 col-span-1">
          <ClassificationNavigation
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            workflowStep={workflowStep}
            setWorkflowStep={setWorkflowStep}
          />
        </div>

        {activeTab === ClassifyTab.EXPLORE && (
          <div className="p-6 h-full bg-base-300 col-span-2">
            <Explore />
          </div>
        )}

        {activeTab === ClassifyTab.CLASSIFY && (
          <div
            className={`p-4 col-span-2 w-full max-w-3xl mx-auto ${
              workflowStep !== WorkflowStep.CLASSIFICATION
                ? "items-center"
                : "h-full pt-16"
            }`}
          >
            {workflowStep === WorkflowStep.DESCRIPTION && (
              <DescriptionStep setWorkflowStep={setWorkflowStep} />
            )}
            {workflowStep === WorkflowStep.ANALYSIS && (
              <AnalysisStep setWorkflowStep={setWorkflowStep} />
            )}
            {workflowStep === WorkflowStep.CLASSIFICATION && (
              <ClassificationStep
                setActiveTab={setActiveTab}
                setWorkflowStep={setWorkflowStep}
                showExplore={showExplore}
                setShowExplore={setShowExplore}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-full items-start justify-center overflow-hidden gap-2">
      <div className="h-full w-full overflow-auto p-4 mx-auto rounded-md bg-base-300 min-w-[50%] max-w-4xl">
        {workflowStep === WorkflowStep.DESCRIPTION ||
          (workflowStep === WorkflowStep.ANALYSIS && (
            <ArticleDetailsStep
              workflowStep={workflowStep}
              setWorkflowStep={setWorkflowStep}
              showExplore={showExplore}
              setShowExplore={setShowExplore}
            />
          ))}
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
