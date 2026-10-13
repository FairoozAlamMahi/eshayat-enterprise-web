"use client";

import React from "react";
import Link from "next/link";
import { RefreshCw, Home, MessageCircle } from "lucide-react";
import { COMPANY_INFO } from "@/data/translations";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[70vh] bg-slate-50 flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full bg-white rounded-3xl border border-slate-200 p-8 shadow-sm text-center space-y-5">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-[#c0272d] font-bold flex items-center justify-center mx-auto text-xl">
          !
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">
          Something Went Wrong
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          We encountered a temporary issue loading this view. Please try
          refreshing, or reach out to our wholesale desk directly on WhatsApp.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-amber-400" />
            <span>Try Again</span>
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold"
          >
            <Home className="w-4 h-4" />
            <span>Home Page</span>
          </Link>
          <a
            href={`https://wa.me/${COMPANY_INFO.whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp Support</span>
          </a>
        </div>
      </div>
    </div>
  );
}
