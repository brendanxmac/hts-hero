interface Props {
  value: string;
}

export const CellLabel = ({ value }: Props) => {
  return (
    <h4 className="text-[#40C969] uppercase font-bold text-xs sm:text-sm">
      {value}
    </h4>
  );
};