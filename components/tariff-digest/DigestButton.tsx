"use client"

import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid"
import * as ui from "@/components/ui/styles"
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel"

// Every tariff news sign-up outside /tariff-digest: one button that opens it in a new tab, where
// they pick weekly, as it happens, or both (DigestForm). `?from=` carries where it was, so the
// sign-up keeps its source.

export const DIGEST_PATH = "/tariff-digest"

export function DigestButton({
  source,
  label = "Get Tariff Updates",
  size,
  className = "",
}: {
  source: string
  label?: string
  size?: "sm" | "md" | "lg"
  className?: string
}) {
  return (
    <a
      href={`${DIGEST_PATH}?from=${encodeURIComponent(source)}`}
      target="_blank"
      rel="noopener"
      onClick={() => trackEvent(MixpanelEvent.TARIFF_DIGEST_CTA_CLICKED, { source })}
      className={`${ui.button({ variant: "primary", size })} ${className}`}
    >
      {label}
      <ArrowTopRightOnSquareIcon className="h-4 w-4" aria-hidden />
    </a>
  )
}
