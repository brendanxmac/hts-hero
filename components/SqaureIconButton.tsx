import { classNames } from "../utilities/style";

interface Props {
  icon: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
  tooltip?: string;
  color?:
    | "primary"
    | "secondary"
    | "accent"
    | "error"
    | "success"
    | "warning"
    | "info";
  variant?: "solid" | "ghost" | "outline";
  size?: "xs" | "sm" | "md" | "lg";
}

export default function SquareIconButton({
  icon,
  disabled = false,
  onClick,
  color = "primary",
  variant = "ghost",
  tooltip,
  size = "sm",
}: Props) {
  // Build DaisyUI classes
  const getColorClass = () => {
    if (variant === "ghost") {
      return `btn-ghost hover:btn-${color}`;
    }
    if (variant === "outline") {
      return `btn-outline btn-${color}`;
    }
    return `btn-${color}`;
  };

  const getSizeClass = () => {
    switch (size) {
      case "xs":
        return "btn-xs";
      case "sm":
        return "btn-sm";
      case "md":
        return "btn-md";
      case "lg":
        return "btn-lg";
      default:
        return "btn-sm";
    }
  };

  const buttonClasses = classNames(
    "btn btn-square shrink-0",
    getSizeClass(),
    getColorClass(),
    disabled && "btn-disabled",
    "transition-all duration-200 ease-in-out"
  );

  const button = (
    <button
      type="button"
      disabled={disabled}
      className={buttonClasses}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      aria-label={tooltip}
    >
      {icon}
    </button>
  );

  // Use DaisyUI's built-in tooltip
  if (tooltip) {
    return (
      <div className="tooltip tooltip-top" data-tip={tooltip}>
        {button}
      </div>
    );
  }

  return button;
}
