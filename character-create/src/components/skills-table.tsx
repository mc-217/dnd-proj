// What can be picked here is decided by the two earlier steps: a background
// grants its skills outright, and a class chooses a fixed number from its own
// list. Skills on neither list are shown greyed out so the sheet still reads as
// the full set of eighteen.
//
// Showing all eighteen rather than filtering down to what is available is the
// deliberate choice here: a short list of four rows loses the sense that this is
// a character sheet, and hides what a different class would have offered.
//
// The class lists below come from the 2014 PHB and were checked by script, not
// by eye — a misspelled skill name raises no error anywhere, it just silently
// makes that row unselectable.
"use client";

import { useCharacter, type CharacterDraft } from "@/components/character-provider";
import { backgrounds } from "@/components/background-table";

const skills = [
  { name: "Acrobatics", ability: "DEX" },
  { name: "Animal Handling", ability: "WIS" },
  { name: "Arcana", ability: "INT" },
  { name: "Athletics", ability: "STR" },
  { name: "Deception", ability: "CHA" },
  { name: "History", ability: "INT" },
  { name: "Insight", ability: "WIS" },
  { name: "Intimidation", ability: "CHA" },
  { name: "Investigation", ability: "INT" },
  { name: "Medicine", ability: "WIS" },
  { name: "Nature", ability: "INT" },
  { name: "Perception", ability: "WIS" },
  { name: "Performance", ability: "CHA" },
  { name: "Persuasion", ability: "CHA" },
  { name: "Religion", ability: "INT" },
  { name: "Sleight of Hand", ability: "DEX" },
  { name: "Stealth", ability: "DEX" },
  { name: "Survival", ability: "WIS" },
];

const everySkill = skills.map((skill) => skill.name);

// Keyed by the same class names the class table stores. A bard picks from the
// whole list rather than a shortlist of its own.
const classSkills: Record<string, { choose: number; from: string[] }> = {
  Barbarian: {
    choose: 2,
    from: ["Animal Handling", "Athletics", "Intimidation", "Nature", "Perception", "Survival"],
  },
  Bard: { choose: 3, from: everySkill },
  Cleric: {
    choose: 2,
    from: ["History", "Insight", "Medicine", "Persuasion", "Religion"],
  },
  Druid: {
    choose: 2,
    from: ["Animal Handling", "Arcana", "Insight", "Medicine", "Nature", "Perception", "Religion", "Survival"],
  },
  Fighter: {
    choose: 2,
    from: ["Acrobatics", "Animal Handling", "Athletics", "History", "Insight", "Intimidation", "Perception", "Survival"],
  },
  Monk: {
    choose: 2,
    from: ["Acrobatics", "Athletics", "History", "Insight", "Religion", "Stealth"],
  },
  Paladin: {
    choose: 2,
    from: ["Athletics", "Insight", "Intimidation", "Medicine", "Persuasion", "Religion"],
  },
  Ranger: {
    choose: 3,
    from: ["Animal Handling", "Athletics", "Insight", "Investigation", "Nature", "Perception", "Stealth", "Survival"],
  },
  Rogue: {
    choose: 4,
    from: ["Acrobatics", "Athletics", "Deception", "Insight", "Intimidation", "Investigation", "Perception", "Performance", "Persuasion", "Sleight of Hand", "Stealth"],
  },
  Sorcerer: {
    choose: 2,
    from: ["Arcana", "Deception", "Insight", "Intimidation", "Persuasion", "Religion"],
  },
  Warlock: {
    choose: 2,
    from: ["Arcana", "Deception", "History", "Intimidation", "Investigation", "Nature", "Religion"],
  },
  Wizard: {
    choose: 2,
    from: ["Arcana", "History", "Insight", "Investigation", "Medicine", "Religion"],
  },
};

// s_proficiency is a single comma-separated column, so it is split and rejoined
// the same way on every read and write.
const SEPARATOR = ", ";

function splitList(value: string | null) {
  return value ? value.split(SEPARATOR).filter(Boolean) : [];
}

