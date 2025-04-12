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
  indentLevel: number;
  classificationProgression: HtsLevelClassification[];
  setClassificationProgression: (
    classificationProgression: HtsLevelClassification[]
  ) => void;
}

export const CandidateElements = ({
  loading,
  indentLevel,
  classificationProgression,
  setClassificationProgression,
}: Props) => {
  const { candidates, selection, suggestions, level, reasoning } =
    classificationProgression[indentLevel];
  const { isLoading, text } = loading;
  const [showDetails, setShowDetails] = useState(true);
  const [selectedElement, setSelectedElement] = useState<HtsElement | null>(
    candidates[0]
  );

  useEffect(() => {
    setShowDetails(!Boolean(selectedElement));
  }, [selectedElement]);

  return (
    <div className="w-full flex flex-col gap-2">
      <div
        className="flex justify-between items-center"
        onClick={() => setShowDetails(!showDetails)}
      >
        <TertiaryInformation label={`Level ${indentLevel + 1}`} value="" />
        <ChevronUpIcon
          className={classNames(
            "w-5 h-5 text-primary transition-transform duration-200 ease-in-out",
            showDetails && "rotate-180"
          )}
        />
      </div>

      <div className="flex flex-col gap-2 bg-base-300 rounded-md p-4">
        {isLoading && <LoadingIndicator text={text} />}
        {!showDetails ? (
          <CandidateElement
            key={candidates[0].uuid}
            element={candidates[0]}
            isSelectedElement={selectedElement?.uuid === candidates[0].uuid}
            setSelectedElement={(element) => {
              setSelectedElement(element);
              const newClassificationProgression =
                classificationProgression.slice(0, indentLevel);
              setClassificationProgression([
                ...newClassificationProgression,
                {
                  level: getHtsLevel(element.htsno),
                  candidates: candidates,
                  selection: element,
                  reasoning: "",
                },
              ]);
            }}
          />
        ) : (
          candidates.map((element) => (
            <CandidateElement
              key={element.uuid}
              element={element}
              isSelectedElement={selectedElement?.uuid === element.uuid}
              setSelectedElement={(element) => {
                setSelectedElement(element);
                const newClassificationProgression =
                  classificationProgression.slice(0, indentLevel);
                setClassificationProgression([
                  ...newClassificationProgression,
                  {
                    level: getHtsLevel(element.htsno),
                    candidates: candidates,
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
