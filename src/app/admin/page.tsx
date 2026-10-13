"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Lock,
  Package,
  Inbox,
  BarChart3,
  Plus,
  Trash2,
  Edit3,
  Languages,
  Upload,
  CheckCircle2,
  PhoneCall,
  MessageCircle,
  Mail,
  RefreshCw,
  Smartphone,
  Monitor,
  Search,
  FileDown,
  Eye,
  Sparkles,
  LogOut,
} from "lucide-react";
import { DIVISIONS, DivisionId } from "@/data/divisions";
import { INITIAL_PRODUCTS, Product, ProductStatus } from "@/data/initialProducts";
import type { RfqLead, AnalyticsEvent } from "@/lib/db";

interface AnalyticsResponse {
  counters: {
    totalPageviews: number;
    mobileVisits: number;
    desktopVisits: number;
    enViews: number;
    bnViews: number;
    whatsappClicks: number;
    callClicksLine1: number;
    callClicksLine2: number;
    rfqSubmissions: number;
    pdfDownloads: number;
  };
  topViewedProducts: {
    id: string;
    title: string;
    divisionId: string;
    views: number;
    whatsappClicks: number;
  }[];
  topWhatsappProducts: {
    id: string;
    title: string;
    divisionId: string;
    whatsappClicks: number;
    views: number;
  }[];
  topSearchQueries: { query: string; count: number }[];
  recentEvents: AnalyticsEvent[];
  totalProducts: number;
  totalRfqLeads: number;
}

