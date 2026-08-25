"use client";

import { useCharacter } from "@/components/character-provider";
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

type Background = {
  name: string;
  skills: string;
  feature: string;
};

const backgrounds: Background[] = [
  { name: "Acolyte", skills: "Insight, Religion", feature: "Shelter of the Faithful" },
  { name: "Charlatan", skills: "Deception, Sleight of Hand", feature: "False Identity" },
  { name: "Criminal", skills: "Deception, Stealth", feature: "Criminal Contact" },
  { name: "Folk Hero", skills: "Animal Handling, Survival", feature: "Rustic Hospitality" },
  { name: "Noble", skills: "History, Persuasion", feature: "Position of Privilege" },
  { name: "Sage", skills: "Arcana, History", feature: "Researcher" },
  { name: "Soldier", skills: "Athletics, Intimidation", feature: "Military Rank" },
  { name: "Urchin", skills: "Sleight of Hand, Stealth", feature: "City Secrets" },
];

const columnHelper = createColumnHelper<typeof features, Background>();

const columns = columnHelper.columns([
  columnHelper.accessor("name", { header: "Background" }),
  columnHelper.accessor("skills", { header: "Skill Proficiencies" }),
  columnHelper.accessor("feature", { header: "Feature" }),
]);

export function BackgroundTable() {
  const { character, updateCharacter } = useCharacter();
  const table = useTable({ features, columns, data: backgrounds });

  return (
    <>
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
          {table.getRowModel().rows.map((row) => {
            const isSelected = row.original.name === character.background;
            const choose = () => updateCharacter({ background: row.original.name });

            return (
              <tr
                key={row.id}
                className={isSelected ? "is-selected" : undefined}
                tabIndex={0}
                aria-selected={isSelected}
                onClick={choose}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    choose();
                  }
                }}
              >
                {row.getAllCells().map((cell) => (
                  <td key={cell.id}>
                    <table.FlexRender cell={cell} />
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>

      <p className="table-selection" role="status">
        {character.background
          ? `Selected: ${character.background}`
          : "Click a background to choose it."}
      </p>
    </>
  );
}
