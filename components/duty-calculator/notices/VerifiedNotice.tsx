"use client";

import { TariffFinder } from "../lib/useTariffFinder";
import { DateNotice } from "./DateNotice";

// The Tariff Finder's DateNotice, for its entry date
export const VerifiedNotice = ({ f }: { f: TariffFinder }) => (
  <DateNotice entryDate={f.entryDate} onUseVerified={(date) => f.setEntryDate(date, "verified_notice")} />
);
