import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export const Cell = ({ children }: Props) => {
  return (
    <div className="col-span-2 sm:col-span-1 bg-neutral-900 rounded-md p-4 hover:bg-neutral-800">
      {children}
    </div>
  );
};
