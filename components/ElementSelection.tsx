import { HtsElement, HtsLevelClassification } from "../interfaces/hts";
import { LoadingIndicator } from "./LoadingIndicator";
import { TertiaryInformation } from "./TertiaryInformation";
import { Loader } from "../interfaces/ui";
import { CandidateElement } from "./CandidateElement";
import { classNames } from "../utilities/style";
import { useEffect, useState } from "react";
import { ChevronUpIcon } from "@heroicons/react/16/solid";
import { getHtsLevel } from "../libs/hts";
interface Props {
  loading: Loader;
  elements: HtsElement[];
  recommendedElement: HtsElement | null;
  indentLevel: number;
  classificationProgression: HtsLevelClassification[];
  setClassificationProgression: (
    classificationProgression: HtsLevelClassification[]
  ) => void;
}

export const ElementSelection = ({
  loading,
  elements,
  recommendedElement,
  indentLevel,
  classificationProgression,
  setClassificationProgression,
}: Props) => {
  const { isLoading, text } = loading;
  const [showDetails, setShowDetails] = useState(true);
  const [selectedElement, setSelectedElement] = useState<HtsElement | null>(
    elements[0]
  );

  useEffect(() => {
    setShowDetails(!Boolean(selectedElement));
  }, [selectedElement]);

  return (
    <div
      className="w-full flex flex-col gap-2"
      onClick={() => setShowDetails(!showDetails)}
    >
      <div className="flex justify-between items-center">
        <TertiaryInformation label="Candidate Elements" value="" />
        <ChevronUpIcon
          className={classNames(
            "w-5 h-5 text-primary transition-transform duration-200 ease-in-out",
            showDetails && "rotate-180"
          )}
        />
      </div>

      <div className="flex flex-col gap-2 bg-base-300 rounded-md p-4">
        {isLoading && <LoadingIndicator text={text} />}
        {selectedElement ? (
          <CandidateElement
            key={selectedElement.uuid}
            element={selectedElement}
            isRecommendedElement={
              recommendedElement?.uuid === selectedElement.uuid
            }
            isSelectedElement={true}
            setSelectedElement={(element) => {
              setSelectedElement(null);
              // using the passed indent level, we should remove any classification progression at levels greater than the indent level using slice

              const newClassificationProgression =
                classificationProgression.length
                  ? classificationProgression.slice(0, indentLevel)
                  : classificationProgression;
              setClassificationProgression([...newClassificationProgression]);
            }}
          />
        ) : !showDetails ? (
          <CandidateElement
            key={elements[0].uuid}
            element={elements[0]}
            isRecommendedElement={recommendedElement?.uuid === elements[0].uuid}
            isSelectedElement={selectedElement?.uuid === elements[0].uuid}
            setSelectedElement={(element) => {
              setSelectedElement(element);
              // using the passed indent level, we should remove any classification progression at levels greater than the indent level using slice
              const newClassificationProgression =
                classificationProgression.slice(0, indentLevel);
              setClassificationProgression([
                ...newClassificationProgression,
                {
                  level: getHtsLevel(element.htsno),
                  candidates: elements,
                  selection: element,
                  reasoning: "",
                },
              ]);
            }}
          />
        ) : (
          elements.map((element) => (
            <CandidateElement
              key={element.uuid}
              element={element}
              isRecommendedElement={recommendedElement?.uuid === element.uuid}
              isSelectedElement={selectedElement?.uuid === element.uuid}
              setSelectedElement={(element) => {
                setSelectedElement(element);
                // using the passed indent level, we should remove any classification progression at levels greater than the indent level using slice
                const newClassificationProgression =
                  classificationProgression.slice(0, indentLevel);
                setClassificationProgression([
                  ...newClassificationProgression,
                  {
                    level: getHtsLevel(element.htsno),
                    candidates: elements,
                    selection: element,
                    reasoning: "",
                  },
                ]);
              }}
            />
          ))
        )}
      </div>
    </div>
  );
};
