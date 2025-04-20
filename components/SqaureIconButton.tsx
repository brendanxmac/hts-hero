interface Props {
  icon: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
  color?: "primary" | "secondary" | "accent" | "error";
}

export default function SquareIconButton({
  icon,
  disabled,
  onClick,
  color = "primary",
}: Props) {
  return (
    <button
      disabled={disabled}
      className={`btn btn-xs btn-square bg-${color} hover:btn-secondary shrink-0 text-white hover:text-white hover:shadow-md transition-all duration-200 border-none`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
    >
      {icon}
    </button>
  );
}
