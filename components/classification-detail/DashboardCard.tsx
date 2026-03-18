export function DashboardCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-base-300 bg-base-100 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function DashboardCardHeader({
  title,
  icon,
  action,
}: {
  title: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-3 border-b border-base-300 bg-base-200/30 rounded-t-xl">
      <div className="flex items-center gap-2">
        {icon && <span className="text-base-content/50">{icon}</span>}
        <h3 className="text-sm font-semibold text-base-content">{title}</h3>
      </div>
      {action}
    </div>
  );
}
