import type { Metadata } from "next";
import { INITIAL_PRODUCTS } from "@/data/initialProducts";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = INITIAL_PRODUCTS.find(
    (p) => p.slug === slug || p.id === slug
  );

  if (!product) {
    return {
      title: "Product Specification Sheet",
      description:
        "View technical specifications and request wholesale pricing from M/S Eshayat Enterprise, Dhaka.",
    };
  }

  return {
    title: `${product.title.en} (${product.model}) — Wholesale Bangladesh`,
    description: `${product.shortDescription.en} Supplied by M/S Eshayat Enterprise, Mirpur, Dhaka. Request wholesale or tender rate on WhatsApp.`,
    alternates: {
      canonical: `/products/${product.slug}`,
    },
    openGraph: {
      title: `${product.title.en} | M/S Eshayat Enterprise`,
      description: product.shortDescription.en,
      url: `/products/${product.slug}`,
      images: [
        {
          url: product.image,
          alt: product.title.en,
        },
      ],
    },
  };
}

export default function ProductDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
