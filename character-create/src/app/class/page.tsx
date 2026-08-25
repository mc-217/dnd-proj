import { ClassTable } from "@/components/class-table";
import { CreationStepPage } from "@/components/creation-step-page";

export default function ClassPage() {
  return (
    <CreationStepPage
      step={2}
      title="Class"
      description="Pick a class to set your hit die, primary ability, and saving throws."
    >
      <ClassTable />
    </CreationStepPage>
  );
}
