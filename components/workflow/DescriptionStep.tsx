import { WorkflowStep } from "../../app/classify/page";
import { useClassification } from "../../contexts/ClassificationContext";
import TextInput from "../TextInput";

interface DescriptionStepProps {
  setWorkflowStep: (step: WorkflowStep) => void;
}

export const DescriptionStep = ({ setWorkflowStep }: DescriptionStepProps) => {
  const { classification, setProductDescription } = useClassification();
  const { productDescription } = classification;

  return (
    <div className="h-full flex flex-col gap-4 justify-center">
      <h1 className="text-2xl text-center font-bold">Enter Item Description</h1>
      <TextInput
        placeholder="Enter item description"
        defaultValue={productDescription}
        setProductDescription={(value) => {
          setProductDescription(value);
          setWorkflowStep(WorkflowStep.ANALYSIS);
        }}
      />
    </div>
  );
};
