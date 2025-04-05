import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export const NestedCell = ({ children }: Props) => {
  return <div className="col-span-2 sm:col-span-1">{children}</div>;
};
