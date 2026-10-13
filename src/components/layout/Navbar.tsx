"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PhoneCall,
  ClipboardList,
  Menu,
  X,
  FileDown,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useRfqBasket } from "@/context/RfqBasketContext";
import { UI_TEXT } from "@/data/translations";
import { DIVISIONS } from "@/data/divisions";

export function Navbar() {
  const pathname = usePathname();
  const { t, lang } = useLanguage();
  const { items, setIsOpen, setIsCallModalOpen } = useRfqBasket();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [divisionsOpen, setDivisionsOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs print:hidden">
      {/* Subtle 2px brand accent top line */}
      <div className="h-0.5 w-full bg-gradient-to-r from-[#0d2461] via-[#c0272d] to-amber-500" />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 sm:h-[72px] flex items-center justify-between gap-2 sm:gap-3">
        {/* Brand Identity (Full text on Desktop, Zero Overflow on 390px Mobile) */}
        <Link
          href="/"
          className="flex items-center gap-2.5 sm:gap-3 group min-w-0 flex-1 lg:flex-none lg:shrink-0"
        >
          <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl border border-slate-200 bg-white flex items-center justify-center overflow-hidden shadow-2xs shrink-0 group-hover:border-[#0d2461] transition-colors">
            <img
              src="/images/brand/emblem.png"
              alt="M/S Eshayat Enterprise Emblem"
              className="w-8 h-8 sm:w-9 sm:h-9 object-contain"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-baseline gap-1 sm:gap-1.5 whitespace-nowrap">
              <span className="font-extrabold text-sm sm:text-base xl:text-lg tracking-tight text-slate-900">
                {lang === "bn" ? "এম/এস এশায়াত" : "M/S ESHAYAT"}
              </span>
              <span className="font-extrabold text-xs sm:text-sm xl:text-base text-[#c0272d] shrink-0">
                {lang === "bn" ? "এন্টারপ্রাইজ" : "ENTERPRISE"}
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate sm:whitespace-nowrap">
              {lang === "bn"
                ? "ল্যাব, পিপিই ও ইন্ডাস্ট্রিয়াল পাইকারি সরবরাহকারী"
                : "Lab, PPE, Safety & Institutional Wholesale"}
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links (whitespace-nowrap prevents 2-line wrapping) */}
        <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 shrink-0">
          <Link
            href="/"
            className={`px-2.5 xl:px-3 py-2 rounded-lg text-xs xl:text-sm font-semibold whitespace-nowrap transition-colors ${
              isActive("/")
                ? "bg-slate-900 text-white"
                : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            {t(UI_TEXT.nav.home)}
          </Link>

          {/* 6 Divisions Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setDivisionsOpen(true)}
            onMouseLeave={() => setDivisionsOpen(false)}
          >
            <Link
              href="/products"
              className={`px-3 py-2 rounded-lg text-xs xl:text-sm font-semibold whitespace-nowrap inline-flex items-center gap-1 transition-colors ${
                isActive("/products")
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span>{t(UI_TEXT.nav.catalogue)}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-75 shrink-0" />
            </Link>

            {divisionsOpen && (
              <div className="absolute left-0 top-full pt-2 w-80 z-50">
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200/90 p-2 grid gap-1">
                  <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    {lang === "bn"
                      ? "আমাদের ৬টি প্রধান বিভাগ"
                      : "6 Official Supply Divisions"}
                  </div>
                  {DIVISIONS.map((div) => (
                    <Link
                      key={div.id}
                      href={`/products?division=${div.id}`}
                      onClick={() => setDivisionsOpen(false)}
                      className="px-3 py-2 rounded-xl hover:bg-slate-50 flex items-center justify-between gap-2 transition-colors group"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 group-hover:text-[#c0272d] truncate">
                          {t(div.name)}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {div.subcategories.map((s) => t(s.name)).join(" • ")}
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#c0272d] shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Link
            href="/institutional-supply"
            className={`px-3 py-2 rounded-lg text-xs xl:text-sm font-semibold whitespace-nowrap transition-colors ${
              isActive("/institutional-supply")
                ? "bg-slate-900 text-white"
                : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            {t(UI_TEXT.nav.institutional)}
          </Link>

          <Link
            href="/catalog-print"
            className={`px-3 py-2 rounded-lg text-xs xl:text-sm font-semibold whitespace-nowrap inline-flex items-center gap-1.5 transition-colors ${
              isActive("/catalog-print")
                ? "bg-slate-900 text-white"
                : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <FileDown className="w-3.5 h-3.5 text-[#c0272d] shrink-0" />
            <span>{t(UI_TEXT.nav.downloadPdf)}</span>
          </Link>

          <Link
            href="/contact"
            className={`px-3 py-2 rounded-lg text-xs xl:text-sm font-semibold whitespace-nowrap transition-colors ${
              isActive("/contact")
                ? "bg-slate-900 text-white"
                : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            {t(UI_TEXT.nav.contact)}
          </Link>
        </nav>

        {/* Action Buttons: Quote List & Call Picker */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="relative inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100 whitespace-nowrap transition-colors cursor-pointer"
            title="Multi-Item Quotation Basket"
          >
            <ClipboardList className="w-4 h-4 text-[#c0272d] shrink-0" />
            <span className="hidden sm:inline">{t(UI_TEXT.nav.quoteList)}</span>
            {items.length > 0 && (
              <span className="bg-[#c0272d] text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full leading-none">
                {items.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsCallModalOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#c0272d] hover:bg-[#a31f24] text-white whitespace-nowrap shadow-xs transition-all cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5 shrink-0" />
            <span>{t(UI_TEXT.nav.callNow)}</span>
          </button>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-3 shadow-xl max-h-[80vh] overflow-y-auto">
          <div className="grid gap-1">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl font-semibold text-sm text-slate-800 hover:bg-slate-100"
            >
              {t(UI_TEXT.nav.home)}
            </Link>
            <Link
              href="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl font-semibold text-sm text-slate-800 hover:bg-slate-100"
            >
              {t(UI_TEXT.nav.catalogue)}
            </Link>
            <Link
              href="/institutional-supply"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl font-semibold text-sm text-slate-800 hover:bg-slate-100"
            >
              {t(UI_TEXT.nav.institutional)}
            </Link>
            <Link
              href="/catalog-print"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl font-semibold text-sm text-slate-800 hover:bg-slate-100 flex items-center gap-2"
            >
              <FileDown className="w-4 h-4 text-[#c0272d]" />
              <span>{t(UI_TEXT.nav.downloadPdf)}</span>
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl font-semibold text-sm text-slate-800 hover:bg-slate-100"
            >
              {t(UI_TEXT.nav.contact)}
            </Link>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
              {lang === "bn" ? "৬টি পণ্য বিভাগ" : "6 Product Divisions"}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {DIVISIONS.map((div) => (
                <Link
                  key={div.id}
                  href={`/products?division=${div.id}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-800 flex items-center justify-between"
                >
                  <span className="truncate">{t(div.shortName)}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
