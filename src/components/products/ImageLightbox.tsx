"use client";

import React from "react";
import { X } from "lucide-react";

export function ImageLightbox({
  src,
  title,
  onClose,
}: {
  src: string | null;
  title?: string;
  onClose: () => void;
}) {
  if (!src) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4 cursor-zoom-out"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-3xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-700"
      >
        <div className="bg-[#0d2461] text-white px-4 py-3 flex items-center justify-between">
          <span className="font-bold text-sm truncate">
            {title || "Product Preview"}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg bg-white/15 hover:bg-white/25 text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="bg-slate-900 flex items-center justify-center max-h-[80vh] overflow-auto">
          <img
            src={src}
            alt={title || "Product Image"}
            className="max-h-[78vh] w-auto object-contain"
          />
        </div>
      </div>
    </div>
  );
}
