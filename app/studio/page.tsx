import type { Metadata } from "next";
import { barlowCondensed } from "../fonts";
import { CanStudio } from "./can-studio";

export const metadata: Metadata = {
  title: "Can studio · zuzu",
  description: "Render the zuzu cans as transparent PNGs. Drag to rotate.",
};

export default function StudioPage() {
  return (
    <main className="min-h-screen bg-neutral-200 text-neutral-900">
      <CanStudio fontFamily={barlowCondensed.style.fontFamily} />
    </main>
  );
}
