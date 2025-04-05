import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export const Cell = ({ children }: Props) => {
  return (
    <div className="col-span-2 sm:col-span-1 bg-primary-content rounded-md p-2">
      {children}
    </div>
  );
};
