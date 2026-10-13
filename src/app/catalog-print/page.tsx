"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Printer, ArrowLeft, CheckCircle2, Phone, Mail, MapPin } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { DIVISIONS } from "@/data/divisions";
import { INITIAL_PRODUCTS, Product } from "@/data/initialProducts";
import { COMPANY_INFO } from "@/data/translations";
import { trackEvent } from "@/lib/trackClient";

export default function CatalogPrintPage() {
  const { lang, t } = useLanguage();
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data?.products) && data.products.length > 0) {
          setProducts(data.products);
        }
      })
      .catch(() => {});
  }, []);

  const handlePrint = () => {
    trackEvent({
      type: "pdf_download",
      lang,
    });
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 print:bg-white print:py-0">
      {/* Top Action Bar (Hidden in Print) */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>
            {lang === "en" ? "Back to Catalogue" : "ক্যাটালগে ফিরে যান"}
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md cursor-pointer"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>
              {lang === "en"
                ? "Print / Save as PDF Catalog"
                : "প্রিন্ট / পিডিএফ ক্যাটালগ ডাউনলোড"}
            </span>
          </button>
        </div>
      </div>

      {/* Printable A4 Sheet Container */}
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-2xl print:shadow-none print:rounded-none p-6 sm:p-10 border border-slate-200 print:border-none">
        {/* Letterhead Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b-2 border-slate-900">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-950 p-1">
              <Image
                src="/images/brand/emblem.png"
                alt="M/S Eshayat Enterprise"
                fill
                className="object-contain"
                sizes="64px"
              />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {t(COMPANY_INFO.name)}
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-amber-700">
                {lang === "en"
                  ? "Institutional, Laboratory, PPE, Industrial Safety & MRO Wholesale Supplier"
                  : "ল্যাবরেটরি, পিপিই, ইন্ডাস্ট্রিয়াল সেফটি ও এমআরও পাইকারি ও টেন্ডার সরবরাহকারী"}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {t(COMPANY_INFO.managerName)} ({t(COMPANY_INFO.managerRole)})
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-700 space-y-1.5 sm:text-right sm:max-w-xs">
            <div className="inline-flex sm:justify-end items-center gap-1.5 font-semibold">
              <Phone className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>
                {COMPANY_INFO.phonePrimary} (WhatsApp) |{" "}
                {COMPANY_INFO.phoneSales}
              </span>
            </div>
            <div className="flex sm:justify-end items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>{COMPANY_INFO.email}</span>
            </div>
            <div className="flex sm:justify-end items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span className="text-left sm:text-right">{t(COMPANY_INFO.address)}</span>
            </div>
          </div>
        </div>

        {/* Company Overview & Enlistment Notice */}
        <div className="py-6 border-b border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-2">
              {lang === "en"
                ? "Company Profile & Institutional Enlistment"
                : "কোম্পানি পরিচিতি ও প্রাতিষ্ঠানিক ভেন্ডর তালিকাভুক্তি"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {lang === "en"
                ? "M/S Eshayat Enterprise is a trusted B2B wholesale and institutional tender supplier based in Mirpur, Dhaka. We supply hospitals, diagnostic laboratories, pharmaceutical plants, universities, and industrial factories across Bangladesh. Beyond our core online catalogue, we source 20+ additional brands of safety footwear, clinical furniture, patient beds, and specialized lab instruments to provide the most competitive tender quotations."
                : "মেসার্স এশায়েত এন্টারপ্রাইজ ঢাকার মিরপুরে অবস্থিত একটি নির্ভরযোগ্য B2B পাইকারি ও প্রাতিষ্ঠানিক টেন্ডার সরবরাহকারী প্রতিষ্ঠান। আমরা হাসপাতাল, ডায়াগনস্টিক ল্যাব, ফার্মাসিউটিক্যালস, বিশ্ববিদ্যালয় এবং শিল্প কারখানায় পণ্য সরবরাহ করি। ক্যাটালগের বাইরেও ২০+ অতিরিক্ত ব্র্যান্ডের সেফটি শু, হাসপাতালের বেড ও বিশেষায়িত ল্যাব যন্ত্রপাতি আমরা সবচেয়ে সাশ্রয়ী টেন্ডার দরে সরবরাহ করে থাকি।"}
            </p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
              {lang === "en" ? "6 Core Supply Divisions" : "৬টি প্রধান সরবরাহ বিভাগ"}
            </h3>
            <ul className="space-y-1 text-xs text-slate-700">
              {DIVISIONS.map((d) => (
                <li key={d.id} className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{t(d.name)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Division-by-Division Product Table */}
        <div className="py-6 space-y-8">
          {DIVISIONS.map((div) => {
            const divProducts = products.filter(
              (p) => p.divisionId === div.id
            );
            return (
              <div key={div.id} className="break-inside-avoid">
                <div className="flex items-center justify-between bg-slate-900 text-white px-4 py-2.5 rounded-lg mb-3">
                  <h3 className="text-sm font-bold">{t(div.name)}</h3>
                  <span className="text-[11px] text-amber-400 font-medium">
                    {lang === "en"
                      ? "Wholesale Rate on Inquiry + Custom Brands Available"
                      : "পাইকারি দর আলোচনা সাপেক্ষে + অতিরিক্ত ব্র্যান্ড সোর্সিং"}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 uppercase">
                        <th className="py-2 px-2 w-1/3">
                          {lang === "en" ? "Item / Model" : "পণ্যের নাম"}
                        </th>
                        <th className="py-2 px-2 w-1/4">
                          {lang === "en" ? "Model / Spec" : "মডেল / স্পেক"}
                        </th>
                        <th className="py-2 px-2">
                          {lang === "en"
                            ? "Key Specifications / Standards"
                            : "প্রধান স্পেসিফিকেশন ও মানদণ্ড"}
                        </th>
                        <th className="py-2 px-2 text-right w-28">
                          {lang === "en" ? "Rate" : "মূল্য"}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {divProducts.map((p) => (
                        <tr key={p.slug}>
                          <td className="py-2 px-2 font-bold text-slate-900">
                            {t(p.title)}
                          </td>
                          <td className="py-2 px-2 text-slate-600">{p.model}</td>
                          <td className="py-2 px-2 text-slate-600">
                            {p.certifications.join(", ") ||
                              t(p.shortDescription)}
                          </td>
                          <td className="py-2 px-2 text-right font-semibold text-amber-700">
                            {lang === "en" ? "On Inquiry" : "আলোচনা সাপেক্ষে"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Sign-off */}
        <div className="pt-6 border-t-2 border-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-600">
          <div>
            <p className="font-bold text-slate-900">
              {lang === "en"
                ? "For Tender Enlistment & Bulk Quotations:"
                : "টেন্ডার তালিকাভুক্তি এবং বাল্ক কোটেশনের জন্য:"}
            </p>
            <p>
              Email: <strong>{COMPANY_INFO.email}</strong> | WhatsApp:{" "}
              <strong>{COMPANY_INFO.phonePrimary}</strong> | Direct:{" "}
              <strong>{COMPANY_INFO.phoneSales}</strong>
            </p>
          </div>
          <div className="sm:text-right">
            <p className="font-bold text-slate-900">
              {COMPANY_INFO.managerName.en} — {COMPANY_INFO.managerRole.en}
            </p>
            <p>{COMPANY_INFO.name.en}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
