import { ColumnAssignment } from "../types"

// Countries without normal trade relations (general note 3(b)), which use Column 2 rates
export const columnAssignments: ColumnAssignment[] = [
  { country: "CU", column: "column2", effective: {} },
  { country: "KP", column: "column2", effective: {} },
  {
    country: "RU",
    column: "column2",
    effective: { from: "2022-04-09" },
    source: { citation: "Suspending Normal Trade Relations with Russia and Belarus Act" },
  },
  {
    country: "BY",
    column: "column2",
    effective: { from: "2022-04-09" },
    source: { citation: "Suspending Normal Trade Relations with Russia and Belarus Act" },
  },
]
