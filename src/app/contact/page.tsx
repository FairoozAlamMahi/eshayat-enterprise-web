"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  PhoneCall,
  MessageCircle,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  UserCheck,
  Building2,
  ExternalLink,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { COMPANY_INFO } from "@/data/translations";
import { getCustomSourcingWhatsAppUrl } from "@/lib/whatsapp";
import { trackEvent } from "@/lib/trackClient";

export default function ContactPage() {
  const { lang, t } = useLanguage();

  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !phone.trim() || !notes.trim()) return;

    setSubmitting(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/rfq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: contactPerson || companyName,
          company: companyName,
          phone,
          email,
          location: "Dhaka, Bangladesh",
          inquiryType: "wholesale_quote",
          message: notes,
          items: [
            {
              productId: "direct-contact-inquiry",
              title: "General / Direct Contact Page Inquiry",
              model: "Custom Wholesale",
              quantity: "Inquiry",
            },
          ],
          lang,
          website_url_hp: honeypot,
        }),
      });
      if (res.ok) {
        trackEvent({
          type: "rfq_submit",
          lang,
        });
        setSubmittedSuccess(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(
          data.error ||
            (lang === "bn"
              ? "সঠিক মোবাইল নম্বর (১১ ডিজিট) ও তথ্য প্রদান করুন।"
              : "Please enter a valid Bangladesh phone number and required fields.")
        );
      }
    } catch {
      setErrorMsg(
        lang === "bn"
          ? "নেটওয়ার্ক ত্রুটি। অনুগ্রহ করে সরাসরি হোয়াটসঅ্যাপে যোগাযোগ করুন।"
          : "Network error. Please message us directly on WhatsApp."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Header */}
      <section className="bg-slate-950 text-white py-12 sm:py-16 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-semibold mb-3">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {lang === "en"
                ? "Mirpur, Dhaka-1216 • Wholesale & Tender Desk"
                : "মিরপুর, ঢাকা-১২১৬ • পাইকারি ও টেন্ডার ডেস্ক"}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
            {lang === "en"
              ? "Contact M/S Eshayat Enterprise"
              : "মেসার্স এশায়েত এন্টারপ্রাইজের সাথে যোগাযোগ"}
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl">
            {lang === "en"
              ? "Connect directly with Efaz Alam (Business Manager) or our primary wholesale desk for instant WhatsApp quotes, institutional tenders, and product samples."
              : "তাৎক্ষণিক হোয়াটসঅ্যাপ কোটেশন, প্রাতিষ্ঠানিক টেন্ডার এবং পণ্যের স্যাম্পলের জন্য সরাসরি ইফাজ আলম (বিজনেস ম্যানেজার) বা আমাদের প্রধান পাইকারি ডেস্কে যোগাযোগ করুন।"}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Direct Contact Cards & Business Card */}
        <div className="lg:col-span-5 space-y-5">
          {/* Primary Hotline & WhatsApp Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <span className="inline-block text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 mb-3">
              {lang === "en"
                ? "Line 1 • Primary Sales & WhatsApp"
                : "লাইন ১ • প্রধান সেলস ও হোয়াটসঅ্যাপ"}
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 mb-1">
              {COMPANY_INFO.phonePrimary}
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              {lang === "en"
                ? "All WhatsApp product inquiries & direct office calls route to this number."
                : "সকল হোয়াটসঅ্যাপ মেসেজ এবং অফিস কল এই নম্বরে গ্রহণ করা হয়।"}
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <a
                href={`tel:${COMPANY_INFO.phonePrimaryRaw}`}
                onClick={() =>
                  trackEvent({
                    type: "call_click",
                    phoneLine: "01862-679456",
                    lang,
                  })
                }
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === "en" ? "Call Line 1" : "কল করুন (লাইন ১)"}</span>
              </a>
              <a
                href={getCustomSourcingWhatsAppUrl("Wholesale Inquiry", lang)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  trackEvent({
                    type: "whatsapp_click",
                    lang,
                  })
                }
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>{lang === "en" ? "WhatsApp Chat" : "হোয়াটসঅ্যাপ চ্যাট"}</span>
              </a>
            </div>
          </div>

          {/* Efaz Alam Direct Line Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <UserCheck className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                {lang === "en"
                  ? "Line 2 • Direct Management Line"
                  : "লাইন ২ • সরাসরি ব্যবস্থাপনা লাইন"}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              {t(COMPANY_INFO.managerName)}{" "}
              <span className="text-xs font-normal text-slate-500">
                ({t(COMPANY_INFO.managerRole)})
              </span>
            </h2>
            <p className="text-xl font-extrabold text-slate-900 mt-1 mb-4">
              {COMPANY_INFO.phoneSales}
            </p>
            <a
              href={`tel:${COMPANY_INFO.phoneSalesRaw}`}
              onClick={() =>
                trackEvent({
                  type: "call_click",
                  phoneLine: "01309-816266",
                  lang,
                })
              }
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>
                {lang === "en"
                  ? "Call Efaz Alam (01309-816266)"
                  : "কল করুন ইফাজ আলম (০১৩০৯-৮১৬২৬৬)"}
              </span>
            </a>
          </div>

          {/* Office Address, Email & Hours */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {lang === "en" ? "Registered Office" : "অফিসের ঠিকানা"}
                </h3>
                <p className="text-sm font-semibold text-slate-900 mt-0.5">
                  {t(COMPANY_INFO.address)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {lang === "en"
                    ? "Official Tender & Inquiry Email"
                    : "অফিসিয়াল ইমেইল"}
                </h3>
                <a
                  href={`mailto:${COMPANY_INFO.email}`}
                  className="text-sm font-bold text-slate-900 hover:text-amber-600 break-all"
                >
                  {COMPANY_INFO.email}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {lang === "en" ? "Business Hours" : "অফিস সময়সূচী"}
                </h3>
                <p className="text-sm text-slate-700">
                  {lang === "en"
                    ? "Saturday – Thursday: 9:00 AM – 8:00 PM"
                    : "শনিবার – বৃহস্পতিবার: সকাল ৯:০০ – রাত ৮:০০"}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {lang === "en" ? "Official Facebook Page" : "অফিসিয়াল ফেসবুক পেজ"}
              </span>
              <a
                href={COMPANY_INFO.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 hover:text-amber-600"
              >
                <span>facebook.com/mseshayatenterprise</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Official Visiting Card Preview */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              {lang === "en"
                ? "Official Business Card"
                : "অফিসিয়াল বিজনেস কার্ড"}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative aspect-16/10 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                <Image
                  src="/images/brand/business-card-contact.jpg"
                  alt="M/S Eshayat Enterprise Visiting Card Front"
                  fill
                  className="object-cover"
                  sizes="250px"
                />
              </div>
              <div className="relative aspect-16/10 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                <Image
                  src="/images/brand/business-card-divisions.jpg"
                  alt="M/S Eshayat Enterprise 6 Divisions Card"
                  fill
                  className="object-cover"
                  sizes="250px"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Corporate RFQ Form & Map */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-2.5 mb-2">
              <Building2 className="w-5 h-5 text-amber-600" />
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                {lang === "en"
                  ? "Send a Wholesale Quotation or Sourcing Inquiry"
                  : "পাইকারি কোটেশন বা সোর্সিং বার্তা পাঠান"}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mb-6">
              {lang === "en"
                ? "Fill out your requirement below. It will be logged in our RFQ inbox and forwarded to eshayat.enterprise@outlook.com."
                : "নিচে আপনার চাহিদা পূরণ করুন। এটি আমাদের টেন্ডার ইনবক্সে এবং eshayat.enterprise@outlook.com ইমেইলে জমা হবে।"}
            </p>

            {submittedSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center space-y-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="text-lg font-bold text-slate-900">
                  {lang === "en"
                    ? "Message Sent Successfully!"
                    : "আপনার বার্তা সফলভাবে পাঠানো হয়েছে!"}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                  {lang === "en"
                    ? "Our team will get back to you shortly. For immediate confirmation, you can also tap below to open WhatsApp."
                    : "আমাদের টিম শীঘ্রই আপনার সাথে যোগাযোগ করবে। তাৎক্ষণিক কথা বলতে নিচের হোয়াটসঅ্যাপ বাটনে ট্যাপ করুন।"}
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <a
                    href={getCustomSourcingWhatsAppUrl(
                      `${companyName} - ${notes}`,
                      lang
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>
                      {lang === "en"
                        ? "Send via WhatsApp (01862-679456)"
                        : "হোয়াটসঅ্যাপে পাঠান (০১৮৬২-৬৭৯৪৫৬)"}
                    </span>
                  </a>
                  <button
                    onClick={() => {
                      setSubmittedSuccess(false);
                      setNotes("");
                    }}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    {lang === "en" ? "Send Another Message" : "নতুন বার্তা পাঠান"}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  name="website_url_hp"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {lang === "en"
                        ? "Company / Institution Name *"
                        : "প্রতিষ্ঠানের নাম *"}
                    </label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder={
                        lang === "en"
                          ? "Your Company / Hospital / Lab"
                          : "প্রতিষ্ঠানের নাম লিখুন"
                      }
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {lang === "en" ? "Your Name" : "আপনার নাম"}
                    </label>
                    <input
                      type="text"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      placeholder={lang === "en" ? "Full Name" : "আপনার নাম"}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {lang === "en"
                        ? "Phone / WhatsApp Number *"
                        : "ফোন / হোয়াটসঅ্যাপ নম্বর *"}
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {lang === "en" ? "Email Address" : "ইমেইল ঠিকানা"}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {lang === "en"
                      ? "Product List / Inquiry Details *"
                      : "প্রয়োজনীয় পণ্যের বিবরণ বা বার্তা *"}
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={
                      lang === "en"
                        ? "Specify items, quantities, or custom brands you need a wholesale quote for..."
                        : "আপনার প্রয়োজনীয় পণ্যের নাম, পরিমাণ বা ব্র্যান্ডের নাম লিখুন..."
                    }
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-slate-900"
                  />
                </div>

                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm font-semibold text-red-700">
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4 text-amber-400" />
                  <span>
                    {submitting
                      ? lang === "en"
                        ? "Sending..."
                        : "পাঠানো হচ্ছে..."
                      : lang === "en"
                      ? "Send Official Inquiry"
                      : "অফিসিয়াল বার্তা পাঠান"}
                  </span>
                </button>
              </form>
            )}
          </div>

          {/* Embedded Google Map for East Shewrapara, Mirpur, Dhaka-1216 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {lang === "en"
                  ? "Location Map — 1035/1, East Shewrapara, Mirpur, Dhaka-1216"
                  : "লোকেশন ম্যাপ — ১০৩৫/১, পূর্ব শেওড়াপাড়া, মিরপুর, ঢাকা-১২১৬"}
              </span>
              <a
                href="https://maps.google.com/?q=1035/1+East+Shewrapara+Mirpur+Dhaka+1216"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-amber-600 hover:text-amber-700 inline-flex items-center gap-1"
              >
                <span>{lang === "en" ? "Open in Google Maps" : "গুগল ম্যাপে দেখুন"}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="relative w-full h-64 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
              <iframe
                title="M/S Eshayat Enterprise Office Location"
                src="https://maps.google.com/maps?q=East%20Shewrapara,%20Mirpur,%20Dhaka%201216,%20Bangladesh&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
