import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export const NestedCell = ({ children }: Props) => {
  return (
    <div className="col-span-2 sm:col-span-1 bg-base-200 hover:bg-base-300 rounded-md hover:shadow-sm transition duration-200 ease-in-out cursor-pointer">
      {children}
    </div>
  );
};
