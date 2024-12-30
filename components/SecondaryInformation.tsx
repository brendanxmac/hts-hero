import { HorizontalAlignment } from "../enums/style";
import { getTextAlignmentStyle } from "../utilities/style";
import { SectionLabel } from "./SectionLabel";

interface Props {
  label: string;
  heading: string;
  textAlign?: HorizontalAlignment;
}

export const SecondaryInformation = ({ label, heading, textAlign }: Props) => {
  return (
    <div className={`flex flex-col gap-1 ${getTextAlignmentStyle(textAlign)}`}>
      <SectionLabel value={label} />
      <h2 className="text-gray-200 md:text-lg font-bold whitespace-pre-line">
        {heading}
      </h2>
    </div>
  );
};
