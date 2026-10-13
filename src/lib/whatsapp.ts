import { COMPANY_INFO } from "@/data/translations";
import { Product } from "@/data/initialProducts";

export interface RfqBasketItem {
  product: Product;
  quantityNote: string;
}

export function getProductWhatsAppUrl(
  product: Product,
  lang: "en" | "bn",
  quantityNote?: string
): string {
  const qtyText = quantityNote?.trim() || "";
  const message =
    lang === "bn"
      ? `আসসালামু আলাইকুম এম/এস এশায়াত এন্টারপ্রাইজ,\nআমি আপনাদের ওয়েবসাইট থেকে নিচের পণ্যটির পাইকারি দর ও স্টক সম্পর্কে জানতে চাচ্ছি:\n\n📦 পণ্যের নাম: ${product.title.bn} (${product.title.en})\n🔖 মডেল/স্পেক: ${product.model}\n📍 ডেলিভারি লোকেশন: \n🔢 আনুমানিক পরিমাণ: ${qtyText}`
      : `Hello M/S Eshayat Enterprise,\nI am inquiring from your website regarding wholesale availability and rate for:\n\n📦 Product: ${product.title.en}\n🔖 Model/Spec: ${product.model}\n📍 Delivery Location: \n🔢 Estimated Quantity: ${qtyText}`;

  return `https://wa.me/${COMPANY_INFO.whatsappNumber}?text=${encodeURIComponent(
    message
  )}`;
}

export function getBasketWhatsAppUrl(
  items: RfqBasketItem[],
  lang: "en" | "bn",
  buyerInfo?: {
    name?: string;
    company?: string;
    phone?: string;
    location?: string;
    notes?: string;
  }
): string {
  const itemLines = items
    .map(
      (item, idx) =>
        `${idx + 1}. ${
          lang === "bn" ? item.product.title.bn : item.product.title.en
        } (${item.product.model}) — Qty: ${item.quantityNote || "Wholesale"}`
    )
    .join("\n");

  const header =
    lang === "bn"
      ? `আসসালামু আলাইকুম এম/এস এশায়াত এন্টারপ্রাইজ,\nআমি নিচের পণ্যগুলোর জন্য একটি পাইকারি কোটেশন (RFQ) চাচ্ছি:\n\n`
      : `Hello M/S Eshayat Enterprise,\nPlease provide a wholesale quotation (RFQ) for the following items:\n\n`;

  const footer = buyerInfo
    ? `\n\n👤 Name: ${buyerInfo.name || "-"}\n🏢 Organization: ${
        buyerInfo.company || "-"
      }\n📞 Phone: ${buyerInfo.phone || "-"}\n📍 Location: ${
        buyerInfo.location || "-"
      }${buyerInfo.notes ? `\n📝 Note: ${buyerInfo.notes}` : ""}`
    : `\n\n🏢 Organization/Company: \n📍 Delivery Location: `;

  return `https://wa.me/${COMPANY_INFO.whatsappNumber}?text=${encodeURIComponent(
    header + itemLines + footer
  )}`;
}

export function getCustomSourcingWhatsAppUrl(
  divisionName: string,
  lang: "en" | "bn"
): string {
  const message =
    lang === "bn"
      ? `আসসালামু আলাইকুম এম/এস এশায়াত এন্টারপ্রাইজ,\nআমি "${divisionName}" বিভাগের আওতায় একটি নির্দিষ্ট ব্র্যান্ড/মডেল বা প্রাতিষ্ঠানিক টেন্ডার পণ্যের পাইকারি সোর্সিং সম্পর্কে জানতে চাচ্ছি।\n\nপণ্যের বিবরণ: \nআনুমানিক পরিমাণ: `
      : `Hello M/S Eshayat Enterprise,\nI am looking to source a specific brand/model or institutional tender item under "${divisionName}".\n\nProduct / Brand Required: \nEstimated Quantity: `;

  return `https://wa.me/${COMPANY_INFO.whatsappNumber}?text=${encodeURIComponent(
    message
  )}`;
}
