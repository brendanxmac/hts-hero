interface Props {
  icon: JSX.Element;
  label: string;
  onClick: () => void;
  transparent?: boolean;
}

export const ButtonWithIcon = ({
  icon,
  label,
  onClick,
  transparent,
}: Props) => {
  return (
    <button
      className={`flex btn btn-xs gap-1 hover:bg-primary shrink-0 btn-primary hover:shadow-md transition-all duration-100 border-none hover:cursor-pointer ${
        transparent ? "bg-primary/10" : "bg-primary/90"
      }`}
      onClick={() => onClick()}
    >
      {icon}
      {label}
    </button>
  );
};
