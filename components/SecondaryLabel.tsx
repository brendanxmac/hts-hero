import { Color } from "../enums/style";

interface Props {
  value: string;
  color?: Color;
}

export const SecondaryLabel = ({
  value,
  color = Color.NEUTRAL_CONTENT,
}: Props) => {
  return (
    <h3 className={`text-${color} text-sm md:text-base font-bold`}>{value}</h3>
  );
};
