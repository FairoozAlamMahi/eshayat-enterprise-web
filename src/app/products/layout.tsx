import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Wholesale Product Catalogue — Lab Glassware, PPE, Safety Shoes & MRO Items",
  description:
    "Browse the 6 official wholesale divisions of M/S Eshayat Enterprise in Dhaka: Lab Glassware, Lab Consumables, PPE Products, Industrial Safety, MRO Items, and Hospital Supply.",
  alternates: {
    canonical: "/products",
  },
  openGraph: {
    title: "Wholesale Product & Supply Catalogue | M/S Eshayat Enterprise",
    description:
      "Filter across 6 official supply divisions and request instant WhatsApp or multi-item B2B quotations.",
    url: "/products",
  },
};

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
