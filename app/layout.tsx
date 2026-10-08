import type { Metadata } from "next";
import { barlow, barlowCondensed } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "zuzu: product parallax showcase",
  description:
    "A free, open-source product parallax showcase built with Next.js, Motion and Tailwind. Fictional brand, real code.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${barlow.variable} ${barlowCondensed.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
