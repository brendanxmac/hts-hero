import { classNames } from "../utilities/style";

interface Props {
  value: string;
  loud?: boolean;
}

export const SecondaryLabel = ({ value, loud }: Props) => {
  return (
    <h3
      className={classNames(
        "text-xs sm:text-sm md:text-base lg:text-lg text-base-content font-bold",
        loud && "text-secondary"
      )}
    >
      {value}
    </h3>
  );
};
