"use client";

import React from "react";
import { MapPin, Phone, Mail, Globe } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { COMPANY_INFO } from "@/data/translations";
import { trackEvent } from "@/lib/trackClient";

export function TopBar() {
  const { lang, setLang, t } = useLanguage();

  return (
    <div className="bg-slate-950 text-slate-200 text-xs border-b border-slate-800/80 print:hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 flex items-center justify-between gap-2">
        {/* Left: Location & Email */}
        <div className="flex items-center gap-3 min-w-0">
          <span className="inline-flex items-center gap-1.5 text-slate-300 truncate">
            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate text-[11px] sm:text-xs font-medium">
              {t(COMPANY_INFO.shortAddress)}
            </span>
          </span>
          <span className="hidden lg:inline-block text-slate-700">•</span>
          <a
            href={`mailto:${COMPANY_INFO.email}`}
            className="hidden lg:inline-flex items-center gap-1.5 text-slate-300 hover:text-amber-300 transition-colors font-medium"
          >
            <Mail className="w-3.5 h-3.5 text-amber-400" />
            <span>{COMPANY_INFO.email}</span>
          </a>
        </div>

        {/* Right: Dual Phone Numbers + Bilingual Toggle */}
        <div className="flex items-center gap-3 sm:gap-5 shrink-0">
          <div className="hidden md:flex items-center gap-3 text-slate-200">
            <a
              href={`tel:${COMPANY_INFO.phonePrimaryRaw}`}
              onClick={() =>
                trackEvent({
                  type: "call_click",
                  phoneLine: "01862-679456",
                })
              }
              className="inline-flex items-center gap-1.5 hover:text-amber-300 transition-colors font-semibold"
              title="Primary & WhatsApp Line"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>{COMPANY_INFO.phonePrimary}</span>
            </a>
            <span className="text-slate-700">|</span>
            <a
              href={`tel:${COMPANY_INFO.phoneSalesRaw}`}
              onClick={() =>
                trackEvent({
                  type: "call_click",
                  phoneLine: "01309-816266",
                })
              }
              className="inline-flex items-center gap-1.5 hover:text-amber-300 transition-colors font-semibold"
              title="Efaz Alam - Business Manager"
            >
              <span>{COMPANY_INFO.phoneSales}</span>
              <span className="text-[11px] text-amber-400/90 font-medium hidden xl:inline">
                (Efaz Alam)
              </span>
            </a>
          </div>

          {/* Language Switcher Pill */}
          <div
            className="inline-flex items-center bg-slate-900 border border-slate-700/80 rounded-full p-0.5"
            role="group"
            aria-label="Language Switcher"
          >
            <Globe className="w-3 h-3 text-amber-400 ml-2 mr-1 hidden sm:inline" />
            <button
              type="button"
              onClick={() => setLang("en")}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                lang === "en"
                  ? "bg-amber-400 text-slate-950 shadow-xs"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLang("bn")}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                lang === "bn"
                  ? "bg-amber-400 text-slate-950 shadow-xs"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              বাংলা
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
