import { Color } from "../enums/style";

interface Props {
  value: string;
  color?: Color;
}

export const TertiaryLabel = ({
  value,
  color = Color.NEUTRAL_CONTENT,
}: Props) => {
  return (
    <h3 className={`text-${color} text-xs md:text-sm lg:text-base font-bold`}>
      {value}
    </h3>
  );
};
