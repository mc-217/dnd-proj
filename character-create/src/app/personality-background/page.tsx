import { BackgroundTable } from "@/components/background-table";
import { CreationStepPage } from "@/components/creation-step-page";

export default function PersonalityBackgroundPage() {
  return (
    <CreationStepPage
      step={4}
      title="Personality & Background"
      description="Choose a background to set your skill proficiencies and starting feature."
    >
      <BackgroundTable />
    </CreationStepPage>
  );
}
