create table if not exists login_audit_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  result text not null check (
    result in ('success', 'invalid_format', 'not_found', 'not_started', 'expired', 'inactive', 'db_error')
  ),
  access_code_id uuid references access_codes(id) on delete set null,
  code_fingerprint text not null,
  normalized_preview text,
  input_length integer not null default 0,
  changed_by_normalization boolean not null default false,
  user_agent text,
  ip_hash text,
  request_region text,
  error_message text
);

create index if not exists login_audit_logs_created_idx on login_audit_logs (created_at desc);
create index if not exists login_audit_logs_result_created_idx on login_audit_logs (result, created_at desc);
create index if not exists login_audit_logs_code_fingerprint_idx on login_audit_logs (code_fingerprint, created_at desc);

alter table login_audit_logs enable row level security;
