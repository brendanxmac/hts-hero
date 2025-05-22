interface Props {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

export const ButtonWithIcon = ({ icon, label, onClick }: Props) => {
  return (
    <button
      className="flex btn btn-xs bg-primary/30 hover:bg-primary/70 shrink-0 text-white hover:text-white hover:shadow-md transition-all duration-100 border-none hover:cursor-pointer"
      onClick={() => onClick()}
    >
      {icon}
      {label}
    </button>
  );
};
