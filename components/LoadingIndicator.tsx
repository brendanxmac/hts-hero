interface Props {
  text?: string;
  spinnerOnly?: boolean;
  color?: string;
}
export const LoadingIndicator = ({ text, spinnerOnly, color }: Props) => {
  return (
    <div className="flex justify-center items-center gap-2">
      {!spinnerOnly && (
        <p className="text-xs font-semibold">
          {text ? `${text} ` : "Loading "}
        </p>
      )}
      <span
        className={`loading loading-spinner loading-sm ${color ? `text-${color}` : "text-primary"}`}
      ></span>
    </div>
  );
};
