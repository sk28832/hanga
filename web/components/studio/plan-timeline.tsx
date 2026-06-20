"use client";

import type { DeconstructPlan } from "@/lib/types";

type Props = {
  plan: DeconstructPlan;
};

const ROLE_LABEL: Record<string, string> = {
  keyblock: "keyblock — sumiban",
  field: "flat field",
  color: "colour block",
  detail: "detail block",
  bokashi: "bokashi gradation",
  "sumi-field": "sumi field",
};

export function PlanTimeline({ plan }: Props) {
  const rows = [
    {
      sequence: plan.keyblock.sequence,
      role: plan.keyblock.role,
      hex: "#1a1a1a",
      pigment: plan.keyblock.pigment,
      bokashi: null as null,
      note: "printed first. every other block registers to this outline.",
    },
    ...plan.blocks.map((b) => ({
      sequence: b.sequence,
      role: b.role,
      hex: b.hex,
      pigment: b.pigment,
      bokashi: b.bokashi,
      note: b.bokashi
        ? `${b.bokashi.type} bokashi, ${b.bokashi.orientation}. wiped from ${b.bokashi.from_hex} toward ${b.bokashi.to_hex}.`
        : undefined,
    })),
  ].sort((a, b) => a.sequence - b.sequence);

  return (
    <div className="space-y-0">
      {rows.map((row, i) => (
        <div
          key={row.sequence}
          className="relative pl-8 pb-8 border-l border-stone/30 ml-3 last:pb-0"
        >
          <span className="absolute -left-[7px] top-1 w-3.5 h-3.5 rounded-full bg-parchment border-2 border-umber/60" />
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1">
            <span className="font-serif text-lg text-ink">
              {row.sequence}. {row.pigment.romaji}
              <span className="text-stone ml-2 text-base">{row.pigment.kanji}</span>
            </span>
            <span
              className="inline-block w-4 h-4 rounded-sm border border-ink/10 align-middle"
              style={{ backgroundColor: row.hex }}
              aria-hidden
            />
            <span className="text-xs text-stone uppercase tracking-wide">
              {ROLE_LABEL[row.role] ?? row.role}
            </span>
          </div>
          <p className="text-sm text-brush-gray leading-relaxed mb-1">
            {row.pigment.english}. {row.pigment.note}
          </p>
          {row.note && (
            <p className="text-sm text-umber/90 italic leading-relaxed">{row.note}</p>
          )}
          {i === 0 && plan.kento?.explanation && (
            <p className="mt-3 text-xs text-stone leading-relaxed max-w-lg">
              kentō: {plan.kento.explanation} kagi at the corner, hikitsuke
              along the edge — the sheet drops into the same two marks on every pull.
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
