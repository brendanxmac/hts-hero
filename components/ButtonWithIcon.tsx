interface Props {
  icon: JSX.Element;
  label: string;
  onClick: () => void;
  transparent?: boolean;
}

export const ButtonWithIcon = ({ icon, label, onClick }: Props) => {
  return (
    <button
      className={`flex btn btn-xs btn-neutral gap-1 shrink-0 hover:cursor-pointer`}
      onClick={() => onClick()}
    >
      {icon}
      {label}
    </button>
  );
};
