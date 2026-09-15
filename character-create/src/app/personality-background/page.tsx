import { BackgroundTable } from "@/components/background-table";
import { CreationStepPage } from "@/components/creation-step-page";
import { PersonalityTable } from "@/components/personality-table";

// TODO languages: they belong on this page rather than a step of their own,
// because the background is what grants them and the table below already lists
// how many each one gives. How they get picked is still undecided (a fixed list
// of the standard languages, or free text), so nothing writes draft.languages
// yet and the final sheet shows a dash for it.

export default function PersonalityBackgroundPage() {
  return (
    <CreationStepPage
      step={4}
      title="Personality & Background"
      description="Choose a background to set your skill proficiencies and starting feature."
    >
      <BackgroundTable />
      <PersonalityTable />
    </CreationStepPage>
  );
}
