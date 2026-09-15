// Reads the shared character draft and shows what has been chosen so far.
// A Client Component because context can only be read on the client.
"use client";

import { useState } from "react";
import { useCharacter } from "@/components/character-provider";
import { ChosenSkillsTable } from "@/components/chosen-skills-table";

// Unchosen fields are dropped rather than sent as null, so the database keeps
// its own defaults (level, for one) instead of being overwritten with nothing.
function filledFields(values: Record<string, string | number | null>) {
  return Object.fromEntries(
    Object.entries(values).filter(([, value]) => value !== null),
  );
}

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
          ...filledFields({
            subrace: character.subrace,
            multiclass: character.multiclass,
            level: character.level,
            hitDice: character.hitDice,
            strength: character.strength,
            dexterity: character.dexterity,
            constitution: character.constitution,
            intelligence: character.intelligence,
            wisdom: character.wisdom,
            charisma: character.charisma,
            s_throws: character.s_throws,
            wep_proficiency: character.wep_proficiency,
            armor_proficiency: character.armor_proficiency,
            s_proficiency: character.s_proficiency,
            t_proficiency: character.t_proficiency,
            background: character.background,
            languages: character.languages,
            personality: character.personality,
            ideal: character.ideal,
            bond: character.bond,
            flaw: character.flaw,
            equipment: character.equipment,
          }),
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
    { label: "Multiclass", value: character.multiclass },
    { label: "Level", value: character.level },
    { label: "Hit Dice", value: character.hitDice },
    { label: "Background", value: character.background },
    { label: "Languages", value: character.languages },
    { label: "Saving Throws", value: character.s_throws },
    { label: "Weapon Proficiency", value: character.wep_proficiency },
    { label: "Armor Proficiency", value: character.armor_proficiency },
    { label: "Skill Proficiency", value: character.s_proficiency },
    { label: "Tool Proficiency", value: character.t_proficiency },
    { label: "Personality", value: character.personality },
    { label: "Ideal", value: character.ideal },
    { label: "Bond", value: character.bond },
    { label: "Flaw", value: character.flaw },
    { label: "Equipment", value: character.equipment },
  ];

  const scores = [
    { label: "STR", value: character.strength },
    { label: "DEX", value: character.dexterity },
    { label: "CON", value: character.constitution },
    { label: "INT", value: character.intelligence },
    { label: "WIS", value: character.wisdom },
    { label: "CHA", value: character.charisma },
  ].filter((entry): entry is { label: string; value: number } => entry.value !== null);

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
      {scores.length > 0 && (
        <table className="sheet-table">
          <thead>
            <tr>
              <th>Ability</th>
              <th>Score</th>
              <th>Modifier</th>
            </tr>
          </thead>
          <tbody>
            {scores.map(({ label, value }) => {
              const modifier = Math.floor((value - 10) / 2);

              return (
                <tr key={label}>
                  <td>{label}</td>
                  <td>{value}</td>
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

      {/* Sits here rather than in the page so it lands above the buttons, which
          stay the last thing on the sheet. */}
      <ChosenSkillsTable />

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
