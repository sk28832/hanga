import Link from "next/link";
import {
  PaperTexture,
  SiteNav,
  BrushDivider,
  InkWash,
  PlumBlossom,
} from "@/components/site/chrome";

const SECTIONS = [
  {
    title: "bero-ai — prussian blue",
    body: "after the 1820s, edo printers imported synthetic prussian blue — bero-ai — and hiroshige used it everywhere. his skies and rivers go from pale wash to deep cobalt in a single impression technique: bokashi. the engine names recovered blues after the pigment a hanmoto would actually reach for.",
  },
  {
    title: "bokashi — wiped gradation",
    body: "bokashi is not a separate block. it is a way of inking one: the printer dampens the block and wipes pigment so colour fades across the sheet. ichimonji-bokashi runs in straight bands; atenashi is free, edgeless. hiroshige's rain and sky depend on it. the engine detects smooth tonal ramps inside a colour region and tags them as gradations.",
  },
  {
    title: "composition — the cut corner",
    body: "hiroshige frames the world through foreground masses — a branch, a bridge railing, a traveller's hat — thrust into the corner while the middle distance opens. in one hundred famous views of edo the vertical ōban format becomes a device: sky as a flat field, earth as another, life between them.",
  },
  {
    title: "the tōkaidō and the hundred views",
    body: "the fifty-three stations of the tōkaidō (c. 1833) made his name: weather, road, human scale against landscape. one hundred famous views of edo (1856–58), including sudden shower over shin-ōhashi — the print van gogh copied — show the late style: bolder colour, more bokashi, rain cut as ruled lines in the keyblock itself.",
  },
];

export default function StudyPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-washi">
      <PaperTexture />
      <InkWash />

      <main className="relative z-10 px-8 sm:px-16 md:px-24 lg:px-32 py-16 sm:py-20 max-w-2xl">
        <SiteNav active="study" />

        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-ink mb-6 leading-[1.1] ink-reveal delay-1">
          a study of hiroshige
        </h1>
        <BrushDivider className="mb-10" />

        <p className="text-lg text-ink leading-relaxed mb-12 ink-reveal-subtle delay-2">
          utagawa hiroshige (1797–1858) was the last great master of landscape
          ukiyo-e. this project is both a tool and a way of reading him — how
          colour, line, and sequence become a print.
        </p>

        <div className="space-y-12">
          {SECTIONS.map((s, i) => (
            <section key={s.title} className={`ink-reveal-subtle delay-${Math.min(i + 3, 7)}`}>
              <h2 className="font-serif text-xl sm:text-2xl text-ink mb-3">
                {s.title}
              </h2>
              <p className="text-brush-gray leading-relaxed">{s.body}</p>
            </section>
          ))}
        </div>

        <p className="mt-14 text-stone text-sm leading-relaxed ink-reveal-subtle delay-7">
          run the bundled samples in the{" "}
          <Link href="/studio" className="link-brush text-ink">
            studio
          </Link>{" "}
          to see the engine deconstruct prints in his palette. public-domain scans
          from the met and library of congress.
        </p>
      </main>

      <PlumBlossom />
    </div>
  );
}
