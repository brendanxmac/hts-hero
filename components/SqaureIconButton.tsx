export default function SquareIconButton({
  icon,
  onClick,
}: {
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <div
      className="btn btn-sm btn-square bg-base-200 hover:btn-primary shrink-0 text-primary hover:text-white hover:dark:text-base-100 flex items-center gap-2 shadow-sm shadow-primary/20 dark:shadow-primary/60"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
    >
      <button className="text-sm">{icon}</button>
    </div>
  );
}
