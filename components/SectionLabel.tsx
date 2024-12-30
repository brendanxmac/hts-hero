interface Props {
  value: string;
}

export const SectionLabel = ({ value }: Props) => {
  return (
    // w-full max-w-4xl grid grid-cols-2 gap-2
    <h4 className="w-full max-w-4xl text-left text-neutral-500 uppercase font-bold">
      {value}
    </h4>
  );
};
