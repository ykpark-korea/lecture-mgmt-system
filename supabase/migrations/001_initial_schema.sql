create extension if not exists pgcrypto;

create table access_codes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code_hash text not null unique,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  is_active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint access_codes_valid_window check (ends_at > starts_at)
);

create table admin_codes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code_hash text not null unique,
  expires_at timestamptz not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table lectures (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  status text not null default 'draft' check (status in ('draft', 'active', 'inactive')),
  html_storage_path text,
  thumbnail_storage_path text,
  uses_default_hero boolean not null default true,
  published_starts_at timestamptz,
  published_ends_at timestamptz,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint lectures_publish_window check (
    published_starts_at is null
    or published_ends_at is null
    or published_ends_at > published_starts_at
  )
);

create table lecture_access_codes (
  id uuid primary key default gen_random_uuid(),
  lecture_id uuid not null references lectures(id) on delete cascade,
  access_code_id uuid not null references access_codes(id) on delete cascade,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (lecture_id, access_code_id)
);

create table artifacts (
  id uuid primary key default gen_random_uuid(),
  lecture_id uuid not null references lectures(id) on delete cascade,
  type text not null check (type in ('file', 'link')),
  category text not null check (category in ('practice', 'reference', 'external', 'preparation')),
  title text not null,
  description text not null default '',
  url text,
  storage_path text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint artifacts_file_or_link check (
    (type = 'file' and storage_path is not null and url is null)
    or (type = 'link' and url is not null and storage_path is null)
  )
);

create index access_codes_active_window_idx on access_codes (is_active, starts_at, ends_at);
create index lectures_status_sort_idx on lectures (status, sort_order);
create index lecture_access_codes_access_idx on lecture_access_codes (access_code_id, sort_order);
create index artifacts_lecture_idx on artifacts (lecture_id, is_active, sort_order);

create function set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_access_codes_updated_at
before update on access_codes
for each row
execute function set_updated_at();

create trigger set_admin_codes_updated_at
before update on admin_codes
for each row
execute function set_updated_at();

create trigger set_lectures_updated_at
before update on lectures
for each row
execute function set_updated_at();

create trigger set_artifacts_updated_at
before update on artifacts
for each row
execute function set_updated_at();

alter table access_codes enable row level security;
alter table admin_codes enable row level security;
alter table lectures enable row level security;
alter table lecture_access_codes enable row level security;
alter table artifacts enable row level security;
