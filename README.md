# Hanwha Lecture Management System

Temporary Vercel-hosted lecture portal for Hanwha internal AI training.

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and fill in:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=
   SUPABASE_SERVICE_ROLE_KEY=
   SESSION_SECRET=
   NEXT_PUBLIC_APP_URL=http://127.0.0.1:3000
   ```

   `SUPABASE_SERVICE_ROLE_KEY` must remain server-only. Use a strong random value for `SESSION_SECRET`.

3. Run the initial database migration in the Supabase SQL editor:

   ```text
   supabase/migrations/001_initial_schema.sql
   ```

4. Create these private Supabase Storage buckets:

   ```text
   lecture-html
   lecture-artifacts
   lecture-images
   ```

5. Bootstrap the first admin code. Generate a hash with the same format as `src/lib/crypto.ts`, using the exact `SESSION_SECRET` from `.env.local`:

   ```bash
   SESSION_SECRET='replace-with-local-secret' ADMIN_CODE='replace-with-admin-code' node -e "const { createHash } = require('node:crypto'); console.log(createHash('sha256').update(process.env.SESSION_SECRET + ':' + process.env.ADMIN_CODE.trim()).digest('hex'))"
   ```

   Insert the output into Supabase SQL:

   ```sql
   insert into admin_codes (name, code_hash, expires_at, is_active)
   values ('Local Admin', 'paste-generated-hash-here', now() + interval '30 days', true);
   ```

   `supabase/seed.sql` contains placeholder hashes only; they are not usable as-is.

6. Start the local app:

   ```bash
   npm run dev
   ```

## Verification

```bash
npm run test
npm run build
npm run e2e
npm run lint
```

## Notes

Supabase storage buckets for lecture HTML, lecture artifacts, and lecture images must stay private. The app serves access through server-side authorization flows that proxy private assets or issue access-checked URLs after a learner or admin session is verified; do not expose permanent public URLs.

Learner and admin access use code-based sessions. Learner codes grant access to eligible lectures; admin codes grant access to the operating console.
# lecture-mgmt-system
