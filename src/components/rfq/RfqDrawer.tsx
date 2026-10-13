"use client";

import React, { useState } from "react";
import {
  X,
  Trash2,
  MessageCircle,
  Send,
  CheckCircle2,
  ClipboardList,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useRfqBasket } from "@/context/RfqBasketContext";
import { getBasketWhatsAppUrl } from "@/lib/whatsapp";
import { trackEvent } from "@/lib/trackClient";
import { COMPANY_INFO } from "@/data/translations";

export function RfqDrawer() {
  const { lang, t } = useLanguage();
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, clearBasket } =
    useRfqBasket();

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const whatsappBasketUrl = getBasketWhatsAppUrl(items, lang, {
    name,
    company,
    phone,
    location,
    notes: message,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/rfq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          company,
          phone,
          email,
          location,
          message,
          website_url_hp: honeypot,
          lang,
          inquiryType: "wholesale_quote",
          items: items.map((i) => ({
            productId: i.product.id,
            title: i.product.title.en,
            model: i.product.model,
            quantity: i.quantityNote,
          })),
        }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(
          data.error ||
            (lang === "bn"
              ? "সঠিক ফোন নম্বর ও তথ্য প্রদান করুন।"
              : "Please enter a valid phone number and required details.")
        );
      }
    } catch {
      setErrorMsg(
        lang === "bn"
          ? "নেটওয়ার্ক ত্রুটি। অনুগ্রহ করে হোয়াটসঅ্যাপে পাঠান।"
          : "Network error. Please use the WhatsApp button above."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-lg h-full flex flex-col shadow-2xl overflow-hidden">
        {/* Drawer Header */}
        <div className="bg-[#0d2461] text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <ClipboardList className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-base">
                {lang === "bn"
                  ? "পাইকারি কোটেশন লিস্ট (RFQ)"
                  : "Wholesale Quotation List (RFQ)"}
              </h3>
              <p className="text-xs text-blue-200">
                {lang === "bn"
                  ? "একাধিক পণ্যের দরদাম একসাথে জানুন"
                  : "Request wholesale pricing for multiple items at once"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setSubmitted(false);
            }}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {submitted ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h4 className="font-extrabold text-lg text-[#0d2461]">
                {lang === "bn"
                  ? "আপনার কোটেশন রিকোয়েস্ট গৃহীত হয়েছে!"
                  : "Quotation Request Logged Successfully!"}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {lang === "bn"
                  ? `আপনার চাহিদাপত্রটি আমাদের অফিশিয়াল ইনবক্সে (${COMPANY_INFO.email}) পাঠানো হয়েছে। আরও দ্রুত উত্তরের জন্য নিচে ক্লিক করে হোয়াটসঅ্যাপেও পাঠাতে পারেন:`
                  : `Your RFQ has been saved and routed to ${COMPANY_INFO.email}. For immediate priority response on WhatsApp (${COMPANY_INFO.phonePrimary}), tap below:`}
              </p>

              <a
                href={whatsappBasketUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  trackEvent({ type: "whatsapp_click" });
                }}
                className="w-full py-3 px-4 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                <span>
                  {lang === "bn"
                    ? "হোয়াটসঅ্যাপেও পাঠিয়ে দিন (১-ক্লিক)"
                    : "Also Send via WhatsApp Now (1-Click)"}
                </span>
              </a>

              <button
                type="button"
                onClick={() => {
                  clearBasket();
                  setSubmitted(false);
                  setIsOpen(false);
                }}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline cursor-pointer"
              >
                {lang === "bn" ? "বন্ধ করুন" : "Close Window"}
              </button>
            </div>
          ) : (
            <>
              {/* Selected Items List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {lang === "bn"
                      ? `নির্বাচিত পণ্য (${items.length})`
                      : `Selected Items (${items.length})`}
                  </span>
                  {items.length > 0 && (
                    <button
                      type="button"
                      onClick={clearBasket}
                      className="text-xs text-red-600 hover:underline font-medium cursor-pointer"
                    >
                      {lang === "bn" ? "সব মুছে ফেলুন" : "Clear All"}
                    </button>
                  )}
                </div>

                {items.length === 0 ? (
                  <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-6 text-center space-y-2">
                    <p className="text-xs text-slate-500">
                      {lang === "bn"
                        ? "আপনার কোটেশন লিস্টে এখনো কোনো পণ্য যোগ করা হয়নি। যেকোনো পণ্যের '+ কোটেশন লিস্ট' বাটনে ট্যাপ করুন অথবা নিচে সরাসরি আপনার চাহিদা লিখুন।"
                        : "No specific products added yet. Tap '+ Quote List' on any product card, or simply write your requirement below."}
                    </p>
                    <Link
                      href="/products"
                      onClick={() => setIsOpen(false)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#c0272d] hover:underline"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>
                        {lang === "bn"
                          ? "ক্যাটালগ থেকে পণ্য যোগ করুন"
                          : "Browse Catalogue to Add Items"}
                      </span>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {items.map((item) => (
                      <div
                        key={item.product.id}
                        className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                      >
                        <img
                          src={item.product.image}
                          alt={t(item.product.title)}
                          className="w-12 h-12 rounded-lg object-contain p-1 bg-white border border-slate-200 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-[#0d2461] truncate">
                            {t(item.product.title)}
                          </div>
                          <div className="text-[11px] text-slate-500 mb-1">
                            {item.product.model}
                          </div>
                          <input
                            type="text"
                            value={item.quantityNote}
                            onChange={(e) =>
                              updateQuantity(item.product.id, e.target.value)
                            }
                            placeholder={
                              lang === "bn"
                                ? "পরিমাণ (যেমন: ৫০ জোড়া / ৫ কার্টন)"
                                : "Quantity (e.g. 50 pcs / 5 cartons)"
                            }
                            className="w-full text-xs px-2.5 py-1 rounded border border-slate-300 bg-white text-slate-800"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.product.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 cursor-pointer"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Instant WhatsApp Option */}
              {items.length > 0 && (
                <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3.5">
                  <div className="text-xs font-bold text-emerald-950 mb-2">
                    {lang === "bn"
                      ? "ফরম পূরণ ছাড়াই সরাসরি হোয়াটসঅ্যাপে পাঠান:"
                      : "Want an instant reply? Send this list straight to WhatsApp:"}
                  </div>
                  <a
                    href={whatsappBasketUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent({ type: "whatsapp_click" })}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>
                      {lang === "bn"
                        ? `হোয়াটসঅ্যাপে লিস্ট পাঠান (${COMPANY_INFO.phonePrimary})`
                        : `Send Quote List on WhatsApp (${COMPANY_INFO.phonePrimary})`}
                    </span>
                  </a>
                </div>
              )}

              {/* Formal Corporate RFQ Form */}
              <form onSubmit={handleSubmit} className="space-y-3 pt-2 border-t border-slate-200">
                <div className="text-xs font-bold uppercase tracking-wider text-[#0d2461]">
                  {lang === "bn"
                    ? "অথবা অফিশিয়াল কোটেশন / টেন্ডার রিকোয়েস্ট পাঠান"
                    : "Or Submit Official Corporate RFQ (Email & Portal)"}
                </div>

                {/* Silent Honeypot */}
                <input
                  type="text"
                  name="website_url_hp"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {lang === "bn" ? "আপনার নাম *" : "Contact Person Name *"}
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={lang === "bn" ? "আপনার নাম" : "Your Name"}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:border-[#0d2461] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {lang === "bn" ? "মোবাইল / হোয়াটসঅ্যাপ নম্বর *" : "Phone / WhatsApp *"}
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:border-[#0d2461] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {lang === "bn"
                        ? "প্রতিষ্ঠান / হাসপাতাল / ফ্যাক্টরি"
                        : "Company / Hospital / Factory"}
                    </label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder={
                        lang === "bn"
                          ? "প্রতিষ্ঠানের নাম"
                          : "Organization Name"
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:border-[#0d2461] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {lang === "bn" ? "ডেলিভারি জেলা / এলাকা" : "Delivery Location"}
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder={
                        lang === "bn"
                          ? "যেমন: মিরপুর, গাজীপুর, চট্টগ্রাম"
                          : "e.g. Dhaka, Gazipur, Chattogram"
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:border-[#0d2461] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {lang === "bn" ? "অফিশিয়াল ইমেইল (ঐচ্ছিক)" : "Official Email (Optional)"}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="procurement@company.com"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:border-[#0d2461] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {lang === "bn"
                      ? "পণ্যের বিবরণ, পরিমাণ বা টেন্ডার নোট"
                      : "Additional Specs, Unlisted Brands or Tender Details"}
                  </label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={
                      lang === "bn"
                        ? "আপনার প্রয়োজনীয় পণ্যের নাম, ব্র্যান্ড বা পরিমাণ লিখুন..."
                        : "Specify quantities, sizes, or any unlisted brand/hospital item you need..."
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:border-[#0d2461] outline-none"
                  />
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 px-4 rounded-xl bg-[#c0272d] hover:bg-[#a31f24] disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {submitting
                      ? lang === "bn"
                        ? "পাঠানো হচ্ছে..."
                        : "Submitting..."
                      : lang === "bn"
                      ? "অফিশিয়াল কোটেশন রিকোয়েস্ট পাঠান"
                      : "Submit Official Quotation Request"}
                  </span>
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
