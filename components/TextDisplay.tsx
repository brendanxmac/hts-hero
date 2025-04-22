import { SecondaryText } from "./SecondaryText";
import { SecondaryLabel } from "./SecondaryLabel";

interface TextDisplayProps {
  title: string;
  text: string;
}

export const TextDisplay = ({ title, text }: TextDisplayProps) => {
  return (
    <div className="flex flex-col gap-2">
      <SecondaryLabel value={title} color="base-content/30" />
      <SecondaryText value={text} />
    </div>
  );
};
