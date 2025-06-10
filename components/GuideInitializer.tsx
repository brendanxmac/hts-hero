"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useGuide } from "@/contexts/GuideContext";

export const GuideInitializer = (): null => {
  const pathname = usePathname();
  const { showGuide, guides } = useGuide();

  useEffect(() => {
    // Ensure code only runs client-side
    if (typeof window === "undefined") return;

    // Find the guide config for the current route
    const guideConfig = guides.find((config) =>
      config.routes?.includes(pathname)
    );

    if (guideConfig) {
      const storageKey = `guide-${guideConfig.name.toLowerCase()}`;
      const guideRaw = localStorage.getItem(storageKey);

      if (!guideRaw) {
        showGuide(guideConfig.name);
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            seen: true,
            expiresAt:
              Date.now() + guideConfig.daysUntilShowAgain * 24 * 60 * 60 * 1000,
          })
        );
        return;
      }

      try {
        const guide = JSON.parse(guideRaw);
        const hasExpired = Date.now() > guide.expiresAt;

        if (hasExpired) {
          showGuide(guideConfig.name);
          localStorage.setItem(
            storageKey,
            JSON.stringify({
              seen: false,
              expiresAt:
                Date.now() +
                guideConfig.daysUntilShowAgain * 24 * 60 * 60 * 1000,
            })
          );
        }
      } catch {
        // If data is corrupted, show the guide
        showGuide(guideConfig.name);
      }
    }
  }, [pathname, showGuide, guides]);

  return null;
};
