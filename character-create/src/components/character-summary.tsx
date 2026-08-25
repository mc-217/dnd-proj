// Reads the shared character draft and shows what has been chosen so far.
// A Client Component because context can only be read on the client.
"use client";

import { useCharacter } from "@/components/character-provider";

export function CharacterSummary() {
  const { character, resetCharacter } = useCharacter();

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

      <button className="allocate-button" type="button" onClick={resetCharacter}>
        Start over
      </button>
    </>
  );
}
