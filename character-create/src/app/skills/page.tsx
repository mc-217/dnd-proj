import { CreationStepPage } from "@/components/creation-step-page";
import { SkillsTable } from "@/components/skills-table";

export default function SkillsPage() {
  return (
    <CreationStepPage
      step={5}
      title="Skills"
      description="Your background grants two skills outright; your class picks a few more from its own list."
    >
      <SkillsTable />
    </CreationStepPage>
  );
}
