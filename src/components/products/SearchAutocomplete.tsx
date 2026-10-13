"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  ArrowUpRight,
  TrendingUp,
  Layers,
  Package,
  Sparkles,
} from "lucide-react";
import { DIVISIONS } from "@/data/divisions";
import { INITIAL_PRODUCTS, Product } from "@/data/initialProducts";
import { useLanguage } from "@/context/LanguageContext";
import { trackEvent } from "@/lib/trackClient";

interface SearchAutocompleteProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit?: (val: string) => void;
  products?: Product[];
  variant?: "hero" | "catalog";
  placeholder?: string;
}

const POPULAR_SEARCHES = [
  { en: "Safety Shoes", bn: "সেফটি জুতা (Safety Shoes)" },
  { en: "Nitrile Gloves", bn: "নাইট্রিল গ্লাভস (Nitrile Gloves)" },
  { en: "Surgical Mask", bn: "সার্জিক্যাল মাস্ক (Surgical Mask)" },
  { en: "Reagent Bottle", bn: "রিএজেন্ট বোতল (Reagent Bottle)" },
  { en: "Micropipette", bn: "মাইক্রোপিপেট (Micropipette)" },
  { en: "Gumboots", bn: "গামবুট (Gumboots)" },
];

const EXTRA_B2B_KEYWORDS = [
  "Safety Shoes Steel Toe",
  "Runner Safety Shoes",
  "Safety Jogger Bestboot",
  "Industrial Gumboots PVC",
  "Borosilicate Reagent Bottle",
  "Volumetric Pipette Class A",
  "Adjustable Micropipette",
  "Peristaltic Pump Lab",
  "Autosampler Vials 2mL",
  "Petri Dish Glass",
  "Sterilization Reels Medical",
  "3-Ply Surgical Face Mask",
  "Nitrile Examination Gloves",
  "Hospital Beds & Ward Equipment",
  "Fire Extinguisher & Safety Helmet",
  "Cleanroom & QC Lab Supplies",
];

type SuggestionItem =
  | {
      kind: "keyword";
      label: string;
      sublabel?: string;
      query: string;
      divisionId?: string;
    }
  | {
      kind: "product";
      product: Product;
    };

