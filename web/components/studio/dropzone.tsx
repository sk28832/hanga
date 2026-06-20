"use client";

import { useCallback, useRef } from "react";
import { cn } from "@/lib/utils";

type Props = {
  onFile: (file: File) => void;
  busy?: boolean;
  className?: string;
};

export function Dropzone({ onFile, busy, className }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const pick = useCallback(
    (file: File | undefined) => {
      if (!file || busy) return;
      onFile(file);
    },
    [busy, onFile],
  );

  return (
    <div
      className={cn(
        "relative rounded-sm border border-dashed border-stone/60 bg-parchment/40 p-8 text-center transition-colors",
        !busy && "hover:border-umber/50 cursor-pointer",
        className,
      )}
      onClick={() => !busy && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
      }}
      onDrop={(e) => {
        e.preventDefault();
        pick(e.dataTransfer.files[0]);
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => pick(e.target.files?.[0])}
      />
      <p className="font-serif text-xl text-ink mb-2">
        {busy ? "carving blocks…" : "drop an image here"}
      </p>
      <p className="text-brush-gray text-sm leading-relaxed max-w-sm mx-auto">
        a photo, a generated scene, your own drawing — anything with colour and
        line. the engine will plan the blocks.
      </p>
    </div>
  );
}
