import { NextRequest, NextResponse } from "next/server";
import {
  addRfqLead,
  readDb,
  updateRfqLeadStatus,
  recordAnalyticsEvent,
} from "@/lib/db";
import { COMPANY_INFO } from "@/data/translations";
import {
  isAdminRequestAuthorized,
  isValidEmail,
  isValidPhone,
  sanitizeText,
} from "@/lib/security";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export async function GET(req: NextRequest) {
  if (!isAdminRequestAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = readDb();
  return NextResponse.json({ rfqLeads: db.rfqLeads });
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rate = checkRateLimit(`rfq-submit:${ip}`, 15, 10 * 60 * 1000);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many quotation requests. Please wait a few minutes." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();

    // Silent Honeypot check to block spam bots
    if (body.website_url_hp) {
      return NextResponse.json({ ok: true, spamFiltered: true });
    }

    const name = sanitizeText(body.name, 120);
    const phone = sanitizeText(body.phone, 30);
    const email = sanitizeText(body.email, 160);

    if (!name || !phone) {
      return NextResponse.json(
        { error: "Name and Phone are required." },
        { status: 400 }
      );
    }

    if (!isValidPhone(phone)) {
      return NextResponse.json(
        { error: "Please enter a valid phone or WhatsApp number." },
        { status: 400 }
      );
    }

    if (email && !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const sanitizedItems = Array.isArray(body.items)
      ? body.items.slice(0, 50).map((item: Record<string, unknown>) => ({
          productId: sanitizeText(item.productId || item.slug, 100) || "item",
          title: sanitizeText(item.title || item.titleEn, 200) || "Product",
          model: sanitizeText(item.model, 100) || "Wholesale",
          quantity: sanitizeText(item.quantity, 80) || "Inquiry",
        }))
      : [];

    const savedLead = addRfqLead({
      name,
      company:
        sanitizeText(body.company, 160) || "Individual / Corporate Buyer",
      phone,
      email,
      location: sanitizeText(body.location, 160) || "Dhaka, Bangladesh",
      inquiryType:
        body.inquiryType === "hospital_enlistment" ||
        body.inquiryType === "custom_sourcing"
          ? body.inquiryType
          : "wholesale_quote",
      items: sanitizedItems,
      message: sanitizeText(body.message, 2000),
      lang: body.lang === "bn" ? "bn" : "en",
    });

    recordAnalyticsEvent({
      type: "rfq_submit",
      lang: body.lang === "bn" ? "bn" : "en",
      device: "mobile",
    });

    // Optional instant email dispatch to eshayat.enterprise@outlook.com via Web3Forms if configured
    if (process.env.WEB3FORMS_ACCESS_KEY) {
      await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: process.env.WEB3FORMS_ACCESS_KEY,
          subject: `New B2B Quotation Request from ${savedLead.company} (${savedLead.name})`,
          from_name: "M/S Eshayat Enterprise Website",
          to: COMPANY_INFO.email,
          name: savedLead.name,
          company: savedLead.company,
          phone: savedLead.phone,
          email: savedLead.email || "Not provided",
          location: savedLead.location,
          items: savedLead.items
            .map((i) => `${i.title} (${i.model}) - Qty: ${i.quantity}`)
            .join("\n"),
          message: savedLead.message,
        }),
      }).catch(() => {});
    }

    return NextResponse.json({
      ok: true,
      lead: savedLead,
      recipientEmail: COMPANY_INFO.email,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to submit quotation request" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  if (!isAdminRequestAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const id = sanitizeText(body.id, 100);
    const status =
      body.status === "contacted" || body.status === "quoted"
        ? body.status
        : "new";
    const updated = updateRfqLeadStatus(id, status);
    return NextResponse.json({ lead: updated });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
