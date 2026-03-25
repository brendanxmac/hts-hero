"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const proseThemeClasses =
  "prose-headings:scroll-mt-20 prose-headings:font-semibold prose-headings:text-base-content " +
  "prose-h1:text-lg prose-h2:text-base prose-h3:text-sm " +
  "prose-p:text-base-content/80 prose-li:text-base-content/80 prose-td:text-base-content/80 " +
  "prose-strong:text-base-content prose-strong:font-semibold " +
  "prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline " +
  "prose-code:rounded-md prose-code:bg-base-200 prose-code:px-1 prose-code:py-0.5 prose-code:text-sm prose-code:font-normal prose-code:text-base-content/90 prose-code:before:content-none prose-code:after:content-none " +
  "prose-pre:bg-base-200 prose-pre:border prose-pre:border-base-300 prose-pre:rounded-lg " +
  "prose-blockquote:border-l-4 prose-blockquote:border-primary/50 prose-blockquote:bg-base-200/40 prose-blockquote:py-0.5 prose-blockquote:not-italic prose-blockquote:text-base-content/75 " +
  "prose-hr:border-base-300 " +
  "prose-th:border prose-th:border-base-300 prose-th:bg-base-200/60 prose-th:text-base-content prose-th:font-semibold " +
  "prose-td:border prose-td:border-base-300 " +
  "prose-table:text-sm";

type MarkdownProseProps = {
  children: string | null | undefined;
  className?: string;
  size?: "sm" | "base";
};

export function MarkdownProse({
  children,
  className = "",
  size = "sm",
}: MarkdownProseProps) {
  const markdown = typeof children === "string" ? children.trim() : "";
  if (!markdown) return null;

  const sizeClass = size === "base" ? "prose-base" : "prose-sm";

  return (
    <div
      className={`prose ${sizeClass} max-w-none leading-[1.7] ${proseThemeClasses} ${className}`.trim()}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
    </div>
  );
}
