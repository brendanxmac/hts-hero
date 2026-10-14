"use client";

import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { ColumnDef } from "@tanstack/react-table";
import { FacetMeta } from "@/components/ui/table";
import { Countries } from "../../constants/countries";

// Column pieces the Tracker's tables share (components/ui/table)

// A filter by country, values being country codes: shown with the flag and name
export const countryFacet = (label = "Country of origin"): FacetMeta => ({
  label,
  describe: (code) => {
    const country = Countries.find((c) => c.code === code);
    return { label: country?.name ?? code, icon: country?.flag };
  },
});

// The last column of a table whose rows open something: a chevron
export const openColumn = <T,>(): ColumnDef<T, any> => ({
  id: "open",
  header: () => <span className="sr-only">Open</span>,
  enableSorting: false,
  meta: { width: "w-10", align: "right" },
  cell: () => <ChevronRightIcon className="ml-auto h-5 w-5 text-base-content/40" aria-hidden />,
});
