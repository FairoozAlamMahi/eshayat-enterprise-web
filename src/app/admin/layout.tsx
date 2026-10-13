import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Management Portal",
  description:
    "Protected management portal for M/S Eshayat Enterprise product catalogue, RFQ tender inbox, and visitor analytics.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
