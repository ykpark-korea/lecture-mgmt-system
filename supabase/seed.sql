-- Placeholder seed values for local development codes HPMP-2026 and ADMIN-2026.
-- These are not usable password hashes.
-- After Task 3 adds the hash helper in src/lib/crypto.ts, generate fresh production
-- hashes with the production SESSION_SECRET and replace these placeholders.
insert into access_codes (name, code_hash, starts_at, ends_at, is_active, notes)
values ('Local HPMP 2026', 'replace-with-generated-hash-for-HPMP-2026', now() - interval '1 day', now() + interval '30 days', true, 'Local development learner code');

insert into admin_codes (name, code_hash, expires_at, is_active)
values ('Local Admin', 'replace-with-generated-hash-for-ADMIN-2026', now() + interval '30 days', true);
