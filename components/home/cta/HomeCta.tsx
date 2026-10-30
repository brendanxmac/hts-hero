"use client";

import { ReactNode } from "react";
import { EntryCta } from "@/components/onboarding/EntryCta";
import type { HomeSection } from "../lib/offer";

// Every button on the homepage: an EntryCta starting from its section
export const HomeCta = ({ section, label, className, children }: { section: HomeSection; label: string; className: string; children: ReactNode }) => (
  <EntryCta page="home" entry={section} section={section} label={label} className={className}>
    {children}
  </EntryCta>
);
