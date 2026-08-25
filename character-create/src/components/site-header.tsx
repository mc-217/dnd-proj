import Link from "next/link";

const navigation = [
  { href: "/race", label: "Race" },
  { href: "/class", label: "Class" },
  { href: "/character-stats", label: "Character Stats" },
  { href: "/personality-background", label: "Personality & Background" },
  { href: "/character-sheet", label: "Final Character Sheet" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="site-logo" href="/">D&D Character Creator</Link>
      <nav aria-label="Character creation">
        {navigation.map((item) => (
          <Link href={item.href} key={item.href}>{item.label}</Link>
        ))}
      </nav>
    </header>
  );
}
