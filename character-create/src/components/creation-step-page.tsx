import Link from "next/link";

// Race, Class, Character Stats, Personality & Background, Skills, Final Sheet.
export const TOTAL_STEPS = 6;

type CreationStepPageProps = {
  step: number;
  title: string;
  description: string;
  children?: React.ReactNode;
};

export function CreationStepPage({ step, title, description, children }: CreationStepPageProps) {
  return (
    <main className="placeholder-page">
      <p className="eyebrow">Step {step} of {TOTAL_STEPS}</p>
      <h1>{title}</h1>
      <p>{description}</p>
      {children}
      <Link className="home-link" href="/">Return to character creation</Link>
    </main>
  );
}
