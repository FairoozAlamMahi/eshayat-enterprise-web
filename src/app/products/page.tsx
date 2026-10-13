"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Filter, X, Layers, ArrowUp } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { DIVISIONS, DivisionId } from "@/data/divisions";
import { INITIAL_PRODUCTS, Product } from "@/data/initialProducts";
import { ProductCard } from "@/components/products/ProductCard";
import { CustomSourcingCard } from "@/components/products/CustomSourcingCard";
import { ImageLightbox } from "@/components/products/ImageLightbox";
import SearchAutocomplete from "@/components/products/SearchAutocomplete";
import { trackEvent } from "@/lib/trackClient";

function ProductsCatalogContent() {
  const { lang, t } = useLanguage();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [selectedDivision, setSelectedDivision] = useState<DivisionId | "all">(
    "all"
  );
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [lightbox, setLightbox] = useState<{
    src: string | null;
    title?: string;
  }>({ src: null });

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Sync initial URL query params (?division=... & ?q=...)
  useEffect(() => {
    const divParam = searchParams.get("division") as DivisionId | null;
    const qParam = searchParams.get("q");
    if (divParam && DIVISIONS.some((d) => d.id === divParam)) {
      setSelectedDivision(divParam);
      setSelectedSubcategory("all");
    }
    if (qParam) {
      setSearchQuery(qParam);
    }
  }, [searchParams]);

  // Fetch live dynamic products from API
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

  const activeDivisionObj = useMemo(
    () => DIVISIONS.find((d) => d.id === selectedDivision),
    [selectedDivision]
  );

  const filteredProducts = useMemo(() => {
    const base = products.filter((p) => {
      if (selectedDivision !== "all" && p.divisionId !== selectedDivision) {
        return false;
      }
      if (
        selectedSubcategory !== "all" &&
        p.subcategoryId !== selectedSubcategory
      ) {
        return false;
      }
      return true;
    });

    const q = searchQuery.toLowerCase().trim();
    if (!q) return base;

    const wordStartRegex = new RegExp(
      `(^|[\\s\\-\\(\\/])${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
      "i"
    );

    const scored = base
      .map((p) => {
        let score = 0;
        const titleStr = `${p.title.en} ${p.title.bn}`.toLowerCase();
        const brandModelStr = `${p.brand} ${p.model}`.toLowerCase();
        const certStr = (p.certifications || []).join(" ").toLowerCase();
        const descStr = `${p.shortDescription.en} ${p.shortDescription.bn}`.toLowerCase();

        if (wordStartRegex.test(titleStr)) score += 100;
        else if (titleStr.includes(q)) score += 70;

        if (brandModelStr.includes(q)) score += 40;
        if (certStr.includes(q)) score += 25;
        if (descStr.includes(q)) score += 10;

        return { product: p, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score);

    return scored.map((x) => x.product);
  }, [products, selectedDivision, selectedSubcategory, searchQuery]);

  const handleDivisionChange = (divId: DivisionId | "all") => {
    setSelectedDivision(divId);
    setSelectedSubcategory("all");
    if (divId !== "all") {
      trackEvent({
        type: "division_filter",
        divisionId: divId,
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page Banner */}
      <div className="bg-slate-950 text-white py-10 px-4 sm:px-6 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-wider text-amber-400 mb-1">
              {lang === "bn"
                ? "এম/এস এশায়াত এন্টারপ্রাইজ — ডায়নামিক ক্যাটালগ"
                : "M/S ESHAYAT ENTERPRISE — B2B CATALOGUE"}
            </div>
            <h1 className="font-extrabold text-2xl sm:text-4xl text-white">
              {activeDivisionObj
                ? t(activeDivisionObj.name)
                : lang === "bn"
                ? "সম্পূর্ণ পাইকারি পণ্যের ক্যাটালগ"
                : "Wholesale Product & Supply Catalogue"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              {activeDivisionObj
                ? t(activeDivisionObj.description)
                : lang === "bn"
                ? "ল্যাব গ্লাসওয়্যার, পিপিই, ইন্ডাস্ট্রিয়াল সেফটি, এমআরও এবং হাসপাতাল ও টেন্ডার সরবরাহের সম্পূর্ণ তালিকা।"
                : "Browse our 6 official supply divisions. Click 'WhatsApp Quote' for instant wholesale pricing or build a multi-item Quote List."}
            </p>
          </div>

          {/* Search Input with Google-style Autocomplete */}
          <div className="w-full lg:w-96">
            <SearchAutocomplete
              value={searchQuery}
              onChange={(val) => setSearchQuery(val)}
              onSubmit={(val) => {
                setSearchQuery(val);
                setSelectedDivision("all");
                setSelectedSubcategory("all");
              }}
              products={products}
              variant="catalog"
              placeholder={
                lang === "bn"
                  ? "নাম, ব্র্যান্ড বা মডেল লিখে খুঁজুন..."
                  : "Filter by name, brand, model, or spec..."
              }
            />
          </div>
        </div>
      </div>

      {/* Sticky 2-Level Filter Bar (6 Divisions + Subcategory Pills) */}
      <div className="sticky top-[66px] sm:top-[74px] z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 space-y-2.5 overflow-hidden">
          {/* Level 1: 6 Main Divisions */}
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5 no-scrollbar">
            <span className="text-xs font-bold text-slate-400 inline-flex items-center gap-1 shrink-0 mr-1">
              <Layers className="w-3.5 h-3.5" />
              {lang === "bn" ? "বিভাগ:" : "Division:"}
            </span>
            <button
              type="button"
              onClick={() => handleDivisionChange("all")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                selectedDivision === "all"
                  ? "bg-[#c0272d] text-white shadow-2xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {lang === "bn"
                ? `সকল বিভাগ (${products.length})`
                : `All 6 Divisions (${products.length})`}
            </button>

            {DIVISIONS.map((div) => {
              const count = products.filter(
                (p) => p.divisionId === div.id
              ).length;
              return (
                <button
                  key={div.id}
                  type="button"
                  onClick={() => handleDivisionChange(div.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                    selectedDivision === div.id
                      ? "bg-slate-900 text-white shadow-2xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {t(div.shortName)} ({count})
                </button>
              );
            })}
          </div>

          {/* Level 2: Subcategory Filter Pills (when a Division is selected) */}
          {activeDivisionObj && (
            <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-100 no-scrollbar">
              <span className="text-xs font-bold text-slate-400 inline-flex items-center gap-1 shrink-0 mr-1">
                <Filter className="w-3.5 h-3.5 text-[#c0272d]" />
                {lang === "bn" ? "সাব-ক্যাটাগরি:" : "Subcategory:"}
              </span>
              <button
                type="button"
                onClick={() => setSelectedSubcategory("all")}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  selectedSubcategory === "all"
                    ? "bg-amber-400 text-slate-950 font-bold"
                    : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                {lang === "bn" ? "সবগুলো" : "All in Division"}
              </button>

              {activeDivisionObj.subcategories.map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setSelectedSubcategory(sub.id)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                    selectedSubcategory === sub.id
                      ? "bg-amber-400 text-slate-950 font-bold"
                      : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {t(sub.name)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Product Grid + Custom Brand / Tender Sourcing Card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs sm:text-sm text-slate-600">
            {lang === "bn" ? (
              <>
                মোট <strong>{filteredProducts.length}</strong> টি পণ্য প্রদর্শিত হচ্ছে
              </>
            ) : (
              <>
                Showing <strong>{filteredProducts.length}</strong> wholesale
                items
              </>
            )}
          </p>

          {(selectedDivision !== "all" || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedDivision("all");
                setSelectedSubcategory("all");
                setSearchQuery("");
              }}
              className="text-xs font-bold text-[#c0272d] hover:underline cursor-pointer"
            >
              {lang === "bn" ? "ফিল্টার রিসেট করুন" : "Reset All Filters"}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onImageClick={(src, title) => setLightbox({ src, title })}
            />
          ))}

          {/* Persistent Unlisted Brand & Hospital Tender Sourcing Card */}
          <CustomSourcingCard
            divisionName={
              activeDivisionObj
                ? t(activeDivisionObj.name)
                : lang === "bn"
                ? "সকল বিভাগ"
                : "All Supply Divisions"
            }
            sourcingNote={
              activeDivisionObj ? t(activeDivisionObj.sourcingNote) : undefined
            }
          />
        </div>
      </section>

      {/* Floating Back to Top Button */}
      {showBackToTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-20 sm:bottom-6 right-4 z-40 px-3.5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-xl border border-slate-700 flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer print:hidden"
          aria-label="Back to top"
        >
          <ArrowUp className="w-4 h-4 text-amber-400" />
          <span>{lang === "bn" ? "উপরে যান" : "Top"}</span>
        </button>
      )}

      <ImageLightbox
        src={lightbox.src}
        title={lightbox.title}
        onClose={() => setLightbox({ src: null })}
      />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-16 text-center text-sm text-slate-500">
          Loading wholesale catalogue...
        </div>
      }
    >
      <ProductsCatalogContent />
    </Suspense>
  );
}
