"use client";

import { useState } from "react";
import { useCharacter } from "@/components/character-provider";

const abilities = [
  { name: "Strength", abbreviation: "STR", description: "How hard can you crush a tomato?" },
  { name: "Dexterity", abbreviation: "DEX", description: "How well can you dodge a tomato thrown at you?" },
  { name: "Constitution", abbreviation: "CON", description: "How sick will you get after eating a rotten tomato?" },
  { name: "Intelligence", abbreviation: "INT", description: "Do you know that a tomato is a fruit?" },
  { name: "Wisdom", abbreviation: "WIS", description: "Do you know not to put a tomato in a fruit salad?" },
  { name: "Charisma", abbreviation: "CHA", description: "Can you sell someone a tomato fruit salad?" },
];

const initialValues = Object.fromEntries(
  abilities.map(({ abbreviation }) => [abbreviation, 10]),
);

export default function CharacterStats() {
  // The pending roll is throwaway, so it stays local. The allocated scores are
  // part of the character, so they live in the shared draft and survive
  // navigating away from this page.
  const [statRoll, setStatRoll] = useState<number | null>(null);
  const { character, updateCharacter } = useCharacter();
  const scores = character.abilityScores ?? initialValues;

  function rollStat() {
    const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
    rolls.sort((a, b) => a - b);
    setStatRoll(rolls.slice(1).reduce((total, roll) => total + roll, 0));
  }

  function allocateRoll(ability: string) {
    if (statRoll === null) return;
    updateCharacter({ abilityScores: { ...scores, [ability]: statRoll } });
    setStatRoll(null);
  }

  return (
    <main className="character-builder">
      <header className="page-header">
        <p className="eyebrow">Character creation · Character stats</p>
        <div className="heading-row">
          <div>
            <h1>Ability Scores</h1>
            <p className="intro">Roll your stats.</p>
          </div>
          <div className="roll-panel">
            <button className="dice-roll" type="button" onClick={rollStat}>
              Roll Stat
            </button>
            <div className="stat-roll" aria-label="Stat roll result">
              <span>Stat Roll</span>
              <strong>{statRoll ?? "-"}</strong>
            </div>
          </div>
        </div>
      </header>

      <section className="ability-grid" aria-label="Ability scores">
        {abilities.map((ability) => {
          const modifier = Math.floor((scores[ability.abbreviation] - 10) / 2);

          return (
            <article className="ability-card" key={ability.abbreviation}>
              <div className="card-topline">
                <span className="ability-abbreviation">{ability.abbreviation}</span>
                <span className="modifier">
                  {modifier >= 0 ? "+" : ""}
                  {modifier} modifier
                </span>
              </div>
              <h2>{ability.name}</h2>
              <p>{ability.description}</p>
              <label htmlFor={ability.abbreviation}>Score</label>
              <input
                id={ability.abbreviation}
                type="number"
                min="3"
                max="20"
                value={scores[ability.abbreviation]}
                readOnly
              />
              <button
                className="allocate-button"
                type="button"
                onClick={() => allocateRoll(ability.abbreviation)}
                disabled={statRoll === null}
              >
                Allocate roll
              </button>
            </article>
          );
        })}
      </section>
    </main>
  );
}
