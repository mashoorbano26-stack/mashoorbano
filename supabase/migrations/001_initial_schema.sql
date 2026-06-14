-- Run this entire file in Supabase SQL Editor
-- Go to: supabase.com → your project → SQL Editor → New Query → paste → Run

create extension if not exists "pgcrypto";

-- PACKAGES
create table if not exists packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tagline text,
  price_inr numeric not null,
  price_usd numeric,
  features jsonb not null default '[]',
  is_popular boolean default false,
  is_active boolean default true,
  sort_order int default 0,
  stripe_price_id text,
  razorpay_plan_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ORDERS
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  customer_gst text,
  items jsonb not null,
  subtotal numeric not null,
  gst_amount numeric default 0,
  total numeric not null,
  currency text default 'INR',
  payment_gateway text check (payment_gateway in ('razorpay','stripe')),
  payment_id text,
  payment_order_id text,
  payment_signature text,
  status text default 'pending' check (status in ('pending','paid','failed','refunded','processing','delivered')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- PORTFOLIO
create table if not exists portfolio (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  client_name text,
  service_type text check (service_type in ('website','merchandise','content','meta-ads','google-ads','branding')),
  description text,
  result_metric text,
  thumbnail_url text,
  images jsonb default '[]',
  tags text[],
  is_featured boolean default false,
  is_active boolean default true,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- TESTIMONIALS
create table if not exists testimonials (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  brand_name text,
  designation text,
  quote text not null,
  video_url text,
  photo_url text,
  rating int default 5 check (rating between 1 and 5),
  service_type text,
  is_active boolean default true,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- LEADS (contact form)
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  brand_name text,
  service_interest text,
  message text,
  source text default 'website',
  status text default 'new' check (status in ('new','contacted','converted','lost')),
  admin_notes text,
  created_at timestamptz default now()
);

-- SITE CONTENT (CMS)
create table if not exists site_content (
  id uuid primary key default gen_random_uuid(),
  page text not null,
  section text not null,
  content jsonb not null,
  updated_at timestamptz default now(),
  unique(page, section)
);

-- BLOG POSTS
create table if not exists blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  excerpt text,
  body text,
  cover_image_url text,
  author text default 'Mashurban',
  tags text[],
  seo_title text,
  seo_description text,
  is_published boolean default false,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- SEO SETTINGS
create table if not exists seo_settings (
  id uuid primary key default gen_random_uuid(),
  page_path text unique not null,
  title text,
  description text,
  og_title text,
  og_description text,
  og_image_url text,
  canonical_url text,
  keywords text,
  json_ld jsonb,
  updated_at timestamptz default now()
);

-- RLS
alter table packages     enable row level security;
alter table orders       enable row level security;
alter table portfolio    enable row level security;
alter table testimonials enable row level security;
alter table leads        enable row level security;
alter table site_content enable row level security;
alter table blog_posts   enable row level security;
alter table seo_settings enable row level security;

-- Public read policies
create policy "public_read_packages"     on packages     for select using (is_active = true);
create policy "public_read_portfolio"    on portfolio    for select using (is_active = true);
create policy "public_read_testimonials" on testimonials for select using (is_active = true);
create policy "public_read_site_content" on site_content for select using (true);
create policy "public_read_blog_posts"   on blog_posts   for select using (is_published = true);
create policy "public_read_seo_settings" on seo_settings for select using (true);

-- Public insert for contact form
create policy "public_insert_leads" on leads for insert with check (true);

-- SEED DATA
insert into packages (name, tagline, price_inr, features, is_popular, sort_order) values
(
  'Starter', 'Perfect for new brands', 29999,
  '["5-page website","Mobile responsive","Basic SEO setup","Contact form","Google Analytics","1 month support"]'::jsonb,
  false, 1
),
(
  'Growth', 'Most chosen by growing brands', 79999,
  '["10-page website","Social media setup","Meta ads (1 month)","4 content reels","Advanced SEO","WhatsApp integration","3 months support"]'::jsonb,
  true, 2
),
(
  'Full Stack', 'Complete digital presence', 149999,
  '["Custom website","Brand identity kit","Merchandise design","Meta + Google ads 3mo","8 monthly reels","Dedicated account mgr","6 months support"]'::jsonb,
  false, 3
)
on conflict do nothing;

insert into testimonials (client_name, brand_name, quote, rating, is_active, sort_order) values
(
  'Aryan Kapoor', 'UrbanFit Apparel · Mumbai',
  'Mashurban rebuilt our website and ran our Meta ads for 45 days. We tripled our online leads.',
  5, true, 1
),
(
  'Priya Sharma', 'Chai Republic · Delhi',
  'The merch they designed for us sold out in 6 days. The brand kit is something we will use for the next decade.',
  5, true, 2
),
(
  'Rohan Verma', 'Voltex EV · Bengaluru',
  'Our Google Ads ROAS went from 1.2x to 4.8x in 60 days. These guys understand performance marketing.',
  5, true, 3
)
on conflict do nothing;
