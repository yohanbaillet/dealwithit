-- ============================================================
-- 007_companies_directory.sql
-- Scalable company directory: replaces static frontend lists
-- with a DB-driven, country-aware, intent-aware structure.
-- ============================================================

-- ── companies ────────────────────────────────────────────────
-- One row per (company × country × category).
-- A company like "Orange" appears twice for FR:
--   category=telecom_mobile AND category=telecom_internet
create table companies (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  -- normalized for case-insensitive matching (e.g. OCR output)
  normalized_name text generated always as (lower(trim(name))) stored,
  aliases        text[] default '{}',   -- alternate spellings / OCR variants
  country_code   text not null,         -- locale code: 'fr' | 'en' | 'de' | 'es' | 'it' | ...
  category       text not null,         -- 'gym' | 'telecom_mobile' | 'telecom_internet' |
                                        -- 'streaming' | 'insurance_home' | 'insurance_car' |
                                        -- 'health_insurance' | 'bank' | 'transport' | 'logistics'
  website        text,
  logo_url       text,
  sort_order     integer default 99,    -- lower = shown first in picker
  is_active      boolean default true,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now(),
  unique(normalized_name, country_code, category)
);

-- ── company_contacts ─────────────────────────────────────────
-- Contact info per company per intent type.
-- intent_type NULL = generic contact used as fallback for any intent.
-- Research goes here: find the right postal/email per request type.
create table company_contacts (
  id               uuid primary key default gen_random_uuid(),
  company_id       uuid references companies(id) on delete cascade not null,
  intent_type      text,          -- 'terminate' | 'contest' | 'complain' | 'request' | NULL=generic
  postal_address   text,          -- full postal address (street, city, zip, country)
  email            text,          -- service email for this request type
  phone            text,
  department       text,          -- e.g. 'Service Résiliation', 'Service Réclamations'
  notes            text,          -- special instructions (e.g. "envoyer en RAR", "délai 30 jours")
  source_url       text,          -- URL where this info was verified
  last_verified_at timestamptz,   -- when the contact info was last checked
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- ── RLS ──────────────────────────────────────────────────────
-- Company directory is public read (no auth required for lookups)
alter table companies enable row level security;
create policy "companies are public read" on companies
  for select using (true);

alter table company_contacts enable row level security;
create policy "company_contacts are public read" on company_contacts
  for select using (true);

-- ── Indexes ──────────────────────────────────────────────────
create index on companies(country_code, category, sort_order);
create index on companies(normalized_name);
create index on company_contacts(company_id, intent_type);

-- ── updated_at triggers ──────────────────────────────────────
create trigger companies_updated_at
  before update on companies
  for each row execute function handle_updated_at();

create trigger company_contacts_updated_at
  before update on company_contacts
  for each row execute function handle_updated_at();
