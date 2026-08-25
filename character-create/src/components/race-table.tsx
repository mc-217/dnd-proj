// "use client" makes this a Client Component: it ships JavaScript to the browser
// and can hold state. Required here because sorting, expanding, and selecting all
// change as the user clicks. 
// The page that renders this stays a Server Component.
"use client";
import { useCharacter } from "@/components/character-provider";

// TanStack Table v9 is opt-in: you register only the features you use, 
// Each feature needs its "*Feature" object, and anything that reorders or adds rows also needs a row model.
import {
  createColumnHelper,
  createExpandedRowModel,
  createSortedRowModel,
  rowExpandingFeature, //opted-in for expanding
  //    -> lets a row open to reveal its sub-rows
  
  rowSortingFeature, 
  //    -> lets columns be sorted when a header is clicked

  tableFeatures,
  useTable,
} from "@tanstack/react-table";


const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
 
  rowExpandingFeature,
  expandedRowModel: createExpandedRowModel(),
});

type Race = {
  name: string;
  abilityBonus: string;
  speed: number;
  size: string;
  subraces?: Race[]; // "?" allows for subrace to be optional ..
  //                    ..  and holds more race objects which is why the type refers to itself
//        ^ .. this nesting is what makes the rows expandable
};

// Parent races carry a "subraces" list;

// Declared outside the component so it isn't rebuilt on every render.

// Look! it's an array of ojects! a list :D 
const races: Race[] = [
  {
    name: "Dwarf",
    abilityBonus: "+2 CON",
    speed: 25,
    size: "Medium",
    subraces: [
      { name: "Hill Dwarf", abilityBonus: "+1 WIS", speed: 25, size: "Medium" },
      { name: "Mountain Dwarf", abilityBonus: "+2 STR", speed: 25, size: "Medium" },
    ],
  },
  {
    name: "Elf",
    abilityBonus: "+2 DEX",
    speed: 30,
    size: "Medium",
    subraces: [
      { name: "High Elf", abilityBonus: "+1 INT", speed: 30, size: "Medium" },
      { name: "Wood Elf", abilityBonus: "+1 WIS", speed: 35, size: "Medium" },
      { name: "Drow", abilityBonus: "+1 CHA", speed: 30, size: "Medium" },
    ],
  },
  {
    name: "Halfling",
    abilityBonus: "+2 DEX",
    speed: 25,
    size: "Small",
    subraces: [
      { name: "Lightfoot", abilityBonus: "+1 CHA", speed: 25, size: "Small" },
      { name: "Stout", abilityBonus: "+1 CON", speed: 25, size: "Small" },
    ],
  },
  { 
    name: "Human",
    abilityBonus: "+1 All",
    speed: 30, 
    size: "Medium" },
 //             Human has no subrace, so it behaves as a final choice rather than an expandable row.
];

// The column helpercreates a small factory that is permanently bound to two things: your Race type and your registered features.
//  Every column you make with it is then checked against those.
const columnHelper = createColumnHelper<typeof features, Race>();

// Columns map a field on Race to a visible header. This is the only place the
// header text lives; the table builds every <th> from it.
const columns = columnHelper.columns([
  columnHelper.accessor("name", { header: "Race" }), // typescript will verify that "name" is actually a field in Race 
  //                                                .. so if there's a typo "nmae" .. it will make it a red squiggle 
  //                                                   .. instead of an empty column at runtime
  columnHelper.accessor("abilityBonus", { header: "Ability Bonus" }),
  columnHelper.accessor("speed", { header: "Speed" }),
  columnHelper.accessor("size", { header: "Size" }),
]);
//without columnHelper it would look like this: 
//          const columns = [
//              { accessorKey: "name", header: "Race" },
//              { accessorKey: "speed", header: "Speed" },
//               ];

// TLDR:  ColumnHelper is a bughandler.. it will add a red squiggle for mispelled column names instead of an empty cell

