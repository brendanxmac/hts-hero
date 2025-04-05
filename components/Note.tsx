import { EyeIcon, EyeSlashIcon } from "@heroicons/react/16/solid";
import { Cell } from "./Cell";
import { useState } from "react";
import { PrimaryInformation } from "./PrimaryInformation";
import { Note as NoteType } from "../public/notes/notes";
import ModalPDF from "./ModalPDF";
interface Props {
  note: NoteType;
}

export const Note = ({ note }: Props) => {
  const { description, title, pdfURL } = note;
  const [show, setShow] = useState(false);

  return (
    <Cell>
      <div className="w-full flex flex-col gap-4">
        <div
          className="flex items-start justify-between gap-3"
          onClick={() => {
            setShow(!show);
          }}
        >
          <div className="flex gap-3 items-start">
            <div className="shrink-0 flex flex-col">
              <PrimaryInformation
                value={`${title}:`}
                loud={false}
                copyable={false}
              />

              <h4 className="text-xs font-semibold text-primary">
                {description}
              </h4>
            </div>
            {/* <PrimaryInformation
              value={description}
              loud={true}
              copyable={false}
            /> */}
          </div>

          <button onClick={() => setShow(!show)}>
            {show ? (
              <EyeSlashIcon className="w-5 h-5" />
            ) : (
              <EyeIcon className="w-5 h-5" />
            )}
          </button>
        </div>

        {show && (
          <div className="flex flex-col gap-2">
            <ModalPDF
              title={title}
              isOpen={show}
              pdfURL={pdfURL}
              setIsOpen={setShow}
            />
          </div>
        )}
      </div>
    </Cell>
  );
};
