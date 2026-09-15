// Holds the character being built and shares it with every page.
// This is a Client Component because it reads browser storage; it lives in the
// root layout, which stays mounted while you navigate, so the data survives
// moving between pages.
"use client";

import { createContext, useContext, useSyncExternalStore } from "react";

// One place that defines everything a character-in-progress can hold.
// null means "not chosen yet", with level the one field that starts filled in.
export type CharacterDraft = {
  race: string | null;
  subrace: string | null;
  characterClass: string | null;
  multiclass: string | null;
  level: number | null;
  hitDice: number | null;
  strength: number | null;
  dexterity: number | null;
  constitution: number | null;
  intelligence: number | null;
  wisdom: number | null;
  charisma: number | null;
  s_throws: string | null;
  wep_proficiency: string | null;
  armor_proficiency: string | null;
  s_proficiency: string | null;
  t_proficiency: string | null;
  background: string | null;
  languages: string | null;
  personality: string | null;
  ideal: string | null;
  bond: string | null;
  flaw: string | null;
  equipment: string | null;
};

const emptyDraft: CharacterDraft = {
  race: null,
  subrace: null,
  characterClass: null,
  multiclass: null,
  // Every character starts at 1; the other fields have no sensible default.
  level: 1,
  hitDice: null,
  strength: null,
  dexterity: null,
  constitution: null,
  intelligence: null,
  wisdom: null,
  charisma: null,
  s_throws: null,
  wep_proficiency: null,
  armor_proficiency: null,
  s_proficiency: null,
  t_proficiency: null,
  background: null,
  languages: null,
  personality: null,
  ideal: null,
  bond: null,
  flaw: null,
  equipment: null,
};

const STORAGE_KEY = "dnd-character-draft";

// localStorage is the single source of truth, so there is no second copy in
// React state to keep in sync. Components below subscribe to it directly.
const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  // The "storage" event fires when another tab edits the same key, so the
  // character stays consistent across tabs.
  window.addEventListener("storage", onChange);

  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

// React calls getSnapshot on every render and bails out only if the result is
// the SAME object as last time. Parsing fresh each call would return a new
// object every time and loop forever, so the parsed draft is cached and reused
// until the stored text actually changes.
let cachedRaw: string | null = null;
let cachedDraft: CharacterDraft = emptyDraft;

// Spreading over emptyDraft fills in any field added since the draft was saved.
// Stored nulls are dropped first: a draft written before level gained its
// default still holds "level": null, and that would overwrite the 1 and leave
// the sheet showing a dash. Dropping them changes nothing for the other fields,
// whose default is null anyway.
function restore(stored: Record<string, unknown>): CharacterDraft {
  const chosen = Object.fromEntries(
    Object.entries(stored).filter(([, value]) => value !== null),
  );

  return { ...emptyDraft, ...chosen } as CharacterDraft;
}

function getSnapshot(): CharacterDraft {
  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (raw !== cachedRaw) {
    cachedRaw = raw;

    try {
      cachedDraft = raw ? restore(JSON.parse(raw)) : emptyDraft;
    } catch {
      cachedDraft = emptyDraft;
    }
  }

  return cachedDraft;
}

// There is no localStorage on the server, so server-rendered HTML always shows
// an empty character. React then swaps in the stored one after hydration,
// which is why this cannot simply be read during render.
function getServerSnapshot(): CharacterDraft {
  return emptyDraft;
}

function writeDraft(next: CharacterDraft) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  // Writing from this tab does not fire "storage", so tell subscribers directly.
  listeners.forEach((listener) => listener());
}

type CharacterContextValue = {
  character: CharacterDraft;
  // Partial =>> only pass the fields you're changing, e.g. { race: "Elf" }.
  updateCharacter: (changes: Partial<CharacterDraft>) => void;
  resetCharacter: () => void;
};

// Context is React's way to hand a value to deeply nested components without
// threading it through every layer as props. It starts as null 
const CharacterContext = createContext<CharacterContextValue | null>(null);

export function CharacterProvider({ children }: { children: React.ReactNode }) {
  // The hook built for exactly this job: subscribing to a store that lives
  // outside React, with a separate value for server rendering.
  const character = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const value: CharacterContextValue = {
    character,
    updateCharacter: (changes) => writeDraft({ ...character, ...changes }),
    resetCharacter: () => writeDraft(emptyDraft),
  };

  return <CharacterContext.Provider value={value}>{children}</CharacterContext.Provider>;
}

// Every page uses this instead of touching the context object directly.
export function useCharacter() {
  const context = useContext(CharacterContext);

  if (!context) {
    throw new Error("useCharacter must be used inside a CharacterProvider");
  }

  return context;
}
