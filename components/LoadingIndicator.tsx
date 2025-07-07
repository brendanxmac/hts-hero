interface Props {
  text?: string;
  color?: string;
}
export const LoadingIndicator = ({ text, color }: Props) => {
  return (
    <div className="flex justify-center items-center gap-2">
      <p className="text-xs font-semibold">{text ? `${text} ` : "Loading "}</p>
      <span
        className={`loading loading-spinner loading-sm ${color ? `text-${color}` : "text-primary"}`}
      ></span>
    </div>
  );
};
