import { useState } from "react";
import { useBreadcrumbs } from "../contexts/BreadcrumbsContext";
import { HtsElement } from "../interfaces/hts";
import SquareIconButton from "./SqaureIconButton";
import {
  SparklesIcon,
  TrashIcon,
  DocumentTextIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/solid";
import { MagnifyingGlassIcon } from "@heroicons/react/16/solid";
import { PDFProps } from "./Element";
import PDF from "./PDF";
import { classNames } from "../utilities/style";
import { TertiaryText } from "./TertiaryText";
import { useHtsSections } from "../contexts/HtsSectionsContext";
import { SecondaryText } from "./SecondaryText";
import { useClassification } from "../contexts/ClassificationContext";
import { Color } from "../enums/style";
import { SecondaryLabel } from "./SecondaryLabel";
import { useClassifyTab } from "../contexts/ClassifyTabContext";
import { ClassifyTab } from "../enums/classify";
import TextInput from "./TextInput";
import { TertiaryLabel } from "./TertiaryLabel";
import {
  generateBreadcrumbsForHtsElement,
  getBreadCrumbsForElement,
  getChapterFromHtsElement,
  getHtsElementParents,
  getSectionAndChapterFromChapterNumber,
} from "../libs/hts";
import { useHts } from "../contexts/HtsContext";
interface Props {
  element: HtsElement;
  indentLevel: number;
  locallySelectedElement: HtsElement | undefined;
  setLocallySelectedElement: (element: HtsElement) => void;
}

export const CandidateElement = ({
  element,
  indentLevel,
  locallySelectedElement,
  setLocallySelectedElement,
}: Props) => {
  const {
    htsno,
    chapter,
    description,
    recommended,
    recommendedReason,
    indent,
  } = element;

  const { addBreadcrumb, clearBreadcrumbs, setBreadcrumbs } = useBreadcrumbs();
  const { setActiveTab } = useClassifyTab();
  const { findChapterByNumber, sections } = useHtsSections();
  const [showPDF, setShowPDF] = useState<PDFProps | null>(null);
  const { classification, updateLevel, setClassification } =
    useClassification();
  const [showNotes, setShowNotes] = useState(false);
  const { htsElements } = useHts();

  // Check all progression levels to see if this element is selected in any of them
  const isLevelSelection = Boolean(
    classification.levels.some(
      (level) => level.selection && level.selection.uuid === element.uuid
    )
  );

  const isLocallySelected = locallySelectedElement?.uuid === element.uuid;

  return (
    <div
      className={classNames(
        "flex w-full rounded-md bg-base-100 p-4 gap-4 transition duration-100 ease-in-out",
        // FIXME: this inset syntax won't work in daisyUI v5, https://chatgpt.com/c/680acac7-5db4-8000-a309-b4ba81c63e8c
        isLevelSelection &&
          !locallySelectedElement &&
          "shadow-[inset_0_0_0_4px_oklch(var(--p))]",
        isLevelSelection &&
          locallySelectedElement &&
          !isLocallySelected &&
          "shadow-[inset_0_0_0_2px_oklch(var(--nc))]",
        isLocallySelected && "shadow-[inset_0_0_0_4px_oklch(var(--p))]",
        !isLevelSelection &&
          !isLocallySelected &&
          "hover:cursor-pointer hover:bg-base-200 shadow-[inset_0_0_0_1px_oklch(var(--n))]"
      )}
      onClick={() => {
        if (isLocallySelected) {
          setLocallySelectedElement(undefined);
        } else {
          setLocallySelectedElement(element);

          // clearBreadcrumbs();
          // const ch = findChapterByNumber(element.chapter);
          // if (ch) {
          //   addBreadcrumb({
          //     type: Navigatable.CHAPTER,
          //     ...ch,
          //   });
          // }
          // addBreadcrumb(element);
        }
      }}
    >
      <div className="flex flex-col w-full gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap">
            {getBreadCrumbsForElement(element, sections, htsElements).map(
              (breadcrumb, i) => (
                <span key={`breadcrumb-${i}`} className="text-xs">
                  {breadcrumb.label && <b>{breadcrumb.label} </b>}
                  <span
                    className={`${!breadcrumb.value ? "font-bold" : "text-white"}`}
                  >
                    {breadcrumb.value}
                  </span>
                  <span className="text-white mx-2">›</span>
                </span>
              )
            )}
          </div>
          <div className="w-full h-[1px] bg-base-content/10" />
        </div>
        <div className="flex items-start justify-between">
          <div className="w-full flex items-center justify-between gap-2">
            <SecondaryText value={htsno ? `${htsno}` : "Prequalifier"} />
            <div className="flex gap-2">
              <SquareIconButton
                icon={<DocumentTextIcon className="h-4 w-4" />}
                onClick={() =>
                  setShowPDF({
                    title: `Chapter ${chapter} Notes`,
                    file: `/notes/chapter/Chapter ${chapter}.pdf`,
                  })
                }
                transparent
              />
              <SquareIconButton
                icon={<MagnifyingGlassIcon className="h-4 w-4" />}
                onClick={() => {
                  clearBreadcrumbs();
                  const sectionAndChapter =
                    getSectionAndChapterFromChapterNumber(
                      sections,
                      Number(getChapterFromHtsElement(element, htsElements))
                    );

                  const parents = getHtsElementParents(element, htsElements);
                  const breadcrumbs = generateBreadcrumbsForHtsElement(
                    sections,
                    sectionAndChapter.chapter,
                    [...parents, element]
                  );

                  setBreadcrumbs(breadcrumbs);

                  setActiveTab(ClassifyTab.EXPLORE);
                }}
                transparent
              />
              <SquareIconButton
                icon={<PencilSquareIcon className="h-4 w-4" />}
                onClick={() => {
                  setShowNotes(!showNotes);
                }}
                transparent={!element.notes}
              />
              {indent === "0" && (
                <SquareIconButton
                  icon={<TrashIcon className="h-4 w-4 text-error" />}
                  onClick={() => {
                    if (isLevelSelection) {
                      const newClassificationProgression =
                        classification.levels.slice(0, indentLevel + 1);
                      newClassificationProgression[indentLevel].selection =
                        null;

                      // remove this element from the candidates of this level
                      newClassificationProgression[indentLevel].candidates =
                        newClassificationProgression[
                          indentLevel
                        ].candidates.filter(
                          (candidate) => candidate.uuid !== element.uuid
                        );

                      setClassification({
                        ...classification,
                        levels: newClassificationProgression,
                      });
                    } else {
                      const newClassificationProgression =
                        classification.levels.slice(0, indentLevel + 1);

                      newClassificationProgression[indentLevel].candidates =
                        newClassificationProgression[
                          indentLevel
                        ].candidates.filter(
                          (candidate) => candidate.uuid !== element.uuid
                        );
                      updateLevel(indentLevel, {
                        candidates:
                          newClassificationProgression[indentLevel].candidates,
                      });
                    }
                  }}
                  color="error"
                  transparent
                />
              )}
            </div>
          </div>
        </div>

        <SecondaryLabel value={description} color={Color.WHITE} />

        {showNotes && (
          <div className="flex flex-col gap-2 rounded-md">
            <TertiaryLabel value="Notes" />
            <TextInput
              defaultValue={element.notes}
              placeholder="Why is this candidate good or bad compared to others for the classification?"
              showCharacterCount={false}
              onChange={(str) => {
                const updatedCandidates = classification.levels[
                  indentLevel
                ].candidates.map((candidate) => {
                  if (candidate.uuid === element.uuid) {
                    return { ...candidate, notes: str };
                  }
                  return candidate;
                });
                updateLevel(indentLevel, {
                  candidates: updatedCandidates,
                });
              }}
            />
          </div>
        )}

        {recommended && (
          <div className="flex flex-col gap-2 bg-base-300 rounded-md p-2">
            <div className="flex gap-2 text-accent">
              <SparklesIcon className="h-4 w-4" />
              <TertiaryText value="Suggested" />
            </div>
            <p className="text-sm dark:text-white/90">{recommendedReason}</p>
          </div>
        )}
      </div>

      {showPDF && (
        <PDF
          title={showPDF.title}
          file={showPDF.file}
          isOpen={showPDF !== null}
          setIsOpen={(isOpen) => {
            if (!isOpen) {
              setShowPDF(null);
            }
          }}
        />
      )}
    </div>
  );
};
