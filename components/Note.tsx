import { useState } from "react";
import { NoteI as NoteType } from "../public/notes/notes";
import PDF from "./PDF";
import { SupabaseBuckets } from "../constants/supabase";
import {
  ChevronRightIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/16/solid";

interface Props {
  note: NoteType;
}

export const Note = ({ note }: Props) => {
  const { description, title, filePath, specialTariffTreatmentCodes } = note;
  const [show, setShow] = useState(false);

  return (
    <div
      className={`group relative overflow-hidden rounded-xl transition-all duration-200 ${
        filePath
          ? "bg-gradient-to-br from-base-100 via-base-100 to-base-200/30 border border-base-content/10 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 cursor-pointer"
          : "bg-base-200/50 border border-base-content/5 opacity-60 cursor-not-allowed"
      }`}
      onClick={() => {
        if (filePath) setShow(!show);
      }}
    >
      {/* Subtle hover gradient */}
      {filePath && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      )}

      <div className="relative z-10 p-4 flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* <div
              className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                filePath
                  ? "bg-primary/10 border border-primary/20"
                  : "bg-base-content/5 border border-base-content/10"
              }`}
            >
              <DocumentTextIcon
                className={`w-5 h-5 ${filePath ? "text-primary" : "text-base-content/30"}`}
              />
            </div> */}
            <div className="flex flex-col gap-0.5 min-w-0">
              {title === description ? (
                <h3 className="text-sm font-semibold text-base-content leading-snug">
                  {title}
                </h3>
              ) : (
                <>
                  <span className="text-xs font-semibold uppercase tracking-widest text-primary/70">
                    {title}
                  </span>
                  <h3 className="text-sm font-medium text-base-content leading-snug">
                    {description}
                  </h3>
                </>
              )}
            </div>
          </div>

          {filePath ? (
            <ChevronRightIcon className="shrink-0 w-5 h-5 text-base-content/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200" />
          ) : (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-base-content/5 border border-base-content/10">
              <ExclamationCircleIcon className="w-3.5 h-3.5 text-base-content/40" />
              <span className="text-xs font-medium text-base-content/40">
                N/A
              </span>
            </div>
          )}
        </div>

        {/* Special Tariff Codes */}
        {specialTariffTreatmentCodes &&
          specialTariffTreatmentCodes.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-semibold uppercase tracking-widest text-base-content/40">
                Trade Programs:
              </span>
              <div className="flex flex-wrap gap-1">
                {specialTariffTreatmentCodes.map((code) => (
                  <span
                    key={code}
                    className="px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-xs font-bold text-primary"
                  >
                    {code}
                  </span>
                ))}
              </div>
            </div>
          )}
      </div>

      {show && filePath && (
        <PDF
          title={title}
          bucket={SupabaseBuckets.NOTES}
          filePath={filePath}
          isOpen={show}
          setIsOpen={setShow}
        />
      )}
    </div>
  );
};
