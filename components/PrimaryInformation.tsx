import { HorizontalAlignment } from "../enums/style";
import { getTextAlignmentStyle } from "../utilities/style";
import { InformationLabel } from "./InformationLabel";

interface Props {
  label: string;
  heading: string;
  textAlign?: HorizontalAlignment;
}

export const PrimaryInformation = ({ label, heading, textAlign }: Props) => {
  return (
    <div className={`flex flex-col ${getTextAlignmentStyle(textAlign)}`}>
      <InformationLabel value={label} />
      <h2 className="text-white font-bold text-xl md:text-2xl">{heading}</h2>
    </div>
  );
};
