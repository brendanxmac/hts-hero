export default function SquareIconButton({
  icon,
  onClick,
}: {
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <div className="btn btn-sm btn-square bg-base-200 hover:btn-primary shrink-0 text-primary hover:text-base-300 flex items-center gap-2">
      <button
        className="text-sm"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClick();
        }}
      >
        {icon}
      </button>
    </div>
  );
}
