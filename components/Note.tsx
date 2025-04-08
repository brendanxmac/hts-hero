import { DocumentMagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Cell } from "./Cell";
import { useState } from "react";
import { PrimaryInformation } from "./PrimaryInformation";
import { Note as NoteType } from "../public/notes/notes";
import PDF from "./PDF";
import SquareIconButton from "./SqaureIconButton";

interface Props {
  note: NoteType;
}

export const Note = ({ note }: Props) => {
  const { description, title, pdfURL } = note;
  const [show, setShow] = useState(false);

  return (
    <Cell>
      <div className="w-full flex flex-col rounded-md hover:shadow-sm hover:bg-base-content/10 active:bg-base-content/30 transition duration-200 ease-in-out cursor-pointer">
        <div
          className="flex items-center justify-between gap-3 p-4"
          onClick={() => {
            setShow(!show);
          }}
        >
          <div className="flex gap-3 items-start">
            <div className="flex flex-col sm:ml-4">
              <PrimaryInformation
                label={`${title}`}
                value={""}
                copyable={false}
              />
              {title !== description && (
                <PrimaryInformation value={description} copyable={false} />
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
