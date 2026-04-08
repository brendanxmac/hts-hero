import {
  DashboardCard,
  DashboardCardHeader,
} from "./classification-detail/DashboardCard";

export interface ExplorerDetailSectionProps {
  title: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  /** When false, body has no horizontal/vertical padding (for full-bleed inner layouts). */
  padBody?: boolean;
}

/**
 * Standard section shell for HTS explorer-style pages: matches classification
 * {@link DashboardCard} / {@link DashboardCardHeader} styling.
 */
export function ExplorerDetailSection({
  title,
  icon,
  action,
  description,
  children,
  footer,
  className = "",
  bodyClassName = "",
  padBody = true,
}: ExplorerDetailSectionProps) {
  return (
    <DashboardCard className={className}>
      <DashboardCardHeader
        title={title}
        icon={icon}
        action={action}
        description={description}
      />
      <div
        className={
          padBody ? `p-5 ${bodyClassName}`.trim() : bodyClassName.trim()
        }
      >
        {children}
      </div>
      {footer ? (
        <div className="flex flex-col gap-2 border-t border-base-300 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          {footer}
        </div>
      ) : null}
    </DashboardCard>
  );
}
