import { TextCopyButton } from "./Copy";

interface Props {
  value: string;
}

export const PrimaryInformation = ({ value }: Props) => {
  return (
    <div className="flex gap-2 items-center">
      <h2 className="text-white font-bold text-xl md:text-2xl">{value}</h2>
      <TextCopyButton value={value} />
    </div>
  );
};
