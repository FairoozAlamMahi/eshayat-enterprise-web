"use client";

import React from "react";
import Link from "next/link";
import {
  FlaskConical,
  TestTubes,
  HardHat,
  ShieldAlert,
  Settings,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";
import { DIVISIONS, DivisionId } from "@/data/divisions";
import { useLanguage } from "@/context/LanguageContext";

const ICON_MAP: Record<DivisionId, React.ComponentType<{ className?: string }>> = {
  "lab-glassware": FlaskConical,
  "lab-consumables": TestTubes,
  "ppe-products": HardHat,
  "industrial-safety": ShieldAlert,
  "mro-items": Settings,
  "general-supply": ShoppingBag,
};

export function DivisionGrid() {
  const { lang, t } = useLanguage();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {DIVISIONS.map((div, index) => {
        const IconComponent = ICON_MAP[div.id] || FlaskConical;
        return (
          <Link
            key={div.id}
            href={`/products?division=${div.id}`}
            className="group relative bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 p-6 shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
          >
            {/* Subtle top accent bar */}
            <div
              className="absolute top-0 inset-x-0 h-1"
              style={{ backgroundColor: div.accentColor }}
            />

            <div>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm shrink-0 group-hover:scale-105 transition-transform"
                  style={{ backgroundColor: div.accentColor }}
                >
                  <IconComponent className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 font-mono">
                  0{index + 1}
                </span>
              </div>

              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 group-hover:text-[#0d2461] transition-colors mb-2 leading-snug">
                {t(div.name)}
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                {t(div.description)}
              </p>

              {/* Subcategory Pills */}
              <div className="flex flex-wrap gap-1.5 mb-5">
                {div.subcategories.map((sub) => (
                  <span
                    key={sub.id}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/70 text-slate-700 font-medium"
                  >
                    {t(sub.name)}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#0d2461] group-hover:text-[#c0272d]">
              <span>
                {lang === "bn"
                  ? "এই বিভাগের পণ্যগুলো দেখুন"
                  : "Explore Division Catalogue"}
              </span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
