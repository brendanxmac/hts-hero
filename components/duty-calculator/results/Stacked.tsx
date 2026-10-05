// Compound values ("24¢ each + 4.5% on the case + 3.5% on the battery") go one part per line,
// so a long HTS rate can't stretch its column
export const Stacked = ({
  text,
  separator,
  align = "left",
}: {
  text: string;
  separator: string;
  align?: "left" | "right";
}) => {
  const parts = text.split(separator);
  return (
    <span
      className={`flex flex-col max-w-48 ${align === "right" ? "items-end ml-auto text-right" : ""}`}
    >
      {parts.map((part, i) => (
        <span key={i} className={part.length > 22 ? "" : "whitespace-nowrap"}>
          {i > 0 && separator.trim() === "+" ? "+ " : ""}
          {part}
        </span>
      ))}
    </span>
  );
};
