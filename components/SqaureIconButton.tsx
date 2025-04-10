export default function SquareIconButton({
  icon,
  disabled,
  onClick,
}: {
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      disabled={disabled}
      className="btn btn-sm btn-square bg-primary hover:btn-secondary shrink-0 text-white hover:text-white hover:shadow-md hover:scale-105 transition-all duration-200 border-none"
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
