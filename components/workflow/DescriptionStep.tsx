import { useClassification } from "../../contexts/ClassificationContext";
import { WorkflowStep } from "../../enums/hts";
import { SecondaryLabel } from "../SecondaryLabel";
import TextInput from "../TextInput";
import { WorkflowHeader } from "./WorkflowHeader";

interface DescriptionStepProps {
  setWorkflowStep: (step: WorkflowStep) => void;
}

export const DescriptionStep = ({ setWorkflowStep }: DescriptionStepProps) => {
  const { classification, setProductDescription } = useClassification();
  const { productDescription } = classification;

  return (
    <div className="h-full flex flex-col gap-8">
      <WorkflowHeader
        currentStep={WorkflowStep.DESCRIPTION}
        previousStep={undefined}
        nextStep={WorkflowStep.ANALYSIS}
        setWorkflowStep={setWorkflowStep}
        showExplore={false}
        setShowExplore={() => {}}
      />
      <div className="h-full flex flex-col gap-4">
        <SecondaryLabel value="Enter Item Description" />
        <TextInput
          placeholder="Enter item description"
          defaultValue={productDescription}
          onSubmit={(value) => {
            setProductDescription(value);
            setWorkflowStep(WorkflowStep.ANALYSIS);
          }}
        />
      </div>
    </div>
  );
};
