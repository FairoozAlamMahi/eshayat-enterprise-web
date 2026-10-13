import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Printable PDF Company Profile & Product Catalogue",
  description:
    "Download or print the official A4 Company Profile and 6-Division Wholesale Product Catalogue of M/S Eshayat Enterprise for tender and procurement committees.",
  alternates: {
    canonical: "/catalog-print",
  },
};

export default function CatalogPrintLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
