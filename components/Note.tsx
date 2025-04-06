import {
  ChevronRightIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/16/solid";
import { Cell } from "./Cell";
import { useState } from "react";
import { PrimaryInformation } from "./PrimaryInformation";
import { Note as NoteType } from "../public/notes/notes";
import PDF from "./PDF";
import { NestedCell } from "./NestedCell";
import { SecondaryInformation } from "./SecondaryInformation";

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
          className="flex items-start justify-between gap-3 p-4"
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
              <PrimaryInformation value={description} copyable={false} />
              {/* <SecondaryInformation value={description} copyable={false} /> */}
            </div>
          </div>

          <ChevronRightIcon className="shrink-0 w-7 h-7 self-center" />
        </div>

        {show && (
          <PDF title={title} file={pdfURL} isOpen={show} setIsOpen={setShow} />
        )}
      </div>
    </Cell>
  );
};
