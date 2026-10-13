import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getProducts, saveProduct, deleteProduct } from "@/lib/db";
import { Product } from "@/data/initialProducts";
import {
  isAdminRequestAuthorized,
  sanitizeText,
  validateBase64Image,
} from "@/lib/security";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export async function GET() {
  const products = getProducts();
  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  if (!isAdminRequestAuthorized(req)) {
    return NextResponse.json(
      { error: "Unauthorized admin access" },
      { status: 401 }
    );
  }

  const ip = getClientIp(req);
  const rate = checkRateLimit(`products-write:${ip}`, 30, 10 * 60 * 1000);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again shortly." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();

    // Validate optional base64 image upload (MIME whitelist, magic bytes, <= 5MB)
    let imagePath =
      sanitizeText(body.image, 300) || "/images/products/reagent-bottle.jpg";

    if (body.imageBase64 && typeof body.imageBase64 === "string") {
      if (body.imageBase64.startsWith("data:image/")) {
        const validation = validateBase64Image(body.imageBase64);
        if (!validation.valid || !validation.buffer || !validation.ext) {
          return NextResponse.json(
            { error: validation.error || "Invalid image file" },
            { status: 400 }
          );
        }
        const safeName = `upload-${Date.now()}.${validation.ext}`;
        const uploadDir = path.join(
          process.cwd(),
          "public",
          "images",
          "products"
        );
        fs.mkdirSync(uploadDir, { recursive: true });
        fs.writeFileSync(path.join(uploadDir, safeName), validation.buffer);
        imagePath = `/images/products/${safeName}`;
      }
    }

    const titleEn = sanitizeText(
      body.title?.en || body.titleEn || "New Product",
      200
    );
    const titleBn = sanitizeText(
      body.title?.bn || body.titleBn || titleEn,
      200
    );

    const rawSlug = sanitizeText(body.slug, 160);
    const slug =
      rawSlug ||
      titleEn
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") +
        "-" +
        Date.now().toString().slice(-4);

    const product: Product = {
      id: sanitizeText(body.id, 100) || `prod-${Date.now()}`,
      slug,
      title: { en: titleEn, bn: titleBn },
      model: sanitizeText(body.model || "Wholesale Standard", 120),
      brand: sanitizeText(body.brand || "M/S Eshayat Enterprise", 120),
      divisionId: body.divisionId || "ppe-products",
      subcategoryId: sanitizeText(body.subcategoryId || "safety-footwear", 100),
      image: imagePath,
      status: body.status || "in_stock",
      certifications: Array.isArray(body.certifications)
        ? body.certifications.map((c: unknown) => sanitizeText(c, 80)).filter(Boolean)
        : sanitizeText(body.certifications || "Quality Checked", 300)
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean),
      shortDescription: {
        en: sanitizeText(
          body.shortDescription?.en || body.shortDescEn || titleEn,
          600
        ),
        bn: sanitizeText(
          body.shortDescription?.bn || body.shortDescBn || titleBn,
          600
        ),
      },
      features: {
        en: Array.isArray(body.features?.en)
          ? body.features.en.map((f: unknown) => sanitizeText(f, 300)).filter(Boolean)
          : sanitizeText(body.featuresEn || "", 1500)
              .split("\n")
              .map((s: string) => s.trim())
              .filter(Boolean),
        bn: Array.isArray(body.features?.bn)
          ? body.features.bn.map((f: unknown) => sanitizeText(f, 300)).filter(Boolean)
          : sanitizeText(body.featuresBn || "", 1500)
              .split("\n")
              .map((s: string) => s.trim())
              .filter(Boolean),
      },
      specs: body.specs && typeof body.specs === "object" ? body.specs : {},
      featured: Boolean(body.featured),
      views: typeof body.views === "number" ? body.views : 1,
      whatsappClicks:
        typeof body.whatsappClicks === "number" ? body.whatsappClicks : 0,
      createdAt: sanitizeText(body.createdAt, 60) || new Date().toISOString(),
    };

    const saved = saveProduct(product);
    return NextResponse.json({ product: saved });
  } catch {
    return NextResponse.json(
      { error: "Failed to save product" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  if (!isAdminRequestAuthorized(req)) {
    return NextResponse.json(
      { error: "Unauthorized admin access" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const id = sanitizeText(searchParams.get("id"), 120);
  if (!id) {
    return NextResponse.json({ error: "Missing product id" }, { status: 400 });
  }

  const deleted = deleteProduct(id);
  return NextResponse.json({ deleted });
}
