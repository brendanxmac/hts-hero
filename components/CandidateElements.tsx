import { HtsElement, HtsLevelClassification } from "../interfaces/hts";
import { LoadingIndicator } from "./LoadingIndicator";
import { TertiaryInformation } from "./TertiaryInformation";
import { Loader } from "../interfaces/ui";
import { CandidateElement } from "./CandidateElement";
import { classNames } from "../utilities/style";
import { useEffect, useState } from "react";
import {
  ChevronUpIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/16/solid";
import { getHtsLevel } from "../libs/hts";
import SquareIconButton from "./SqaureIconButton";
import { SecondaryInformation } from "./SecondaryInformation";
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
    null
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

      {candidates.length === 0 ? (
        <div className="flex flex-col gap-2 bg-base-300 rounded-md p-4 items-center justify-center">
          <div className="w-full flex items-center justify-evenly py-6">
            <div className="min-w-28 flex flex-col items-center justify-center gap-2">
              <SquareIconButton
                icon={<MagnifyingGlassIcon className="h-4 w-4" />}
                onClick={() => {}}
              />
              <p className="text-xs text-base-content/50">Select</p>
            </div>

            <div className="h-full w-px bg-base-content/20"></div>
            <div className="min-w-28 flex flex-col items-center gap-2">
              <SquareIconButton
                icon={<SparklesIcon className="h-4 w-4" />}
                onClick={() => {}}
              />
              <p className="text-xs text-base-content/50">Generate</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2 bg-base-300 rounded-md p-4">
          {isLoading && <LoadingIndicator text={text} />}

          {candidates.map((element) => (
            <CandidateElement
              key={element.uuid}
              element={element}
              indentLevel={indentLevel}
              isSelectedElement={selectedElement?.uuid === element.uuid}
              classificationProgression={classificationProgression}
              setClassificationProgression={setClassificationProgression}
              setSelectedElement={(element) => {
                setSelectedElement(element);
                const newClassificationProgression =
                  classificationProgression.slice(0, indentLevel);
                setClassificationProgression([
                  ...newClassificationProgression,
                  {
                    level: getHtsLevel(
                      element && element.htsno ? element.htsno : ""
                    ),
                    candidates: candidates,
                    selection: element,
                    reasoning: "",
                  },
                ]);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
