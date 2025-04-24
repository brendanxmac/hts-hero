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
  const [classificationLevel, setClassificationLevel] = useState<
    number | undefined
  >(undefined);

  useEffect(() => {
    if (workflowStep === WorkflowStep.CLASSIFICATION) {
      setShowExplore(true);
    } else {
      setShowExplore(false);
    }
  }, [workflowStep]);

  return (
    <div className="h-full w-full bg-base-300 grid grid-cols-3 items-center">
      {/* Sidebar Navigation */}
      <div className="h-full bg-base-100 col-span-1">
        <ClassificationNavigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          workflowStep={workflowStep}
          setWorkflowStep={setWorkflowStep}
          classificationLevel={classificationLevel}
          setClassificationLevel={setClassificationLevel}
        />
      </div>

      {/* Classify Tab */}
      {activeTab === ClassifyTab.CLASSIFY && (
        <div className="grow h-full w-full col-span-2">
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
              showExplore={showExplore}
              setActiveTab={setActiveTab}
              setShowExplore={setShowExplore}
              setWorkflowStep={setWorkflowStep}
              classificationLevel={classificationLevel}
              setClassificationLevel={setClassificationLevel}
            />
          )}
        </div>
      )}

      {/* Explore Tab */}
      {activeTab === ClassifyTab.EXPLORE && (
        <div className="h-full bg-base-300 col-span-2 overflow-hidden">
          <Explore />
        </div>
      )}
    </div>
  );
};
