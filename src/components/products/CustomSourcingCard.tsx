"use client";

import React from "react";
import { MessageCircle, ClipboardList, Sparkles, PhoneCall } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useRfqBasket } from "@/context/RfqBasketContext";
import { UI_TEXT } from "@/data/translations";
import { getCustomSourcingWhatsAppUrl } from "@/lib/whatsapp";
import { trackEvent } from "@/lib/trackClient";

export function CustomSourcingCard({
  divisionName,
  sourcingNote,
}: {
  divisionName: string;
  sourcingNote?: string;
}) {
  const { lang, t } = useLanguage();
  const { setIsOpen, setIsCallModalOpen } = useRfqBasket();

  const whatsappUrl = getCustomSourcingWhatsAppUrl(divisionName, lang);

  return (
    <div className="bg-gradient-to-br from-[#0d2461] via-[#132f7c] to-[#091945] text-white rounded-2xl p-6 border-2 border-amber-400/40 shadow-lg flex flex-col justify-between">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-bold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t(UI_TEXT.sourcingCard.badge)}</span>
        </div>

        <h3 className="font-extrabold text-lg text-white leading-snug mb-2">
          {t(UI_TEXT.sourcingCard.title)}
        </h3>

        <p className="text-xs text-blue-100 leading-relaxed mb-4">
          {sourcingNote || t(UI_TEXT.sourcingCard.desc)}
        </p>

        <div className="bg-white/10 rounded-xl p-3 mb-5 border border-white/15 text-xs text-blue-100 space-y-1">
          <div className="font-bold text-amber-300">
            {lang === "bn"
              ? "✓ হাসপাতাল ও ফ্যাক্টরি এনলিস্টমেন্ট সাপ্লাই"
              : "✓ Enlisted Hospital & Factory Sourcing"}
          </div>
          <div>
            {lang === "bn"
              ? "✓ ২০+ অতিরিক্ত ব্র্যান্ডের সেফটি সুজ, ল্যাব গ্লাসওয়্যার ও মেডিকেল ফার্নিচার"
              : "✓ 20+ Additional Shoe Brands, Lab Models & Hospital Beds"}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent({ type: "whatsapp_click" })}
          className="w-full py-2.5 px-4 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span>{t(UI_TEXT.sourcingCard.ctaWhatsapp)}</span>
        </a>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="py-2 px-3 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <ClipboardList className="w-3.5 h-3.5 text-amber-300" />
            <span>{t(UI_TEXT.sourcingCard.ctaRfq)}</span>
          </button>
          <button
            type="button"
            onClick={() => setIsCallModalOpen(true)}
            className="py-2 px-3 rounded-xl bg-[#c0272d] hover:bg-[#a31f24] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>{lang === "bn" ? "সরাসরি কল" : "Call Manager"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
