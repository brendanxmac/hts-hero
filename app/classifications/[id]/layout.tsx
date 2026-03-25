import { ReactNode } from "react";
import { AnonymousClassificationLinker } from "../../../components/AnonymousClassificationLinker";

export default function ClassificationDetailLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <AnonymousClassificationLinker />
      {children}
    </>
  );
}
