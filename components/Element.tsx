import { HtsElement } from "../interfaces/hts";
import { Cell } from "./Cell";
import { NavigatableElement } from "./Elements";
import { useEffect, useState } from "react";
import { PrimaryInformation } from "./PrimaryInformation";
import { LoadingIndicator } from "./LoadingIndicator";
import { getHtsChapterData } from "../libs/hts";
import { getDirectChildrenElements } from "../libs/hts";
import { ElementSum } from "./ElementSum";

interface Props {
  element: HtsElement;
  breadcrumbs: NavigatableElement[];
  setBreadcrumbs: (breadcrumbs: NavigatableElement[]) => void;
}

export const Element = ({ element, breadcrumbs, setBreadcrumbs }: Props) => {
  const { htsno, description, chapter } = element;
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
      <div className="flex flex-col gap-2 w-full rounded-md transition duration-100 ease-in-out cursor-pointer">
        <div className="flex items-start gap-3 p-4">
          <div className="flex gap-4">
            <div className="shrink-0">
              <PrimaryInformation label={htsno} value={``} copyable={false} />
            </div>
            <PrimaryInformation value={description} copyable={false} />
          </div>
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
