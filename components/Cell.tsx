import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export const Cell = ({ children }: Props) => {
  return (
    <div className="col-span-2 sm:col-span-1 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      {children}
    </div>
  );
};
