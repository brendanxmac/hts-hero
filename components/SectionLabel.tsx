interface Props {
  value: string;
}

export const SectionLabel = ({ value }: Props) => {
  return (
    <h4 className="w-full max-w-3xl text-left text-neutral-500 uppercase font-bold">
      {value}
    </h4>
  );
};
