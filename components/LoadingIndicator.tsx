interface Props {
  text?: string;
}
export const LoadingIndicator = ({ text }: Props) => {
  return (
    <div className="flex justify-center items-center gap-2">
      <p className="text-xs font-semibold">{text ? `${text} ` : "Loading "}</p>
      <span className="loading loading-spinner loading-sm text-primary"></span>
    </div>
  );
};
