# Vercel and Supabase Deployment

## Vercel Environment Variables

Set these variables in the Vercel project before deploying:

```text
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SESSION_SECRET=
NEXT_PUBLIC_APP_URL=
```

Keep `SUPABASE_SERVICE_ROLE_KEY` server-only. Do not expose it in client components, browser code, logs, or public build output. Use a strong random `SESSION_SECRET`, and set `NEXT_PUBLIC_APP_URL` to the deployed Vercel URL.

## Supabase Storage

Create these private Supabase storage buckets:

```text
lecture-html
lecture-artifacts
lecture-images
```

The app should not expose permanent public storage URLs. After authorization, the current implementation proxies private assets or issues access-checked URLs for the requested lecture or artifact.

## Database

Run the initial schema before deploying:

```text
supabase/migrations/001_initial_schema.sql
```

Bootstrap the first active admin code before opening the admin console. Admin code creation requires an existing admin session, so a fresh deployment needs one direct insert.

Generate the hash with the same format as `src/lib/crypto.ts`, using the production `SESSION_SECRET` and the first admin code:

```bash
SESSION_SECRET='replace-with-production-secret' ADMIN_CODE='replace-with-admin-code' node -e "const { createHash } = require('node:crypto'); console.log(createHash('sha256').update(process.env.SESSION_SECRET + ':' + process.env.ADMIN_CODE.trim()).digest('hex'))"
```

Insert the generated hash in the Supabase SQL editor:

```sql
insert into admin_codes (name, code_hash, expires_at, is_active)
values ('Initial Admin', 'paste-generated-hash-here', now() + interval '30 days', true);
```

`supabase/seed.sql` is documentation/sample seed material with placeholder hashes. Do not deploy those placeholder values.

Row Level Security is enabled in the schema. Server routes use the Supabase service role key for privileged operations, so keep that key restricted to trusted server-side environments only.
