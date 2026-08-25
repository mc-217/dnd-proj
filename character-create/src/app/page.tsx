import Link from "next/link";

const creationSteps = [
  { href: "/race", title: "Race", description: "Choose your character's race and traits." },
  { href: "/class", title: "Class", description: "Select a class and define your adventuring role." },
  { href: "/character-stats", title: "Character Stats", description: "Roll and allocate your six ability scores." },
  {
    href: "/personality-background",
    title: "Personality & Background",
    description: "Describe who your character is and where they came from.",
  },
  {
    href: "/character-sheet",
    title: "Final Character Sheet",
    description: "Review the completed character sheet.",
  },
];

export default function Home() {
  return (
    <main className="home-page">
      <header className="home-hero">
        <p className="eyebrow">Dungeons & Dragons</p>
        <h1>Build your next character</h1>
        <p>Work through each section, then review your finished character sheet.</p>
      </header>

      <section className="step-grid" aria-label="Character creation pages">
        {creationSteps.map((step, index) => (
          <Link
            className="step-card"
            data-step={index + 1}
            href={step.href}
            key={step.href}
          >
            <span>Step {index + 1}</span>
            <h2>{step.title}</h2>
            <p>{step.description}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
