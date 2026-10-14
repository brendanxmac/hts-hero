"use client";

import { CheckIcon, LinkIcon } from "@heroicons/react/20/solid";
import * as tt from "@/components/ui/styles/tracker";
import { TariffFinder } from "../lib/useTariffFinder";

// On the calculator's tab bar: copy a link to this calculation, which is free
export const ShareButton = ({ f }: { f: TariffFinder }) => (
  <button type="button" className={tt.button("secondary", "sm")} onClick={f.copyLink}>
    {f.copied ? <CheckIcon className="h-4 w-4 text-success" aria-hidden /> : <LinkIcon className="h-4 w-4" aria-hidden />}
    {f.copied ? "Link copied" : "Share"}
  </button>
);
