import { Color } from "../enums/style";

interface Props {
  value: string;
  color?: Color;
}

export const PrimaryLabel = ({
  value,
  color = Color.NEUTRAL_CONTENT,
}: Props) => {
  return <h2 className={`text-${color} font-bold md:text-xl`}>{value}</h2>;
};
