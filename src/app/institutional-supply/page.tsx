"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Hospital,
  FlaskConical,
  Factory,
  CheckCircle2,
  MessageCircle,
  PhoneCall,
  Send,
  FileSpreadsheet,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Layers,
  Printer,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useRfqBasket } from "@/context/RfqBasketContext";
import { COMPANY_INFO } from "@/data/translations";
import { getCustomSourcingWhatsAppUrl } from "@/lib/whatsapp";
import { trackEvent } from "@/lib/trackClient";

export default function InstitutionalSupplyPage() {
  const { lang } = useLanguage();
  const { setIsCallModalOpen } = useRfqBasket();

  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [organizationType, setOrganizationType] = useState("Hospital / Clinic");
  const [notes, setNotes] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleEnlistmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !phone.trim() || !notes.trim()) return;

    setSubmitting(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/rfq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: contactPerson || companyName,
          company: `${companyName} (${organizationType})`,
          phone,
          email,
          location: "Dhaka / Bangladesh",
          inquiryType: "hospital_enlistment",
          message: `[Institutional Tender / Brand Indenting Inquiry]\n${notes}`,
          items: [
            {
              productId: "institutional-tender-indent",
              title: `Institutional / Custom Brand Tender (${organizationType})`,
              model: "Custom Specification",
              quantity: "As per BOQ / Tender",
            },
          ],
          lang,
          website_url_hp: honeypot,
        }),
      });

      if (res.ok) {
        trackEvent({
          type: "rfq_submit",
          lang,
        });
        setSubmittedSuccess(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(
          data.error ||
            (lang === "bn"
              ? "সঠিক মোবাইল নম্বর (১১ ডিজিট) ও তথ্য প্রদান করুন।"
              : "Please enter a valid Bangladesh phone number and required fields.")
        );
      }
    } catch {
      setErrorMsg(
        lang === "bn"
          ? "নেটওয়ার্ক ত্রুটি। অনুগ্রহ করে সরাসরি হোয়াটসঅ্যাপে যোগাযোগ করুন।"
          : "Network error. Please message us directly on WhatsApp."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const sectors = [
    {
      icon: Hospital,
      titleEn: "Hospitals, Clinics & Diagnostic Centers",
      titleBn: "হাসপাতাল, ক্লিনিক ও ডায়াগনস্টিক সেন্টার",
      descEn:
        "We participate in hospital vendor enlistment and email quotation tenders for patient beds, clinical furniture, surgical PPE, autoclaves, and pathology glassware.",
      descBn:
        "রোগীর বেড, ক্লিনিক্যাল ফার্নিচার, সার্জিক্যাল পিপিই, অটোক্লেভ এবং প্যাথলজি গ্লাসওয়্যারের জন্য আমরা হাসপাতাল তালিকাভুক্তি ও ইমেইল দরপত্রে অংশগ্রহণ করি।",
      examplesEn: [
        "Hospital Beds & Ward Furniture",
        "Pathology Lab Glassware",
        "Clinical PPE & Disposables",
      ],
      examplesBn: [
        "হাসপাতালের বেড ও ওয়ার্ড ফার্নিচার",
        "প্যাথলজি ল্যাব গ্লাসওয়্যার",
        "ক্লিনিক্যাল পিপিই ও ডিসপোজেবল",
      ],
    },
    {
      icon: FlaskConical,
      titleEn: "Pharmaceuticals, Universities & Research Labs",
      titleBn: "ফার্মাসিউটিক্যালস, বিশ্ববিদ্যালয় ও গবেষণা ল্যাব",
      descEn:
        "Precision Borosilicate 3.3 glassware, micropipettes, analytical balances, fume hood accessories, and daily QC lab consumables sourced across multiple international brands.",
      descBn:
        "বোরোসিলিকেট ৩.৩ গ্লাসওয়্যার, মাইক্রোপিপেট, অ্যানালিটিক্যাল ব্যালেন্স এবং দৈনিক কিউসি ল্যাব কনজিউমেবলস একাধিক আন্তর্জাতিক ব্র্যান্ড থেকে সরবরাহ।",
      examplesEn: [
        "Volumetric & Graduated Glassware",
        "Digital Lab Instruments",
        "Filtration & Lab Consumables",
      ],
      examplesBn: [
        "ভলিউমেট্রিক ও গ্র্যাজুয়েটেড গ্লাসওয়্যার",
        "ডিজিটাল ল্যাব যন্ত্রপাতি",
        "ফিল্টারেশন ও ল্যাব কনজিউমেবলস",
      ],
    },
    {
      icon: Factory,
      titleEn: "Factories, EPC Contractors & Industrial Plants",
      titleBn: "কারখানা, ইপিসি ঠিকাদার ও ইন্ডাস্ট্রিয়াল প্ল্যান্ট",
      descEn:
        "Bulk safety shoes (across 20+ brands beyond our online display), full body harnesses, gas detectors, Lockout-Tagout (LOTO), firefighting gear, and routine MRO hardware.",
      descBn:
        "বাল্ক সেফটি শু (ওয়েবসাইটের বাইরেও ২০+ ব্র্যান্ড), ফুল বডি হারনেস, গ্যাস ডিটেক্টর, লকআউট-ট্যাগআউট (LOTO), ফায়ার সেফটি এবং নিয়মিত MRO হার্ডওয়্যার সরবরাহ।",
      examplesEn: [
        "Multi-Brand Safety Footwear",
        "Height, Fire & Gas Safety",
        "MRO Hardware & Spill Kits",
      ],
      examplesBn: [
        "মাল্টি-ব্র্যান্ড সেফটি জুতা",
        "হাইট, ফায়ার ও গ্যাস সেফটি",
        "MRO হার্ডওয়্যার ও স্পিল কিট",
      ],
    },
  ];

  const steps = [
    {
      num: "01",
      titleEn: "Enlist Us or Send Your Requisition",
      titleBn: "তালিকাভুক্ত করুন বা চাহিদাপত্র পাঠান",
      descEn:
        "Add M/S Eshayat Enterprise (eshayat.enterprise@outlook.com) to your hospital or corporate procurement mailing list, or send your BOQ via WhatsApp.",
      descBn:
        "আপনার হাসপাতাল বা প্রতিষ্ঠানের প্রকিউরমেন্ট মেইলিং লিস্টে মেসার্স এশায়েত এন্টারপ্রাইজকে যুক্ত করুন অথবা হোয়াটসঅ্যাপে BOQ পাঠান।",
    },
    {
      num: "02",
      titleEn: "Multi-Brand Sourcing & Lowest Wholesale Quote",
      titleBn: "মাল্টি-ব্র্যান্ড সোর্সিং ও সর্বনিম্ন পাইকারি দর",
      descEn:
        "Because we work with an extensive network of importers and manufacturers, we compare multiple origins to submit the most competitive wholesale quotation.",
      descBn:
        "আমাদের বিস্তৃত আমদানিকারক ও প্রস্তুতকারক নেটওয়ার্ক থেকে একাধিক ব্র্যান্ডের তুলনা করে আমরা সবচেয়ে সাশ্রয়ী পাইকারি দরপত্র জমা দিই।",
    },
    {
      num: "03",
      titleEn: "Sample Approval & Institutional Delivery",
      titleBn: "স্যাম্পল অনুমোদন ও প্রাতিষ্ঠানিক ডেলিভারি",
      descEn:
        "Inspect physical samples or technical datasheets for your tender committee approval before final bulk supply to your store or project site.",
      descBn:
        "চূড়ান্ত বাল্ক সরবরাহের আগে আপনার টেন্ডার কমিটির অনুমোদনের জন্য সরাসরি স্যাম্পল বা টেকনিক্যাল ডাটাশিট যাচাই করুন।",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Hero Header */}
      <section className="bg-slate-950 text-white py-14 sm:py-20 border-b border-slate-800 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-semibold mb-4">
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {lang === "en"
                ? "Hospital, Lab & Corporate Vendor Enlistment"
                : "হাসপাতাল, ল্যাব ও কর্পোরেট ভেন্ডর তালিকাভুক্তি"}
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight max-w-3xl leading-tight mb-4">
            {lang === "en"
              ? "Competitive Institutional Tenders & Custom Brand Sourcing"
              : "প্রতিযোগিতামূলক প্রাতিষ্ঠানিক টেন্ডার ও কাস্টম ব্র্যান্ড সোর্সিং"}
          </h1>
          <p className="text-slate-300 text-base sm:text-lg max-w-3xl leading-relaxed mb-8">
            {lang === "en"
              ? "What you see on our website is only a showcase of our core divisions. Through our direct importer and supply network in Dhaka, we source 20+ additional brands of safety footwear, hospital beds, laboratory instruments, and MRO supplies to help your institution secure the best specification at the lowest tender rate."
              : "আমাদের ওয়েবসাইটে প্রদর্শিত পণ্যগুলো আমাদের মূল বিভাগগুলোর একটি নমুনা মাত্র। ঢাকার প্রত্যক্ষ আমদানিকারক ও সাপ্লাই নেটওয়ার্কের মাধ্যমে আমরা ২০+ অতিরিক্ত ব্র্যান্ডের সেফটি শু, হাসপাতালের বেড, ল্যাবরেটরি যন্ত্রপাতি এবং MRO সামগ্রী সবচেয়ে সাশ্রয়ী টেন্ডার দরে সরবরাহ করে থাকি।"}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="#tender-form"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-colors shadow-lg shadow-amber-500/20"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>
                {lang === "en"
                  ? "Send Tender / BOQ Inquiry"
                  : "টেন্ডার / BOQ পাঠান"}
              </span>
            </a>
            <a
              href={getCustomSourcingWhatsAppUrl(
                "Institutional Tender & Custom Sourcing",
                lang
              )}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                trackEvent({
                  type: "whatsapp_click",
                  lang,
                })
              }
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>
                {lang === "en"
                  ? "WhatsApp Direct: 01862-679456"
                  : "হোয়াটসঅ্যাপ: ০১৮৬২-৬৭৯৪৫৬"}
              </span>
            </a>
            <button
              onClick={() => setIsCallModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-sm border border-slate-700 transition-colors cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 text-amber-400" />
              <span>
                {lang === "en" ? "Call Efaz Alam / Office" : "সরাসরি কল করুন"}
              </span>
            </button>
            <Link
              href="/catalog-print"
              onClick={() =>
                trackEvent({
                  type: "catalog_pdf_print",
                  lang,
                })
              }
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-semibold text-sm border border-amber-500/30 transition-colors"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>
                {lang === "en"
                  ? "Print Vendor Profile & Catalog (PDF)"
                  : "ভেন্ডর প্রোফাইল ও ক্যাটালগ (PDF)"}
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Unlisted Brands Matter Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 relative z-20 mb-14">
        <div className="bg-white rounded-2xl border-2 border-amber-300 shadow-xl p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-3 py-1 rounded-full mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>
                {lang === "en"
                  ? "Beyond The Online Catalogue"
                  : "অনলাইন ক্যাটালগের বাইরেও"}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
              {lang === "en"
                ? "Need a Specific Brand or Budget Model Not Shown on Our Website?"
                : "ওয়েবসাইটে নেই এমন কোনো নির্দিষ্ট ব্র্যান্ড বা বাজেট মডেল প্রয়োজন?"}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              {lang === "en"
                ? "For example, while our website showcases 3 core models of industrial safety shoes, we actively supply dozens of additional certified brands and price tiers upon request. Similarly, when enlisted with hospitals, we quote across clinical beds, trolleys, and specialized lab consumables tailored to your exact tender budget."
                : "উদাহরণস্বরূপ, আমাদের ওয়েবসাইটে সেফটি শু-এর ৩টি মূল মডেল প্রদর্শিত হলেও আমরা চাহিদা অনুযায়ী আরও ডজনখানেক ব্র্যান্ড ও বাজেট রেঞ্জের জুতা সরবরাহ করি। একইভাবে, হাসপাতালে তালিকাভুক্ত ভেন্ডর হিসেবে আমরা আপনার নির্দিষ্ট বাজেট অনুযায়ী রোগীর বেড, ট্রলি ও বিশেষায়িত ল্যাব সামগ্রীর দরপত্র প্রদান করি।"}
            </p>
          </div>
          <div className="lg:col-span-4 bg-slate-900 text-white rounded-xl p-5 border border-slate-800">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2">
              {lang === "en" ? "Official Tender Email" : "অফিসিয়াল টেন্ডার ইমেইল"}
            </p>
            <p className="font-mono text-sm sm:text-base font-bold text-white break-all mb-3">
              {COMPANY_INFO.email}
            </p>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              {lang === "en"
                ? "Include our email in your hospital or corporate procurement circular to receive prompt competitive quotations."
                : "দ্রুত ও সাশ্রয়ী দরপত্র পেতে আপনার প্রতিষ্ঠানের প্রকিউরমেন্ট তালিকায় আমাদের ইমেইলটি যুক্ত রাখুন।"}
            </p>
            <Link
              href="/catalog-print"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300"
            >
              <span>
                {lang === "en"
                  ? "Download Company Profile PDF"
                  : "কোম্পানি প্রোফাইল পিডিএফ ডাউনলোড"}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 3 Institutional Sectors */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-16">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
            {lang === "en"
              ? "Institutions We Serve & Enlist With"
              : "যেসব প্রতিষ্ঠানে আমরা সরবরাহ ও তালিকাভুক্ত হই"}
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            {lang === "en"
              ? "Dedicated B2B fulfillment across healthcare, scientific research, and industrial manufacturing."
              : "স্বাস্থ্যসেবা, বৈজ্ঞানিক গবেষণা এবং শিল্প কারখানায় নিবেদিত B2B সরবরাহ।"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sectors.map((sec, idx) => {
            const Icon = sec.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {lang === "en" ? sec.titleEn : sec.titleBn}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-5">
                    {lang === "en" ? sec.descEn : sec.descBn}
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  {(lang === "en" ? sec.examplesEn : sec.examplesBn).map(
                    (ex, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-xs font-medium text-slate-700"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{ex}</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How Our Tender Process Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-16">
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-10">
          <div className="max-w-2xl mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
              {lang === "en" ? "Procurement Workflow" : "প্রকিউরমেন্ট প্রক্রিয়া"}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold mt-1">
              {lang === "en"
                ? "How Hospital & Corporate Enlistment Works"
                : "হাসপাতাল ও কর্পোরেট টেন্ডার প্রক্রিয়া যেভাবে কাজ করে"}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((st) => (
              <div
                key={st.num}
                className="bg-slate-950/60 border border-slate-800 rounded-xl p-5"
              >
                <span className="text-2xl font-black text-amber-400 font-mono">
                  {st.num}
                </span>
                <h3 className="text-base font-bold text-white mt-2 mb-2">
                  {lang === "en" ? st.titleEn : st.titleBn}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {lang === "en" ? st.descEn : st.descBn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Direct Tender & Vendor Enlistment Form */}
      <section id="tender-form" className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10">
          <div className="flex items-center gap-3 mb-2">
            <Layers className="w-6 h-6 text-amber-600" />
            <h2 className="text-2xl font-bold text-slate-900">
              {lang === "en"
                ? "Submit Institutional RFQ or Vendor Enlistment Request"
                : "প্রাতিষ্ঠানিক দরপত্র (RFQ) বা ভেন্ডর তালিকাভুক্তির অনুরোধ পাঠান"}
            </h2>
          </div>
          <p className="text-sm text-slate-600 mb-6">
            {lang === "en"
              ? "Your inquiry is saved directly in our tender inbox and dispatched to eshayat.enterprise@outlook.com."
              : "আপনার বার্তাটি সরাসরি আমাদের টেন্ডার ইনবক্সে এবং eshayat.enterprise@outlook.com ইমেইলে পৌঁছে যাবে।"}
          </p>

          {submittedSuccess ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="text-xl font-bold text-slate-900">
                {lang === "en"
                  ? "Institutional Inquiry Received!"
                  : "আপনার প্রাতিষ্ঠানিক অনুরোধ গৃহীত হয়েছে!"}
              </h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                {lang === "en"
                  ? "Efaz Alam (Business Manager) will review your requirements and respond with a competitive quotation."
                  : "ইফাজ আলম (বিজনেস ম্যানেজার) আপনার চাহিদা পর্যালোচনা করে দ্রুত সাশ্রয়ী দরপত্র পাঠাবেন।"}
              </p>
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <a
                  href={getCustomSourcingWhatsAppUrl(
                    `${companyName} (${organizationType}) - ${notes}`,
                    lang
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>
                    {lang === "en"
                      ? "Also Send via WhatsApp (01862-679456)"
                      : "হোয়াটসঅ্যাপেও পাঠান (০১৮৬২-৬৭৯৪৫৬)"}
                  </span>
                </a>
                <button
                  onClick={() => {
                    setSubmittedSuccess(false);
                    setNotes("");
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-100 cursor-pointer"
                >
                  {lang === "en" ? "Submit Another" : "আরেকটি পাঠান"}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleEnlistmentSubmit} className="space-y-4">
              {/* Honeypot */}
              <input
                type="text"
                name="website_url_hp"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {lang === "en"
                      ? "Institution / Company Name *"
                      : "প্রতিষ্ঠানের নাম *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder={
                      lang === "en"
                        ? "e.g. Square Hospital / ABC Pharma"
                        : "যেমন: হাসপাতাল / ফার্মা / ফ্যাক্টরি"
                    }
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {lang === "en" ? "Organization Sector" : "প্রতিষ্ঠানের ধরন"}
                  </label>
                  <select
                    value={organizationType}
                    onChange={(e) => setOrganizationType(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-slate-900 bg-white"
                  >
                    <option value="Hospital / Clinic">
                      {lang === "en"
                        ? "Hospital / Diagnostic / Clinic"
                        : "হাসপাতাল / ডায়াগনস্টিক / ক্লিনিক"}
                    </option>
                    <option value="Pharmaceutical / Research Lab">
                      {lang === "en"
                        ? "Pharmaceutical / QC / Research Lab"
                        : "ফার্মাসিউটিক্যাল / গবেষণা ল্যাব"}
                    </option>
                    <option value="Factory / Industrial Plant">
                      {lang === "en"
                        ? "Factory / EPC / Industrial Plant"
                        : "কারখানা / ইন্ডাস্ট্রিয়াল প্ল্যান্ট"}
                    </option>
                    <option value="Government / NGO / University">
                      {lang === "en"
                        ? "University / NGO / Govt Tender"
                        : "বিশ্ববিদ্যালয় / এনজিও / সরকারি টেন্ডার"}
                    </option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {lang === "en" ? "Contact Person" : "যোগাযোগকারীর নাম"}
                  </label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder={
                      lang === "en"
                        ? "Procurement Officer / Manager"
                        : "প্রকিউরমেন্ট অফিসার / ম্যানেজার"
                    }
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {lang === "en" ? "Phone / WhatsApp *" : "ফোন / হোয়াটসঅ্যাপ *"}
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {lang === "en" ? "Official Email" : "অফিসিয়াল ইমেইল"}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="procurement@company.com"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === "en"
                    ? "Required Items, Unlisted Brands, or Vendor Enlistment Details *"
                    : "প্রয়োজনীয় পণ্যের তালিকা, ব্র্যান্ড বা টেন্ডার বিবরণ *"}
                </label>
                <textarea
                  rows={4}
                  required
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={
                    lang === "en"
                      ? "List required items (e.g., 20 Hospital Patient Beds, 100 pairs Safety Shoes within budget, Lab Glassware BOQ, or how to enlist M/S Eshayat Enterprise in your vendor panel)..."
                      : "প্রয়োজনীয় পণ্যের নাম, পরিমাণ, নির্দিষ্ট ব্র্যান্ড বা ভেন্ডর তালিকাভুক্তির বিস্তারিত লিখুন..."
                  }
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-slate-900"
                />
              </div>

              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm font-semibold text-red-700">
                  {errorMsg}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    {lang === "en"
                      ? "Direct response from Efaz Alam (Business Manager)"
                      : "সরাসরি উত্তর দেবেন ইফাজ আলম (বিজনেস ম্যানেজার)"}
                  </span>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4 text-amber-400" />
                  <span>
                    {submitting
                      ? lang === "en"
                        ? "Submitting..."
                        : "পাঠানো হচ্ছে..."
                      : lang === "en"
                      ? "Submit Tender / RFQ"
                      : "টেন্ডার / RFQ জমা দিন"}
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
