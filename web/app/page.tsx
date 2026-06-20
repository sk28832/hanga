import Link from "next/link";
import {
  PaperTexture,
  SiteNav,
  BrushDivider,
  InkWash,
  PlumBlossom,
} from "@/components/site/chrome";

export default function Home() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-washi">
      <PaperTexture />
      <InkWash />

      <main className="relative z-10 flex items-start justify-start min-h-screen px-8 sm:px-16 md:px-24 lg:px-32 py-20 sm:py-24">
        <div className="w-full max-w-2xl">
          <SiteNav active="home" />

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight text-ink mb-10 sm:mb-14 leading-[1.1] ink-reveal delay-1">
            hanga
          </h1>

          <BrushDivider className="mb-10 sm:mb-14" />

          <div className="space-y-5 sm:space-y-6 mb-10 ink-reveal-subtle delay-3">
            <p className="text-ink text-lg sm:text-xl md:text-2xl leading-relaxed">
              a woodblock deconstruction engine — a study of{" "}
              <span className="italic">hiroshige</span>. take any image and
              recover the ukiyo-e production plan: the keyblock, the colour
              blocks, the bokashi gradations, the printing sequence.
            </p>
            <p className="text-brush-gray text-base sm:text-lg leading-relaxed">
              watch the blocks peel apart. watch the print build up, impression
              by impression. the inverse problem no generator solves.
            </p>
          </div>

          <div className="flex flex-wrap gap-6 ink-reveal-subtle delay-4">
            <Link
              href="/studio"
              className="font-serif text-lg link-brush text-ink hover:text-umber"
            >
              open the studio
            </Link>
            <Link
              href="/study"
              className="font-serif text-lg text-stone hover:text-umber transition-colors"
            >
              read the study
            </Link>
          </div>
        </div>
      </main>

      <PlumBlossom />
    </div>
  );
}
