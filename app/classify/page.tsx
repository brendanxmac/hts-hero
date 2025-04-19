"use client";

import { useState } from "react";
import { Classify } from "../../components/Classify";
import { Explore } from "../../components/Explore";
import { BreadcrumbsProvider } from "../../contexts/BreadcrumbsContext";
import { ChaptersProvider } from "../../contexts/ChaptersContext";
import { classNames } from "../../utilities/style";

export enum WorkflowStep {
  DESCRIPTION = "description",
  ANALYSIS = "analysis",
  CLASSIFICATION = "classification",
}

export default function Home() {
  const [showExplore, setShowExplore] = useState(false);
  const [workflowStep, setWorkflowStep] = useState(WorkflowStep.DESCRIPTION);
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
                "h-full w-full overflow-auto p-4 bg-base-100 mx-auto",
                showExplore ? "col-span-8" : "col-span-2 max-w-3xl"
              )}
            >
              <Classify
                workflowStep={workflowStep}
                setWorkflowStep={setWorkflowStep}
                setShowExplore={setShowExplore}
              />
            </div>
            {showExplore && (
              <div className="overflow-auto hidden md:block md:col-span-6 px-4 bg-base-100">
                <Explore />
              </div>
            )}
          </div>
        </BreadcrumbsProvider>
      </ChaptersProvider>
    </main>
  );
}
