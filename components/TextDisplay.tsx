import { SecondaryText } from "./SecondaryText";
import { SecondaryLabel } from "./SecondaryLabel";
import { Color } from "../enums/style";

interface TextDisplayProps {
  title: string;
  text: string;
}

export const TextDisplay = ({ title, text }: TextDisplayProps) => {
  return (
    <div className="flex flex-col gap-2">
      <SecondaryLabel value={title} color={Color.BASE_CONTENT_30} />
      <SecondaryText value={text} />
    </div>
  );
};
