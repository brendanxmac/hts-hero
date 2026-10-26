"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowRightIcon, CheckCircleIcon, MagnifyingGlassIcon, MinusCircleIcon } from "@heroicons/react/20/solid";
import { Countries } from "@/constants/countries";
import { canonicalHtsCode } from "@/libs/hts-code";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import type { ProgramLookup } from "@/libs/tariff-programs/lookup";
import { markCalculatorHandoff } from "@/components/duty-calculator/lib/analytics";
import { mono } from "@/components/ui/font";
import { Select } from "@/components/ui/Select";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";

// "Is my code on a list?" on the /tariffs pages: paste an HTS code, see which program lists it
// (this page's first), then open its total duty in the calculator. The lists stay on the server
// (/api/tariff-programs/lookup), so the page carries no extra data for it.

const ORIGINS = Countries.filter((c) => c.code !== "US").sort((a, b) => a.name.localeCompare(b.name));

type Program = { slug: string; short: string; country?: string };

const calculatorHref = (code: string, country: string) => `/duty-calculator?code=${encodeURIComponent(code)}&country=${country}`;

export function CodeCheck({ program }: { program?: Program }) {
  const [input, setInput] = useState("");
  const [state, setState] = useState<{ status: "idle" | "loading" | "error"; error?: string; result?: ProgramLookup }>({ status: "idle" });
  const [country, setCountry] = useState(program?.country ?? "CN");

  const check = async (raw: string) => {
    if (!canonicalHtsCode(raw.trim())) {
      setState({ status: "error", error: "Enter a 4-, 6-, 8- or 10-digit HTS code, like 8471.30.01.00." });
      return;
    }
    setState((s) => ({ ...s, status: "loading", error: undefined }));
    try {
      const res = await fetch(`/api/tariff-programs/lookup?code=${encodeURIComponent(raw.trim())}`);
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Something went wrong. Try again.");
      const result = body as ProgramLookup;
      setState({ status: "idle", result });
      trackEvent(MixpanelEvent.TARIFF_PROGRAM_CODE_CHECKED, {
        program: program?.slug ?? "all",
        hts_code: result.code,
        digit_count: result.code.replace(/\D/g, "").length,
        listed_here: program ? result.listed.some((l) => l.slug === program.slug) : null,
        listed_programs: result.listed.length,
      });
    } catch (e) {
      setState({ status: "error", error: e instanceof Error ? e.message : "Something went wrong. Try again." });
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    check(input);
  };

  const result = state.result;
  const here = program && result ? result.listed.find((l) => l.slug === program.slug) : undefined;
  const others = result ? result.listed.filter((l) => l.slug !== program?.slug) : [];
  const beneathHere = program && result ? result.beneath.find((b) => b.slug === program.slug) : undefined;
  const otherBeneath = result ? result.beneath.filter((b) => b.slug !== program?.slug) : [];

  return (
    <div className={`${tt.panel} flex flex-col gap-5 p-6 lg:p-7`}>
      <div className="flex flex-col gap-1">
        <h2 className={`${tt.title} m-0`}>{program ? "Is Your HTS Code on the List?" : "Is Your HTS Code on a Tariff List?"}</h2>
        <p className={`${tt.subtitle} m-0`}>
          Paste an HTS code to see {program ? `whether the ${program.short} list it, and which other programs do` : "which US tariff programs list it"}.
        </p>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
        <label className={`${ui.input} flex flex-1 items-center gap-2`}>
          <MagnifyingGlassIcon className="h-4 w-4 shrink-0 text-base-content/50" aria-hidden />
          <span className="sr-only">HTS code</span>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPaste={(e) => {
              const pasted = e.clipboardData.getData("text");
              if (canonicalHtsCode(pasted.trim())) setTimeout(() => check(pasted), 0);
            }}
            inputMode="decimal"
            placeholder="e.g. 8471.30.01.00"
            className={`${mono.className} h-full w-full bg-transparent outline-hidden`}
          />
        </label>
        <button type="submit" className={`${ui.button({ variant: "primary" })} shrink-0`} disabled={state.status === "loading"}>
          {state.status === "loading" ? "Checking…" : "Check Code"}
        </button>
      </form>
      {state.status === "error" && <p className="m-0 text-sm text-error">{state.error}</p>}

      {result && (
        <div className="flex flex-col gap-4 border-t border-base-300 pt-5">
          <p className="m-0 text-sm text-base-content">
            {result.line.href ? (
              <Link href={result.line.href} className={`${mono.className} font-semibold text-primary hover:underline`}>
                {result.code}
              </Link>
            ) : (
              <span className={`${mono.className} font-semibold`}>{result.code}</span>
            )}
            {result.line.name && <span className="text-base-content/70"> · {result.line.name}</span>}
          </p>

          {program && (
            <Verdict
              listed={!!here}
              text={
                here
                  ? `Listed under the ${program.short}`
                  : beneathHere
                    ? `${beneathHere.count.toLocaleString("en-US")} code${beneathHere.count === 1 ? "" : "s"} under ${result.code} ${beneathHere.count === 1 ? "is" : "are"} on the ${program.short} lists`
                    : `Not on the ${program.short} lists`
              }
            />
          )}
          {here && <Headings headings={here.headings} />}
          {beneathHere && <Beneath examples={beneathHere.examples} count={beneathHere.count} />}

          {others.length > 0 && (
            <div className="flex flex-col gap-3">
              {program && <p className={`${tt.sectionTitle}`}>Also listed under</p>}
              {others.map((l) => (
                <div key={l.slug} className="flex flex-col gap-2">
                  <Link href={l.href} className={`${ui.link} text-sm font-semibold`}>
                    {l.title}
                  </Link>
                  <Headings headings={l.headings} />
                </div>
              ))}
            </div>
          )}
          {!program && others.length === 0 && (
            <Verdict
              listed={false}
              text={otherBeneath.length > 0 ? `${result.code} itself isn't listed, but some codes under it are` : "Not listed under any US tariff program's code list"}
            />
          )}
          {otherBeneath.length > 0 && (
            <p className="m-0 text-sm text-base-content/80">
              Codes under {result.code} are listed under{" "}
              {otherBeneath.map((b, i) => (
                <span key={b.slug}>
                  {i > 0 && (i === otherBeneath.length - 1 ? " and " : ", ")}
                  <Link href={b.href} className={ui.link}>
                    {b.title}
                  </Link>{" "}
                  ({b.count.toLocaleString("en-US")})
                </span>
              ))}
              . Enter the full 10-digit code to check yours.
            </p>
          )}
          {result.everyProduct.length > 0 && (
            <p className="m-0 text-sm text-base-content/80">
              Some programs apply to every product from the countries they name, whatever the code:{" "}
              {result.everyProduct.map((e, i) => (
                <span key={e.slug}>
                  {i > 0 && "; "}
                  <Link href={e.href} className={ui.link}>
                    {e.title}
                  </Link>{" "}
                  ({e.countries})
                </span>
              ))}
              .
            </p>
          )}

          <div className={`${tt.tile} flex flex-col gap-3 p-5`}>
            <p className="m-0 text-sm font-semibold text-base-content">See the total duty on {result.code}</p>
            <p className="m-0 text-sm text-base-content/80">
              Whether a list applies also depends on the country of origin, exemptions and how the programs stack. The free calculator works it all
              out: the regular duty plus every tariff in force.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Select<string>
                value={country}
                onChange={setCountry}
                options={ORIGINS.map((c) => ({ value: c.code, label: c.name }))}
                className="sm:w-64"
                menuClassName="w-64"
              />
              <Link
                href={calculatorHref(result.code, country)}
                onClick={() => markCalculatorHandoff(result.code, "tariff_program_page")}
                className={`${ui.button({ variant: "primary" })} shrink-0`}
              >
                Calculate Total Duty
                <ArrowRightIcon className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const Verdict = ({ listed, text }: { listed: boolean; text: string }) => (
  <p className={`m-0 flex items-center gap-2 text-base font-semibold ${listed ? "text-success" : "text-base-content"}`}>
    {listed ? <CheckCircleIcon className="h-5 w-5 shrink-0" aria-hidden /> : <MinusCircleIcon className="h-5 w-5 shrink-0 text-base-content/50" aria-hidden />}
    {text}
  </p>
);

const Headings = ({ headings }: { headings: ProgramLookup["listed"][number]["headings"] }) => (
  <ul className="m-0 flex list-none flex-col divide-y divide-base-300 rounded-md border border-base-300 p-0">
    {headings.map((h) => (
      <li key={h.code} className="flex flex-col gap-1 px-4 py-2.5 text-sm sm:flex-row sm:items-baseline sm:gap-4">
        <Link href={`/hts/${h.code}`} className={`${mono.className} shrink-0 font-semibold text-primary hover:underline`}>
          {h.code}
        </Link>
        <span className="min-w-0 flex-1 text-base-content">{h.name}</span>
        <span className="shrink-0 font-semibold text-base-content">{h.rate}</span>
        <span className="shrink-0 text-base-content/60">
          {h.countries} · listed as <span className={mono.className}>{h.listedAs}</span>
        </span>
      </li>
    ))}
  </ul>
);

const Beneath = ({ examples, count }: { examples: string[]; count: number }) => (
  <p className="m-0 text-sm text-base-content/80">
    Listed:{" "}
    {examples.map((c, i) => (
      <span key={c}>
        {i > 0 && ", "}
        <span className={mono.className}>{c}</span>
      </span>
    ))}
    {count > examples.length ? ` and ${(count - examples.length).toLocaleString("en-US")} more` : ""}. Enter the full 10-digit code to check yours.
  </p>
);
