-- ============================================================
-- dealWithIt — Initial Schema Migration
-- ============================================================

-- gen_random_uuid() is built into Postgres 13+ — no extension needed

-- ============================================================
-- ENUMS
-- ============================================================

create type request_status as enum ('draft', 'clarifying', 'generating', 'complete');
create type intent_type as enum ('terminate', 'contest', 'complain', 'request', 'certify');
create type entity_source as enum ('user_input', 'ocr', 'ai_extraction');
create type letter_type as enum ('postal', 'email');

-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================

create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================================
-- TABLES
-- ============================================================

-- user_profiles
create table user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  full_name text,
  preferred_language text default 'fr',
  country text default 'FR',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger user_profiles_updated_at
  before update on user_profiles
  for each row execute function handle_updated_at();

-- requests
create table requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  status request_status default 'draft',
  intent_type intent_type,
  raw_input text,
  title text,
  language text default 'fr',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger requests_updated_at
  before update on requests
  for each row execute function handle_updated_at();

create index requests_user_id_idx on requests(user_id);
create index requests_created_at_idx on requests(created_at desc);

-- document_uploads
create table document_uploads (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references requests(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  file_path text not null,
  file_name text,
  file_type text,
  ocr_text text,
  created_at timestamptz default now()
);

create index document_uploads_request_id_idx on document_uploads(request_id);

-- extracted_entities
create table extracted_entities (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references requests(id) on delete cascade not null,
  entity_type text not null,
  value text,
  confidence float default 1.0 check (confidence >= 0 and confidence <= 1),
  is_verified boolean default false,
  source entity_source default 'ai_extraction',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger extracted_entities_updated_at
  before update on extracted_entities
  for each row execute function handle_updated_at();

create index extracted_entities_request_id_idx on extracted_entities(request_id);

-- clarification_questions
create table clarification_questions (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references requests(id) on delete cascade not null,
  question text not null,
  answer text,
  field_key text not null,
  is_required boolean default true,
  order_index integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger clarification_questions_updated_at
  before update on clarification_questions
  for each row execute function handle_updated_at();

create index clarification_questions_request_id_idx on clarification_questions(request_id);

-- generated_letters
create table generated_letters (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references requests(id) on delete cascade not null,
  letter_type letter_type default 'postal',
  content text not null,
  subject text,
  language text default 'fr',
  version integer default 1,
  is_final boolean default false,
  pdf_path text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger generated_letters_updated_at
  before update on generated_letters
  for each row execute function handle_updated_at();

create index generated_letters_request_id_idx on generated_letters(request_id);

-- recipients_directory
create table recipients_directory (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  aliases text[],
  country text,
  postal_address text,
  email text,
  website text,
  category text,
  created_at timestamptz default now()
);

create index recipients_directory_company_name_idx on recipients_directory(company_name);
create index recipients_directory_country_idx on recipients_directory(country);

-- attachments_checklists
create table attachments_checklists (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references requests(id) on delete cascade not null,
  item_name text not null,
  description text,
  is_required boolean default true,
  is_provided boolean default false,
  created_at timestamptz default now()
);

create index attachments_checklists_request_id_idx on attachments_checklists(request_id);

-- activity_history
create table activity_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  request_id uuid references requests(id) on delete set null,
  action_type text not null,
  metadata jsonb,
  created_at timestamptz default now()
);

create index activity_history_user_id_idx on activity_history(user_id);
create index activity_history_created_at_idx on activity_history(created_at desc);

-- billing_plans (schema-ready, no UI in MVP)
create table billing_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  plan text default 'free',
  stripe_customer_id text,
  stripe_subscription_id text,
  letters_used integer default 0,
  letters_limit integer default 3,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger billing_plans_updated_at
  before update on billing_plans
  for each row execute function handle_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table user_profiles enable row level security;
alter table requests enable row level security;
alter table document_uploads enable row level security;
alter table extracted_entities enable row level security;
alter table clarification_questions enable row level security;
alter table generated_letters enable row level security;
alter table recipients_directory enable row level security;
alter table attachments_checklists enable row level security;
alter table activity_history enable row level security;
alter table billing_plans enable row level security;

-- user_profiles
create policy "Users can view own profile" on user_profiles for select using (auth.uid() = user_id);
create policy "Users can update own profile" on user_profiles for update using (auth.uid() = user_id);
create policy "Users can insert own profile" on user_profiles for insert with check (auth.uid() = user_id);

-- requests
create policy "Users can view own requests" on requests for select using (auth.uid() = user_id);
create policy "Users can insert own requests" on requests for insert with check (auth.uid() = user_id);
create policy "Users can update own requests" on requests for update using (auth.uid() = user_id);
create policy "Users can delete own requests" on requests for delete using (auth.uid() = user_id);

-- document_uploads
create policy "Users can view own uploads" on document_uploads for select using (auth.uid() = user_id);
create policy "Users can insert own uploads" on document_uploads for insert with check (auth.uid() = user_id);
create policy "Users can delete own uploads" on document_uploads for delete using (auth.uid() = user_id);

-- extracted_entities (scoped via request ownership)
create policy "Users can view own entities" on extracted_entities for select
  using (exists (select 1 from requests where requests.id = extracted_entities.request_id and requests.user_id = auth.uid()));
create policy "Users can insert own entities" on extracted_entities for insert
  with check (exists (select 1 from requests where requests.id = extracted_entities.request_id and requests.user_id = auth.uid()));
create policy "Users can update own entities" on extracted_entities for update
  using (exists (select 1 from requests where requests.id = extracted_entities.request_id and requests.user_id = auth.uid()));

-- clarification_questions
create policy "Users can view own questions" on clarification_questions for select
  using (exists (select 1 from requests where requests.id = clarification_questions.request_id and requests.user_id = auth.uid()));
create policy "Users can insert own questions" on clarification_questions for insert
  with check (exists (select 1 from requests where requests.id = clarification_questions.request_id and requests.user_id = auth.uid()));
create policy "Users can update own questions" on clarification_questions for update
  using (exists (select 1 from requests where requests.id = clarification_questions.request_id and requests.user_id = auth.uid()));

-- generated_letters
create policy "Users can view own letters" on generated_letters for select
  using (exists (select 1 from requests where requests.id = generated_letters.request_id and requests.user_id = auth.uid()));
create policy "Users can insert own letters" on generated_letters for insert
  with check (exists (select 1 from requests where requests.id = generated_letters.request_id and requests.user_id = auth.uid()));
create policy "Users can update own letters" on generated_letters for update
  using (exists (select 1 from requests where requests.id = generated_letters.request_id and requests.user_id = auth.uid()));

-- recipients_directory — public read
create policy "Anyone can read recipients" on recipients_directory for select using (true);

-- attachments_checklists
create policy "Users can view own checklists" on attachments_checklists for select
  using (exists (select 1 from requests where requests.id = attachments_checklists.request_id and requests.user_id = auth.uid()));
create policy "Users can insert own checklists" on attachments_checklists for insert
  with check (exists (select 1 from requests where requests.id = attachments_checklists.request_id and requests.user_id = auth.uid()));
create policy "Users can update own checklists" on attachments_checklists for update
  using (exists (select 1 from requests where requests.id = attachments_checklists.request_id and requests.user_id = auth.uid()));

-- activity_history
create policy "Users can view own activity" on activity_history for select using (auth.uid() = user_id);
create policy "Users can insert own activity" on activity_history for insert with check (auth.uid() = user_id);

-- billing_plans
create policy "Users can view own billing" on billing_plans for select using (auth.uid() = user_id);

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (user_id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
