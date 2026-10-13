"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  MessageCircle,
  Plus,
  Check,
  ShieldCheck,
  PhoneCall,
  Printer,
  CheckCircle2,
  ZoomIn,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useRfqBasket } from "@/context/RfqBasketContext";
import { INITIAL_PRODUCTS, Product } from "@/data/initialProducts";
import { getDivisionById } from "@/data/divisions";
import { COMPANY_INFO, UI_TEXT } from "@/data/translations";
import { getProductWhatsAppUrl } from "@/lib/whatsapp";
import { ImageLightbox } from "@/components/products/ImageLightbox";
import { trackEvent } from "@/lib/trackClient";

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { lang, t } = useLanguage();
  const { addItem, isInBasket, setIsCallModalOpen } = useRfqBasket();

  const [product, setProduct] = useState<Product | undefined>(() =>
    INITIAL_PRODUCTS.find((p) => p.slug === slug || p.id === slug)
  );
  const [activeImage, setActiveImage] = useState<string>("");
  const [quantityNote, setQuantityNote] = useState<string>("");
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => {
        if (d.products) {
          const found = d.products.find(
            (p: Product) => p.slug === slug || p.id === slug
          );
          if (found) {
            setProduct(found);
            setActiveImage(found.image);
            trackEvent({
              type: "product_view",
              productId: found.id,
              productTitle: found.title.en,
              divisionId: found.divisionId,
            });
          }
        }
      })
      .catch(() => {});
  }, [slug]);

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="font-extrabold text-2xl text-[#0d2461]">
          {lang === "bn" ? "পণ্যটি খুঁজে পাওয়া যায়নি" : "Product Not Found"}
        </h1>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0d2461] text-white font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{lang === "bn" ? "ক্যাটালগে ফিরে যান" : "Back to Catalogue"}</span>
        </Link>
      </div>
    );
  }

  const division = getDivisionById(product.divisionId);
  const inBasket = isInBasket(product.id);
  const whatsappUrl = getProductWhatsAppUrl(product, lang, quantityNote);
  const gallery =
    product.gallery && product.gallery.length > 0
      ? product.gallery
      : [product.image];
  const displayImg = activeImage || product.image;
  const featuresList =
    lang === "bn" && product.features.bn.length > 0
      ? product.features.bn
      : product.features.en;

  const quickQuantities =
    lang === "bn"
      ? ["১০ পিস / জোড়া", "৫০ পিস / জোড়া", "৫ কার্টন", "টেন্ডার BOQ অনুযায়ী"]
      : ["10 Pcs / Pairs", "50 Pcs / Pairs", "5 Cartons", "As per Tender BOQ"];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
      {/* Breadcrumb (Responsive wrapping on 390px mobile) */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200 print:hidden">
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 font-medium min-w-0">
          <Link href="/" className="hover:text-[#0d2461] shrink-0">
            {lang === "bn" ? "হোম" : "Home"}
          </Link>
          <span>›</span>
          <Link href="/products" className="hover:text-[#0d2461] shrink-0">
            {lang === "bn" ? "ক্যাটালগ" : "Catalogue"}
          </Link>
          {division && (
            <>
              <span>›</span>
              <Link
                href={`/products?division=${division.id}`}
                className="hover:text-[#0d2461]"
              >
                {t(division.shortName)}
              </Link>
            </>
          )}
          <span>›</span>
          <span className="text-[#0d2461] font-bold break-words">
            {t(product.title)}
          </span>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer shrink-0"
        >
          <Printer className="w-3.5 h-3.5 text-[#c0272d]" />
          <span>
            {lang === "bn"
              ? "স্পেক শিট প্রিন্ট / PDF"
              : "Print Product Spec Sheet"}
          </span>
        </button>
      </div>

      {/* Main Product Sheet */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left 5 Cols: Image & Gallery */}
        <div className="lg:col-span-5 space-y-3">
          <div
            onClick={() => setLightboxOpen(true)}
            className="relative group rounded-2xl border border-slate-200 bg-white p-3 overflow-hidden aspect-square flex items-center justify-center cursor-zoom-in"
          >
            <img
              src={displayImg}
              alt={t(product.title)}
              className="w-full h-full object-contain group-hover:scale-[1.02] transition-transform"
            />
            <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-slate-900/75 text-white text-[11px] font-semibold inline-flex items-center gap-1 opacity-85 group-hover:opacity-100 transition-opacity print:hidden">
              <ZoomIn className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === "bn" ? "বড় করে দেখুন" : "Tap to Zoom"}</span>
            </span>
          </div>

          {gallery.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {gallery.map((imgUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImage(imgUrl)}
                  className={`w-16 h-16 rounded-xl border-2 bg-white p-1 overflow-hidden shrink-0 cursor-pointer transition-all ${
                    displayImg === imgUrl
                      ? "border-[#c0272d] shadow-xs"
                      : "border-slate-200 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`${t(product.title)} view ${idx + 1}`}
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right 7 Cols: Specs & B2B Inquiry Actions */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {division && (
                <span className="px-3 py-1 rounded-full bg-[#0d2461] text-white text-xs font-bold">
                  {t(division.name)}
                </span>
              )}
              {product.certifications.map((c) => (
                <span
                  key={c}
                  className="px-2.5 py-1 rounded-full bg-red-50 text-[#c0272d] border border-red-200 text-xs font-bold inline-flex items-center gap-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {c}
                </span>
              ))}
            </div>

            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {product.brand} •{" "}
                <span className="text-[#c0272d]">{product.model}</span>
              </div>
              <h1 className="font-extrabold text-2xl sm:text-3xl text-[#0d2461] mt-1 leading-tight">
                {t(product.title)}
              </h1>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">
              {t(product.shortDescription)}
            </p>

            {/* Key Specifications & Features */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
              <h3 className="font-bold text-sm text-[#0d2461] uppercase tracking-wider">
                {lang === "bn"
                  ? "প্রধান বৈশিষ্ট্য ও স্পেসিফিকেশন"
                  : "Key Features & Technical Highlights"}
              </h3>
              <ul className="space-y-2">
                {featuresList.map((f, i) => (
                  <li
                    key={i}
                    className="text-xs sm:text-sm text-slate-700 flex items-start gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              {product.specs && Object.keys(product.specs).length > 0 && (
                <div className="pt-3 mt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries(product.specs).map(([k, v]) => (
                    <div
                      key={k}
                      className="bg-white px-3 py-2 rounded-lg border border-slate-200 text-xs"
                    >
                      <span className="text-slate-500 font-medium">{k}: </span>
                      <strong className="text-slate-900">{v}</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Wholesale Conversion Box + Quantity / Variant Selector */}
          <div className="bg-blue-50/60 border-2 border-[#0d2461]/20 rounded-2xl p-5 space-y-4 print:hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-extrabold uppercase text-[#c0272d]">
                  {lang === "bn"
                    ? "পাইকারি ও প্রাতিষ্ঠানিক সরবরাহ"
                    : "B2B WHOLESALE & INSTITUTIONAL SUPPLY"}
                </span>
                <div className="font-extrabold text-base text-[#0d2461]">
                  {t(UI_TEXT.productCard.noPublicPrice)}
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full self-start sm:self-auto">
                {t(UI_TEXT.status[product.status])}
              </span>
            </div>

            {/* Optional Quantity / Size / Brand Note Selector */}
            <div className="bg-white/90 rounded-xl p-3 border border-slate-200/90 space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                {lang === "bn"
                  ? "আনুমানিক পরিমাণ বা সাইজ/ব্র্যান্ড নোট (ঐচ্ছিক):"
                  : "Estimated Quantity / Size / Brand Note (Optional):"}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {quickQuantities.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setQuantityNote(preset)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                      quantityNote === preset
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={quantityNote}
                onChange={(e) => setQuantityNote(e.target.value)}
                placeholder={
                  lang === "bn"
                    ? "যেমন: ৫০ জোড়া (সাইজ ৪১-৪৩) / ১০০ পিস..."
                    : "e.g., 50 Pairs (Size 41-43) / 100 Pcs / Specific Brand..."
                }
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 outline-none focus:border-[#0d2461]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  trackEvent({
                    type: "whatsapp_click",
                    productId: product.id,
                    productTitle: product.title.en,
                    divisionId: product.divisionId,
                  })
                }
                className="py-3 px-4 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{t(UI_TEXT.productCard.whatsappBtn)}</span>
              </a>

              <button
                type="button"
                onClick={() =>
                  addItem(product, quantityNote.trim() || "Wholesale Inquiry")
                }
                className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border transition-colors cursor-pointer ${
                  inBasket
                    ? "bg-[#0d2461] text-white border-[#0d2461]"
                    : "bg-white hover:bg-slate-50 text-[#0d2461] border-slate-300"
                }`}
              >
                {inBasket ? (
                  <>
                    <Check className="w-4 h-4 text-amber-400" />
                    <span>{t(UI_TEXT.productCard.inQuoteList)}</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 text-[#c0272d]" />
                    <span>{t(UI_TEXT.productCard.addToQuote)}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsCallModalOpen(true)}
                className="py-3 px-4 rounded-xl bg-[#c0272d] hover:bg-[#a31f24] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <PhoneCall className="w-4 h-4" />
                <span>{COMPANY_INFO.phonePrimary}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <ImageLightbox
        src={lightboxOpen ? displayImg : null}
        title={t(product.title)}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  );
}
