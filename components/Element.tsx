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
import { SecondaryLabel } from "./SecondaryLabel";

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

  useEffect(() => {
    const fetchElementData = async () => {
      setLoading(true);
      const chapterElements = await getHtsChapterData(String(chapter));
      const directChildrenElements = getDirectChildrenElements(
        element,
        chapterElements
      );

      console.log("directChildrenElements", directChildrenElements);

      setChildren(directChildrenElements);
      setLoading(false);
    };
    fetchElementData();
  }, [element]);

  return (
    <Cell>
      <div className="flex flex-col w-full rounded-md transition duration-100 ease-in-out cursor-pointer">
        <div className="card bg-base-200 w-full flex flex-col items-start justify-between gap-7 p-4">
          <div className="flex gap-3">
            <div className="shrink-0">
              <PrimaryInformation
                label={htsno ? `${htsno}: ` : ``}
                value={``}
                copyable={false}
              />
            </div>
            <PrimaryInformation value={description} copyable={false} />
          </div>
          {(general || special || other) && (
            <div className="w-full flex flex-col gap-2">
              <SecondaryLabel value={"Tariff Rates"} />
              <div className="flex gap-2">
                {units &&
                  units.map((unit) => (
                    <div className="flex flex-col gap-1 p-2 bg-base-300 rounded-md min-w-24">
                      <SecondaryInformation value={`Unit`} />
                      <SecondaryInformation label={unit} value={""} />
                    </div>
                  ))}
                <div className="flex flex-col gap-1 p-2 bg-base-300 rounded-md min-w-24">
                  <SecondaryInformation value={"General"} />
                  <SecondaryInformation label={general || "N/A"} value={""} />
                </div>
                <div className="flex flex-col gap-1 p-2 bg-base-300 rounded-md min-w-24">
                  <SecondaryInformation value={"Special"} />
                  <SecondaryInformation label={special || "N/A"} value={""} />
                </div>
                <div className="flex flex-col gap-1 p-2 bg-base-300 rounded-md min-w-24">
                  <SecondaryInformation value={"Other"} />
                  <SecondaryInformation label={other || "N/A"} value={""} />
                </div>
              </div>
            </div>
          )}
          {loading && <LoadingIndicator text="Fetching Element Data" />}
          {children.length > 0 && (
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
    </Cell>
  );
};
