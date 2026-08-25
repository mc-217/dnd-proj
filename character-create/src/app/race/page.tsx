// The "@/" prefix is an alias for the src folder, configured in tsconfig.json.
// "@/components/..." means "src/components/...", so imports don't need "../../".
// Curly braces are used because these files use named exports, not default ones.
import { CreationStepPage } from "@/components/creation-step-page";
import { RaceTable } from "@/components/race-table";

// This file's location decides its URL: src/app/race/page.tsx becomes /race.
// Next.js only creates a route for a file literally named "page", and it reads
// the DEFAULT export, which is why "export default" is required here.
// The function name (RacePage) is only for readability and stack traces.
//
// There is no "use client" at the top, so this stays a Server Component: it runs
// on the server, and its HTML arrives already built. RaceTable is marked
// "use client" in its own file because it needs state for sorting.
export default function RacePage() {
  // Everything after "return" is JSX: HTML-like syntax that describes the UI.
  // The parentheses just let the markup span multiple lines.
  return (
    // Capitalized tags are React components, lowercase ones are real HTML
    // elements. CreationStepPage is the shared layout wrapper that draws the
    // parchment panel, the heading, and the "return home" link.
    <CreationStepPage
      // These three are props: inputs passed into the component, like function
      // arguments. Braces pass a JavaScript value (the number 1); quotes pass
      // a plain string.
      step={1}
      title="Race"
      description="Choose a race to set your starting ability bonuses, speed, and size."
    >
      {/* Because RaceTable sits BETWEEN the opening and closing tags rather
          than inside them, it arrives as the special "children" prop.
          CreationStepPage decides where to place it. This is why the tag above
          ends with ">" instead of self-closing with "/>". */}
      <RaceTable />
    </CreationStepPage>
  );
}
