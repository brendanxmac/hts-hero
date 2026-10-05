import * as ui from "@/components/ui/styles";
import { formatDate } from "../lib/format";

// Tiny "Effective Mar 4, 2025" after the program name
export const EffectiveDate = ({ from }: { from?: string }) =>
  from ? (
    <span className={ui.caption}>
      {" · "}Effective {formatDate(from)}
    </span>
  ) : null;
