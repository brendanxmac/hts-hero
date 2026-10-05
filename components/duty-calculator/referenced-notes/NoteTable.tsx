// A table in a note's text, its first row as the header
export const NoteTable = ({ rows }: { rows: string[][] }) => {
  const [head, ...body] = rows;
  return (
    <div className="overflow-x-auto rounded-md border border-base-300 bg-base-100">
      <table className="w-full text-xs leading-snug">
        <thead className="bg-base-200">
          <tr>
            {head.map((cell, i) => (
              <th
                key={i}
                className="px-2.5 py-1.5 text-left font-semibold text-base-content align-bottom"
              >
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, r) => (
            <tr key={r} className="border-t border-base-300">
              {row.map((cell, i) => (
                <td
                  key={i}
                  className="px-2.5 py-1.5 text-base-content/70 align-top"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
