import type { Metadata } from "next";
import { Alegreya_Sans_SC, Cinzel, EB_Garamond } from "next/font/google";
import { CharacterProvider } from "@/components/character-provider";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

// Headings. Inscriptional roman caps, standing in for the printed sheet's
// Modesto display face.
const cinzel = Cinzel({
  variable: "--font-display",
  subsets: ["latin"],
});

// The small letterspaced caps used for every printed field label.
const alegreyaSansSC = Alegreya_Sans_SC({
  variable: "--font-label",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const ebGaramond = EB_Garamond({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "D&D Character Creator",
  description: "Build and roll ability scores for a D&D character.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${cinzel.variable} ${alegreyaSansSC.variable} ${ebGaramond.variable}`}
    >
      <body>
        {/* The provider wraps every page, and this layout does not remount when
            you navigate, so the character survives moving between routes. */}
        <CharacterProvider>
          <SiteHeader />
          {children}
        </CharacterProvider>
      </body>
    </html>
  );
}
