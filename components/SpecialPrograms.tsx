import { useState } from "react";
import { SupabaseBuckets } from "../constants/supabase";
import { PDFProps } from "../interfaces/ui";
import { getGeneralNoteFromSpecialTariffSymbol } from "../libs/hts";
import PDF from "./PDF";

interface Props {
  programs: string[];
}

export const SpecialPrograms = ({ programs }: Props) => {
  const [showPDF, setShowPDF] = useState<PDFProps | null>(null);

  return (
    <div className="flex flex-wrap gap-1 items-center">
      <p className="text-sm text-base-content/60">Special Trade Programs:</p>
      {programs.map((specialTariffSymbol, index) => {
        const note = getGeneralNoteFromSpecialTariffSymbol(
          specialTariffSymbol.trim()
        );
        return (
          <div
            key={`${specialTariffSymbol}-${index}`}
            className="tooltip tooltip-primary"
            data-tip={note?.description || note?.title || null}
          >
            <button
              className="btn btn-link btn-primary btn-xs text-xs p-0 font-bold"
              onClick={() => {
                const note = getGeneralNoteFromSpecialTariffSymbol(
                  specialTariffSymbol.trim()
                );
                setShowPDF({
                  title: note?.title || "",
                  bucket: SupabaseBuckets.NOTES,
                  filePath: note?.filePath || "",
                });
              }}
            >
              {specialTariffSymbol}
            </button>
          </div>
        );
      })}
      {showPDF && (
        <PDF
          title={showPDF.title}
          bucket={showPDF.bucket}
          filePath={showPDF.filePath}
          isOpen={showPDF !== null}
          setIsOpen={(isOpen) => {
            if (!isOpen) {
              setShowPDF(null);
            }
          }}
        />
      )}
    </div>
  );
};
