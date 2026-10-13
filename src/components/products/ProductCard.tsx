"use client";

import React from "react";
import Link from "next/link";
import {
  MessageCircle,
  Plus,
  Check,
  ShieldCheck,
  ArrowUpRight,
  ZoomIn,
} from "lucide-react";
import { Product } from "@/data/initialProducts";
import { getDivisionById } from "@/data/divisions";
import { UI_TEXT } from "@/data/translations";
import { useLanguage } from "@/context/LanguageContext";
import { useRfqBasket } from "@/context/RfqBasketContext";
import { getProductWhatsAppUrl } from "@/lib/whatsapp";
import { trackEvent } from "@/lib/trackClient";

export function ProductCard({
  product,
  onImageClick,
}: {
  product: Product;
  onImageClick?: (src: string, title: string) => void;
}) {
  const { lang, t } = useLanguage();
  const { addItem, isInBasket } = useRfqBasket();

  const division = getDivisionById(product.divisionId);
  const inBasket = isInBasket(product.id);
  const whatsappUrl = getProductWhatsAppUrl(product, lang);

  const statusBadge =
    product.status === "in_stock"
      ? {
          text: lang === "bn" ? "পাইকারি স্টক" : "Ready Stock",
          dot: "bg-emerald-500",
          cls: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
        }
      : product.status === "available_bulk"
      ? {
          text: lang === "bn" ? "বাল্ক অর্ডার" : "Bulk Supply",
          dot: "bg-blue-500",
          cls: "bg-blue-50 text-blue-800 border-blue-200/80",
        }
      : {
          text: lang === "bn" ? "কাস্টম সোর্সিং" : "Custom Indent",
          dot: "bg-purple-500",
          cls: "bg-purple-50 text-purple-800 border-purple-200/80",
        };

  const featuresList =
    lang === "bn" && product.features.bn.length > 0
      ? product.features.bn
      : product.features.en;

  return (
    <article className="bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group">
      {/* 1. Clean Top Meta Bar (Keeps badges OFF the product photo!) */}
      <div className="px-3.5 py-2.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between gap-2">
        {division ? (
          <span className="text-[11px] font-bold text-slate-600 truncate">
            {t(division.shortName)}
          </span>
        ) : (
          <span />
        )}
        <span
          className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${statusBadge.cls}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
          <span>{statusBadge.text}</span>
        </span>
      </div>

      {/* 2. Uncropped Studio Image Container (aspect-square + object-contain) */}
      <div
        onClick={() =>
          onImageClick && onImageClick(product.image, t(product.title))
        }
        className="relative aspect-square w-full bg-white p-3 border-b border-slate-100 overflow-hidden cursor-zoom-in flex items-center justify-center"
      >
        <img
          src={product.image}
          alt={`${t(product.title)} - ${product.model}`}
          className="w-full h-full object-contain group-hover:scale-103 transition-transform duration-300"
        />
        <button
          type="button"
          aria-label="Zoom Product Image"
          className="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full bg-slate-900/75 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm pointer-events-none"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
      </div>

      {/* 3. Product Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-4">
        <div>
          {/* Brand & Model Row */}
          <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500 font-semibold mb-1.5">
            <span className="truncate">{product.brand}</span>
            <span className="text-[#c0272d] font-bold shrink-0 bg-rose-50 px-2 py-0.5 rounded">
              {product.model}
            </span>
          </div>

          {/* Product Title */}
          <Link
            href={`/products/${product.slug}`}
            className="block font-extrabold text-base text-slate-900 hover:text-[#0d2461] transition-colors leading-snug mb-2 line-clamp-2"
          >
            {t(product.title)}
          </Link>

          {/* Certifications Row (Cleanly below title, never blocking image) */}
          {product.certifications && product.certifications.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {product.certifications.slice(0, 3).map((cert) => (
                <span
                  key={cert}
                  className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 inline-flex items-center gap-1"
                >
                  <ShieldCheck className="w-3 h-3 text-[#0d2461] shrink-0" />
                  <span>{cert}</span>
                </span>
              ))}
            </div>
          )}

          {/* Short Description */}
          <p className="text-xs text-slate-600 leading-relaxed mb-3 line-clamp-2">
            {t(product.shortDescription)}
          </p>

          {/* Key Features Bullets */}
          <ul className="space-y-1">
            {featuresList.slice(0, 2).map((feat, idx) => (
              <li
                key={idx}
                className="text-xs text-slate-700 flex items-start gap-1.5 leading-snug"
              >
                <span className="text-amber-500 font-bold mt-0.5">•</span>
                <span className="line-clamp-1">{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 4. Card Footer: Wholesale Rate Bar + Un-Truncated Action Buttons */}
        <div className="pt-3 border-t border-slate-100 space-y-2.5">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="font-bold text-amber-900 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-md text-[11px]">
              {t(UI_TEXT.productCard.noPublicPrice)}
            </span>
            <Link
              href={`/products/${product.slug}`}
              className="text-xs font-bold text-[#0d2461] hover:text-[#c0272d] inline-flex items-center gap-0.5 shrink-0"
            >
              <span>{lang === "bn" ? "বিস্তারিত" : "Specs"}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {/* 1-Click WhatsApp Button */}
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
              className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors whitespace-nowrap"
            >
              <MessageCircle className="w-4 h-4 shrink-0" />
              <span>
                {lang === "bn" ? "হোয়াটসঅ্যাপে দর" : "WhatsApp Quote"}
              </span>
            </a>

            {/* + Quote List Button */}
            <button
              type="button"
              onClick={() => addItem(product)}
              className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1 border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                inBasket
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200"
              }`}
            >
              {inBasket ? (
                <>
                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{lang === "bn" ? "যুক্ত" : "Added"}</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5 text-[#c0272d] shrink-0" />
                  <span>{lang === "bn" ? "লিস্ট" : "Quote"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
