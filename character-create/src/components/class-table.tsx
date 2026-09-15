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
  level: number;
  hitDie: string;
  primaryAbility: string;
  savingThrows: string;
  toolProficiency: string;
  armorProficiency: string;
  wepProficiency: string;
};

const classes: CharacterClass[] = [
  { name: "Barbarian", level: 1, hitDie: "d12", primaryAbility: "STR", savingThrows: "STR, CON",
    toolProficiency: "None", armorProficiency: "Light Armor, Medium Armor, Shields",
    wepProficiency: "Simple Weapons, Martial Weapons" },
  { name: "Bard", level: 1, hitDie: "d8", primaryAbility: "CHA", savingThrows: "DEX, CHA",
    toolProficiency: "Any 3 Musical Items", armorProficiency: "Light Armor",
    wepProficiency: "Simple Weapons, Hand Crossbows, Longswords, Rapiers, Shortswords" },
  { name: "Cleric", level: 1, hitDie: "d8", primaryAbility: "WIS", savingThrows: "WIS, CHA",
    toolProficiency: "None", armorProficiency: "Light Armor, Medium Armor, Shields",
    wepProficiency: "All Simple Weapons" },
  { name: "Druid", level: 1, hitDie: "d8", primaryAbility: "WIS", savingThrows: "INT, WIS",
    toolProficiency: "Herbalism Kit", armorProficiency: "(nonmetal) Light Armor, Medium Armor, Shields ",
    wepProficiency: "Clubs, Daggers, Darts, Javelins, Maces, Quarterstaffs, Scimitars, Sickles, Slings, Spears" },
  { name: "Fighter", level: 1, hitDie: "d10", primaryAbility: "STR or DEX", savingThrows: "STR, CON",
    toolProficiency: "None", armorProficiency: "All Armor, Shields",
    wepProficiency: "Simple Weapons, Martial Weapons" },
  { name: "Monk", level: 1, hitDie: "d8", primaryAbility: "DEX & WIS", savingThrows: "STR, DEX",
    toolProficiency: "One of any Artisan's Tools OR one Musical Instrument", armorProficiency: "None",
    wepProficiency: "Simple Weapons, Shortswords" },
  { name: "Paladin", level: 1, hitDie: "d10", primaryAbility: "STR & CHA", savingThrows: "WIS, CHA",
    toolProficiency: "None", armorProficiency: "All Armor, Shields",
    wepProficiency: "Simple Weapons, Martial Weapons" },
  { name: "Ranger", level: 1, hitDie: "d10", primaryAbility: "DEX & WIS", savingThrows: "STR, DEX",
    toolProficiency: "None", armorProficiency: "Light Armor, Medium Armor, Shields",
    wepProficiency: "Simple Weapons, Martial Weapons" },
  { name: "Rogue", level: 1, hitDie: "d8", primaryAbility: "DEX", savingThrows: "DEX, INT",
    toolProficiency: "Thieves' Tools", armorProficiency: "Light Armor",
    wepProficiency: "Simple Weapons, Hand Crossbows, Longswords, Rapiers, Shortswords" },
  { name: "Sorcerer", level: 1, hitDie: "d6", primaryAbility: "CHA", savingThrows: "CON, CHA",
    toolProficiency: "None", armorProficiency: "None",
    wepProficiency: "Daggers, Darts, Slings, Quarterstaffs, Light Crossbows" },
  { name: "Warlock", level: 1, hitDie: "d8", primaryAbility: "CHA", savingThrows: "WIS, CHA",
    toolProficiency: "None", armorProficiency: "Light Armor",
    wepProficiency: "Simple Weapons" },
  { name: "Wizard", level: 1, hitDie: "d6", primaryAbility: "INT", savingThrows: "INT, WIS",
    toolProficiency: "None", armorProficiency: "None",
    wepProficiency: "Daggers, Darts, Slings, Quarterstaffs, Light Crossbows" },
];

const columnHelper = createColumnHelper<typeof features, CharacterClass>();

const columns = columnHelper.columns([
  columnHelper.accessor("name", { header: "Class" }),
  columnHelper.accessor("hitDie", { header: "Hit Die" }),
  columnHelper.accessor("primaryAbility", { header: "Primary Ability" }),
  columnHelper.accessor("savingThrows", { header: "Saving Throws" }),
]);

// Several proficiencies above are still blank. Storing "" would render as an
// empty row on the sheet instead of a dash, and would be written to the
// database as an empty string rather than left null.
function orNull(value: string) {
  return value || null;
}

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
            // These columns are deliberately absent from the table above: they
            // are carried straight to the final sheet instead of being shown here.
            // hitDie reads "d12" but the hitDice column is an int, and the
            // generated hp column stays null until hitDice has a value.
            const choose = () =>
              updateCharacter({
                characterClass: row.original.name,
                hitDice: Number.parseInt(row.original.hitDie.slice(1), 10),
                s_throws: row.original.savingThrows,
                t_proficiency: orNull(row.original.toolProficiency),
                armor_proficiency: orNull(row.original.armorProficiency),
                wep_proficiency: orNull(row.original.wepProficiency),
              });

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
