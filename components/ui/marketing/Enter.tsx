"use client";

import { ReactNode, useEffect, useState } from "react";

// Fades and slides its child in on mount (for items that arrive, like a new alert)
export const Enter = ({ children, className = "" }: { children: ReactNode; className?: string }) => {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <div
      className={`transition-all duration-500 ease-out ${shown ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"} ${className}`}
    >
      {children}
    </div>
  );
};