function grantedBy(backgroundName: string | null) {
  const background = backgrounds.find((entry) => entry.name === backgroundName);
  return background ? background.skills.split(SEPARATOR) : [];
}

export type ChosenSkill = {
  name: string;
  ability: string;
  source: string;
};

// Shared with the final sheet so the recap there can never disagree with what
// this page let you pick. Returned in the canonical skill order rather than the
// order they were clicked.
export function chosenSkills(character: CharacterDraft): ChosenSkill[] {
  const fromClass = character.characterClass
    ? classSkills[character.characterClass]
    : undefined;
  const granted = grantedBy(character.background);
  const saved = splitList(character.s_proficiency);

  return skills
    .filter((skill) => saved.includes(skill.name))
    .map((skill) => {
      let source = "—";
      if (granted.includes(skill.name)) {
        source = character.background ?? "—";
      } else if (fromClass?.from.includes(skill.name)) {
        source = character.characterClass ?? "—";
      }

      return { name: skill.name, ability: skill.ability, source };
    });
}

export function SkillsTable() {
  const { character, updateCharacter } = useCharacter();

  const fromClass = character.characterClass
    ? classSkills[character.characterClass]
    : undefined;

  const background = backgrounds.find((entry) => entry.name === character.background);
  const granted = grantedBy(character.background);

  const saved = splitList(character.s_proficiency);
  // Whatever is stored that the background did not grant was picked from the
  // class list. Filtering against that list drops anything left behind by an
  // earlier class or background; the next toggle rewrites the column without it.
  const picked = saved.filter(
    (skill) => !granted.includes(skill) && (fromClass?.from.includes(skill) ?? false),
  );
  const remaining = (fromClass?.choose ?? 0) - picked.length;

  function toggle(name: string) {
    const isPicked = picked.includes(name);
    if (!isPicked && remaining <= 0) return;

    const next = isPicked
      ? picked.filter((skill) => skill !== name)
      : [...picked, name];

    const combined = [...granted, ...next];
    updateCharacter({ s_proficiency: combined.length ? combined.join(SEPARATOR) : null });
  }

  if (!character.characterClass && !character.background) {
    return (
      <p className="table-selection">
        Choose a class and a background first — between them they decide which
        skills you can take.
      </p>
    );
  }

  return (
    <>
      <table className="sheet-table">
        <thead>
          <tr>
            <th>Skill</th>
            <th>Ability</th>
            <th>Source</th>
          </tr>
        </thead>
        <tbody>
          {skills.map((skill) => {
            const isGranted = granted.includes(skill.name);
            const isChoosable = !isGranted && (fromClass?.from.includes(skill.name) ?? false);

            // Granted skills are already fixed, so the row is shown filled in
            // but is not interactive.
            if (isGranted) {
              return (
                <tr className="is-granted" key={skill.name} aria-selected="true">
                  <td>{skill.name}</td>
                  <td>{skill.ability}</td>
                  <td>{character.background}</td>
                </tr>
              );
            }

            if (!isChoosable) {
              return (
                <tr className="is-unavailable" key={skill.name}>
                  <td>{skill.name}</td>
                  <td>{skill.ability}</td>
                  <td>—</td>
                </tr>
              );
            }

            const isPicked = picked.includes(skill.name);
            const choose = () => toggle(skill.name);

            return (
              <tr
                key={skill.name}
                className={isPicked ? "is-selected" : undefined}
                tabIndex={0}
                aria-selected={isPicked}
                onClick={choose}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    choose();
                  }
                }}
              >
                <td>{skill.name}</td>
                <td>{skill.ability}</td>
                <td>{character.characterClass}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <p className="table-selection" role="status">
        {!fromClass
          ? "Pick a class to unlock its skill choices."
          : remaining > 0
            ? `Choose ${remaining} more ${remaining === 1 ? "skill" : "skills"} from the ${character.characterClass} list.`
            : `All ${fromClass.choose} ${character.characterClass} skills chosen.`}
        {!background && " A background will add two more."}
      </p>
    </>
  );
}
