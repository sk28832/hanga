"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { DeconstructPlan } from "@/lib/types";

type Props = {
  plan: DeconstructPlan;
  spread: number;
};

export function BlockStack({ plan, spread }: Props) {
  const layers = useMemo(() => {
    const all = [
      { id: "key", label: "sumiban", image: plan.keyblock.image, z: 0 },
      ...plan.blocks.map((b) => ({
        id: String(b.id),
        label: b.pigment.romaji,
        image: b.image,
        z: b.sequence,
      })),
    ];
    return all.sort((a, b) => a.z - b.z);
  }, [plan]);

  const maxZ = layers.length - 1;

  return (
    <div className="relative w-full aspect-[4/3] max-h-[520px]">
      <div className="absolute inset-0 flex items-center justify-center perspective-[900px]">
        {layers.map((layer, i) => {
          const offset = (maxZ - i) * spread * 28;
          const tilt = (maxZ - i) * spread * 4;
          return (
            <motion.div
              key={layer.id}
              className="absolute inset-4 sm:inset-8 rounded-sm shadow-md overflow-hidden bg-washi"
              style={{
                zIndex: i,
                transformStyle: "preserve-3d",
              }}
              animate={{
                x: offset,
                y: -offset * 0.35,
                rotateY: tilt,
                opacity: 1 - (maxZ - i) * spread * 0.08,
              }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={layer.image}
                alt={layer.label}
                className="w-full h-full object-contain"
              />
              <span className="absolute bottom-2 left-2 text-xs font-serif text-ink/70 bg-washi/80 px-2 py-0.5 rounded-sm">
                {layer.label}
              </span>
            </motion.div>
          );
        })}
      </div>
      <p className="absolute -bottom-8 left-0 text-xs text-stone">
        scrub to peel the blocks apart
      </p>
    </div>
  );
}
