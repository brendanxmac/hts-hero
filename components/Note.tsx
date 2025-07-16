import { useState } from "react";
import { Note as NoteType } from "../public/notes/notes";
import PDF from "./PDF";
import { TertiaryText } from "./TertiaryText";
import { Color } from "../enums/style";
import { PrimaryLabel } from "./PrimaryLabel";
import { SupabaseBuckets } from "../constants/supabase";

interface Props {
  note: NoteType;
}

export const Note = ({ note }: Props) => {
  const {
    description,
    title,
    filePath: pdfURL,
    specialTariffTreatmentCodes,
  } = note;
  const [show, setShow] = useState(false);

  return (
    <div className="w-full flex flex-col rounded-md bg-base-100 border-2 border-base-content/40 hover:bg-neutral transition duration-100 ease-in-out scale-[0.99] hover:scale-[1] active:scale-[0.99] cursor-pointer">
      <div
        className="flex items-center justify-between gap-3 p-4"
        onClick={() => {
          setShow(!show);
        }}
      >
        <div className="flex flex-col sm:ml-4 gap-3">
          {title === description ? (
            <PrimaryLabel value={title} color={Color.WHITE} />
          ) : (
            <TertiaryText value={title} color={Color.WHITE} />
          )}
          {title !== description && (
            <div>
              <PrimaryLabel value={description} color={Color.WHITE} />

              {specialTariffTreatmentCodes &&
                specialTariffTreatmentCodes.length > 0 && (
                  <div className="flex gap-1 rounded-md min-w-24">
                    <TertiaryText value={"Special Tariff Symbols:"} />
                    <TertiaryText
                      value={specialTariffTreatmentCodes.join(", ") || "--"}
                    />
                  </div>
                )}
            </div>
          )}
        </div>
      </div>

      {show && (
        <PDF
          title={title}
          bucket={SupabaseBuckets.NOTES}
          filePath={pdfURL}
          isOpen={show}
          setIsOpen={setShow}
        />
      )}
    </div>
  );
};
