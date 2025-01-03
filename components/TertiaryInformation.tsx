interface Props {
  value: string;
}

export const TertiaryInformation = ({ value }: Props) => {
  return <p className="text-white text-sm md:text-base">{value}</p>;
};
