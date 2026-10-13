"use client";

import React from "react";
import { PhoneCall, MessageCircle, X, UserCheck, Building2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useRfqBasket } from "@/context/RfqBasketContext";
import { COMPANY_INFO, UI_TEXT } from "@/data/translations";
import { trackEvent } from "@/lib/trackClient";

export function CallPickerModal() {
  const { lang, t } = useLanguage();
  const { isCallModalOpen, setIsCallModalOpen } = useRfqBasket();

  if (!isCallModalOpen) return null;

  const whatsappUrl = `https://wa.me/${
    COMPANY_INFO.whatsappNumber
  }?text=${encodeURIComponent(
    lang === "bn"
      ? "আসসালামু আলাইকুম এম/এস এশায়াত এন্টারপ্রাইজ, আমি পাইকারি পণ্য ও কোটেশন সম্পর্কে কথা বলতে চাচ্ছি।"
      : "Hello M/S Eshayat Enterprise, I would like to discuss a wholesale inquiry."
  )}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-[#0d2461] text-white px-5 py-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base sm:text-lg">
              {t(UI_TEXT.callModal.title)}
            </h3>
            <p className="text-xs text-blue-200">
              {t(UI_TEXT.callModal.subtitle)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsCallModalOpen(false)}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Phone Options */}
        <div className="p-5 space-y-3">
          {/* Line 1: 01862-679456 */}
          <a
            href={`tel:${COMPANY_INFO.phonePrimaryRaw}`}
            onClick={() => {
              trackEvent({
                type: "call_click",
                phoneLine: "01862-679456",
              });
              setIsCallModalOpen(false);
            }}
            className="flex items-center justify-between p-4 rounded-xl border-2 border-slate-200 hover:border-[#0d2461] bg-slate-50 hover:bg-blue-50/40 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#0d2461] text-white flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500">
                  {t(UI_TEXT.callModal.line1Label)}
                </div>
                <div className="text-lg font-extrabold text-[#0d2461] group-hover:text-[#c0272d]">
                  {COMPANY_INFO.phonePrimary}
                </div>
              </div>
            </div>
            <span className="px-3 py-1.5 rounded-lg bg-[#0d2461] text-white text-xs font-bold inline-flex items-center gap-1">
              <PhoneCall className="w-3.5 h-3.5" />
              {lang === "bn" ? "কল" : "Call"}
            </span>
          </a>

          {/* Line 2: Efaz Alam (01309-816266) */}
          <a
            href={`tel:${COMPANY_INFO.phoneSalesRaw}`}
            onClick={() => {
              trackEvent({
                type: "call_click",
                phoneLine: "01309-816266",
              });
              setIsCallModalOpen(false);
            }}
            className="flex items-center justify-between p-4 rounded-xl border-2 border-slate-200 hover:border-[#c0272d] bg-slate-50 hover:bg-red-50/40 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#c0272d] text-white flex items-center justify-center shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500">
                  {t(UI_TEXT.callModal.line2Label)}
                </div>
                <div className="text-lg font-extrabold text-[#0d2461] group-hover:text-[#c0272d]">
                  {COMPANY_INFO.phoneSales}
                </div>
              </div>
            </div>
            <span className="px-3 py-1.5 rounded-lg bg-[#c0272d] text-white text-xs font-bold inline-flex items-center gap-1">
              <PhoneCall className="w-3.5 h-3.5" />
              {lang === "bn" ? "কল" : "Call"}
            </span>
          </a>

          {/* Direct WhatsApp Button (Always 01862-679456) */}
          <div className="pt-2 border-t border-slate-100">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                trackEvent({ type: "whatsapp_click" });
                setIsCallModalOpen(false);
              }}
              className="w-full py-3 px-4 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{t(UI_TEXT.callModal.whatsappInstead)}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
