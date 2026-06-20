"use client";

import { useCallback, useEffect, useState } from "react";
import {
  PaperTexture,
  SiteNav,
  BrushDivider,
  InkWash,
  PlumBlossom,
} from "@/components/site/chrome";
import { Dropzone } from "@/components/studio/dropzone";
import { SamplePicker } from "@/components/studio/sample-picker";
import { BlockStack } from "@/components/studio/block-stack";
import { PrintPress } from "@/components/studio/print-press";
import { PlanTimeline } from "@/components/studio/plan-timeline";
import {
  deconstructImage,
  fetchManifest,
  fetchSamplePlan,
} from "@/lib/api";
import type { DeconstructPlan, SampleEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

type Tab = "deconstruct" | "print" | "plan";

export default function StudioPage() {
  const [samples, setSamples] = useState<SampleEntry[]>([]);
  const [plan, setPlan] = useState<DeconstructPlan | null>(null);
  const [activeSample, setActiveSample] = useState<string>();
  const [tab, setTab] = useState<Tab>("deconstruct");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [spread, setSpread] = useState(0.55);
  const [printStep, setPrintStep] = useState(0);
  const [printing, setPrinting] = useState(false);
  const [nColors, setNColors] = useState(7);

  useEffect(() => {
    fetchManifest().then(setSamples);
  }, []);

  const loadPlan = useCallback((p: DeconstructPlan, slug?: string) => {
    setPlan(p);
    setActiveSample(slug);
    setPrintStep(0);
    setPrinting(false);
    setError(undefined);
    setTab("deconstruct");
  }, []);

  const onUpload = useCallback(
    async (file: File) => {
      setBusy(true);
      setError(undefined);
      setActiveSample(undefined);
      try {
        const p = await deconstructImage(file, nColors);
        loadPlan(p);
      } catch (e) {
        setError(e instanceof Error ? e.message : "something went wrong");
      } finally {
        setBusy(false);
      }
    },
    [loadPlan, nColors],
  );

  const onSample = useCallback(
    async (s: SampleEntry) => {
      setBusy(true);
      setError(undefined);
      try {
        const p = await fetchSamplePlan(s.plan);
        loadPlan(p, s.slug);
      } catch (e) {
        setError(e instanceof Error ? e.message : "sample unavailable");
      } finally {
        setBusy(false);
      }
    },
    [loadPlan],
  );

  const tabs: { id: Tab; label: string }[] = [
    { id: "deconstruct", label: "deconstruction" },
    { id: "print", label: "printing" },
    { id: "plan", label: "production plan" },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-washi">
      <PaperTexture />
      <InkWash />

      <main className="relative z-10 px-8 sm:px-16 md:px-24 lg:px-32 py-16 sm:py-20 max-w-5xl mx-auto">
        <SiteNav active="studio" />

        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-ink mb-6 leading-[1.1] ink-reveal delay-1">
          the studio
        </h1>
        <BrushDivider className="mb-10" />

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <div className="space-y-6 ink-reveal-subtle delay-2">
            <Dropzone onFile={onUpload} busy={busy} />
            <SamplePicker
              samples={samples}
              active={activeSample}
              onPick={onSample}
            />
            <label className="block text-sm text-brush-gray">
              <span className="font-serif text-ink">colour blocks</span>
              <input
                type="range"
                min={4}
                max={10}
                value={nColors}
                onChange={(e) => setNColors(Number(e.target.value))}
                className="w-full mt-2 accent-umber"
              />
              <span className="text-stone ml-1">{nColors}</span>
            </label>
            {error && (
              <p className="text-sm text-brush-gray border-l-2 border-umber pl-3">
                {error}
              </p>
            )}
          </div>

          <div className="ink-reveal-subtle delay-3 min-h-[24rem]">
            {!plan && (
              <div className="h-full flex items-center justify-center text-stone font-serif text-lg">
                upload or pick a sample to begin
              </div>
            )}
            {plan && (
              <div className="space-y-6">
                <div className="flex flex-wrap gap-2 border-b border-stone/30 pb-3">
                  {tabs.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTab(t.id)}
                      className={cn(
                        "font-serif text-sm px-3 py-1 rounded-sm transition-colors",
                        tab === t.id
                          ? "text-ink bg-parchment/80"
                          : "text-stone hover:text-umber",
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {tab === "deconstruct" && (
                  <div className="space-y-4 pb-10">
                    <BlockStack plan={plan} spread={spread} />
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={spread}
                      onChange={(e) => setSpread(Number(e.target.value))}
                      className="w-full accent-umber"
                      aria-label="block spread"
                    />
                  </div>
                )}

                {tab === "print" && (
                  <PrintPress
                    plan={plan}
                    step={printStep}
                    onStepChange={setPrintStep}
                    playing={printing}
                    onPlayingChange={setPrinting}
                  />
                )}

                {tab === "plan" && <PlanTimeline plan={plan} />}
              </div>
            )}
          </div>
        </div>
      </main>

      <PlumBlossom />
    </div>
  );
}
