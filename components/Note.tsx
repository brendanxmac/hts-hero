import { useState } from "react";
import { NoteI as NoteType } from "../public/notes/notes";
import PDF from "./PDF";
import { SupabaseBuckets } from "../constants/supabase";
import { classNames } from "../utilities/style";

interface Props {
  note: NoteType;
}

export const Note = ({ note }: Props) => {
  const { description, title, filePath, specialTariffTreatmentCodes } = note;
  const [show, setShow] = useState(false);

  return (
    <div
      className={classNames(
        "card p-5 w-full rounded-xl border-2 transition-all duration-150 ease-in-out",
        filePath
          ? "bg-base-100 border-base-content/20 hover:border-primary hover:shadow-lg cursor-pointer"
          : "bg-base-200 border-base-content/10 opacity-60 cursor-not-allowed"
      )}
      onClick={() => {
        if (filePath) setShow(!show);
      }}
    >
      <div className="flex flex-col gap-4">
        {/* Header with title and badge */}
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            {title === description ? (
              <h3 className="text-base font-semibold text-base-content leading-snug">
                {title}
              </h3>
            ) : (
              <p className="text-sm font-medium text-base-content/60 uppercase tracking-wide">
                {title}
              </p>
            )}
          </div>
          {!note.filePath && (
            <div className="badge badge-ghost badge-lg flex-shrink-0">
              No Notes
            </div>
          )}
        </div>

        {/* Description and special tariff codes */}
        {title !== description && (
          <div className="flex flex-col gap-3">
            <h3 className="text-base font-semibold text-base-content leading-snug">
              {description}
            </h3>

            {specialTariffTreatmentCodes &&
              specialTariffTreatmentCodes.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-xs font-medium text-base-content/60 uppercase tracking-wide">
                    Special Tariff Symbols:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {specialTariffTreatmentCodes.map((code) => (
                      <span
                        key={code}
                        className="badge badge-sm text-primary bg-primary/10 font-semibold border-primary"
                      >
                        {code}
                      </span>
                    ))}
                  </div>
                </div>
              )}
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
