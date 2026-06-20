"use client";

import {
  PaperTexture,
  InkWash,
  PlumBlossom,
} from "@/components/site/chrome";
import { Workbench } from "@/components/studio/workbench";

export default function HangaPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-washi">
      <PaperTexture />
      <InkWash />

      <main className="relative z-10 px-8 sm:px-16 md:px-24 lg:px-32 py-16 sm:py-20 max-w-6xl mx-auto">
        <Workbench />
      </main>

      <PlumBlossom />
    </div>
  );
}
