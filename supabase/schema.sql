-- M/S Eshayat Enterprise — Supabase PostgreSQL Schema with Row-Level Security (RLS)
-- Run this inside the Supabase SQL Editor when connecting a cloud database.

CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title JSONB NOT NULL,
  model TEXT NOT NULL,
  brand TEXT NOT NULL,
  division_id TEXT NOT NULL,
  subcategory_id TEXT NOT NULL,
  image TEXT NOT NULL,
  gallery JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'in_stock',
  certifications JSONB DEFAULT '[]'::jsonb,
  short_description JSONB NOT NULL,
  features JSONB NOT NULL,
  specs JSONB DEFAULT '{}'::jsonb,
  featured BOOLEAN DEFAULT false,
  views INTEGER DEFAULT 0,
  whatsapp_clicks INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.rfq_leads (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  location TEXT,
  inquiry_type TEXT NOT NULL DEFAULT 'wholesale_quote',
  items JSONB DEFAULT '[]'::jsonb,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  lang TEXT NOT NULL DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  path TEXT,
  product_id TEXT,
  product_title TEXT,
  division_id TEXT,
  phone_line TEXT,
  search_query TEXT,
  lang TEXT NOT NULL DEFAULT 'en',
  device TEXT NOT NULL DEFAULT 'mobile',
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row-Level Security (RLS) on all tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfq_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Public read-only policy for products catalogue
CREATE POLICY "Allow public read access to products"
  ON public.products
  FOR SELECT
  USING (true);

-- Only server-side service_role can insert/update/delete products, view RFQ leads, or read analytics
CREATE POLICY "Allow public insert of RFQ leads"
  ON public.rfq_leads
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public insert of analytics events"
  ON public.analytics_events
  FOR INSERT
  WITH CHECK (true);
