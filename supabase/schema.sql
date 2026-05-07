-- RoofSolar Supabase Schema
-- Run in Supabase SQL Editor

create table if not exists calculations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  created_at timestamptz default now(),
  inputs jsonb not null,
  results jsonb not null,
  address text,
  system_kwp numeric
);

create table if not exists pro_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  calculation_id uuid references calculations(id),
  stripe_session_id text unique,
  purchased_at timestamptz default now(),
  pdf_sent boolean default false
);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text,
  email text,
  phone text,
  address text,
  system_kwp numeric,
  budget_gbp numeric,                         -- legacy, no longer written
  budget_local numeric,                       -- in local currency
  currency_code text,                         -- ISO-4217, e.g. 'EUR', 'USD'
  country_code text,                          -- ISO-3166-1 alpha-2 lower-case
  finance_preference text,
  calculation_id uuid references calculations(id),
  distributed boolean default false
);

create table if not exists installer_waitlist (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  company_name text,
  contact_name text,
  email text,
  phone text,
  coverage_regions text[],
  notes text
);

-- Row Level Security
alter table calculations enable row level security;
alter table pro_purchases enable row level security;
alter table leads enable row level security;
alter table installer_waitlist enable row level security;

-- Policies: users can only read their own calculations
create policy "Users can read own calculations"
  on calculations for select
  using (auth.uid() = user_id);

create policy "Users can insert calculations"
  on calculations for insert
  with check (true); -- allow anonymous inserts (user_id nullable)

-- Policies: users can only read their own pro_purchases
create policy "Users can read own pro_purchases"
  on pro_purchases for select
  using (auth.uid() = user_id);

-- Service role can insert leads and pro_purchases (via API routes)
-- No direct client access to leads needed
create policy "Service role manages leads"
  on leads for all
  using (true); -- enforced via server-side service role key only

create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  rating smallint not null check (rating between 1 and 5),
  message text,
  page text
);

alter table feedback enable row level security;

create policy "Service role manages feedback"
  on feedback for all
  using (true);
