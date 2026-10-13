"use client";

import React from "react";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  ShieldCheck,
  FileDown,
  Lock,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { COMPANY_INFO } from "@/data/translations";
import { DIVISIONS } from "@/data/divisions";
import { trackEvent } from "@/lib/trackClient";

export function Footer() {
  const { lang, t } = useLanguage();

  return (
    <footer className="bg-slate-950 text-white border-t border-slate-800 pb-20 md:pb-0 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Col 1: Brand & Mission */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-white p-1.5 flex items-center justify-center shrink-0">
              <img
                src="/images/brand/emblem.png"
                alt="M/S Eshayat Enterprise"
                className="w-9 h-9 object-contain"
              />
            </div>
            <div>
              <div className="font-extrabold text-base sm:text-lg text-white leading-tight">
                {t(COMPANY_INFO.name)}
              </div>
              <div className="text-xs text-amber-400 font-medium">
                {t(COMPANY_INFO.shortTagline)}
              </div>
            </div>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed mb-4">
            {lang === "bn"
              ? "ল্যাব গ্লাসওয়্যার, বৈজ্ঞানিক যন্ত্রপাতি, পিপিই (PPE), ইন্ডাস্ট্রিয়াল সেফটি, এমআরও এবং হাসপাতাল ও প্রাতিষ্ঠানিক টেন্ডার পণ্যের বিশ্বস্ত ইমপোর্টার ও পাইকারি সরবরাহকারী।"
              : "Trusted direct importer, wholesaler, and enlisted institutional supplier of Lab Glassware, Scientific Instruments, PPE, Industrial Safety, MRO, and General Supply Solutions across Bangladesh."}
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-amber-300 font-medium inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              {lang === "bn" ? "তালিকাভুক্ত সরবরাহকারী" : "Enlisted Vendor"}
            </span>
            <Link
              href="/catalog-print"
              className="text-xs px-2.5 py-1 rounded-lg bg-[#c0272d] hover:bg-[#a31f24] text-white font-semibold inline-flex items-center gap-1 transition-colors"
            >
              <FileDown className="w-3.5 h-3.5" />
              {lang === "bn" ? "পিডিএফ ব্রোশিওর" : "PDF Catalog"}
            </Link>
          </div>
        </div>

        {/* Col 2: The 6 Official Card Divisions */}
        <div>
          <h3 className="font-bold text-xs uppercase tracking-wider text-amber-400 mb-4 border-b border-slate-800 pb-2">
            {lang === "bn" ? "আমাদের ৬টি পণ্য বিভাগ" : "Our 6 Supply Divisions"}
          </h3>
          <ul className="space-y-2 text-xs text-slate-300">
            {DIVISIONS.map((div) => (
              <li key={div.id}>
                <Link
                  href={`/products?division=${div.id}`}
                  className="hover:text-amber-300 transition-colors flex items-center gap-1.5"
                >
                  <span className="text-amber-500 font-bold">›</span>
                  <span>{t(div.name)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3: Quick Navigation & Institutional */}
        <div>
          <h3 className="font-bold text-xs uppercase tracking-wider text-amber-400 mb-4 border-b border-slate-800 pb-2">
            {lang === "bn" ? "গুরুত্বপূর্ণ লিংক" : "Quick Links"}
          </h3>
          <ul className="space-y-2 text-xs text-slate-300">
            <li>
              <Link href="/" className="hover:text-amber-300 transition-colors">
                › {lang === "bn" ? "হোম পেজ" : "Home"}
              </Link>
            </li>
            <li>
              <Link
                href="/products"
                className="hover:text-amber-300 transition-colors"
              >
                › {lang === "bn" ? "সম্পূর্ণ ক্যাটালগ" : "Full Product Catalogue"}
              </Link>
            </li>
            <li>
              <Link
                href="/institutional-supply"
                className="hover:text-amber-300 transition-colors"
              >
                ›{" "}
                {lang === "bn"
                  ? "হাসপাতাল ও কর্পোরেট টেন্ডার এনলিস্টমেন্ট"
                  : "Hospital & Corporate Enlistment"}
              </Link>
            </li>
            <li>
              <Link
                href="/catalog-print"
                className="hover:text-amber-300 transition-colors"
              >
                ›{" "}
                {lang === "bn"
                  ? "কোম্পানি প্রোফাইল ও ক্যাটালগ ডাউনলোড"
                  : "Download Company Profile (PDF)"}
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="hover:text-amber-300 transition-colors"
              >
                ›{" "}
                {lang === "bn"
                  ? "পাইকারি কোটেশন ও যোগাযোগ"
                  : "Request Wholesale Quotation"}
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 4: Verified Contact & Business Manager Details */}
        <div>
          <h3 className="font-bold text-xs uppercase tracking-wider text-amber-400 mb-4 border-b border-slate-800 pb-2">
            {lang === "bn" ? "অফিস ও যোগাযোগ" : "Direct Contact & Office"}
          </h3>
          <div className="space-y-3 text-xs text-slate-300">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div className="font-bold text-white text-sm">
                {t(COMPANY_INFO.managerName)}
              </div>
              <div className="text-amber-400 font-medium text-xs mb-1">
                {t(COMPANY_INFO.managerRole)}
              </div>
              <a
                href={`tel:${COMPANY_INFO.phoneSalesRaw}`}
                onClick={() =>
                  trackEvent({
                    type: "call_click",
                    phoneLine: "01309-816266",
                  })
                }
                className="inline-flex items-center gap-1.5 text-emerald-400 hover:underline font-semibold"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{COMPANY_INFO.phoneSales}</span>
              </a>
            </div>

            <div className="flex items-start gap-2">
              <Phone className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-[11px] text-slate-400">
                  {lang === "bn"
                    ? "অফিস ও হোয়াটসঅ্যাপ (২৪/৭):"
                    : "Primary Office & WhatsApp:"}
                </div>
                <a
                  href={`tel:${COMPANY_INFO.phonePrimaryRaw}`}
                  onClick={() =>
                    trackEvent({
                      type: "call_click",
                      phoneLine: "01862-679456",
                    })
                  }
                  className="font-bold text-white hover:text-amber-300"
                >
                  {COMPANY_INFO.phonePrimary}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Mail className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-[11px] text-slate-400">
                  {lang === "bn" ? "অফিশিয়াল ইমেইল:" : "Official Tender Email:"}
                </div>
                <a
                  href={`mailto:${COMPANY_INFO.email}`}
                  className="font-medium text-white hover:text-amber-300 break-all"
                >
                  {COMPANY_INFO.email}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-[11px] text-slate-400">
                  {lang === "bn" ? "অফিসের ঠিকানা:" : "Office & Showroom:"}
                </div>
                <span>{t(COMPANY_INFO.address)}</span>
              </div>
            </div>

            <div className="pt-1">
              <a
                href={COMPANY_INFO.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors"
              >
                <Globe className="w-4 h-4 text-amber-400" />
                <span>facebook.com/mseshayatenterprise</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal Bar */}
      <div className="bg-slate-950 border-t border-slate-900 py-4 px-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div>
            © {new Date().getFullYear()} <strong>{t(COMPANY_INFO.name)}</strong>.{" "}
            {lang === "bn" ? "সর্বস্বত্ব সংরক্ষিত।" : "All rights reserved."}
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <span>
              {lang === "bn"
                ? "মানসম্মত পণ্য • নির্ভরযোগ্য সেবা • সম্পূর্ণ নিরাপত্তা সমাধান"
                : "Quality Products • Reliable Service • Total Safety Solutions"}
            </span>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-400 transition-colors"
              title="Staff Portal"
            >
              <Lock className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
