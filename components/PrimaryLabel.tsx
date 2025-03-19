interface Props {
  value: string;
}

export const PrimaryLabel = ({ value }: Props) => {
  return (
    <h4 className="text-[#40C969] uppercase font-bold text-sm sm:text-base">
      {value}
    </h4>
  );
};
