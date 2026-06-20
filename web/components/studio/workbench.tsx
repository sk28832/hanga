"use client";

import { useCallback, useEffect, useState } from "react";
import { SiteHeader } from "@/components/site/chrome";
import { Dropzone } from "@/components/studio/dropzone";
import { SamplePicker } from "@/components/studio/sample-picker";
import { BlockStack } from "@/components/studio/block-stack";
import { PrintPress } from "@/components/studio/print-press";
import { PlanTimeline } from "@/components/studio/plan-timeline";
import { RangeControl } from "@/components/studio/range-control";
import {
  deconstructImage,
  fetchManifest,
  fetchSamplePlan,
} from "@/lib/api";
import { checkEngineHealth } from "@/lib/engine-health";
import type { DeconstructPlan, SampleEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

type Tab = "deconstruct" | "print" | "plan";

let autoLoadDone = false;

const TABS: { id: Tab; label: string }[] = [
  { id: "deconstruct", label: "deconstruction" },
  { id: "print", label: "printing" },
  { id: "plan", label: "production plan" },
];

export function Workbench() {
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
  const [engineOk, setEngineOk] = useState<boolean | null>(null);

  const loadPlan = useCallback((p: DeconstructPlan, slug?: string) => {
    setPlan(p);
    setActiveSample(slug);
    setPrintStep(0);
    setPrinting(false);
    setError(undefined);
    setTab("deconstruct");
  }, []);

  useEffect(() => {
    checkEngineHealth().then((h) => setEngineOk(h.ok));
  }, []);

  useEffect(() => {
    if (autoLoadDone) return;
    fetchManifest().then(async (entries) => {
      setSamples(entries);
      if (!entries.length || autoLoadDone) return;
      autoLoadDone = true;
      try {
        const p = await fetchSamplePlan(entries[0].plan);
        loadPlan(p, entries[0].slug);
      } catch {
        /* bundled samples optional */
      }
    });
  }, [loadPlan]);

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

  const workflowStep = !plan ? 0 : tab === "plan" ? 2 : 1;

  const isLocal =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1");

  return (
    <>
      <SiteHeader />

      {engineOk === false && isLocal && (
        <p className="mb-6 text-sm text-brush-gray border-l-2 border-umber pl-3 leading-relaxed motion-stage">
          engine offline — bundled samples still work. for uploads, run{" "}
          <code className="text-ink">./dev.sh</code> from the hanga folder.
        </p>
      )}

      {engineOk === false && !isLocal && (
        <p className="mb-6 text-sm text-brush-gray border-l-2 border-umber pl-3 leading-relaxed motion-stage">
          uploads unavailable — try a bundled sample below.
        </p>
      )}

      <div className="mb-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-serif motion-stage">
        {[
          { n: 1, label: "source", active: workflowStep >= 0 },
          { n: 2, label: "view", active: workflowStep >= 1 },
          { n: 3, label: "sequence", active: workflowStep >= 2 },
        ].map((step, i) => (
          <span key={step.label} className="flex items-center gap-2">
            {i > 0 && <span className="text-stone/50">·</span>}
            <span
              className={cn(
                "transition-colors motion-fast",
                step.active ? "text-ink" : "text-stone",
              )}
            >
              {step.n} {step.label}
            </span>
          </span>
        ))}
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:items-stretch">
        <div className="flex flex-col gap-6 motion-stage lg:max-h-[min(70vh,600px)]">
          <Dropzone onFile={onUpload} busy={busy} />
          <SamplePicker
            samples={samples}
            active={activeSample}
            onPick={onSample}
          />
          <RangeControl
            label="colour blocks"
            value={nColors}
            min={4}
            max={10}
            valueLabel={String(nColors)}
            onChange={setNColors}
            aria-label="colour blocks"
          />
          {error && (
            <p className="text-sm text-brush-gray border-l-2 border-umber pl-3">
              {error}
            </p>
          )}
        </div>

        <div className="workbench-stage flex flex-col h-[min(70vh,600px)] min-h-[20rem] bg-parchment/30 border border-stone/25 rounded-sm overflow-hidden motion-stage">
          {!plan ? (
            <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-4">
              <p className="font-serif text-lg text-stone max-w-xs leading-relaxed">
                pick a hiroshige sample, or drop your own image
              </p>
              <span className="hidden lg:block text-stone text-2xl" aria-hidden>
                ←
              </span>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-1 p-3 border-b border-stone/25 shrink-0">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTab(t.id)}
                    className={cn(
                      "font-serif text-sm px-3 py-1.5 rounded-sm transition-colors motion-fast",
                      tab === t.id
                        ? "text-ink bg-washi/90"
                        : "text-stone hover:text-umber",
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="flex-1 min-h-0 overflow-hidden p-4">
                {tab === "deconstruct" && (
                  <div className="h-full flex flex-col">
                    <div className="flex-1 min-h-0 flex items-center justify-center">
                      <BlockStack plan={plan} spread={spread} />
                    </div>
                    <div className="shrink-0 pt-4 space-y-1">
                      <RangeControl
                        value={spread}
                        min={0}
                        max={1}
                        step={0.01}
                        onChange={setSpread}
                        aria-label="block spread"
                      />
                      <p className="text-xs text-stone">scrub to peel blocks apart</p>
                    </div>
                  </div>
                )}

                {tab === "print" && (
                  <div className="h-full flex flex-col min-h-0">
                    <PrintPress
                      plan={plan}
                      step={printStep}
                      onStepChange={setPrintStep}
                      playing={printing}
                      onPlayingChange={setPrinting}
                      compact
                    />
                  </div>
                )}

                {tab === "plan" && (
                  <div className="h-full overflow-y-auto overflow-x-hidden scroll-washi pr-1">
                    <PlanTimeline plan={plan} />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
