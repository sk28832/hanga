"use client";

import { cn } from "@/lib/utils";

type Props = {
  label?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  valueLabel?: string;
  className?: string;
  "aria-label"?: string;
};

export function RangeControl({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  valueLabel,
  className,
  "aria-label": ariaLabel,
}: Props) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn("space-y-2", className)}>
      {(label || valueLabel) && (
        <div className="flex items-baseline justify-between gap-2">
          {label && (
            <span className="font-serif text-sm text-ink">{label}</span>
          )}
          {valueLabel && (
            <span className="text-xs text-stone tabular-nums">{valueLabel}</span>
          )}
        </div>
      )}
      <div className="relative h-6 flex items-center">
        <div className="absolute inset-x-0 h-1 rounded-full bg-stone/25" />
        <div
          className="absolute left-0 h-1 rounded-full bg-umber/50 motion-fast"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label={ariaLabel ?? label}
          className="range-washi absolute inset-x-0 w-full h-6 appearance-none bg-transparent cursor-pointer"
        />
      </div>
    </div>
  );
}
