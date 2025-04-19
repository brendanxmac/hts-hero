"use client";

import { useEffect, useState } from "react";
import { Classify } from "../../components/Classify";
import { Explore } from "../../components/Explore";
import { BreadcrumbsProvider } from "../../contexts/BreadcrumbsContext";
import { ChaptersProvider } from "../../contexts/ChaptersContext";
import { WorkflowStep } from "../../enums/hts";
import { classNames } from "../../utilities/style";

export default function Home() {
  const [showExplore, setShowExplore] = useState(false);
  const [workflowStep, setWorkflowStep] = useState(WorkflowStep.DESCRIPTION);

  useEffect(() => {
    if (workflowStep === WorkflowStep.CLASSIFICATION) {
      setShowExplore(true);
    }
  }, [workflowStep]);

  return (
    <main className="h-screen w-full overflow-auto flex flex-col bg-base-100">
      <ChaptersProvider>
        <BreadcrumbsProvider>
          <div
            className={classNames(
              "grid h-full w-full items-start justify-center",
              showExplore ? "grid-cols-12" : "grid-cols-2"
            )}
          >
            <div
              className={classNames(
                "h-full w-full overflow-auto p-4 bg-base-100 mx-auto max-w-4xl",
                showExplore ? "col-span-7" : "col-span-2 max-w-3xl"
              )}
            >
              <Classify
                workflowStep={workflowStep}
                setWorkflowStep={setWorkflowStep}
                setShowExplore={setShowExplore}
              />
            </div>
            {showExplore && (
              <div
                className={classNames(
                  "overflow-auto col-span-5 px-4 bg-base-300 p-4 rounded-md m-4"
                )}
              >
                <Explore />
              </div>
            )}
          </div>
        </BreadcrumbsProvider>
      </ChaptersProvider>
    </main>
  );
}
