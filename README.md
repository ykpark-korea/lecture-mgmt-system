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

4. Start the local app:

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

Supabase storage buckets for lecture HTML, lecture artifacts, and lecture images are private. The app serves access through server-side authorization flows that proxy private assets or issue access-checked URLs after a learner or admin session is verified.

Learner and admin access use code-based sessions. Learner codes grant access to eligible lectures; admin codes grant access to the operating console.