// there's also columnHelper.display({})
//      .. for a column that renders a button rather than reading a field
// and columnHelper.group({})
//      .. for stacked header groups

export function RaceTable() {
  // The choice now lives in the shared character draft instead of local state,
  // so it survives navigating to another page. Expanding stays local to the
  // table, since it's just a display detail.
  const { character, updateCharacter } = useCharacter();

  // A subrace wins over its parent, so only one row is ever highlighted.
  const selected = character.subrace ?? character.race;

  const table = useTable({
    features,
    columns,
    data: races,
    // Tells the table how to find children for a row. Returning undefined (for
    // Human) means that row has nothing to expand.
    getSubRows: (race: Race) => race.subraces,
  });

  // TanStack Table is "headless": it computes rows, sorting, and expansion state,
  // but renders nothing. All the markup below is ours to control and style.
  return (
    <>
      <table className="sheet-table">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                // Clicking a header cycles that column: ascending, descending, off.
                <th key={header.id} onClick={() => header.column.toggleSorting()}>
                  {/* FlexRender prints whatever the column defined as its header,
                      whether that is plain text or a custom component. */}
                  <table.FlexRender header={header} />
                  {{ asc: " ▲", desc: " ▼" }[header.column.getIsSorted() as string] ?? ""}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {/* getRowModel() returns only the rows that should currently be visible:
              sorted, and with subraces included only while their parent is open. */}
          {table.getRowModel().rows.map((row) => {
            const canExpand = row.getCanExpand(); // true when the race has subraces
            const isExpanded = row.getIsExpanded(); // true while its subraces show
            const isSelected = row.original.name === selected;

            // Every row is a valid choice, including a base race like Dwarf.
            // Picking a base race clears any subrace under it; picking a subrace
            // also records its parent, so the sheet always knows both.
            const activate = () => {
              const name = row.original.name;

              if (row.depth === 0) {
                updateCharacter({ race: name, subrace: null });
                return;
              }

              const parent = races.find((race) =>
                race.subraces?.some((subrace) => subrace.name === name),
              );

              updateCharacter({ race: parent?.name ?? null, subrace: name });
            };

            return (
              <tr
                key={row.id}
                // Build the class list from whichever states are active, then drop
                // the empty strings so we don't emit class="  ".
                className={[
                  row.depth > 0 ? "is-subrace" : "", // depth 0 = race, 1 = subrace
                  isExpanded ? "is-expanded" : "",
                  isSelected ? "is-selected" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                // A <tr> isn't focusable by default, so tabIndex puts it in the tab
                // order and the aria-* attributes tell screen readers what it does.
                tabIndex={0}
                aria-selected={isSelected}
                onClick={activate}
                // Mouse users get onClick for free; this gives keyboard users the
                // same action via Enter or Space.
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    activate();
                  }
                }}
              >
                {row.getAllCells().map((cell, index) => (
                  <td key={cell.id}>
                    {/* Only the first column gets the arrow or bullet marker.
                        The arrow is its own button so expanding and choosing stay
                        separate actions: stopPropagation keeps the click from
                        also reaching the row's onClick and selecting the race. */}
                    {index === 0 &&
                      (canExpand ? (
                        <button
                          type="button"
                          className="row-marker row-toggle"
                          aria-expanded={isExpanded}
                          aria-label={`${isExpanded ? "Hide" : "Show"} ${row.original.name} subraces`}
                          onClick={(event) => {
                            event.stopPropagation();
                            row.toggleExpanded();
                          }}
                        >
                          {isExpanded ? "▾" : "▸"}
                        </button>
                      ) : (
                        <span className="row-marker">{row.depth > 0 ? "•" : ""}</span>
                      ))}
                    <table.FlexRender cell={cell} />
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* role="status" makes screen readers announce the choice when it changes. */}
      <p className="table-selection" role="status">
        {selected
          ? `Selected: ${selected}`
          : "Click a race to choose it, or use the arrow to see its subraces."}
      </p>
    </>
  );
}
