import { HtsElement } from "../interfaces/hts";
import { getDirectChildrenElements } from "../libs/hts";
import { Element } from "./Element";

interface Props {
  element: HtsElement;
  chapterElements: HtsElement[];
}

export const ElementDetails = ({ element, chapterElements }: Props) => {
  const childrenElements = getDirectChildrenElements(element, chapterElements);

  console.log(`Child Elements for ${element.htsno}`, childrenElements);

  return (
    <div className="flex flex-col gap-3 mt-3">
      <div className="flex flex-col gap-2">
        <h3 className="text-sm text-neutral-400 font-bold">Options</h3>
        <div className="flex flex-col gap-2">
          {childrenElements.map((element, i) => (
            <Element
              key={`${element.htsno}-${element.indent}-${i}`}
              element={element}
              chapterElements={chapterElements}
            />
          ))}
        </div>
      </div>
      {/* <div className="flex flex-col gap-2">
        <h3 className="text-sm text-neutral-400 font-bold">Reasoning</h3>
        <h4 className="text-sm whitespace-pre-line">{reasoning}</h4>
      </div> */}
    </div>
  );
};
