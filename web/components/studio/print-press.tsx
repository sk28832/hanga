"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { DeconstructPlan } from "@/lib/types";

function playKaChunk() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(90, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
    setTimeout(() => ctx.close(), 300);
  } catch {
    /* audio optional */
  }
}

type Props = {
  plan: DeconstructPlan;
  step: number;
  onStepChange: (n: number) => void;
  playing: boolean;
  onPlayingChange: (v: boolean) => void;
};

export function PrintPress({
  plan,
  step,
  onStepChange,
  playing,
  onPlayingChange,
}: Props) {
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const stepRef = useRef(step);
  stepRef.current = step;
  const maxStep = plan.blocks.length + 1;

  const visible = (() => {
    const layers: { image: string; label: string; key: string }[] = [];
    if (step >= 1) {
      layers.push({
        key: "key",
        image: plan.keyblock.image,
        label: "sumiban",
      });
    }
    for (const b of plan.blocks) {
      if (b.sequence <= step) {
        layers.push({
          key: String(b.id),
          image: b.image,
          label: b.pigment.romaji,
        });
      }
    }
    return layers;
  })();

  const stop = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    onPlayingChange(false);
  }, [onPlayingChange]);

  useEffect(() => {
    if (!playing) {
      if (timer.current) clearInterval(timer.current);
      return;
    }
    timer.current = setInterval(() => {
      const next = stepRef.current + 1;
      if (next > maxStep) {
        stop();
        onStepChange(maxStep);
        return;
      }
      playKaChunk();
      onStepChange(next);
    }, 900);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [playing, maxStep, onStepChange, stop]);

  return (
    <div className="space-y-4">
      <div className="relative w-full aspect-[4/3] max-h-[520px] rounded-sm overflow-hidden press-surface">
        {/* paper base */}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: plan.base.hex }}
        />
        <AnimatePresence mode="sync">
          {visible.map((layer, i) => (
            <motion.div
              key={layer.key}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.02, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 0.61, 0.36, 1] }}
              style={{ zIndex: i + 1 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={layer.image}
                alt={layer.label}
                className="w-full h-full object-contain mix-blend-multiply"
              />
            </motion.div>
          ))}
        </AnimatePresence>
        {/* kento marks */}
        <div className="absolute top-[6%] right-[6%] w-3 h-3 border-r-2 border-b-2 border-ink/25 pointer-events-none" />
        <div className="absolute bottom-[3.5%] left-[30%] w-6 h-0.5 bg-ink/20 pointer-events-none" />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <input
          type="range"
          min={0}
          max={maxStep}
          value={step}
          onChange={(e) => onStepChange(Number(e.target.value))}
          className="flex-1 min-w-[12rem] accent-umber"
          aria-label="print progress"
        />
        <span className="text-sm text-brush-gray font-serif tabular-nums">
          impression {step} / {maxStep}
        </span>
        <button
          type="button"
          onClick={() => {
            if (playing) {
              stop();
            } else {
              if (step >= maxStep) onStepChange(0);
              onPlayingChange(true);
              playKaChunk();
            }
          }}
          className="font-serif text-sm px-4 py-2 border border-stone/50 rounded-sm hover:border-umber hover:text-umber transition-colors"
        >
          {playing ? "pause" : "print"}
        </button>
      </div>
    </div>
  );
}
