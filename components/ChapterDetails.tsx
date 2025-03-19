import { ChapterI } from "./Chapter";
import { Element } from "./Element";

interface Props {
  chapter: ChapterI;
}

export const ChapterDetails = ({ chapter }: Props) => {
  const { headings } = chapter;
  return (
    <div className="flex flex-col gap-3 mt-3">
      {headings.map((heading) => (
        <Element
          key={heading.htsno}
          element={heading}
          chapterElements={chapter.elements}
        />
      ))}
    </div>
  );
};