export default function SearchAutocomplete({
  value,
  onChange,
  onSubmit,
  products = INITIAL_PRODUCTS,
  variant = "hero",
  placeholder,
}: SearchAutocompleteProps) {
  const router = useRouter();
  const { lang, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Build Google-style suggestions based on current input
  const { keywordSuggestions, productMatches } = useMemo(() => {
    const q = value.trim().toLowerCase();

    if (!q) {
      return {
        keywordSuggestions: POPULAR_SEARCHES.map((item) => ({
          kind: "keyword" as const,
          label: lang === "bn" ? item.bn : item.en,
          sublabel: lang === "bn" ? "জনপ্রিয় অনুসন্ধান" : "Popular Search",
          query: item.en,
        })),
        productMatches: products.slice(0, 3).map((product) => ({
          kind: "product" as const,
          product,
        })),
      };
    }

    const scoredKeywords: {
      item: SuggestionItem;
      score: number;
    }[] = [];
    const seen = new Set<string>();

    const wordStartRegex = new RegExp(
      `(^|[\\s\\-\\(\\/])${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
      "i"
    );

    const addKeyword = (
      label: string,
      query: string,
      baseScore: number,
      sublabel?: string,
      divisionId?: string
    ) => {
      const key = label.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        const bonus = wordStartRegex.test(label) ? 30 : 0;
        scoredKeywords.push({
          score: baseScore + bonus,
          item: {
            kind: "keyword",
            label,
            query,
            sublabel,
            divisionId,
          },
        });
      }
    };

    // 1. Match Extra B2B Wholesale Terms (Short, clean Google-like phrases)
    for (const term of EXTRA_B2B_KEYWORDS) {
      if (term.toLowerCase().includes(q)) {
        addKeyword(
          term,
          term,
          85,
          lang === "bn" ? "পাইকারি ক্যাটালগ" : "B2B Catalog"
        );
      }
    }

    // 2. Match Product Titles & Brands
    for (const p of products) {
      const titleText = t(p.title);
      if (
        p.title.en.toLowerCase().includes(q) ||
        p.title.bn.toLowerCase().includes(q)
      ) {
        addKeyword(titleText, p.title.en, 80, p.brand.split("/")[0].trim());
      }
    }

    // 3. Match Subcategories & Divisions
    for (const div of DIVISIONS) {
      if (
        div.name.en.toLowerCase().includes(q) ||
        div.name.bn.toLowerCase().includes(q) ||
        div.shortName.en.toLowerCase().includes(q)
      ) {
        addKeyword(
          t(div.shortName),
          t(div.shortName),
          75,
          lang === "bn" ? "বিভাগ" : "Division",
          div.id
        );
      }
      for (const sub of div.subcategories) {
        if (
          sub.name.en.toLowerCase().includes(q) ||
          sub.name.bn.toLowerCase().includes(q)
        ) {
          addKeyword(
            t(sub.name),
            sub.name.en,
            70,
            t(div.shortName),
            div.id
          );
        }
      }
    }

    scoredKeywords.sort((a, b) => b.score - a.score);
    const keywords = scoredKeywords.slice(0, 5).map((k) => k.item);

    // 4. Score & rank direct product cards
    const scoredProducts = products
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

    const hasHighConfidenceMatch = scoredProducts.some((x) => x.score >= 40);
    const filteredScored = hasHighConfidenceMatch
      ? scoredProducts.filter((x) => x.score >= 40)
      : scoredProducts;

    const matchedProducts: SuggestionItem[] = filteredScored
      .slice(0, 4)
      .map(({ product }) => ({
        kind: "product" as const,
        product,
      }));

    return {
      keywordSuggestions: keywords,
      productMatches: matchedProducts,
    };
  }, [value, products, lang, t]);

  const flatItems: SuggestionItem[] = useMemo(
    () => [...keywordSuggestions, ...productMatches],
    [keywordSuggestions, productMatches]
  );

  // Highlight matching substring like Google autocomplete
  const renderHighlighted = (text: string, query: string) => {
    const q = query.trim();
    if (!q) return <span>{text}</span>;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return <span>{text}</span>;
    const before = text.slice(0, idx);
    const match = text.slice(idx, idx + q.length);
    const after = text.slice(idx + q.length);
    return (
      <span>
        {before}
        <strong className="font-extrabold text-slate-950 bg-amber-200/70 rounded-xs">
          {match}
        </strong>
        {after}
      </span>
    );
  };

  const handleSelectItem = (item: SuggestionItem) => {
    setIsOpen(false);
    setActiveIndex(-1);

    if (item.kind === "product") {
      trackEvent({
        type: "product_view",
        productId: item.product.id,
        productTitle: item.product.title.en,
        divisionId: item.product.divisionId,
      });
      router.push(`/products/${item.product.slug}`);
      return;
    }

    onChange(item.query);
    trackEvent({
      type: "search_query",
      searchQuery: item.query,
    });

    if (onSubmit) {
      onSubmit(item.query);
    } else if (variant === "hero") {
      router.push(`/products?q=${encodeURIComponent(item.query)}`);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeIndex >= 0 && activeIndex < flatItems.length) {
      handleSelectItem(flatItems[activeIndex]);
      return;
    }
    setIsOpen(false);
    const trimmed = value.trim();
    if (trimmed.length >= 2) {
      trackEvent({
        type: "search_query",
        searchQuery: trimmed,
      });
    }
    if (onSubmit) {
      onSubmit(trimmed);
    } else if (variant === "hero") {
      if (trimmed) {
        router.push(`/products?q=${encodeURIComponent(trimmed)}`);
      } else {
        router.push("/products");
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setIsOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev < flatItems.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev > 0 ? prev - 1 : flatItems.length - 1
      );
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${
        variant === "hero" ? "max-w-xl" : "lg:w-96"
      }`}
    >
      <form
        onSubmit={handleFormSubmit}
        className={`bg-white flex items-center transition-all ${
          variant === "hero"
            ? "p-1.5 rounded-2xl shadow-xl gap-1.5 border border-slate-200 focus-within:ring-2 focus-within:ring-amber-400"
            : "p-1 rounded-xl shadow-lg gap-1 border border-slate-200 focus-within:ring-2 focus-within:ring-amber-400"
        }`}
      >
        <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 ml-2.5 sm:ml-3 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
            setActiveIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          placeholder={
            placeholder ||
            (lang === "bn"
              ? "পণ্য খুঁজুন (Safety Shoes, Pipette, Gloves)..."
              : "Search shoes, reagent bottles, pipettes, gloves...")
          }
          aria-label="Search products"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          autoComplete="off"
          className="w-full min-w-0 py-2 px-1.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none"
        />

        {value && (
          <button
            type="button"
            onClick={() => {
              onChange("");
              setActiveIndex(-1);
              inputRef.current?.focus();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer shrink-0"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {variant === "hero" && (
          <button
            type="submit"
            className="px-4 sm:px-5 py-2.5 rounded-xl bg-[#c0272d] hover:bg-[#a31f24] text-white font-bold text-xs sm:text-sm shrink-0 transition-colors cursor-pointer"
          >
            {lang === "bn" ? "খুঁজুন" : "Search"}
          </button>
        )}
      </form>

      {/* Google-Style Suggestions Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 text-left animate-in fade-in duration-150">
          {/* Keyword Autocomplete Section */}
          {keywordSuggestions.length > 0 && (
            <div className="py-1.5">
              <div className="px-3.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                {value.trim() ? (
                  <>
                    <Search className="w-3 h-3 text-slate-400" />
                    <span>
                      {lang === "bn" ? "পরামর্শকৃত অনুসন্ধান" : "Search Suggestions"}
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-3 h-3 text-amber-500" />
                    <span>
                      {lang === "bn" ? "জনপ্রিয় অনুসন্ধান" : "Popular B2B Searches"}
                    </span>
                  </>
                )}
              </div>

              {keywordSuggestions.map((item, idx) => {
                if (item.kind !== "keyword") return null;
                const isSelected = idx === activeIndex;
                return (
                  <button
                    key={`kw-${item.label}-${idx}`}
                    type="button"
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => handleSelectItem(item)}
                    className={`w-full px-3.5 py-2 flex items-center justify-between gap-2 text-xs sm:text-sm transition-colors cursor-pointer ${
                      isSelected ? "bg-slate-100 text-slate-950" : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        {renderHighlighted(item.label, value)}
                      </span>
                    </div>
                    {item.sublabel && (
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full shrink-0 max-w-[100px] sm:max-w-[150px] truncate">
                        {item.sublabel}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Direct Product Matches Section */}
          {productMatches.length > 0 && (
            <div className="border-t border-slate-100 py-1.5">
              <div className="px-3.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Package className="w-3 h-3 text-[#0d2461]" />
                <span>
                  {value.trim()
                    ? lang === "bn"
                      ? "সরাসরি মিলে যাওয়া পণ্য"
                      : "Matching Catalogue Items"
                    : lang === "bn"
                    ? "প্রধান সরবরাহকৃত পণ্য"
                    : "Featured Supply Items"}
                </span>
              </div>

              {productMatches.map((item, pIdx) => {
                if (item.kind !== "product") return null;
                const globalIdx = keywordSuggestions.length + pIdx;
                const isSelected = globalIdx === activeIndex;
                const p = item.product;

                return (
                  <button
                    key={`prod-${p.id}`}
                    type="button"
                    onMouseEnter={() => setActiveIndex(globalIdx)}
                    onClick={() => handleSelectItem(item)}
                    className={`w-full px-3.5 py-2 flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                      isSelected ? "bg-slate-100" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-lg border border-slate-200 bg-white p-1 flex items-center justify-center shrink-0">
                        <img
                          src={p.image}
                          alt={t(p.title)}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="min-w-0 text-left">
                        <div className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {renderHighlighted(t(p.title), value)}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {p.brand} • {p.model}
                        </div>
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </button>
                );
              })}
            </div>
          )}

          {/* Custom Sourcing / Full Search Footer */}
          {value.trim() && (
            <div className="border-t border-slate-100 bg-slate-50 px-3.5 py-2 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleFormSubmit}
                className="text-xs font-bold text-[#0d2461] hover:underline flex items-center gap-1.5 cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>
                  {lang === "bn"
                    ? `"${value.trim()}" এর সকল ফলাফল দেখুন →`
                    : `View all catalog results for "${value.trim()}" →`}
                </span>
              </button>

              {productMatches.length === 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    router.push("/contact");
                  }}
                  className="text-[11px] font-bold text-[#c0272d] hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>
                    {lang === "bn" ? "কাস্টম সোর্সিং রিকোয়েস্ট" : "Request Custom Sourcing"}
                  </span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
