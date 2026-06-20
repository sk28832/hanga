"use client";

import type { SampleEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  samples: SampleEntry[];
  active?: string;
  onPick: (sample: SampleEntry) => void;
  className?: string;
};

export function SamplePicker({ samples, active, onPick, className }: Props) {
  if (!samples.length) return null;

  return (
    <div className={cn("space-y-3", className)}>
      <p className="text-brush-gray text-sm">or try a hiroshige sample</p>
      <div className="flex flex-wrap gap-3">
        {samples.map((s) => (
          <button
            key={s.slug}
            type="button"
            onClick={() => onPick(s)}
            className={cn(
              "group text-left rounded-sm overflow-hidden border transition-colors",
              active === s.slug
                ? "border-umber ring-1 ring-umber/30"
                : "border-stone/40 hover:border-umber/40",
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={s.thumb}
              alt=""
              className="w-24 h-16 object-cover opacity-90 group-hover:opacity-100"
            />
            <span className="block px-2 py-1 text-xs text-brush-gray font-serif truncate max-w-[6rem]">
              {s.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
