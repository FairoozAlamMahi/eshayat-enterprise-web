import fs from "fs";
import path from "path";
import { INITIAL_PRODUCTS, Product } from "@/data/initialProducts";

export interface RfqLead {
  id: string;
  name: string;
  company: string;
  phone: string;
  email?: string;
  location: string;
  inquiryType: "wholesale_quote" | "hospital_enlistment" | "custom_sourcing";
  items: { productId: string; title: string; model: string; quantity: string }[];
  message: string;
  status: "new" | "contacted" | "quoted";
  lang: "en" | "bn";
  createdAt: string;
}

export interface AnalyticsEvent {
  id: string;
  type:
    | "pageview"
    | "product_view"
    | "whatsapp_click"
    | "call_click"
    | "rfq_submit"
    | "search_query"
    | "pdf_download"
    | "language_switch"
    | "division_filter";
  path?: string;
  productId?: string;
  productTitle?: string;
  divisionId?: string;
  phoneLine?: "01862-679456" | "01309-816266";
  searchQuery?: string;
  lang: "en" | "bn";
  device: "mobile" | "desktop";
  timestamp: string;
}

export interface DatabaseSchema {
  products: Product[];
  rfqLeads: RfqLead[];
  analyticsEvents: AnalyticsEvent[];
  counters: {
    totalPageviews: number;
    mobileVisits: number;
    desktopVisits: number;
    enViews: number;
    bnViews: number;
    whatsappClicks: number;
    callClicksLine1: number; // 01862-679456
    callClicksLine2: number; // 01309-816266 (Efaz Alam)
    rfqSubmissions: number;
    pdfDownloads: number;
  };
}

const DB_FILE_PATH = path.join(process.cwd(), "src", "data", "db.json");

function getInitialDb(): DatabaseSchema {
  return {
    products: INITIAL_PRODUCTS.map((p) => ({
      ...p,
      views: p.featured ? 18 : 7,
      whatsappClicks: p.featured ? 5 : 2,
    })),
    rfqLeads: [
      {
        id: "rfq-sample-1",
        name: "Procurement Officer (Sample Lead)",
        company: "Square / Lab Diagnostic Center",
        phone: "01711-000000",
        email: "procurement@example-hospital.com",
        location: "Mirpur, Dhaka",
        inquiryType: "hospital_enlistment",
        items: [
          {
            productId: "prod-schott-duran-reagent-bottles",
            title: "Laboratory Borosilicate Reagent Bottles (Clear & Amber)",
            model: "250mL & 500mL Screw Cap",
            quantity: "200 pcs",
          },
          {
            productId: "prod-sterile-petri-dishes-bkmam",
            title: "Sterile Disposable Polystyrene Petri Dishes",
            model: "90mm×15mm",
            quantity: "5 Cartons",
          },
        ],
        message:
          "Sample institutional inquiry: Please send your wholesale quotation and enlistment profile for our pathology lab.",
        status: "new",
        lang: "en",
        createdAt: "2026-10-12T09:30:00Z",
      },
    ],
    analyticsEvents: [],
    counters: {
      totalPageviews: 142,
      mobileVisits: 98,
      desktopVisits: 44,
      enViews: 86,
      bnViews: 56,
      whatsappClicks: 34,
      callClicksLine1: 19,
      callClicksLine2: 14,
      rfqSubmissions: 1,
      pdfDownloads: 11,
    },
  };
}

export function readDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_FILE_PATH)) {
      const initial = getInitialDb();
      fs.mkdirSync(path.dirname(DB_FILE_PATH), { recursive: true });
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(initial, null, 2), "utf-8");
      return initial;
    }
    const raw = fs.readFileSync(DB_FILE_PATH, "utf-8");
    const parsed = JSON.parse(raw) as DatabaseSchema;
    if (!parsed.products || parsed.products.length === 0) {
      parsed.products = INITIAL_PRODUCTS;
    }
    return parsed;
  } catch {
    return getInitialDb();
  }
}

export function writeDb(data: DatabaseSchema): void {
  try {
    fs.mkdirSync(path.dirname(DB_FILE_PATH), { recursive: true });
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch {
    // Silent fallback on read-only filesystem
  }
}

export function getProducts(): Product[] {
  const db = readDb();
  return db.products;
}

export function getProductBySlug(slug: string): Product | undefined {
  const db = readDb();
  return db.products.find((p) => p.slug === slug || p.id === slug);
}

export function saveProduct(product: Product): Product {
  const db = readDb();
  const idx = db.products.findIndex((p) => p.id === product.id);
  if (idx >= 0) {
    db.products[idx] = { ...db.products[idx], ...product };
  } else {
    db.products.unshift(product);
  }
  writeDb(db);
  return product;
}

export function deleteProduct(id: string): boolean {
  const db = readDb();
  const prevLen = db.products.length;
  db.products = db.products.filter((p) => p.id !== id);
  writeDb(db);
  return db.products.length < prevLen;
}

export function addRfqLead(lead: Omit<RfqLead, "id" | "createdAt" | "status">): RfqLead {
  const db = readDb();
  const newLead: RfqLead = {
    ...lead,
    id: `rfq-${Date.now()}`,
    status: "new",
    createdAt: new Date().toISOString(),
  };
  db.rfqLeads.unshift(newLead);
  db.counters.rfqSubmissions += 1;
  writeDb(db);
  return newLead;
}

export function updateRfqLeadStatus(
  id: string,
  status: "new" | "contacted" | "quoted"
): RfqLead | null {
  const db = readDb();
  const lead = db.rfqLeads.find((l) => l.id === id);
  if (!lead) return null;
  lead.status = status;
  writeDb(db);
  return lead;
}

export function recordAnalyticsEvent(
  event: Omit<AnalyticsEvent, "id" | "timestamp">
): void {
  const db = readDb();
  const fullEvent: AnalyticsEvent = {
    ...event,
    id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
  };

  // Keep most recent 500 events for detailed feed & search analysis
  db.analyticsEvents.unshift(fullEvent);
  if (db.analyticsEvents.length > 500) {
    db.analyticsEvents = db.analyticsEvents.slice(0, 500);
  }

  // Update aggregate counters
  if (event.type === "pageview") {
    db.counters.totalPageviews += 1;
    if (event.device === "mobile") db.counters.mobileVisits += 1;
    else db.counters.desktopVisits += 1;

    if (event.lang === "bn") db.counters.bnViews += 1;
    else db.counters.enViews += 1;
  } else if (event.type === "product_view" && event.productId) {
    const prod = db.products.find(
      (p) => p.id === event.productId || p.slug === event.productId
    );
    if (prod) {
      prod.views = (prod.views || 0) + 1;
    }
  } else if (event.type === "whatsapp_click") {
    db.counters.whatsappClicks += 1;
    if (event.productId) {
      const prod = db.products.find(
        (p) => p.id === event.productId || p.slug === event.productId
      );
      if (prod) {
        prod.whatsappClicks = (prod.whatsappClicks || 0) + 1;
      }
    }
  } else if (event.type === "call_click") {
    if (event.phoneLine === "01309-816266") {
      db.counters.callClicksLine2 += 1;
    } else {
      db.counters.callClicksLine1 += 1;
    }
  } else if (event.type === "pdf_download") {
    db.counters.pdfDownloads += 1;
  } else if (event.type === "language_switch") {
    if (event.lang === "bn") db.counters.bnViews += 1;
    else db.counters.enViews += 1;
  }

  writeDb(db);
}
