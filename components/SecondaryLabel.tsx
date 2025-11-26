import { Color } from "../enums/style";

interface Props {
  value: string;
  color?: Color;
}

export const SecondaryLabel = ({
  value,
  color = Color.BASE_CONTENT,
}: Props) => {
  return (
    <h3 className={`shrink-0 text-${color} text-sm md:text-base font-bold`}>
      {value}
    </h3>
  );
};
