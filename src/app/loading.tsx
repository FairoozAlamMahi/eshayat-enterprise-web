import React from "react";

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-8 animate-pulse">
      <div className="h-36 rounded-3xl bg-slate-200/80 w-full" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-slate-200/80 p-4 space-y-4"
          >
            <div className="aspect-square w-full rounded-xl bg-slate-100" />
            <div className="h-4 bg-slate-200 rounded w-3/4" />
            <div className="h-3 bg-slate-100 rounded w-full" />
            <div className="h-9 bg-slate-200 rounded-xl w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
