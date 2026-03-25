"use client";

import { createContext, useContext, ReactNode } from "react";

const ReadOnlyContext = createContext(false);

export function ReadOnlyProvider({
  children,
  readOnly = true,
}: {
  children: ReactNode;
  readOnly?: boolean;
}) {
  return (
    <ReadOnlyContext.Provider value={readOnly}>
      {children}
    </ReadOnlyContext.Provider>
  );
}

export function useIsReadOnly() {
  return useContext(ReadOnlyContext);
}
