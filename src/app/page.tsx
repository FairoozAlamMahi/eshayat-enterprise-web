"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ShieldCheck,
  Building2,
  PhoneCall,
  MessageCircle,
  ArrowRight,
  CheckCircle2,
  MapPin,
  FileDown,
  Sparkles,
  Award,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useRfqBasket } from "@/context/RfqBasketContext";
import { COMPANY_INFO, UI_TEXT } from "@/data/translations";
import { INITIAL_PRODUCTS, Product } from "@/data/initialProducts";
import { DivisionGrid } from "@/components/products/DivisionGrid";
import { ProductCard } from "@/components/products/ProductCard";
import { ImageLightbox } from "@/components/products/ImageLightbox";
import SearchAutocomplete from "@/components/products/SearchAutocomplete";
import { trackEvent } from "@/lib/trackClient";

export default function HomePage() {
  const { lang, t } = useLanguage();
  const { setIsOpen, setIsCallModalOpen } = useRfqBasket();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [lightbox, setLightbox] = useState<{
    src: string | null;
    title?: string;
  }>({ src: null });

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => {
        if (d.products && d.products.length > 0) {
          setProducts(d.products);
        }
      })
      .catch(() => {});
  }, []);

  const featuredProducts = products.filter((p) => p.featured).slice(0, 8);

  return (
    <div>
      {/* 1. HERO SECTION */}
      <section className="relative bg-slate-950 text-white border-b border-slate-800">
        {/* Ambient modern gradient glow */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40 overflow-hidden"
          style={{
            background:
              "radial-gradient(circle at 15% 20%, rgba(30, 58, 138, 0.8), transparent 50%), radial-gradient(circle at 85% 80%, rgba(192, 39, 45, 0.35), transparent 45%)",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left 7 Cols: Value Proposition & Instant Search */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold tracking-wide">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{t(UI_TEXT.hero.enlistedBadge)}</span>
            </div>

            <h1 className="font-extrabold text-2xl sm:text-4xl lg:text-5xl leading-tight tracking-tight text-white">
              {t(UI_TEXT.hero.title)}
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
              {t(UI_TEXT.hero.subtitle)}
            </p>

            {/* Instant Catalogue Search Bar with Google-style Autocomplete */}
            <SearchAutocomplete
              value={searchTerm}
              onChange={setSearchTerm}
              products={products}
              variant="hero"
            />

            {/* Action Buttons */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2.5 sm:gap-3 pt-1">
              <Link
                href="/products"
                className="col-span-2 sm:col-span-1 px-5 py-3.5 rounded-xl bg-[#c0272d] hover:bg-[#a31f24] text-white font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <span>{t(UI_TEXT.hero.exploreBtn)}</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </Link>

              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="px-4 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span className="truncate">{t(UI_TEXT.hero.tenderBtn)}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsCallModalOpen(true)}
                className="px-4 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs sm:text-sm inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <PhoneCall className="w-4 h-4 shrink-0" />
                <span>{COMPANY_INFO.phonePrimary}</span>
              </button>
            </div>
          </div>

          {/* Right 5 Cols: Uncropped Visual Product & Credential Bento */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3.5">
            <Link
              href="/products?division=ppe-products"
              className="bg-slate-900/90 hover:bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-2.5 transition-colors group"
            >
              <div className="w-full aspect-square bg-white rounded-xl p-2 flex items-center justify-center overflow-hidden">
                <img
                  src="/images/products/safety-shoes-runner.jpg"
                  alt="Industrial Safety Shoes Wholesale Bangladesh"
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                />
              </div>
              <div>
                <div className="text-xs font-bold text-white">
                  {lang === "bn"
                    ? "স্টিল-টো ও অটোক্লেভ সেফটি সুজ"
                    : "Steel-Toe & Autoclave Shoes"}
                </div>
                <div className="text-[11px] text-amber-400 font-medium">
                  {lang === "bn"
                    ? "২০+ ব্র্যান্ড পাইকারি সরবরাহ"
                    : "20+ Brands Available on Order"}
                </div>
              </div>
            </Link>

            <Link
              href="/products?division=lab-glassware"
              className="bg-slate-900/90 hover:bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-2.5 transition-colors group"
            >
              <div className="w-full aspect-square bg-white rounded-xl p-2 flex items-center justify-center overflow-hidden">
                <img
                  src="/images/products/reagent-bottle.jpg"
                  alt="Laboratory Borosilicate Glassware Bangladesh"
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                />
              </div>
              <div>
                <div className="text-xs font-bold text-white">
                  {lang === "bn"
                    ? "ল্যাব গ্লাসওয়্যার ও পিপেট"
                    : "Lab Glassware & Pipettes"}
                </div>
                <div className="text-[11px] text-amber-400 font-medium">
                  Schott Duran • BKMAM • DLAB
                </div>
              </div>
            </Link>

            <div className="col-span-2 bg-gradient-to-r from-[#c0272d] to-[#991b1b] rounded-2xl p-4 border border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-amber-200">
                  {lang === "bn"
                    ? "হাসপাতাল ও ফ্যাক্টরি এনলিস্টমেন্ট"
                    : "Hospital & Corporate Tenders"}
                </div>
                <div className="font-extrabold text-xs sm:text-sm text-white mt-0.5 leading-snug">
                  {lang === "bn"
                    ? "যেকোনো ব্র্যান্ড বা মডেল আমরা সর্বনিম্ন পাইকারি দরে সোর্সিং করি"
                    : "We Source Any Unlisted Brand or Tender Item at Wholesale Rates"}
                </div>
              </div>
              <Link
                href="/institutional-supply"
                className="px-3.5 py-2 rounded-xl bg-white text-slate-950 font-extrabold text-xs shrink-0 hover:bg-amber-100 transition-colors self-start sm:self-center"
              >
                {lang === "bn" ? "বিস্তারিত →" : "Learn More →"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUST STATS & B2B PILLARS BAR */}
      <section className="bg-white border-b border-slate-200/80 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-extrabold text-sm shrink-0">
              06
            </div>
            <div className="min-w-0">
              <div className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
                {lang === "bn" ? "৬টি বিশেষায়িত বিভাগ" : "6 Supply Divisions"}
              </div>
              <div className="text-[11px] text-slate-500 truncate">
                {lang === "bn" ? "ল্যাব থেকে ইন্ডাস্ট্রি" : "From Lab to Industry"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
            <div className="w-10 h-10 rounded-xl bg-[#c0272d] text-white flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
                {lang === "bn" ? "তালিকাভুক্ত ভেন্ডর" : "Enlisted Supplier"}
              </div>
              <div className="text-[11px] text-slate-500 truncate">
                {lang === "bn"
                  ? "হাসপাতাল, ফার্মা ও ফ্যাক্টরি"
                  : "Hospitals, Pharma & Factories"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
                {lang === "bn" ? "আন্তর্জাতিক মানসম্পন্ন" : "Certified Quality"}
              </div>
              <div className="text-[11px] text-slate-500 truncate">
                CE • EN • ISO • FDA • Class A
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
                {lang === "bn" ? "কাস্টম সোর্সিং সুবিধা" : "Custom Indenting"}
              </div>
              <div className="text-[11px] text-slate-500 truncate">
                {lang === "bn"
                  ? "যেকোনো ব্র্যান্ড অর্ডারে সরবরাহ"
                  : "Unlisted Brands on Request"}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. THE 6 OFFICIAL DIVISIONS (FROM VISITING CARD) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#c0272d]">
              {lang === "bn"
                ? "এম/এস এশায়াত এন্টারপ্রাইজ — পোর্টফোলিও"
                : "M/S ESHAYAT ENTERPRISE — CORE PORTFOLIO"}
            </span>
            <h2 className="font-extrabold text-2xl sm:text-3xl text-slate-900 mt-1">
              {lang === "bn"
                ? "আমাদের ৬টি প্রধান পণ্য ও সেবা বিভাগ"
                : "Our 6 Official Product & Supply Divisions"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
              {lang === "bn"
                ? "যেকোনো বিভাগে ক্লিক করে তার সাব-ক্যাটাগরি ও পণ্যসমূহ দেখুন এবং সরাসরি হোয়াটসঅ্যাপে পাইকারি দর জানুন।"
                : "Select any of our 6 divisions below to filter subcategories, view technical specifications, and request wholesale pricing."}
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#0d2461] hover:text-[#c0272d]"
          >
            <span>
              {lang === "bn"
                ? "সকল পণ্য একসাথে দেখুন"
                : "View Complete Catalogue"}
            </span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <DivisionGrid />
      </section>

      {/* 4. FEATURED PRODUCTS CATALOGUE */}
      <section className="bg-slate-100/70 border-y border-slate-200/80 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#c0272d]">
                {lang === "bn" ? "জনপ্রিয় পাইকারি পণ্য" : "WHOLESALE SHOWCASE"}
              </span>
              <h2 className="font-extrabold text-2xl sm:text-3xl text-slate-900 mt-1">
                {lang === "bn"
                  ? "নির্বাচিত পণ্যসমূহ ও স্পেসিফিকেশন"
                  : "Featured Products & Technical Supplies"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                {lang === "bn"
                  ? "পাইকারি ও প্রাতিষ্ঠানিক অর্ডারের পরিমাণের ওপর দর নির্ভরশীল। যেকোনো পণ্যের দর জানতে 'হোয়াটসঅ্যাপে দর' বাটনে ট্যাপ করুন।"
                  : "Wholesale pricing is tailored to order volume. Click 'WhatsApp Quote' or add multiple items to your Quote List."}
              </p>
            </div>
            <Link
              href="/products"
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm inline-flex items-center gap-2 self-start md:self-auto"
            >
              <span>
                {lang === "bn"
                  ? `সকল পণ্য দেখুন (${products.length}+)`
                  : `See All Products (${products.length}+)`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onImageClick={(src, title) => setLightbox({ src, title })}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 5. HOSPITAL ENLISTMENT & UNLISTED BRAND SOURCING SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="bg-slate-950 rounded-3xl p-6 sm:p-10 lg:p-12 text-white shadow-xl border border-slate-800 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <span className="inline-block px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-bold">
              {lang === "bn"
                ? "হাসপাতাল, ক্লিনিক ও ফ্যাক্টরি টেন্ডার সাপ্লাই"
                : "HOSPITAL ENLISTMENT & CUSTOM BRAND SOURCING"}
            </span>

            <h2 className="font-extrabold text-2xl sm:text-3xl text-white leading-tight">
              {lang === "bn"
                ? "ওয়েবসাইটে নেই এমন কোনো ব্র্যান্ডের জুতা, ল্যাব যন্ত্রপাতি বা হাসপাতালের বেড খুঁজছেন?"
                : "Need Hospital Beds, Additional Shoe Brands, or Unlisted Lab Equipment?"}
            </h2>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              {lang === "bn"
                ? "এম/এস এশায়াত এন্টারপ্রাইজ শুধুমাত্র নির্দিষ্ট কয়েকটি পণ্যে সীমাবদ্ধ নয়। আমরা বিভিন্ন সরকারি-বেসরকারি হাসপাতাল, ডায়াগনস্টিক ল্যাব এবং শিল্পকারখানায় তালিকাভুক্ত (Enlisted) ভেন্ডর হিসেবে কাজ করি। হাসপাতালের বেড থেকে শুরু করে দেশি-বিদেশি যেকোনো ব্র্যান্ডের সেফটি সুজ ও যন্ত্রপাতি আমরা প্রতিযোগিতামূলক সর্বনিম্ন দরে সরবরাহ করি।"
                : "M/S Eshayat Enterprise works directly with hospitals, pharmaceutical plants, and factories as an enlisted vendor. While our website highlights sample models (such as 3 flagship shoe lines), our importer network supplies 20+ additional brands, hospital patient beds, clinical furniture, and custom tender items at the most competitive wholesale rates."}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              {[
                {
                  en: "Enlisted Vendor for Hospital & Clinic RFQs",
                  bn: "হাসপাতাল ও ক্লিনিকের তালিকাভুক্ত সরবরাহকারী",
                },
                {
                  en: "20+ Additional PPE & Safety Shoe Brands",
                  bn: "২০+ ব্র্যান্ডের সেফটি সুজ ও পিপিই সোর্সিং",
                },
                {
                  en: "Competitive Lowest Tender Quotation (PI)",
                  bn: "টেন্ডার ও কোটেশনে সর্বনিম্ন পাইকারি দরের নিশ্চয়তা",
                },
                {
                  en: "Direct Supervision by Business Manager",
                  bn: "বিজনেস ম্যানেজারের সরাসরি তত্ত্বাবধানে সরবরাহ",
                },
              ].map((pt, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-xs text-slate-200"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{t(pt)}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 pt-3">
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="px-5 py-3 rounded-xl bg-[#c0272d] hover:bg-[#a31f24] text-white font-bold text-xs sm:text-sm shadow-md transition-colors cursor-pointer"
              >
                {lang === "bn"
                  ? "টেন্ডার / কোটেশন রিকোয়েস্ট পাঠান"
                  : "Send Tender / RFQ Requirement"}
              </button>
              <Link
                href="/catalog-print"
                className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-xs sm:text-sm inline-flex items-center gap-2 transition-colors"
              >
                <FileDown className="w-4 h-4 text-amber-400" />
                <span>
                  {lang === "bn"
                    ? "কোম্পানি প্রোফাইল (PDF)"
                    : "Download Company Profile (PDF)"}
                </span>
              </Link>
            </div>
          </div>

          {/* Right 5 Cols: Official Business Manager Card */}
          <div className="lg:col-span-5 bg-white text-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <img
                src="/images/brand/emblem.png"
                alt="M/S Eshayat Enterprise Emblem"
                className="w-12 h-12 object-contain"
              />
              <div>
                <div className="text-xs font-bold uppercase text-[#c0272d]">
                  {lang === "bn"
                    ? "সরাসরি প্রাতিষ্ঠানিক যোগাযোগ"
                    : "Direct Institutional Desk"}
                </div>
                <div className="font-extrabold text-lg text-slate-900">
                  {t(COMPANY_INFO.managerName)}
                </div>
                <div className="text-xs font-semibold text-slate-500">
                  {t(COMPANY_INFO.managerRole)} — {t(COMPANY_INFO.name)}
                </div>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                <div>
                  <div className="text-slate-500 font-medium">
                    {lang === "bn"
                      ? "বিজনেস ম্যানেজার (সরাসরি কল):"
                      : "Business Manager (Direct Call):"}
                  </div>
                  <div className="font-extrabold text-sm text-slate-900">
                    {COMPANY_INFO.phoneSales}
                  </div>
                </div>
                <a
                  href={`tel:${COMPANY_INFO.phoneSalesRaw}`}
                  onClick={() =>
                    trackEvent({
                      type: "call_click",
                      phoneLine: "01309-816266",
                    })
                  }
                  className="px-3.5 py-2 rounded-xl bg-slate-900 text-white font-bold shrink-0"
                >
                  {lang === "bn" ? "কল করুন" : "Call"}
                </a>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-2">
                <div>
                  <div className="text-emerald-800 font-medium">
                    {lang === "bn"
                      ? "অফিস ও হোয়াটসঅ্যাপ লাইন:"
                      : "Primary Office & WhatsApp:"}
                  </div>
                  <div className="font-extrabold text-sm text-emerald-950">
                    {COMPANY_INFO.phonePrimary}
                  </div>
                </div>
                <a
                  href={`https://wa.me/${COMPANY_INFO.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent({ type: "whatsapp_click" })}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-bold inline-flex items-center gap-1 shrink-0"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-slate-500 font-medium">
                  {lang === "bn"
                    ? "টেন্ডার ও কোটেশন ইমেইল:"
                    : "Tender & Quotation Email:"}
                </div>
                <a
                  href={`mailto:${COMPANY_INFO.email}`}
                  className="font-bold text-[#c0272d] hover:underline break-all"
                >
                  {COMPANY_INFO.email}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. MIRPUR DHAKA OFFICE & MAP SECTION */}
      <section className="bg-white border-t border-slate-200/80 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#c0272d]">
              {lang === "bn" ? "আমাদের অফিস ও শোরুম" : "OUR DHAKA OFFICE"}
            </span>
            <h2 className="font-extrabold text-2xl text-slate-900">
              {lang === "bn"
                ? "সরাসরি স্যাম্পল পরিদর্শন ও আলোচনার জন্য আমাদের মিরপুর অফিসে আসুন"
                : "Visit Our East Shewrapara, Mirpur Office for Sample Inspection"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {lang === "bn"
                ? "বড় পাইকারি অর্ডারের আগে পণ্যের গুণমান ও স্যাম্পল সরাসরি দেখে নিতে আমাদের অফিসে আপনাকে স্বাগতম।"
                : "Prospective institutional buyers and procurement officers are welcome to inspect physical product samples at our Mirpur office."}
            </p>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#c0272d] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block">
                    {t(COMPANY_INFO.name)}
                  </strong>
                  <span className="text-slate-600">
                    {t(COMPANY_INFO.address)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://www.google.com/maps/search/?api=1&query=East+Shewrapara+Mirpur+Dhaka+1216"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs inline-flex items-center gap-1.5"
              >
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>
                  {lang === "bn"
                    ? "গুগল ম্যাপে ডিরেকশন দেখুন"
                    : "Open in Google Maps"}
                </span>
              </a>
              <Link
                href="/contact"
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100"
              >
                {lang === "bn" ? "যোগাযোগ পেজ" : "Contact Page"}
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7 rounded-2xl overflow-hidden border border-slate-200 shadow-sm h-72 sm:h-80 bg-slate-100">
            <iframe
              title="M/S Eshayat Enterprise Mirpur Dhaka Map"
              loading="lazy"
              src="https://www.google.com/maps?q=East+Shewrapara,+Mirpur,+Dhaka+1216,+Bangladesh&output=embed"
              className="w-full h-full border-0"
            />
          </div>
        </div>
      </section>

      <ImageLightbox
        src={lightbox.src}
        title={lightbox.title}
        onClose={() => setLightbox({ src: null })}
      />
    </div>
  );
}
