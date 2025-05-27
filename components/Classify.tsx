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
import { useChapters } from "../contexts/ChaptersContext";
import { useClassification } from "../contexts/ClassificationContext";
import { LoadingIndicator } from "./LoadingIndicator";

interface Props {
  setPage: (page: ClassifyPage) => void;
}

export const Classify = ({ setPage }: Props) => {
  const [fetchingChapters, setFetchingChapters] = useState(true);
  const { activeTab } = useClassifyTab();
  const { classification } = useClassification();
  const { chapters, fetchChapter } = useChapters();
  const [workflowStep, setWorkflowStep] = useState(WorkflowStep.DESCRIPTION);
  const [classificationLevel, setClassificationLevel] = useState<
    number | undefined
  >(undefined);

  useEffect(() => {
    if (
      chapters.length === 0 &&
      classification &&
      classification.levels.length > 0
    ) {
      fetchAllChapters();
    } else {
      setFetchingChapters(false);
    }
  }, []);

  const fetchAllChapters = async () => {
    setFetchingChapters(true);
    await Promise.all(
      classification.levels[0].candidates.map((c) => {
        fetchChapter(c.chapter);
      })
    );
    setFetchingChapters(false);
  };

  if (fetchingChapters) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <LoadingIndicator text="Fetching classification data" />
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-base-300 grid grid-cols-3">
      {/* Sidebar Navigation */}
      <div className="h-full bg-base-100 col-span-1 overflow-hidden">
        <ClassificationNavigation
          workflowStep={workflowStep}
          setWorkflowStep={setWorkflowStep}
          classificationLevel={classificationLevel}
          setClassificationLevel={setClassificationLevel}
          setPage={setPage}
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
