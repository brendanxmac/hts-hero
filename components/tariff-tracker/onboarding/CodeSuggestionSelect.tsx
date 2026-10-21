"use client";

import { mono } from "@/components/ui/font";
import { Select } from "@/components/ui/Select";
import { htsCodeDigitsOnly } from "@/libs/hts-code";
import { CodeSuggestion, isHs6Like, matchedDigits } from "./fixes";

// The full US codes a written code may have meant, in the app's dropdown (ui/Select). Each code
// lights up the digits it shares with what was written, so the right one is easy to spot: the
// 6 digits of an HS code, or every digit but the leading zero Excel dropped.

// A code as the HTS writes it (dots), with the matched digits lit
export const HighlightedCode = ({ written, htsno }: { written: string; htsno: string }) => {
  const matched = matchedDigits(written, htsCodeDigitsOnly(htsno));
  let digit = -1;
  return (
    <span className={`${mono.className} font-semibold`}>
      {htsno.split("").map((ch, i) => {
        const isDigit = /\d/.test(ch);
        if (isDigit) digit++;
        // A dot between two matched digits is part of the match
        const lit = isDigit ? matched.has(digit) : matched.has(digit) && matched.has(digit + 1);
        return (
          <span key={i} className={lit ? "rounded-[3px] bg-primary/15 text-primary" : "text-base-content"}>
            {ch}
          </span>
        );
      })}
    </span>
  );
};

export const CodeSuggestionSelect = ({
  written,
  codes,
  onPick,
  label,
}: {
  // What was written in the code column
  written: string;
  codes: CodeSuggestion[];
  onPick: (htsno: string) => void;
  label: string;
}) => {
  const hs6 = isHs6Like(written);
  return (
    <Select<string>
      value=""
      onChange={(v) => v && onPick(v)}
      label={label}
      size="sm"
      className="min-w-0 max-w-xl flex-1"
      buttonClassName="w-full"
      menuClassName="w-[34rem] max-w-[calc(100vw-2rem)]"
      placeholder={
        <span className="truncate">
          {hs6 ? `Choose the full US code under ${htsCodeDigitsOnly(written).slice(0, 4)}.${htsCodeDigitsOnly(written).slice(4, 6)}` : "Did you mean one of these?"}{" "}
          <span className="text-base-content/50">({codes.length})</span>
        </span>
      }
      options={codes.map((c) => ({
        value: c.htsno,
        label: <HighlightedCode written={written} htsno={c.htsno} />,
        description: <span className="line-clamp-2 text-xs text-base-content/65">{c.description}</span>,
      }))}
    />
  );
};
