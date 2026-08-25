import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { CharacterProvider } from "@/components/character-provider";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";
import "./sheet-theme.css"; //added .css for formatting here

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "D&D Character Creator",
  description: "Build and roll ability scores for a D&D character.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
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
