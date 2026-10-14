"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { Countries } from "@/constants/countries";
import * as mk from "@/components/ui/marketing/styles";

// The hero's way into the free calculator: an HTS code and a country of origin open the full
// result on /duty-calculator. Kept light (no HTS data download) so the homepage stays fast.

const ORIGINS = Countries.filter((c) => c.code !== "US").sort((a, b) => a.name.localeCompare(b.name));

const EXAMPLES = [
  { label: "Cotton T-shirts from Vietnam", code: "6109.10.00.12", country: "VN" },
  { label: "Steel hardware from China", code: "7326.90.86.88", country: "CN" },
  { label: "Passenger cars from Germany", code: "8703.23.01.90", country: "DE" },
];

const calculatorUrl = (code: string, country: string) =>
  `/duty-calculator?code=${encodeURIComponent(code)}&country=${country}`;

export const QuickLookup = () => {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [country, setCountry] = useState("CN");
  const digits = code.replace(/\D/g, "");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    router.push(digits.length >= 4 ? calculatorUrl(code.trim(), country) : "/duty-calculator");
  };

  return (
    <div>
      <form onSubmit={submit} className="flex flex-col gap-3 rounded-3xl border border-base-300 bg-base-100 p-3 sm:flex-row sm:items-center">
        <label className="flex min-w-0 flex-1 flex-col px-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-base-content/60">HTS code</span>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            inputMode="decimal"
            placeholder="e.g. 6109.10.00"
            className="h-9 w-full bg-transparent text-lg text-base-content placeholder:text-base-content/40 focus:outline-none"
          />
        </label>
        <label className="flex min-w-0 flex-col border-base-300 px-2 sm:w-52 sm:border-l sm:pl-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-base-content/60">Country of origin</span>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="h-9 w-full bg-transparent text-lg text-base-content focus:outline-none"
          >
            {ORIGINS.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className={`${mk.buttonPrimary} shrink-0`}>
          Calculate duty <ArrowRightIcon className="h-4 w-4" aria-hidden />
        </button>
      </form>
      <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-base-content/60">
        <span>Try:</span>
        {EXAMPLES.map((ex) => (
          <a key={ex.code} href={calculatorUrl(ex.code, ex.country)} className="font-medium text-primary hover:text-primary hover:underline">
            {ex.label}
          </a>
        ))}
      </p>
    </div>
  );
};
