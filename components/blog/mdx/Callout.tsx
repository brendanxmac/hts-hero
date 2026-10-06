import { ReactNode } from "react";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";

type Tone = "primary" | "success" | "warning" | "error";

const ICONS: Record<Tone, { Icon: typeof InformationCircleIcon; color: string }> = {
  primary: { Icon: InformationCircleIcon, color: "text-primary" },
  success: { Icon: CheckCircleIcon, color: "text-success" },
  warning: { Icon: ExclamationTriangleIcon, color: "text-warning" },
  error: { Icon: XCircleIcon, color: "text-error" },
};

// A note set apart from the text, in MDX: <Callout tone="warning" title="Watch out">…</Callout>
export function Callout({ tone = "primary", title, children }: { tone?: Tone; title?: string; children: ReactNode }) {
  const { Icon, color } = ICONS[tone];
  return (
    <div className={`${ui.notice(tone)} flex gap-3`}>
      <Icon className={`mt-1 h-4 w-4 shrink-0 ${color}`} aria-hidden />
      <div className="flex min-w-0 flex-col gap-1.5">
        {title && <p className="text-base font-semibold text-base-content">{title}</p>}
        {/* MDX wraps a callout's text in <p>s; these keep them tight inside the box */}
        <div className={`${ui.body} flex flex-col gap-2 [&_p]:m-0`}>{children}</div>
      </div>
    </div>
  );
}
