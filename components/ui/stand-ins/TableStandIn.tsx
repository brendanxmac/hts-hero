import * as ui from "../styles";

// Made-up rows drawn behind a LockedPreview's blur in place of a real table
const ROWS = [
  ["8471.30.01", "China", "25.0%", "$2,140"],
  ["6110.20.20", "Vietnam", "16.5%", "$1,320"],
  ["9403.60.80", "Malaysia", "10.0%", "$860"],
  ["8516.60.40", "Thailand", "4.0%", "$410"],
  ["7318.15.20", "India", "8.5%", "$275"],
];

export const TableStandIn = ({ columns = ["Product", "Origin", "Rate", "Savings"] }: { columns?: string[] }) => (
  <table className="w-full text-sm tabular-nums">
    <thead>
      <tr>
        {columns.map((c) => (
          <th key={c} className={`${ui.label} px-3 py-2 text-left`}>
            {c}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {ROWS.map((row) => (
        <tr key={row[0]} className="border-t border-base-300">
          {row.map((cell, i) => (
            <td key={i} className="px-3 py-3">
              {cell}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);
