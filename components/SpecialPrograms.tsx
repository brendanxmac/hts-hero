import { getGeneralNoteFromSpecialTariffSymbol } from "../libs/hts";
import {
  normalizeUsitcHtsFileName,
  openUsitcHtsFileInNewTab,
} from "@/libs/usitc-hts-file-url";

interface Props {
  programs: string[];
}

export const SpecialPrograms = ({ programs }: Props) => {
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
              type="button"
              className="btn btn-link btn-primary btn-xs text-xs p-0 font-bold"
              onClick={() => {
                const n = getGeneralNoteFromSpecialTariffSymbol(
                  specialTariffSymbol.trim()
                );
                const resolved = normalizeUsitcHtsFileName(n?.fileName || "");
                if (resolved) openUsitcHtsFileInNewTab(resolved);
              }}
            >
              {specialTariffSymbol}
            </button>
          </div>
        );
      })}
    </div>
  );
};
