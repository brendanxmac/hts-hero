"use client";

import { useEffect, useState } from "react";
import { DEMO_ALERTS, DemoAlert } from "./demoAlerts";

// The newest few alerts, with a new one arriving on a timer. Each item carries a
// serial so a re-arriving alert mounts fresh and plays its entrance again.
export const useAlertCycle = (visible = 3, everyMs = 2800) => {
  const [tick, setTick] = useState(visible);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setTick((t) => t + 1), everyMs);
    return () => clearInterval(id);
  }, [everyMs]);
  const items: (DemoAlert & { serial: number })[] = [];
  for (let i = 0; i < visible; i++) {
    const serial = tick - i;
    items.push({ ...DEMO_ALERTS[((serial % DEMO_ALERTS.length) + DEMO_ALERTS.length) % DEMO_ALERTS.length], serial });
  }
  return items;
};
