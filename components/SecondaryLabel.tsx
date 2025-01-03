interface Props {
  value: string;
}

export const SecondaryLabel = ({ value }: Props) => {
  return <h3 className="text-sm text-neutral-400 font-bold">{value}</h3>;
};
