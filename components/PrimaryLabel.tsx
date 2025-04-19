interface Props {
  value: string;
  color?:
    | "primary"
    | "secondary"
    | "tertiary"
    | "base-content"
    | "base-content/30";
}

export const PrimaryLabel = ({ value, color = "base-content" }: Props) => {
  return (
    <h2 className={`font-bold text-xl md:text-3xl text-${color}`}>{value}</h2>
  );
};
