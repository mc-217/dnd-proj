// The first table here fed by the API instead of a hardcoded array: the rows
// live in the Supabase `personalities` table and are fetched on mount, so this
// renders a loading, error or empty state before it ever renders a table.
//
// Those four states are the whole reason this looks heavier than its siblings.
// The other tables cannot fail — their data is a const in the file. This one can
// be slow, can fail, and can legitimately come back empty, and the three read
// very differently to someone looking at the page.
//
// The error state is not cosmetic right now: until the `personalities` table is
// created, the endpoint answers with PostgREST's "could not find the table" and
// this is what shows it.
//
// Display-only by request. Wiring row selection to fill personality/ideal/bond/
// flaw into the draft is a small addition once the table shape settles.
"use client";

import { useEffect, useMemo, useState } from "react";
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

// Matches the Personality entity the backend returns: every field but the id is
// optional, so any of them can come back missing.
type Personality = {
  id: string;
  personality?: string;
  ideal?: string;
  bond?: string;
  flaw?: string;
};

type PersonalityRow = {
  id: string;
  personality: string;
  ideal: string;
  bond: string;
  flaw: string;
};

const columnHelper = createColumnHelper<typeof features, PersonalityRow>();

const columns = columnHelper.columns([
  columnHelper.accessor("personality", { header: "Personality" }),
  columnHelper.accessor("ideal", { header: "Ideal" }),
  columnHelper.accessor("bond", { header: "Bond" }),
  columnHelper.accessor("flaw", { header: "Flaw" }),
]);

// Same default the save button uses, so both talk to the one backend.
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api";

export function PersonalityTable() {
  // null means "still loading"; an array means the request came back.
  const [rows, setRows] = useState<Personality[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Guards against a response landing after this component has gone away.
    let active = true;

    async function load() {
      try {
        const response = await fetch(`${apiBaseUrl}/personalities`);

        if (!response.ok) {
          const details = await response.text();
          throw new Error(details || `Request failed with status ${response.status}`);
        }

        const data = (await response.json()) as Personality[];
        if (active) setRows(data);
      } catch (caught) {
        if (active) {
          setError(caught instanceof Error ? caught.message : "Unknown error");
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, []);

  // A missing field shows a dash rather than an empty cell, matching the sheet.
  const data = useMemo<PersonalityRow[]>(
    () =>
      (rows ?? []).map((row) => ({
        id: row.id,
        personality: row.personality ?? "—",
        ideal: row.ideal ?? "—",
        bond: row.bond ?? "—",
        flaw: row.flaw ?? "—",
      })),
    [rows],
  );

  // Hooks have to run in the same order every render, so the table is built
  // before any of the early returns below.
  const table = useTable({ features, columns, data });

  if (error) {
    return (
      <p className="table-selection" role="alert">
        Could not load personalities: {error}
      </p>
    );
  }

  if (rows === null) {
    return <p className="table-selection">Loading personalities...</p>;
  }

  if (data.length === 0) {
    return <p className="table-selection">No personalities have been added yet.</p>;
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
