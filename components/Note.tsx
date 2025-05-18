import { DocumentTextIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { Note as NoteType } from "../public/notes/notes";
import PDF from "./PDF";
import SquareIconButton from "./SqaureIconButton";
import { TertiaryText } from "./TertiaryText";
import { Color } from "../enums/style";
import { SecondaryLabel } from "./SecondaryLabel";

interface Props {
  note: NoteType;
}

export const Note = ({ note }: Props) => {
  const { description, title, pdfURL, specialTariffTreatmentCodes } = note;
  const [show, setShow] = useState(false);

  return (
    <div className="w-full flex flex-col rounded-md bg-base-100 border-2 border-neutral hover:bg-neutral transition duration-200 ease-in-out cursor-pointer">
      <div
        className="flex items-center justify-between gap-3 p-4"
        onClick={() => {
          setShow(!show);
        }}
      >
        <div className="flex flex-col sm:ml-4 gap-3">
          {title === description ? (
            <SecondaryLabel value={title} color={Color.WHITE} />
          ) : (
            <TertiaryText value={title} color={Color.WHITE} />
          )}
          {title !== description && (
            <div>
              <SecondaryLabel value={description} color={Color.WHITE} />

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

        <div className="self-start shrink-0">
          <SquareIconButton
            icon={<DocumentTextIcon className="h-4 w-4" />}
            onClick={() => setShow(!show)}
            transparent
          />
        </div>
      </div>

      {show && (
        <PDF title={title} file={pdfURL} isOpen={show} setIsOpen={setShow} />
      )}
    </div>
  );
};
