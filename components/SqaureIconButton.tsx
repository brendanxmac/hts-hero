import { classNames } from "../utilities/style";

interface Props {
  icon: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
  color?: "primary" | "secondary" | "accent" | "error";
  transparent?: boolean;
}

export default function SquareIconButton({
  icon,
  disabled,
  onClick,
  color = "primary",
  transparent = false,
}: Props) {
  return (
    <button
      disabled={disabled}
      className={classNames(
        `btn btn-xs btn-square shrink-0 text-white hover:text-white hover:shadow-md transition-all duration-100 border-none hover:cursor-pointer`,
        transparent
          ? `bg-${color}/20 hover:bg-${color}/80`
          : `bg-${color} hover:btn-secondary`
      )}
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
