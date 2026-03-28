import type { MouseEvent, ReactNode } from "react";
import {
  normalizeUsitcHtsFileName,
  usitcHtsFileViewerTabUrl,
} from "@/libs/usitc-hts-file-url";

type UsitcHtsDocumentLinkProps = {
  fileName: string;
  className?: string;
  title?: string;
  children: ReactNode;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
};

export function UsitcHtsDocumentLink({
  fileName,
  className,
  title,
  children,
  onClick,
}: UsitcHtsDocumentLinkProps) {
  const normalized = normalizeUsitcHtsFileName(fileName);
  if (!normalized) {
    return <span className={className}>{children}</span>;
  }

  return (
    <a
      href={usitcHtsFileViewerTabUrl(normalized)}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      title={title}
      onClick={onClick}
    >
      {children}
    </a>
  );
}
