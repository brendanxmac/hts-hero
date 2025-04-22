import { DocumentTextIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { PrimaryText } from "./PrimaryText";
import { Note as NoteType } from "../public/notes/notes";
import PDF from "./PDF";
import SquareIconButton from "./SqaureIconButton";
import { SecondaryText } from "./SecondaryText";
import { TertiaryText } from "./TertiaryText";

interface Props {
  note: NoteType;
}

export const Note = ({ note }: Props) => {
  const { description, title, pdfURL, specialTariffTreatmentCodes } = note;
  const [show, setShow] = useState(false);

  return (
    <div className="w-full flex flex-col rounded-md bg-primary/30 dark:bg-primary/30 hover:shadow-sm hover:bg-primary/50 transition duration-200 ease-in-out cursor-pointer">
      <div
        className="flex items-center justify-between gap-3 p-4"
        onClick={() => {
          setShow(!show);
        }}
      >
        <div className="flex flex-col sm:ml-4 gap-3">
          <PrimaryText value={title} copyable={false} />
          <div>
            {title !== description && (
              <SecondaryText value={description} copyable={false} />
            )}
            {specialTariffTreatmentCodes &&
              specialTariffTreatmentCodes.length > 0 && (
                <div className="flex gap-1 rounded-md min-w-24">
                  <TertiaryText value={"Special Tariff Symbols:"} />
                  <TertiaryText
                    label={specialTariffTreatmentCodes.join(", ") || "--"}
                    value=""
                  />
                </div>
              )}
          </div>
        </div>

        <div className="self-start shrink-0">
          <SquareIconButton
            icon={<DocumentTextIcon className="h-4 w-4" />}
            onClick={() => setShow(!show)}
          />
        </div>
      </div>

      {show && (
        <PDF title={title} file={pdfURL} isOpen={show} setIsOpen={setShow} />
      )}
    </div>
  );
};
