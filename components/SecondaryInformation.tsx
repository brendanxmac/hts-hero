import { TextCopyButton } from "./Copy";

interface Props {
  value: string;
}

export const SecondaryInformation = ({ value }: Props) => {
  return <h3 className="text-white font-bold md:text-xl">{value}</h3>;
};
