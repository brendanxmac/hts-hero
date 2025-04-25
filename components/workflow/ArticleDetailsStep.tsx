import { SparklesIcon } from "@heroicons/react/24/solid";
import { ChevronDoubleRightIcon } from "@heroicons/react/16/solid";
import { WorkflowStep } from "../../enums/hts";
import { useClassification } from "../../contexts/ClassificationContext";
import { SecondaryLabel } from "../SecondaryLabel";
import SquareIconButton from "../SqaureIconButton";
import TextInput from "../TextInput";
import { WorkflowHeader } from "./WorkflowHeader";
import { useState } from "react";

interface ArticleDetailsStepProps {
  showExplore: boolean;
  setShowExplore: (show: boolean) => void;
  workflowStep: WorkflowStep;
  setWorkflowStep: (step: WorkflowStep) => void;
}

export const ArticleDetailsStep = ({
  setWorkflowStep,
}: ArticleDetailsStepProps) => {
  const [localProductDescription, setLocalProductDescription] = useState("");
  const {
    classification,
    setArticleAnalysis: setAnalysis,
    setArticleDescription: setProductDescription,
  } = useClassification();
  const { articleDescription: productDescription, articleAnalysis: analysis } =
    classification;

  return (
    <div className="h-full flex flex-col gap-8">
      {/* <WorkflowHeader
        currentStep={workflowStep}
        previousStep={undefined}
        nextStep={productDescription ? WorkflowStep.CLASSIFICATION : undefined}
        setWorkflowStep={setWorkflowStep}
        showExplore={showExplore}
        setShowExplore={setShowExplore}
      /> */}

      <div className="flex flex-col gap-3">
        <SecondaryLabel value="Description" />
        <TextInput
          placeholder="Enter description"
          defaultValue={productDescription}
          onChange={(value) => {
            if (value === "") {
              setProductDescription("");
            }
            setLocalProductDescription(value);
          }}
          onSubmit={(value) => {
            setProductDescription(value);
          }}
          disabled={localProductDescription === productDescription}
        />
      </div>

      {productDescription && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <SecondaryLabel value="Analysis" />
            <div className="flex gap-2 items-center">
              <SquareIconButton
                icon={<SparklesIcon className="h-4 w-4" />}
                onClick={() => {
                  console.log("generate analysis clicked");
                }}
              />
              {!analysis && (
                <button
                  className="self-end btn btn-xs btn-primary gap-0"
                  onClick={() => {
                    setWorkflowStep(WorkflowStep.CLASSIFICATION);
                  }}
                >
                  <span>skip</span>
                  <ChevronDoubleRightIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
          <TextInput
            placeholder="Enter analysis"
            onChange={(value) => {
              setAnalysis(value);
            }}
            onSubmit={(value) => {
              setAnalysis(value);
              setWorkflowStep(WorkflowStep.CLASSIFICATION);
            }}
          />
        </div>
      )}
    </div>
  );
};