export default function AdminPortalPage() {
  const [pinInput, setPinInput] = useState("");
  const [pin, setPin] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");

  const [activeTab, setActiveTab] = useState<"products" | "rfq" | "analytics">(
    "products"
  );

  // Data States
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [rfqs, setRfqs] = useState<RfqLead[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  // Product Form State
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [titleEn, setTitleEn] = useState("");
  const [titleBn, setTitleBn] = useState("");
  const [model, setModel] = useState("");
  const [brand, setBrand] = useState("M/S Eshayat Enterprise");
  const [divisionId, setDivisionId] = useState<DivisionId>("lab-glassware");
  const [subcategoryId, setSubcategoryId] = useState(
    "reagent-bottles-glassware"
  );
  const [shortDescEn, setShortDescEn] = useState("");
  const [shortDescBn, setShortDescBn] = useState("");
  const [featuresTextEn, setFeaturesTextEn] = useState("");
  const [featuresTextBn, setFeaturesTextBn] = useState("");
  const [certificationsText, setCertificationsText] = useState("");
  const [status, setStatus] = useState<ProductStatus>("in_stock");
  const [featured, setFeatured] = useState(false);
  const [imagePreview, setImagePreview] = useState(
    "/images/products/reagent-bottle.jpg"
  );
  const [imageBase64, setImageBase64] = useState<string | undefined>(undefined);
  const [translating, setTranslating] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    fetch("/api/auth/admin")
      .then((r) => r.json())
      .then((d) => {
        if (d?.authenticated) {
          setAuthenticated(true);
        }
      })
      .catch(() => {});
  }, []);

  const fetchAllAdminData = useCallback(async (activePin?: string) => {
    setLoading(true);
    const headers: Record<string, string> = {};
    if (activePin) headers["x-admin-pin"] = activePin;

    try {
      const [prodRes, rfqRes, anaRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/rfq", { headers }),
        fetch("/api/analytics", { headers }),
      ]);

      if (rfqRes.status === 401 || anaRes.status === 401) {
        setAuthenticated(false);
        setAuthError("Session expired or invalid Admin PIN.");
        setLoading(false);
        return;
      }

      const prodData = await prodRes.json();
      const rfqData = await rfqRes.json();
      const anaData = await anaRes.json();

      if (Array.isArray(prodData?.products) && prodData.products.length > 0) {
        setProducts(prodData.products);
      }
      if (Array.isArray(rfqData?.rfqLeads)) setRfqs(rfqData.rfqLeads);
      if (anaData && anaData.counters) {
        setAnalytics(anaData);
      }
    } catch {
      // ignore network error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authenticated) {
      fetchAllAdminData(pin);
    }
  }, [authenticated, pin, fetchAllAdminData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    const cleanPin = pinInput.trim();
    const res = await fetch("/api/auth/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin: cleanPin }),
    });
    if (res.ok) {
      setPin(cleanPin);
      setAuthenticated(true);
    } else {
      const errData = await res.json().catch(() => ({}));
      setAuthError(
        errData.error ||
          "Incorrect PIN. Please enter your authorized 4-digit Admin PIN."
      );
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/admin", { method: "DELETE" }).catch(() => {});
    setAuthenticated(false);
    setPin("");
    setPinInput("");
  };

  const selectedDivisionObj =
    DIVISIONS.find((d) => d.id === divisionId) || DIVISIONS[0];

  const handleDivisionChange = (newDiv: DivisionId) => {
    setDivisionId(newDiv);
    const divObj = DIVISIONS.find((d) => d.id === newDiv);
    if (divObj && divObj.subcategories.length > 0) {
      setSubcategoryId(divObj.subcategories[0].id);
    }
  };

  // Phone Camera / Gallery Photo Upload
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setImageBase64(result);
    };
    reader.readAsDataURL(file);
  };

  // 1-Click Auto-Translate (EN -> BN)
  const handleAutoTranslateToBangla = async () => {
    if (!titleEn.trim() && !shortDescEn.trim()) return;
    setTranslating(true);
    try {
      const translateText = async (text: string) => {
        if (!text.trim()) return "";
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, targetLang: "bn" }),
        });
        const data = await res.json();
        return data.translatedText || text;
      };

      const [tTitle, tDesc, tFeat] = await Promise.all([
        translateText(titleEn),
        translateText(shortDescEn),
        translateText(featuresTextEn),
      ]);

      if (tTitle) setTitleBn(tTitle);
      if (tDesc) setShortDescBn(tDesc);
      if (tFeat) setFeaturesTextBn(tFeat);
      setStatusMessage("Auto-translated English fields to বাংলা!");
      setTimeout(() => setStatusMessage(""), 3500);
    } catch {
      setStatusMessage("Translation service busy. You can edit বাংলা manually.");
    } finally {
      setTranslating(false);
    }
  };

  const openAddProductModal = () => {
    setEditingId(null);
    setEditingSlug(null);
    setTitleEn("");
    setTitleBn("");
    setModel("Wholesale Standard");
    setBrand("M/S Eshayat Enterprise");
    setDivisionId("lab-glassware");
    setSubcategoryId("reagent-bottles-glassware");
    setShortDescEn("");
    setShortDescBn("");
    setFeaturesTextEn("");
    setFeaturesTextBn("");
    setCertificationsText("ISO 9001, CE Certified");
    setStatus("in_stock");
    setFeatured(false);
    setImagePreview("/images/products/reagent-bottle.jpg");
    setImageBase64(undefined);
    setShowProductForm(true);
  };

  const openEditProductModal = (p: Product) => {
    setEditingId(p.id);
    setEditingSlug(p.slug);
    setTitleEn(p.title.en);
    setTitleBn(p.title.bn);
    setModel(p.model);
    setBrand(p.brand);
    setDivisionId(p.divisionId);
    setSubcategoryId(p.subcategoryId);
    setShortDescEn(p.shortDescription.en);
    setShortDescBn(p.shortDescription.bn);
    setFeaturesTextEn(p.features.en.join("\n"));
    setFeaturesTextBn(p.features.bn.join("\n"));
    setCertificationsText(p.certifications.join(", "));
    setStatus(p.status);
    setFeatured(Boolean(p.featured));
    setImagePreview(p.image);
    setImageBase64(undefined);
    setShowProductForm(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleEn.trim()) return;
    setSavingProduct(true);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-pin": pin,
        },
        body: JSON.stringify({
          id: editingId || undefined,
          slug: editingSlug || undefined,
          titleEn: titleEn.trim(),
          titleBn: titleBn.trim() || titleEn.trim(),
          model: model.trim() || "Wholesale Standard",
          brand: brand.trim() || "M/S Eshayat Enterprise",
          divisionId,
          subcategoryId,
          image: imagePreview,
          imageBase64,
          status,
          certifications: certificationsText,
          shortDescEn: shortDescEn.trim(),
          shortDescBn: shortDescBn.trim() || shortDescEn.trim(),
          featuresEn: featuresTextEn,
          featuresBn: featuresTextBn || featuresTextEn,
          featured,
        }),
      });

      if (res.ok) {
        await fetchAllAdminData(pin);
        setShowProductForm(false);
        setStatusMessage(
          editingId
            ? "Product updated successfully!"
            : "New product published to catalogue!"
        );
        setTimeout(() => setStatusMessage(""), 3500);
      }
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}" from the catalogue?`)) return;
    const res = await fetch(`/api/products?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { "x-admin-pin": pin },
    });
    if (res.ok) {
      await fetchAllAdminData(pin);
      setStatusMessage(`Deleted "${title}"`);
      setTimeout(() => setStatusMessage(""), 3000);
    }
  };

  const handleUpdateRfqStatus = async (
    id: string,
    newStatus: "new" | "contacted" | "quoted"
  ) => {
    const res = await fetch("/api/rfq", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-admin-pin": pin,
      },
      body: JSON.stringify({ id, status: newStatus }),
    });
    if (res.ok) {
      await fetchAllAdminData(pin);
    }
  };

  // PIN Login Screen
  if (!authenticated) {
    return (
      <div className="min-h-[80vh] bg-slate-950 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl text-white">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-400 mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold mb-1">
            M/S Eshayat Admin Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mb-6">
            Mobile-first management for Products, 1-Click বাংলা Translation,
            Tender RFQs, and Full Visitor Analytics.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Enter 4-Digit Admin PIN
              </label>
              <input
                type="password"
                inputMode="numeric"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="••••"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-center text-lg tracking-widest font-mono focus:outline-none focus:border-amber-400"
                required
              />
            </div>
            {authError && (
              <p className="text-xs text-rose-400 font-medium">{authError}</p>
            )}
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-colors cursor-pointer"
            >
              Unlock Admin Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  const newRfqCount = rfqs.filter((r) => r.status === "new").length;

  return (
    <div className="min-h-screen bg-slate-100 pb-20">
      {/* Top Admin Header */}
      <div className="bg-slate-950 text-white border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
              M/S Eshayat Enterprise • Admin
            </span>
            <h1 className="text-lg sm:text-xl font-extrabold">
              Business Manager Control Center
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchAllAdminData(pin)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 cursor-pointer"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-xs font-semibold text-rose-200 border border-rose-800/50 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Lock</span>
            </button>
          </div>
        </div>

        {/* 3-Tab Switcher */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-2 overflow-x-auto pt-1">
          <button
            onClick={() => setActiveTab("products")}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === "products"
                ? "border-amber-400 text-amber-400"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Products ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("rfq")}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === "rfq"
                ? "border-amber-400 text-amber-400"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>RFQ Tender Inbox ({rfqs.length})</span>
            {newRfqCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-emerald-500 text-slate-950 font-extrabold">
                {newRfqCount} NEW
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === "analytics"
                ? "border-amber-400 text-amber-400"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Full Analytics Suite</span>
          </button>
        </div>
      </div>

      {/* Status Toast */}
      {statusMessage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-4">
          <div className="bg-emerald-900 text-emerald-100 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-md">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {/* =========================================================
            TAB 1: PRODUCTS MANAGER
           ========================================================= */}
        {activeTab === "products" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Product Catalogue Manager
                </h2>
                <p className="text-xs text-slate-500">
                  Upload photos directly from your phone camera and
                  auto-translate English descriptions into বাংলা with 1 tap.
                </p>
              </div>
              <button
                onClick={openAddProductModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Product</span>
              </button>
            </div>

            {/* Add / Edit Product Form Drawer/Panel */}
            {showProductForm && (
              <div className="bg-white rounded-2xl border-2 border-slate-900 p-5 sm:p-8 shadow-xl">
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200">
                  <h3 className="text-lg font-extrabold text-slate-900">
                    {editingId ? "Edit Product" : "Add New Wholesale Product"}
                  </h3>
                  <button
                    onClick={() => setShowProductForm(false)}
                    className="text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer"
                  >
                    Cancel ✕
                  </button>
                </div>

                <form onSubmit={handleSaveProduct} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Division (Card Section) *
                      </label>
                      <select
                        value={divisionId}
                        onChange={(e) =>
                          handleDivisionChange(e.target.value as DivisionId)
                        }
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white"
                      >
                        {DIVISIONS.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name.en} ({d.name.bn})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Subcategory *
                      </label>
                      <select
                        value={subcategoryId}
                        onChange={(e) => setSubcategoryId(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white"
                      >
                        {selectedDivisionObj.subcategories.map((sub) => (
                          <option key={sub.id} value={sub.id}>
                            {sub.name.en} ({sub.name.bn})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* English Fields + 1-Click Auto Translate Button */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                        Step 1: Type English Details
                      </span>
                      <button
                        type="button"
                        onClick={handleAutoTranslateToBangla}
                        disabled={translating}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <Languages className="w-3.5 h-3.5" />
                        <span>
                          {translating
                            ? "Translating to বাংলা..."
                            : "✨ 1-Click Auto-Translate to বাংলা"}
                        </span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Product Name (English) *
                        </label>
                        <input
                          type="text"
                          required
                          value={titleEn}
                          onChange={(e) => setTitleEn(e.target.value)}
                          placeholder="e.g. Heavy-Duty Steel Toe Safety Shoe"
                          className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Model / Spec Code
                        </label>
                        <input
                          type="text"
                          value={model}
                          onChange={(e) => setModel(e.target.value)}
                          placeholder="e.g. EN ISO 20345 / 250mL"
                          className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Short Description (English) *
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={shortDescEn}
                        onChange={(e) => setShortDescEn(e.target.value)}
                        placeholder="Brief wholesale overview, material, and institutional application..."
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Key Features (English — 1 per line)
                      </label>
                      <textarea
                        rows={3}
                        value={featuresTextEn}
                        onChange={(e) => setFeaturesTextEn(e.target.value)}
                        placeholder={
                          "200J impact resistant steel toe\nOil and slip resistant sole\nAvailable in multiple brands on indent"
                        }
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 bg-white"
                      />
                    </div>
                  </div>

                  {/* Bangla Fields */}
                  <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200 space-y-4">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-amber-900 block">
                      Step 2: বাংলা Details (Auto-filled or Editable)
                    </span>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        পণ্যের নাম (বাংলা)
                      </label>
                      <input
                        type="text"
                        value={titleBn}
                        onChange={(e) => setTitleBn(e.target.value)}
                        placeholder="স্বয়ংক্রিয় অনুবাদের জন্য উপরের বাটনে ক্লিক করুন"
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        সংক্ষিপ্ত বিবরণ (বাংলা)
                      </label>
                      <textarea
                        rows={2}
                        value={shortDescBn}
                        onChange={(e) => setShortDescBn(e.target.value)}
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        প্রধান বৈশিষ্ট্য (প্রতি লাইনে একটি)
                      </label>
                      <textarea
                        rows={3}
                        value={featuresTextBn}
                        onChange={(e) => setFeaturesTextBn(e.target.value)}
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 bg-white"
                      />
                    </div>
                  </div>

                  {/* Photo Upload + Certifications + Stock */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      <label className="block text-xs font-bold text-slate-700 mb-2">
                        Product Photo (Camera / Gallery)
                      </label>
                      <div className="relative w-full h-32 rounded-lg overflow-hidden bg-white border border-slate-200 mb-2">
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          fill
                          className="object-contain p-2"
                          unoptimized={imagePreview.startsWith("data:")}
                        />
                      </div>
                      <label className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-900 text-white text-xs font-bold cursor-pointer hover:bg-slate-800">
                        <Upload className="w-3.5 h-3.5 text-amber-400" />
                        <span>Upload Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="sm:col-span-2 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Brand / Origin
                          </label>
                          <input
                            type="text"
                            value={brand}
                            onChange={(e) => setBrand(e.target.value)}
                            className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Certifications (Comma-separated)
                          </label>
                          <input
                            type="text"
                            value={certificationsText}
                            onChange={(e) =>
                              setCertificationsText(e.target.value)
                            }
                            placeholder="ISO 9001, CE Certified"
                            className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 bg-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Availability Status
                          </label>
                          <select
                            value={status}
                            onChange={(e) =>
                              setStatus(e.target.value as ProductStatus)
                            }
                            className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 bg-white"
                          >
                            <option value="in_stock">
                              Ready Wholesale Stock
                            </option>
                            <option value="available_bulk">
                              Available for Bulk Order
                            </option>
                            <option value="custom_sourcing">
                              Custom Brand Indent / Tender
                            </option>
                          </select>
                        </div>

                        <div className="flex items-center gap-2 pt-6">
                          <input
                            type="checkbox"
                            id="featuredToggle"
                            checked={featured}
                            onChange={(e) => setFeatured(e.target.checked)}
                            className="w-4 h-4 accent-amber-500"
                          />
                          <label
                            htmlFor="featuredToggle"
                            className="text-xs font-bold text-slate-800 cursor-pointer"
                          >
                            Highlight on Homepage Featured Grid
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setShowProductForm(false)}
                      className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingProduct}
                      className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold cursor-pointer disabled:opacity-50"
                    >
                      {savingProduct ? "Saving..." : "Save & Publish Product"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Existing Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 flex gap-3.5 items-start justify-between shadow-2xs"
                >
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-slate-50 border border-slate-200 shrink-0">
                    <Image
                      src={p.image}
                      alt={p.title.en}
                      fill
                      className="object-contain p-1"
                      sizes="64px"
                      unoptimized={p.image.startsWith("data:")}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                      {p.divisionId}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 truncate mt-1">
                      {p.title.en}
                    </h4>
                    <p className="text-xs text-slate-500 truncate">
                      {p.title.bn}
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => openEditProductModal(p)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id, p.title.en)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 2: RFQ & TENDER INBOX
           ========================================================= */}
        {activeTab === "rfq" && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">
                Corporate & Hospital RFQ Tender Inbox
              </h2>
              <p className="text-xs text-slate-500">
                Every inquiry submitted on the website is stored here and routed
                to eshayat.enterprise@outlook.com.
              </p>
            </div>

            {rfqs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-500 text-sm">
                No RFQ submissions yet. Inquiries from the Quote Basket,
                Institutional Tender form, and Contact page will appear here.
              </div>
            ) : (
              <div className="space-y-4">
                {rfqs.map((lead) => (
                  <div
                    key={lead.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase ${
                              lead.status === "new"
                                ? "bg-emerald-100 text-emerald-800"
                                : lead.status === "contacted"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-slate-200 text-slate-700"
                            }`}
                          >
                            {lead.status}
                          </span>
                          <h3 className="text-base font-extrabold text-slate-900">
                            {lead.company}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Contact: <strong>{lead.name}</strong> • Phone:{" "}
                          <strong>{lead.phone}</strong> •{" "}
                          {lead.email || "No email"} •{" "}
                          {new Date(lead.createdAt).toLocaleString()}
                        </p>
                      </div>

                      {/* Status Selector */}
                      <div className="flex items-center gap-1.5">
                        {(["new", "contacted", "quoted"] as const).map((st) => (
                          <button
                            key={st}
                            onClick={() => handleUpdateRfqStatus(lead.id, st)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize cursor-pointer ${
                              lead.status === st
                                ? "bg-slate-900 text-white"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Items Requested */}
                    {lead.items && lead.items.length > 0 && (
                      <div className="py-3 border-b border-slate-100">
                        <p className="text-[11px] font-bold uppercase text-slate-400 mb-1.5">
                          Requested Items:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {lead.items.map((item, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold"
                            >
                              {item.title} (Qty: {item.quantity})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {lead.message && (
                      <p className="text-xs sm:text-sm text-slate-700 bg-slate-50 p-3 rounded-xl mt-3 whitespace-pre-line">
                        {lead.message}
                      </p>
                    )}

                    {/* 1-Tap Actions */}
                    <div className="flex flex-wrap items-center gap-2 mt-4">
                      <a
                        href={`tel:${lead.phone}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold"
                      >
                        <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
                        <span>Call {lead.phone}</span>
                      </a>
                      <a
                        href={`https://wa.me/${lead.phone.replace(
                          /[^0-9]/g,
                          ""
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Reply on WhatsApp</span>
                      </a>
                      {lead.email && (
                        <a
                          href={`mailto:${lead.email}?subject=Quotation from M/S Eshayat Enterprise`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-800 text-xs font-bold"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Email Quote</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =========================================================
            TAB 3: FULL ANALYTICS SUITE ("ANY AND ALL KINDS")
           ========================================================= */}
        {activeTab === "analytics" && analytics && (
          <div className="space-y-6">
            {/* Top 6 KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                  <span>Total Visits</span>
                </div>
                <p className="text-2xl font-black text-slate-900 mt-1">
                  {analytics.counters.totalPageviews}
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WhatsApp Clicks</span>
                </div>
                <p className="text-2xl font-black text-emerald-600 mt-1">
                  {analytics.counters.whatsappClicks}
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                  <PhoneCall className="w-3.5 h-3.5 text-amber-600" />
                  <span>Phone Call Taps</span>
                </div>
                <p className="text-2xl font-black text-amber-600 mt-1">
                  {analytics.counters.callClicksLine1 +
                    analytics.counters.callClicksLine2}
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                  <Inbox className="w-3.5 h-3.5 text-indigo-600" />
                  <span>RFQ Submissions</span>
                </div>
                <p className="text-2xl font-black text-indigo-600 mt-1">
                  {analytics.counters.rfqSubmissions}
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                  <FileDown className="w-3.5 h-3.5 text-purple-600" />
                  <span>PDF Downloads</span>
                </div>
                <p className="text-2xl font-black text-purple-600 mt-1">
                  {analytics.counters.pdfDownloads}
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                  <Sparkles className="w-3.5 h-3.5 text-slate-700" />
                  <span>Active Products</span>
                </div>
                <p className="text-2xl font-black text-slate-900 mt-1">
                  {analytics.totalProducts}
                </p>
              </div>
            </div>

            {/* Breakdown Row: Dual Phone Lines, Device Split, Language Split */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Dual Call Lines Breakdown */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-amber-600" />
                  <span>Calls by Phone Number</span>
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                    <div>
                      <p className="font-bold text-slate-900">
                        01862-679456 (Line 1)
                      </p>
                      <p className="text-slate-500">
                        Primary Office & WhatsApp
                      </p>
                    </div>
                    <span className="text-base font-black text-slate-900">
                      {analytics.counters.callClicksLine1}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/60">
                    <div>
                      <p className="font-bold text-slate-900">
                        01309-816266 (Line 2)
                      </p>
                      <p className="text-slate-500">
                        Efaz Alam (Business Manager)
                      </p>
                    </div>
                    <span className="text-base font-black text-amber-700">
                      {analytics.counters.callClicksLine2}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mobile vs Desktop Split */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-blue-600" />
                  <span>Device Breakdown (Mobile vs Desktop)</span>
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5" /> Mobile Buyers
                    </span>
                    <span className="text-base font-black text-slate-900">
                      {analytics.counters.mobileVisits}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Monitor className="w-3.5 h-3.5" /> Desktop / Office PC
                    </span>
                    <span className="text-base font-black text-slate-900">
                      {analytics.counters.desktopVisits}
                    </span>
                  </div>
                </div>
              </div>

              {/* Language Split (EN vs BN) */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Languages className="w-4 h-4 text-indigo-600" />
                  <span>Language Usage (English vs বাংলা)</span>
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                    <span className="font-bold text-slate-800">
                      English (EN)
                    </span>
                    <span className="text-base font-black text-slate-900">
                      {analytics.counters.enViews}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/60">
                    <span className="font-bold text-slate-800">
                      বাংলা (BN)
                    </span>
                    <span className="text-base font-black text-amber-800">
                      {analytics.counters.bnViews}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Product & Search Leaderboards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Top Viewed Products */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 mb-3">
                  Top Viewed Products
                </h3>
                {analytics.topViewedProducts.length === 0 ? (
                  <p className="text-xs text-slate-400">
                    Product views will rank here automatically.
                  </p>
                ) : (
                  <ul className="space-y-2 text-xs">
                    {analytics.topViewedProducts.map((item, i) => (
                      <li
                        key={item.id}
                        className="flex items-center justify-between py-1.5 border-b border-slate-100"
                      >
                        <span className="font-medium text-slate-800 truncate pr-2">
                          {i + 1}. {item.title}
                        </span>
                        <span className="font-bold text-slate-900 shrink-0">
                          {item.views} views
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Top WhatsApp-Clicked Products */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 mb-3">
                  Most WhatsApp-Inquired Products
                </h3>
                {analytics.topWhatsappProducts.length === 0 ? (
                  <p className="text-xs text-slate-400">
                    WhatsApp product inquiries will rank here.
                  </p>
                ) : (
                  <ul className="space-y-2 text-xs">
                    {analytics.topWhatsappProducts.map((item, i) => (
                      <li
                        key={item.id}
                        className="flex items-center justify-between py-1.5 border-b border-slate-100"
                      >
                        <span className="font-medium text-slate-800 truncate pr-2">
                          {i + 1}. {item.title}
                        </span>
                        <span className="font-bold text-emerald-700 shrink-0">
                          {item.whatsappClicks} clicks
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Customer Search Queries */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                  <Search className="w-4 h-4 text-slate-600" />
                  <span>What Buyers Search For</span>
                </h3>
                {analytics.topSearchQueries.length === 0 ? (
                  <p className="text-xs text-slate-400">
                    Search terms typed by visitors will appear here (helps spot
                    new unlisted items to stock!).
                  </p>
                ) : (
                  <ul className="space-y-2 text-xs">
                    {analytics.topSearchQueries.map((item, i) => (
                      <li
                        key={item.query}
                        className="flex items-center justify-between py-1.5 border-b border-slate-100"
                      >
                        <span className="font-medium text-slate-800">
                          {i + 1}. &ldquo;{item.query}&rdquo;
                        </span>
                        <span className="font-bold text-slate-600">
                          {item.count}x
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Live Recent Activity Stream */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 mb-3">
                Recent Live Visitor Activity Stream
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase">
                      <th className="py-2 px-2">Time</th>
                      <th className="py-2 px-2">Event</th>
                      <th className="py-2 px-2">Details / Product / Path</th>
                      <th className="py-2 px-2">Device</th>
                      <th className="py-2 px-2">Lang</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {analytics.recentEvents.slice(0, 20).map((ev) => (
                      <tr key={ev.id}>
                        <td className="py-2 px-2 text-slate-500 whitespace-nowrap">
                          {new Date(ev.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="py-2 px-2 font-bold text-slate-900">
                          {ev.type}
                        </td>
                        <td className="py-2 px-2 text-slate-600">
                          {ev.productTitle ||
                            ev.phoneLine ||
                            ev.searchQuery ||
                            ev.divisionId ||
                            ev.path}
                        </td>
                        <td className="py-2 px-2 text-slate-500 capitalize">
                          {ev.device}
                        </td>
                        <td className="py-2 px-2 uppercase font-semibold text-slate-700">
                          {ev.lang}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
