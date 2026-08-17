import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Geist, Oswald } from "next/font/google";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const oswald = Oswald({ variable: "--font-oswald", subsets: ["latin"] });
const cormorant = Cormorant_Garamond({ variable: "--font-cormorant", subsets: ["latin"], weight: ["400", "500", "600", "700"] });

const siteUrl = "https://joinsteadyinfaith.com";
const title = "The 30-Day Faith Reset";
const description =
  "Build a consistent daily walk with Jesus Christ in 10 intentional minutes a day—with 90 days of private community access included.";

// No metadataBase on purpose: it would also rewrite the icon href to an absolute
// joinsteadyinfaith.com URL, which fails on preview and *.workers.dev origins.
// Social images need absolute URLs, so those carry the domain explicitly.
const socialImage = `${siteUrl}/steady-in-faith-profile-celestial.webp`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: siteUrl },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-48.png", type: "image/png", sizes: "48x48" },
      { url: "/favicon.ico", sizes: "16x16 32x32 48x48" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Steady in Faith",
    title,
    description,
    locale: "en_US",
    images: [{ url: socialImage, width: 1254, height: 1254, alt: title }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [socialImage],
  },
};

export const viewport: Viewport = {
  themeColor: "#08080a",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} ${oswald.variable} ${cormorant.variable}`}>{children}</body>
    </html>
  );
}
