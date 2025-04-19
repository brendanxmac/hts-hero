interface Props {
  value: string;
  color?:
    | "primary"
    | "secondary"
    | "tertiary"
    | "base-content"
    | "base-content/30";
}

export const SecondaryLabel = ({ value, color = "base-content" }: Props) => {
  return (
    <h3
      className={`text-xs sm:text-sm md:text-base lg:text-lg text-${color} font-bold`}
    >
      {value}
    </h3>
  );
};
