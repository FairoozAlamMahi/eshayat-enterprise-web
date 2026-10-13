"use client";

export type ClientEventType =
  | "pageview"
  | "product_view"
  | "whatsapp_click"
  | "call_click"
  | "rfq_submit"
  | "search_query"
  | "pdf_download"
  | "language_switch"
  | "division_filter";

export function trackEvent(payload: {
  type: ClientEventType;
  path?: string;
  productId?: string;
  productTitle?: string;
  divisionId?: string;
  phoneLine?: "01862-679456" | "01309-816266";
  searchQuery?: string;
  lang?: "en" | "bn";
}): void {
  if (typeof window === "undefined") return;
  const isMobile = window.innerWidth < 768;
  const savedLang = (localStorage.getItem("eshayat_lang") as "en" | "bn") || "en";

  fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...payload,
      path: payload.path || window.location.pathname,
      lang: payload.lang || savedLang,
      device: isMobile ? "mobile" : "desktop",
    }),
  }).catch(() => {
    // Non-blocking analytics
  });
}
