import { ComponentPropsWithoutRef, ReactNode, isValidElement } from "react";
import Link from "next/link";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import { headingId } from "@/libs/blog/headings";
import type { CtaKind } from "@/libs/blog/types";
import { mono } from "@/components/ui/font";
import * as ui from "@/components/ui/styles";
import { CtaPanel } from "../cta/CtaPanel";
import { Callout } from "./Callout";
import { RevisionTable } from "./RevisionTable";
import { TariffChangesTable } from "./TariffChangesTable";

// How markdown renders in a post: every element mapped onto the design system, plus the
// components a post can use by name (<Callout>, <Cta>, <TariffChangesTable>, <RevisionTable>).

// A heading's plain text, for its anchor id
const nodeText = (node: ReactNode): string => {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(nodeText).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return nodeText(node.props.children);
  return "";
};

const isExternal = (href: string) => /^https?:\/\//.test(href) && !href.includes("htshero.com");

const Anchor = ({ href = "", children }: ComponentPropsWithoutRef<"a">) =>
  isExternal(href) ? (
    <a href={href} target="_blank" rel="noopener" className={`${ui.link} underline decoration-primary/30`}>
      {children}
      <ArrowTopRightOnSquareIcon className="ml-0.5 inline h-3.5 w-3.5 align-baseline" aria-hidden />
    </a>
  ) : (
    <Link href={href} className={`${ui.link} underline decoration-primary/30`}>
      {children}
    </Link>
  );

export const mdxComponents = {
  h2: ({ children }: ComponentPropsWithoutRef<"h2">) => (
    <h2 id={headingId(nodeText(children))} className={`${ui.sectionTitle} scroll-mt-6`}>
      {children}
    </h2>
  ),
  h3: ({ children }: ComponentPropsWithoutRef<"h3">) => (
    <h3 id={headingId(nodeText(children))} className={`${ui.subsectionTitle} scroll-mt-6`}>
      {children}
    </h3>
  ),
  p: ({ children }: ComponentPropsWithoutRef<"p">) => <p className={ui.body}>{children}</p>,
  a: Anchor,
  strong: ({ children }: ComponentPropsWithoutRef<"strong">) => (
    <strong className="font-semibold text-base-content">{children}</strong>
  ),
  ul: ({ children }: ComponentPropsWithoutRef<"ul">) => (
    <ul className={`${ui.body} flex list-disc flex-col gap-2 pl-6 marker:text-base-content/60`}>{children}</ul>
  ),
  ol: ({ children }: ComponentPropsWithoutRef<"ol">) => (
    <ol className={`${ui.body} flex list-decimal flex-col gap-2 pl-6 marker:text-base-content/60`}>{children}</ol>
  ),
  li: ({ children }: ComponentPropsWithoutRef<"li">) => <li className="pl-1">{children}</li>,
  blockquote: ({ children }: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote className={`${ui.notice("primary")} flex flex-col gap-2 [&_p]:m-0`}>{children}</blockquote>
  ),
  // Inline code is how a post marks HTS codes and Chapter 99 headings: mono, so the digits line up
  code: ({ children }: ComponentPropsWithoutRef<"code">) => (
    <code className={`${mono.className} rounded bg-base-200 px-1 py-0.5 text-sm text-base-content`}>{children}</code>
  ),
  pre: ({ children }: ComponentPropsWithoutRef<"pre">) => (
    <pre className={`${ui.card} overflow-x-auto p-5 text-sm leading-relaxed [&_code]:bg-transparent [&_code]:p-0`}>
      {children}
    </pre>
  ),
  hr: () => <hr className="border-base-300" />,
  table: ({ children }: ComponentPropsWithoutRef<"table">) => (
    <div className={ui.card}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm tabular-nums">{children}</table>
      </div>
    </div>
  ),
  thead: ({ children }: ComponentPropsWithoutRef<"thead">) => <thead className="bg-base-200">{children}</thead>,
  tr: ({ children }: ComponentPropsWithoutRef<"tr">) => (
    <tr className="border-t border-base-300 first:border-t-0 hover:bg-base-200/60">{children}</tr>
  ),
  th: ({ children, style }: ComponentPropsWithoutRef<"th">) => (
    // GFM column alignment arrives as an inline style
    <th style={style} className={`${ui.label} whitespace-nowrap px-4 py-3 text-left first:pl-5 last:pr-5`}>
      {children}
    </th>
  ),
  td: ({ children, style }: ComponentPropsWithoutRef<"td">) => (
    <td style={style} className="px-4 py-3 align-top text-base-content/70 first:pl-5 last:pr-5">
      {children}
    </td>
  ),
  img: ({ src = "", alt = "" }: ComponentPropsWithoutRef<"img">) => (
    // Post images are static files of unknown size, so a plain <img> instead of next/image
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} loading="lazy" className="w-full rounded-lg border border-base-300" />
  ),
  Callout,
  Cta: ({ kind }: { kind: CtaKind }) => <CtaPanel kind={kind} />,
  TariffChangesTable,
  RevisionTable,
};
