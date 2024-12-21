interface Props {
  value: string;
}

export const InformationLabel = ({ value }: Props) => {
  return (
    <h4 className="text-[#40C969] uppercase font-bold text-xs sm:text-sm md:text-base">
      {value}
    </h4>
  );
};
