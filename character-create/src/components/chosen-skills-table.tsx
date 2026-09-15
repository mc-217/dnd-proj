// A read-only recap of whatever was picked on the skills step. Only sorting is
// registered: unlike the choice tables, no row here is clickable.
//
// Rendered from CharacterSummary rather than the page, because the summary ends
// with the Save and Start Over buttons — mounting this at page level would drop
// it underneath them instead of above.
//
// The rows come from chosenSkills(), shared with the picker, so this recap
// cannot drift from what the picker actually allowed.
"use client";

import { useMemo } from "react";
import { useCharacter } from "@/components/character-provider";
import { chosenSkills } from "@/components/skills-table";
import {
  createColumnHelper,
  createSortedRowModel,
  rowSortingFeature,
  sortFns,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";

const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns,
});

type ChosenSkillRow = {
  name: string;
  ability: string;
  source: string;
  bonus: string;
};

const columnHelper = createColumnHelper<typeof features, ChosenSkillRow>();

const columns = columnHelper.columns([
  columnHelper.accessor("name", { header: "Skill" }),
  columnHelper.accessor("ability", { header: "Ability" }),
  columnHelper.accessor("source", { header: "Source" }),
  // Deliberately blank for now. Filling it in needs the proficiency bonus for
  // the character's level plus the modifier for each skill's ability.
  columnHelper.accessor("bonus", { header: "Bonus" }),
]);

export function ChosenSkillsTable() {
  const { character } = useCharacter();

  // The draft object is only replaced when storage actually changes, so this
  // rebuilds the rows on a real edit rather than on every render.
  const data = useMemo<ChosenSkillRow[]>(
    () => chosenSkills(character).map((skill) => ({ ...skill, bonus: "" })),
    [character],
  );

  const table = useTable({ features, columns, data });

  if (data.length === 0) {
    return (
      <p className="table-selection">
        No skills chosen yet — pick them on the Skills step.
      </p>
    );
  }

  return (
    <table className="sheet-table">
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th key={header.id} onClick={() => header.column.toggleSorting()}>
                <table.FlexRender header={header} />
                {{ asc: " ▲", desc: " ▼" }[header.column.getIsSorted() as string] ?? ""}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getAllCells().map((cell) => (
              <td key={cell.id}>
                <table.FlexRender cell={cell} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
