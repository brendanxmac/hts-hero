import { useState } from "react";
import { Note as NoteType } from "../public/notes/notes";
import PDF from "./PDF";
import { TertiaryText } from "./TertiaryText";
import { Color } from "../enums/style";
import { PrimaryLabel } from "./PrimaryLabel";
import { SupabaseBuckets } from "../constants/supabase";
import { TertiaryLabel } from "./TertiaryLabel";
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
        "p-4 w-full flex flex-col rounded-md bg-base-100 border-2 border-base-content/40 hover:bg-neutral transition duration-100 ease-in-out cursor-pointer",
        !filePath && "bg-base-300 pointer-events-none"
      )}
      onClick={() => {
        setShow(!show);
      }}
    >
      <div className="flex flex-col sm:ml-4 gap-3">
        <div className="flex justify-between">
          {title === description ? (
            <PrimaryLabel
              value={title}
              color={!filePath ? Color.NEUTRAL_CONTENT : Color.WHITE}
            />
          ) : (
            <TertiaryText
              value={title}
              color={!filePath ? Color.NEUTRAL_CONTENT : Color.WHITE}
            />
          )}
          {!note.filePath && (
            <div className="bg-black px-3 py-1 rounded-md">
              <TertiaryLabel
                value="No Notes"
                color={!filePath ? Color.NEUTRAL_CONTENT : Color.WHITE}
              />
            </div>
          )}
        </div>
        {title !== description && (
          <div>
            <PrimaryLabel
              value={description}
              color={!filePath ? Color.NEUTRAL_CONTENT : Color.WHITE}
            />

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
