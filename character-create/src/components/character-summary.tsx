// Reads the shared character draft and shows what has been chosen so far.
// A Client Component because context can only be read on the client.
"use client";

import { useState } from "react";
import { useCharacter } from "@/components/character-provider";

export function CharacterSummary() {
  const { character, resetCharacter } = useCharacter();
  const [saveState, setSaveState] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Keep save disabled until the minimum backend-required fields are chosen.
  const canSave = Boolean(character.race && character.characterClass);
  // Allow local override while defaulting to the backend dev URL.
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api";

  async function saveCharacter() {
    if (!character.race || !character.characterClass) {
      setSaveState("error");
      setSaveMessage("Pick both a race and class before saving.");
      return;
    }

    setSaveState("saving");
    setSaveMessage(null);

    try {
      // Persist through the backend so Supabase credentials stay server-side.
      const response = await fetch(`${apiBaseUrl}/characters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Temporary generated name until a dedicated name input is added.
          name: `${character.race} ${character.characterClass} Adventurer`,
          race: character.race,
          // Backend expects lowercase class values (e.g. "wizard").
          class: character.characterClass.toLowerCase(),
          background: character.background ?? undefined,
        }),
      });

      if (!response.ok) {
        const details = await response.text();
        throw new Error(details || `Request failed with status ${response.status}`);
      }

      const saved = (await response.json()) as { id?: string };
      setSaveState("success");
      setSaveMessage(
        saved.id ? `Saved to backend (id: ${saved.id}).` : "Saved to backend successfully.",
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setSaveState("error");
      setSaveMessage(`Could not save character: ${message}`);
    }
  }

  const entries = [
    { label: "Race", value: character.race },
    { label: "Subrace", value: character.subrace },
    { label: "Class", value: character.characterClass },
    { label: "Background", value: character.background },
  ];

  const scores = character.abilityScores;

  return (
    <>
      <table className="sheet-table">
        <thead>
          <tr>
            <th>Field</th>
            <th>Choice</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.label}>
              <td>{entry.label}</td>
              {/* Falls back to a dash when that step hasn't been completed. */}
              <td>{entry.value ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Only render the scores table once something has been allocated. */}
      {scores && (
        <table className="sheet-table">
          <thead>
            <tr>
              <th>Ability</th>
              <th>Score</th>
              <th>Modifier</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(scores).map(([ability, score]) => {
              const modifier = Math.floor((score - 10) / 2);

              return (
                <tr key={ability}>
                  <td>{ability}</td>
                  <td>{score}</td>
                  <td>
                    {modifier >= 0 ? "+" : ""}
                    {modifier}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <p className="table-selection">
        Choices are kept as you move between pages and are restored if you reload.
      </p>

      <button
        className="allocate-button"
        type="button"
        onClick={saveCharacter}
        // Prevent duplicate submissions and invalid payloads.
        disabled={!canSave || saveState === "saving"}
      >
        {saveState === "saving" ? "Saving..." : "Save to backend"}
      </button>

      {saveMessage && (
        <p className="table-selection" role={saveState === "error" ? "alert" : "status"}>
          {saveMessage}
        </p>
      )}

      <button className="allocate-button" type="button" onClick={resetCharacter}>
        Start over
      </button>
    </>
  );
}
