"use client";

import React from "react";
import { PhoneCall, MessageCircle, ClipboardList } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useRfqBasket } from "@/context/RfqBasketContext";
import { COMPANY_INFO } from "@/data/translations";
import { trackEvent } from "@/lib/trackClient";

export function MobileThumbBar() {
  const { lang } = useLanguage();
  const { items, setIsOpen, setIsCallModalOpen } = useRfqBasket();

  const whatsappUrl = `https://wa.me/${
    COMPANY_INFO.whatsappNumber
  }?text=${encodeURIComponent(
    lang === "bn"
      ? "আসসালামু আলাইকুম এম/এস এশায়াত এন্টারপ্রাইজ, আমি আপনাদের ওয়েবসাইট থেকে পাইকারি পণ্য ও দরদাম সম্পর্কে জানতে চাচ্ছি।"
      : "Hello M/S Eshayat Enterprise, I am visiting your website and would like to inquire about wholesale supply."
  )}`;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] px-3 py-2 print:hidden">
      <div className="grid grid-cols-3 gap-2 max-w-md mx-auto">
        {/* 1. Dual-Line Call Button */}
        <button
          type="button"
          onClick={() => setIsCallModalOpen(true)}
          className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-slate-900 active:scale-95 text-white font-bold text-xs shadow-2xs transition-transform cursor-pointer"
        >
          <PhoneCall className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="truncate">
            {lang === "bn" ? "কল করুন" : "Call Now"}
          </span>
        </button>

        {/* 2. Direct WhatsApp Button (01862-679456) */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent({ type: "whatsapp_click" })}
          className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-emerald-600 active:scale-95 text-white font-bold text-xs shadow-2xs transition-transform"
        >
          <MessageCircle className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">
            {lang === "bn" ? "হোয়াটসঅ্যাপ" : "WhatsApp"}
          </span>
        </a>

        {/* 3. Multi-Item Quote Basket */}
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="relative flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-[#c0272d] active:scale-95 text-white font-bold text-xs shadow-2xs transition-transform cursor-pointer"
        >
          <ClipboardList className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">
            {lang === "bn" ? "কোটেশন" : "Quote List"}
          </span>
          {items.length > 0 && (
            <span className="bg-amber-400 text-slate-950 font-extrabold text-[10px] px-1.5 py-0.5 rounded-full leading-none">
              {items.length}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
