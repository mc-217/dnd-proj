import { CharacterSummary } from "@/components/character-summary";
import { CreationStepPage } from "@/components/creation-step-page";

export default function CharacterSheetPage() {
  return (
    <CreationStepPage
      step={5}
      title="Final Character Sheet"
      description="Everything chosen so far, collected in one place."
    >
      <CharacterSummary />
    </CreationStepPage>
  );
}
