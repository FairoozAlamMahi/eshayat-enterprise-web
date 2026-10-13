import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter, Noto_Sans_Bengali } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { RfqBasketProvider } from "@/context/RfqBasketContext";
import { TopBar } from "@/components/layout/TopBar";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileThumbBar } from "@/components/layout/MobileThumbBar";
import { CallPickerModal } from "@/components/rfq/CallPickerModal";
import { RfqDrawer } from "@/components/rfq/RfqDrawer";
import { AnalyticsTracker } from "@/components/common/AnalyticsTracker";
import { COMPANY_INFO } from "@/data/translations";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

const bengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  variable: "--font-bengali",
  weight: ["400", "500", "600", "700"],
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://eshayatenterprise.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      "M/S Eshayat Enterprise | Lab Glassware, PPE, Industrial Safety & Hospital Supply in Bangladesh",
    template: "%s | M/S Eshayat Enterprise",
  },
  description:
    "M/S Eshayat Enterprise (East Shewrapara, Mirpur, Dhaka-1216) — Direct importer, wholesaler & enlisted institutional vendor of Lab Glassware, Scientific Instruments, PPE, Safety Shoes, Industrial Safety, MRO & Hospital Supply across Bangladesh.",
  keywords: [
    "M/S Eshayat Enterprise",
    "Eshayat Enterprise Dhaka",
    "safety shoes wholesale price in bangladesh",
    "PPE supplier in dhaka mirpur",
    "laboratory glassware supplier bangladesh",
    "Schott Duran reagent bottle bd",
    "hospital bed tender supplier bangladesh",
    "1000V electrical safety gloves bd",
    "SAFT LS 17500 lithium battery bangladesh",
    "সেফটি সুজ পাইকারি ঢাকা",
    "ল্যাবরেটরি গ্লাসওয়্যার বাংলাদেশ",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title:
      "M/S Eshayat Enterprise — Wholesale Lab, PPE, Safety & Hospital Supplier",
    description:
      "Quality Products • Reliable Service • Total Safety Solutions. Request wholesale quotes and institutional tender pricing in Dhaka, Bangladesh.",
    url: SITE_URL,
    siteName: "M/S Eshayat Enterprise",
    type: "website",
    locale: "en_BD",
    images: [
      {
        url: "/images/brand/fb-cover.png",
        width: 1200,
        height: 630,
        alt: "M/S Eshayat Enterprise — Lab Glassware, PPE, Industrial Safety & Institutional Supplier",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "M/S Eshayat Enterprise | Lab Glassware, PPE & Industrial Safety Wholesale",
    description:
      "Direct importer, wholesaler & enlisted institutional vendor serving hospitals, labs, and factories in Bangladesh.",
    images: ["/images/brand/fb-cover.png"],
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WholesaleStore",
    name: "M/S Eshayat Enterprise",
    alternateName: "এম/এস এশায়াত এন্টারপ্রাইজ",
    url: SITE_URL,
    logo: `${SITE_URL}/images/brand/emblem.png`,
    image: `${SITE_URL}/images/brand/fb-cover.png`,
    description:
      "Wholesale importer and enlisted institutional supplier of Lab Glassware, Scientific Instruments, PPE Products, Industrial Safety Items, MRO Items, and General Supply Solutions in Dhaka, Bangladesh.",
    telephone: [COMPANY_INFO.phonePrimaryRaw, COMPANY_INFO.phoneSalesRaw],
    email: COMPANY_INFO.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: "1035/1, East Shewrapara, Mirpur, Kafrul PS",
      addressLocality: "Dhaka",
      postalCode: "1216",
      addressCountry: "BD",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 23.7925,
      longitude: 90.3755,
    },
    sameAs: [COMPANY_INFO.facebookUrl],
  };

  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${inter.variable} ${bengali.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased overflow-x-clip">
        <LanguageProvider>
          <RfqBasketProvider>
            <AnalyticsTracker />
            <TopBar />
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <MobileThumbBar />
            <CallPickerModal />
            <RfqDrawer />
          </RfqBasketProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
