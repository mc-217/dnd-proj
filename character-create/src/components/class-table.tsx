// Same shape as the race table, minus the expanding: classes have no sub-rows
// here, so only the sorting feature is registered.
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

type CharacterClass = {
  name: string;
  hitDie: string;
  primaryAbility: string;
  savingThrows: string;
};

const classes: CharacterClass[] = [
  { name: "Barbarian", hitDie: "d12", primaryAbility: "STR", savingThrows: "STR, CON" },
  { name: "Bard", hitDie: "d8", primaryAbility: "CHA", savingThrows: "DEX, CHA" },
  { name: "Cleric", hitDie: "d8", primaryAbility: "WIS", savingThrows: "WIS, CHA" },
  { name: "Druid", hitDie: "d8", primaryAbility: "WIS", savingThrows: "INT, WIS" },
  { name: "Fighter", hitDie: "d10", primaryAbility: "STR or DEX", savingThrows: "STR, CON" },
  { name: "Monk", hitDie: "d8", primaryAbility: "DEX & WIS", savingThrows: "STR, DEX" },
  { name: "Paladin", hitDie: "d10", primaryAbility: "STR & CHA", savingThrows: "WIS, CHA" },
  { name: "Ranger", hitDie: "d10", primaryAbility: "DEX & WIS", savingThrows: "STR, DEX" },
  { name: "Rogue", hitDie: "d8", primaryAbility: "DEX", savingThrows: "DEX, INT" },
  { name: "Sorcerer", hitDie: "d6", primaryAbility: "CHA", savingThrows: "CON, CHA" },
  { name: "Warlock", hitDie: "d8", primaryAbility: "CHA", savingThrows: "WIS, CHA" },
  { name: "Wizard", hitDie: "d6", primaryAbility: "INT", savingThrows: "INT, WIS" },
];

const columnHelper = createColumnHelper<typeof features, CharacterClass>();

const columns = columnHelper.columns([
  columnHelper.accessor("name", { header: "Class" }),
  columnHelper.accessor("hitDie", { header: "Hit Die" }),
  columnHelper.accessor("primaryAbility", { header: "Primary Ability" }),
  columnHelper.accessor("savingThrows", { header: "Saving Throws" }),
]);

export function ClassTable() {
  const { character, updateCharacter } = useCharacter();
  const table = useTable({ features, columns, data: classes });

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
            const isSelected = row.original.name === character.characterClass;
            const choose = () => updateCharacter({ characterClass: row.original.name });

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
        {character.characterClass
          ? `Selected: ${character.characterClass}`
          : "Click a class to choose it."}
      </p>
    </>
  );
}
