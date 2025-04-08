import { HtsElement } from "../interfaces/hts";
import { Cell } from "./Cell";
import { NavigatableElement } from "./Elements";
import { useEffect, useState } from "react";
import { PrimaryInformation } from "./PrimaryInformation";
import { LoadingIndicator } from "./LoadingIndicator";
import { getHtsChapterData } from "../libs/hts";
import { getDirectChildrenElements } from "../libs/hts";
import { ElementSum } from "./ElementSum";
import { SecondaryInformation } from "./SecondaryInformation";
import { TertiaryInformation } from "./TertiaryInformation";
import { SecondaryLabel } from "./SecondaryLabel";
import SquareIconButton from "./SqaureIconButton";
import { DocumentMagnifyingGlassIcon } from "@heroicons/react/24/outline";
import PDF from "./PDF";

interface Props {
  element: HtsElement;
  breadcrumbs: NavigatableElement[];
  setBreadcrumbs: (breadcrumbs: NavigatableElement[]) => void;
}

export const Element = ({ element, breadcrumbs, setBreadcrumbs }: Props) => {
  const { htsno, description, chapter, units, general, special, other } =
    element;
  const [children, setChildren] = useState<HtsElement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNotes, setShowNotes] = useState(false);

  useEffect(() => {
    const fetchElementData = async () => {
      setLoading(true);
      const chapterElements = await getHtsChapterData(String(chapter));
      const directChildrenElements = getDirectChildrenElements(
        element,
        chapterElements
      );

      setChildren(directChildrenElements);
      setLoading(false);
    };
    fetchElementData();
  }, [element]);

  // Regex that gets the prefix of the special text
  const getPrefixFromSpecial = (special: string) => {
    const regex = /^[^(]+/;
    const match = special.match(regex);
    return match ? match[0].trim() : special;
  };

  // Regex that gets whatever is inside the parentheses of special text, if exists
  const getDetailsFromSpecial = (special: string) => {
    const regex = /\(([^)]+)\)/;
    const match = special.match(regex);
    return match ? match[1].replace(/,/g, ", ") : null;
  };

  return (
    <Cell>
      <div className="flex flex-col w-full rounded-md transition duration-100 ease-in-out cursor-pointer">
        <div className="card bg-base-200 w-full flex flex-col items-start justify-between gap-7 p-4 sm:p-6">
          <div className="flex items-center justify-between gap-3 w-full">
            <div className="flex flex-col gap-3">
              <div className="shrink-0">
                <PrimaryInformation
                  label={htsno ? `${htsno}: ` : ``}
                  value={``}
                  copyable={false}
                />
              </div>
              <PrimaryInformation value={description} copyable={false} />
            </div>
            <SquareIconButton
              icon={<DocumentMagnifyingGlassIcon className="h-6 w-6" />}
              onClick={() => setShowNotes(!showNotes)}
            />
          </div>
          {(general || special || other) && (
            <div className="w-full flex flex-col gap-2">
              <SecondaryLabel value={"Tariff Rates"} />
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {units &&
                  units.map((unit, i) => (
                    <div
                      key={`${i}-${unit}`}
                      className="flex flex-col gap-1 p-2 bg-primary/10 rounded-md min-w-24"
                    >
                      <TertiaryInformation value={`Unit`} />
                      <SecondaryInformation label={unit || "--"} value={""} />
                    </div>
                  ))}
                <div className="flex flex-col gap-1 p-2 bg-primary/10 rounded-md min-w-24">
                  <TertiaryInformation value={"General"} />
                  <SecondaryInformation label={general || "--"} value={""} />
                </div>
                {/* TODO: parse this to extract the countries and have links to the country tariff page */}
                <div className="flex flex-col gap-1 p-2 bg-primary/10 rounded-md min-w-24">
                  <TertiaryInformation value={"Special"} />
                  <SecondaryInformation
                    label={getPrefixFromSpecial(special) || "--"}
                    value={""}
                  />
                  <p className="text-xs text-gray-500">
                    {getDetailsFromSpecial(special) || "--"}
                  </p>
                </div>
                <div className="flex flex-col gap-1 p-2 bg-primary/10 rounded-md min-w-24">
                  <TertiaryInformation value={"Other"} />
                  <SecondaryInformation label={other || "--"} value={""} />
                </div>
              </div>
            </div>
          )}
          {loading && <LoadingIndicator text="Fetching Element Data" />}
          {!loading && children.length > 0 && (
            <div className="w-full flex flex-col gap-2">
              <SecondaryLabel value={"Children"} />
              <div>
                {children.map((child, i) => {
                  return (
                    <ElementSum
                      key={`${i}-${child.htsno}`}
                      element={child}
                      chapter={chapter}
                      breadcrumbs={breadcrumbs}
                      setBreadcrumbs={setBreadcrumbs}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      {showNotes && (
        <PDF
          title={`Chapter ${chapter} Notes`}
          file={`/notes/chapter/Chapter ${chapter}.pdf`}
          isOpen={showNotes}
          setIsOpen={setShowNotes}
        />
      )}
    </Cell>
  );
};
