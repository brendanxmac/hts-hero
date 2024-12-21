interface Props {
  text: string;
}

export const LabelledLoader = ({ text }: Props) => {
  return (
    <div className="flex gap-2">
      <span className="loading loading-dots"></span>
      {/* <p className="text-neutral-200">{text}</p> */}
      {/* <span className="loading loading-ring"></span> */}
    </div>
  );
};
