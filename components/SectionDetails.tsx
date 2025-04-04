import { HtsSection } from "../interfaces/hts";

interface Props {
  section: HtsSection;
}

export const SectionDetails = ({ section }: Props) => {
  const { chapters } = section;
  return (
    <div className="flex flex-col gap-3 mt-3">
      {chapters.map((chapter) => (
        <h2 key={chapter.number}></h2>
        // <ChapterSummary chapter={chapter} />
      ))}
    </div>
  );
};
