import { InformationCircleIcon } from "@heroicons/react/20/solid";
import config from "@/config";
import * as ui from "@/components/ui/styles";
import { formatPostDate } from "@/components/blog";

// Who wrote the comparison and how it was checked. Being upfront about it is what makes the
// rest of the page credible, to readers and to the search engines and AI answers quoting it.
export function Disclosure({ checkedAt }: { checkedAt: string }) {
  return (
    <div className={`${ui.notice("primary")} flex gap-3`}>
      <InformationCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
      <p className={ui.bodySm}>
        <span className="font-semibold text-base-content">HTS Hero makes one of the tools on this page.</span> We
        checked every claim about other tools against their public websites on {formatPostDate(checkedAt)} and link our
        sources below. If something has changed, email{" "}
        <a href={`mailto:${config.resend.supportEmail}`} className={ui.link}>
          {config.resend.supportEmail}
        </a>{" "}
        and we&apos;ll update it.
      </p>
    </div>
  );
}
