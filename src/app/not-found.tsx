"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Search, MessageCircle, Home } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { DIVISIONS } from "@/data/divisions";
import { COMPANY_INFO } from "@/data/translations";

export default function NotFound() {
  const { lang, t } = useLanguage();

  return (
    <div className="min-h-[75vh] bg-slate-50 flex items-center justify-center px-4 py-16">
      <div className="max-w-2xl w-full bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-950 text-amber-400 font-extrabold text-2xl font-mono">
          404
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {lang === "bn"
              ? "পৃষ্ঠাটি খুঁজে পাওয়া যায়নি"
              : "Page or Product Not Found"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            {lang === "bn"
              ? "আপনি যে পণ্য বা পৃষ্ঠাটি খুঁজছেন তা স্থানান্তরিত হতে পারে। আমাদের ৬টি প্রধান বিভাগ থেকে পণ্য খুঁজুন অথবা সরাসরি হোয়াটসঅ্যাপে জিজ্ঞাসা করুন।"
              : "The page or catalogue item you are looking for may have moved. Browse our 6 core supply divisions below or message us on WhatsApp for any unlisted item."}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold transition-colors"
          >
            <Home className="w-4 h-4 text-amber-400" />
            <span>{lang === "bn" ? "হোম পেজে যান" : "Back to Home"}</span>
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c0272d] hover:bg-[#a31f24] text-white text-xs sm:text-sm font-bold transition-colors"
          >
            <Search className="w-4 h-4" />
            <span>
              {lang === "bn" ? "সম্পূর্ণ ক্যাটালগ দেখুন" : "Browse Catalogue"}
            </span>
          </Link>
          <a
            href={`https://wa.me/${COMPANY_INFO.whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{lang === "bn" ? "হোয়াটসঅ্যাপ সহায়তা" : "Ask on WhatsApp"}</span>
          </a>
        </div>

        <div className="pt-6 border-t border-slate-100 text-left">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 text-center">
            {lang === "bn" ? "আমাদের ৬টি পণ্য বিভাগ" : "Quick Links to 6 Divisions"}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {DIVISIONS.map((div) => (
              <Link
                key={div.id}
                href={`/products?division=${div.id}`}
                className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/70 text-xs font-semibold text-slate-800 flex items-center justify-between"
              >
                <span className="truncate">{t(div.name)}</span>
                <ArrowLeft className="w-3.5 h-3.5 rotate-180 text-slate-400 shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
