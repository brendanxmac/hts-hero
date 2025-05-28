interface Props {
  icon: JSX.Element;
  label: string;
  onClick: () => void;
}

export const ButtonWithIcon = ({ icon, label, onClick }: Props) => {
  return (
    <button
      className="flex btn btn-xs bg-primary/90 hover:bg-primary shrink-0 text-white hover:text-white hover:shadow-md transition-all duration-100 border-none hover:cursor-pointer"
      onClick={() => onClick()}
    >
      {icon}
      {label}
    </button>
  );
};
