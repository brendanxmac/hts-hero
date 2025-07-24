import toast from "react-hot-toast";
import { useBreadcrumbs } from "../contexts/BreadcrumbsContext";
import { useHts } from "../contexts/HtsContext";
import { useHtsSections } from "../contexts/HtsSectionsContext";
import {
  generateBreadcrumbsForHtsElement,
  generateHtsLinkedText,
  getChapterFromHtsElement,
  getHtsElementParents,
  getSectionAndChapterFromChapterNumber,
} from "../libs/hts";

interface Props {
  id: string;
  text: string;
}

export const HtsLinkedText = ({ id, text }: Props) => {
  const { clearBreadcrumbs, setBreadcrumbs, breadcrumbs } = useBreadcrumbs();
  const { htsElements } = useHts();
  const { sections } = useHtsSections();

  const clickHandler = (htsCode: string) => {
    const element = htsElements.find((e) => e.htsno === htsCode);
    if (!element) {
      toast.error(`HTS code ${htsCode} not found`);
      return;
    }

    // clearBreadcrumbs();
    // const sectionAndChapter = getSectionAndChapterFromChapterNumber(
    //   sections,
    //   Number(getChapterFromHtsElement(element, htsElements))
    // );

    // const parents = getHtsElementParents(element, htsElements);
    // const breadcrumbs = generateBreadcrumbsForHtsElement(
    //   sections,
    //   sectionAndChapter.chapter,
    //   [...parents, element]
    // );

    setBreadcrumbs([...breadcrumbs, { element, title: element.htsno }]);
  };
  return (
    <div key={`linked-text-${id}`}>
      {generateHtsLinkedText(id, text, clickHandler)}
    </div>
  );
};
