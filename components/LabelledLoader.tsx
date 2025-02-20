interface Props {
  text?: string;
}
export const LoadingIndicator = ({ text }: Props) => {
  return (
    <div className="flex justify-center items-center gap-2">
      {/* <span className="loading loading-dots loading-sm"></span> */}
      <span className="loading loading-spinner loading-sm text-[#40C969]"></span>
      <p className="text-xs">{`${text}...`}</p>
      {/* <progress className="progress w-48 rounded-lg h-1"></progress> */}
      {/* <span className="loading loading-ring loading-xs"></span> */}
      {/* <span className="loading loading-ring loading-xs"></span> */}
    </div>
  );
};
