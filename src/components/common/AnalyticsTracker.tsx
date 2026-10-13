"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/trackClient";

export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    trackEvent({
      type: "pageview",
      path: pathname,
    });
  }, [pathname]);

  return null;
}
