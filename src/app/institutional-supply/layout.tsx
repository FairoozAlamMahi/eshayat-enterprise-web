import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Hospital, Lab & Corporate Tender Enlistment | Custom Brand Indenting",
  description:
    "Enlist M/S Eshayat Enterprise for hospital patient beds, pathology glassware, pharmaceutical QC supplies, and 20+ additional safety shoe brands at competitive tender rates.",
  alternates: {
    canonical: "/institutional-supply",
  },
  openGraph: {
    title:
      "Hospital & Corporate Tender Supply | M/S Eshayat Enterprise Dhaka",
    description:
      "Enlisted institutional vendor for hospitals, pharmaceutical plants, universities, and factories across Bangladesh.",
    url: "/institutional-supply",
  },
};

export default function InstitutionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
