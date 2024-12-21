import { HorizontalAlignment } from "../enums/style";
import { getTextAlignmentStyle } from "../utilities/style";
import { InformationLabel } from "./InformationLabel";

interface Props {
  label: string;
  heading: string;
  textAlign?: HorizontalAlignment;
}

export const SecondaryInformation = ({ label, heading, textAlign }: Props) => {
  return (
    <div className={`flex flex-col gap-1 ${getTextAlignmentStyle(textAlign)}`}>
      <InformationLabel value={label} />
      <h2 className="text-gray-200 md:text-xl font-bold">{heading}</h2>
    </div>
  );
};
