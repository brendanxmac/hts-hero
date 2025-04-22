"use client";

import { WorkflowStep } from "../enums/hts";
import { useState } from "react";
import { useEffect } from "react";
import { Explore } from "./Explore";
import { ClassificationStep } from "./workflow/ClassificationStep";
import {
  ClassificationNavigation,
  ClassifyTab,
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
          <div className={`h-full col-span-2 w-full`}>
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
};
