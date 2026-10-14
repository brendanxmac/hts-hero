import * as tt from "@/components/ui/styles/tracker";
import { OpportunityStatus, statusInfo } from "./statuses";

// A saving's status, as a chip
export const StatusChip = ({ status }: { status: OpportunityStatus }) => {
  const info = statusInfo(status);
  return <span className={tt.chip(info.tone)}>{info.label}</span>;
};
