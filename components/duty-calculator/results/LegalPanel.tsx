import { ReferencedNotes } from "../referenced-notes";

// The legal text and the notes it cites, shared by line items and questions
export const LegalPanel = ({
  text,
  citations,
  notesFor,
}: {
  text: string;
  citations?: string[];
  notesFor?: { asOf: string; htsCode: string };
}) => (
  <div className="flex flex-col gap-4 rounded-md border border-base-300 bg-base-100 p-4 shadow-sm">
    <p className="text-sm leading-relaxed text-base-content">{text}</p>
    {notesFor && (
      <ReferencedNotes
        texts={[text]}
        citations={citations}
        asOf={notesFor.asOf}
        htsCode={notesFor.htsCode}
      />
    )}
  </div>
);
