import type { Metadata } from "next";
import { Cormorant_Garamond, Geist, Oswald } from "next/font/google";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const oswald = Oswald({ variable: "--font-oswald", subsets: ["latin"] });
const cormorant = Cormorant_Garamond({ variable: "--font-cormorant", subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "The 30-Day Faith Reset",
  description: "Build a consistent daily walk with Jesus Christ in 10 intentional minutes a day—with 90 days of private community access included.",
  other: { "codex-preview": "development" },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${geist.variable} ${oswald.variable} ${cormorant.variable}`}>{children}</body></html>;
}
