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
  description,
}: {
  title: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  description?: React.ReactNode;
}) {
  return (
    <div className="border-b border-base-300 bg-base-200/30 rounded-t-xl">
      <div className="flex items-center justify-between gap-3 px-5 pt-3 pb-1">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {icon && (
            <span className="shrink-0 text-base-content/50">{icon}</span>
          )}
          <h3 className="text-sm md:text-base lg:text-lg font-semibold text-base-content">{title}</h3>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {description ? (
        <div className="px-5 pb-3 text-sm leading-snug text-base-content/60">
          {description}
        </div>
      ) : null}
    </div>
  );
}
