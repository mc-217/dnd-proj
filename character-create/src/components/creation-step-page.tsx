import Link from "next/link";

type CreationStepPageProps = {
  step: number;
  title: string;
  description: string;
  children?: React.ReactNode;
};

export function CreationStepPage({ step, title, description, children }: CreationStepPageProps) {
  return (
    <main className="placeholder-page">
      <p className="eyebrow">Step {step} of 5</p>
      <h1>{title}</h1>
      <p>{description}</p>
      {children}
      <Link className="home-link" href="/">Return to character creation</Link>
    </main>
  );
}
