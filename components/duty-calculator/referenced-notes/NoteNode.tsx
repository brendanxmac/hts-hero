import { CitedNode } from "./noteFiles";
import { blocks, covers, marker } from "./noteText";
import { NoteCodeList } from "./NoteCodeList";
import { NoteTable } from "./NoteTable";

// One subdivision of a note, indented by its depth
export const NoteNode = ({ node, htsCode }: { node: CitedNode; htsCode: string }) => {
  const parsed = blocks(node.text);
  // Lists of particular articles name their subheading in the text: highlight the one that covers
  // the entered code
  const mentioned = Array.from(
    node.text.matchAll(/\b\d{4}\.\d{2}(?:\.\d{2,4})?\b/g),
    (m) => m[0],
  );
  const isTable = parsed.some((b) => b.kind !== "text");
  const hit = !isTable && mentioned.some((c) => covers(c, htsCode));
  return (
    <div
      className={`flex flex-col gap-2 ${hit ? "rounded-md bg-success/10 px-2 py-1 -mx-2" : ""}`}
      style={{ marginLeft: node.depth * 16 }}
    >
      {parsed.length === 0 && (
        <p className="text-sm text-base-content/70">
          <span className="font-semibold text-base-content">
            {marker(node.citation)}
          </span>
        </p>
      )}
      {parsed.map((block, i) =>
        block.kind === "text" ? (
          <p
            key={i}
            className="text-sm leading-relaxed text-base-content/70"
          >
            {i === 0 && (
              <span className="font-semibold text-base-content mr-1.5">
                {marker(node.citation)}
              </span>
            )}
            {block.text}
            {hit && i === 0 && (
              <span className="ml-1.5 font-semibold text-success">
                ← {htsCode}
              </span>
            )}
          </p>
        ) : block.kind === "codes" ? (
          <NoteCodeList key={i} codes={block.codes} htsCode={htsCode} />
        ) : (
          <NoteTable key={i} rows={block.rows} />
        ),
      )}
    </div>
  );
};
