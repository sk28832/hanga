"use client";

import { useCallback, useEffect, useState } from "react";
import type { SampleEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  samples: SampleEntry[];
  active?: string;
  onPick: (sample: SampleEntry) => void;
  className?: string;
};

export function SamplePicker({ samples, active, onPick, className }: Props) {
  const activeIndex = Math.max(
    0,
    samples.findIndex((s) => s.slug === active),
  );
  const [index, setIndex] = useState(activeIndex >= 0 ? activeIndex : 0);

  useEffect(() => {
    const i = samples.findIndex((s) => s.slug === active);
    if (i >= 0) setIndex(i);
  }, [active, samples]);

  const go = useCallback(
    (next: number) => {
      if (!samples.length) return;
      const wrapped = ((next % samples.length) + samples.length) % samples.length;
      setIndex(wrapped);
      onPick(samples[wrapped]);
    },
    [samples, onPick],
  );

  if (!samples.length) return null;

  const current = samples[index];

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <p className="text-brush-gray text-sm font-serif">hiroshige samples</p>
        <span className="text-xs text-stone tabular-nums">
          {index + 1} / {samples.length}
        </span>
      </div>

      <div className="relative h-[140px]">
        <div className="h-full rounded-sm overflow-hidden border border-stone/40 bg-parchment/40">
          <button
            type="button"
            onClick={() => current && onPick(current)}
            className={cn(
              "group w-full h-full text-left flex flex-col transition-all motion-fast",
              active === current.slug && "ring-1 ring-umber/30",
            )}
          >
            <div className="h-[96px] overflow-hidden bg-parchment/60 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={current.thumb}
                alt=""
                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity motion-fast"
              />
            </div>
            <div className="px-2 py-1.5 min-h-0 flex-1">
              <span className="block text-xs text-ink font-serif leading-snug line-clamp-1">
                {current.title}
              </span>
              <span className="block text-[10px] text-stone truncate">
                {current.series} · {current.year}
              </span>
            </div>
          </button>
        </div>

        {samples.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(index - 1)}
              className="absolute left-1 top-[40px] -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-sm bg-washi/90 border border-stone/30 text-stone hover:text-umber hover:border-umber/40 transition-colors motion-fast"
              aria-label="previous sample"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              className="absolute right-1 top-[40px] -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-sm bg-washi/90 border border-stone/30 text-stone hover:text-umber hover:border-umber/40 transition-colors motion-fast"
              aria-label="next sample"
            >
              →
            </button>
          </>
        )}
      </div>

      {samples.length > 1 && (
        <div className="flex justify-center gap-1.5">
          {samples.map((s, i) => (
            <button
              key={s.slug}
              type="button"
              onClick={() => go(i)}
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-all motion-fast",
                i === index ? "bg-umber scale-110" : "bg-stone/40 hover:bg-stone",
              )}
              aria-label={s.title}
            />
          ))}
        </div>
      )}
    </div>
  );
}
