import { DocumentMagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Cell } from "./Cell";
import { useState } from "react";
import { PrimaryInformation } from "./PrimaryInformation";
import { Note as NoteType } from "../public/notes/notes";
import PDF from "./PDF";
import SquareIconButton from "./SqaureIconButton";
import { SecondaryInformation } from "./SecondaryInformation";
import { TertiaryInformation } from "./TertiaryInformation";

interface Props {
  note: NoteType;
}

export const Note = ({ note }: Props) => {
  const { description, title, pdfURL, specialTariffTreatmentCodes } = note;
  const [show, setShow] = useState(false);

  return (
    <Cell>
      <div className="w-full flex flex-col rounded-md hover:shadow-sm hover:bg-base-300 active:bg-base-content/30 transition duration-200 ease-in-out cursor-pointer">
        <div
          className="flex items-center justify-between gap-3 p-4"
          onClick={() => {
            setShow(!show);
          }}
        >
          <div className="flex flex-col sm:ml-4 gap-3">
            <PrimaryInformation
              label={`${title}`}
              value={""}
              copyable={false}
            />
            <div>
              {title !== description && (
                <PrimaryInformation value={description} copyable={false} />
              )}
              {specialTariffTreatmentCodes &&
                specialTariffTreatmentCodes.length > 0 && (
                  <div className="flex gap-1 rounded-md min-w-24">
                    <TertiaryInformation value={"Special Tariff Symbols:"} />
                    <SecondaryInformation
                      label={specialTariffTreatmentCodes.join(", ") || "--"}
                      value=""
                    />
                  </div>
                )}
            </div>
          </div>

          <SquareIconButton
            icon={<DocumentMagnifyingGlassIcon className="h-6 w-6" />}
            onClick={() => setShow(!show)}
          />
        </div>

        {show && (
          <PDF title={title} file={pdfURL} isOpen={show} setIsOpen={setShow} />
        )}
      </div>
    </Cell>
  );
};
