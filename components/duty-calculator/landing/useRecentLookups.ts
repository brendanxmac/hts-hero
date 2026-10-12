"use client";

import { useEffect, useState } from "react";
import { readRecentLookups, RecentLookup } from "@/libs/recent-lookups";

// The device's recent calculator lookups, read once on the client
export const useRecentLookups = () => {
  const [lookups, setLookups] = useState<RecentLookup[]>([]);
  useEffect(() => setLookups(readRecentLookups()), []);
  return { lookups, clear: () => setLookups([]) };
};
