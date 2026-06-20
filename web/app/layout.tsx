import type { Metadata } from "next";
import { Shippori_Mincho } from "next/font/google";
import "./globals.css";

const shipporiMincho = Shippori_Mincho({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-shippori",
});

export const metadata: Metadata = {
  title: "hanga",
  description:
    "a study of hiroshige. deconstruct any image into ukiyo-e blocks, bokashi, and a hanmoto printing plan.",
  openGraph: {
    title: "hanga",
    description:
      "woodblock deconstruction — keyblock, colour blocks, bokashi, layer by layer.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={shipporiMincho.variable}>
      <body>{children}</body>
    </html>
  );
}
