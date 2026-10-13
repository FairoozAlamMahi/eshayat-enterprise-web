import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Contact & Wholesale Quotation — East Shewrapara, Mirpur, Dhaka-1216",
  description:
    "Contact M/S Eshayat Enterprise (1035/1, East Shewrapara, Mirpur, Dhaka-1216). Call 01862-679456 (WhatsApp) or 01309-816266 (Efaz Alam, Business Manager).",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact M/S Eshayat Enterprise | Mirpur, Dhaka-1216",
    description:
      "Direct wholesale & institutional tender desk. Reach Efaz Alam (Business Manager) or send an official RFQ.",
    url: "/contact",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
