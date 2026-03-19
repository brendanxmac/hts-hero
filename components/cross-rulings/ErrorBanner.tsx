import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { DashboardCard } from "../classification-detail/DashboardCard";

interface Props {
  message: string;
}

export const ErrorBanner = ({ message }: Props) => (
  <DashboardCard>
    <div className="flex items-center gap-3 p-5">
      <ExclamationTriangleIcon className="w-5 h-5 text-error shrink-0" />
      <p className="text-sm text-error">{message}</p>
    </div>
  </DashboardCard>
);
