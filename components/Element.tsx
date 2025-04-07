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
        <div className="flex items-start justify-between gap-3 p-4">
          <div className="flex flex-col gap-3">
            <div className="shrink-0">
              <PrimaryInformation label={htsno} value={``} copyable={false} />
            </div>
            <PrimaryInformation value={description} copyable={false} />
          </div>
          {(general || special || other) && (
            <div className="shrink-0 flex flex-col gap-1 bg-base-200 rounded-md p-4">
              <PrimaryInformation
                label={"Tariff Rates"}
                value=""
                copyable={false}
              />
              <div className="flex flex-col">
                {units &&
                  units.map((unit) => (
                    <SecondaryInformation
                      label={`Unit`}
                      value={unit}
                      copyable={false}
                      loud={true}
                    />
                  ))}
                <SecondaryInformation
                  label={"General"}
                  value={general || "N/A"}
                  copyable={false}
                  loud={true}
                />
                <SecondaryInformation
                  label={"Special"}
                  value={special || "N/A"}
                  copyable={false}
                  loud={true}
                />
                <SecondaryInformation
                  label={"Other"}
                  value={other}
                  copyable={false}
                  loud={true}
                />
              </div>
            </div>
          )}
        </div>

        {loading && <LoadingIndicator text="Fetching Element Data" />}

        <div className="flex flex-col pl-6">
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
    </Cell>
  );
};
