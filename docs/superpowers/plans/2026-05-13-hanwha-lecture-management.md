# Hanwha Lecture Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Vercel-ready Next.js MVP for code-based Hanwha lecture access, HTML lecture viewing, artifact downloads/links, and admin operation.

**Architecture:** Use Next.js App Router with server actions/API routes for code validation, session cookies, Supabase Postgres access, and Supabase Storage signed URLs. Keep the domain logic in small server modules under `src/lib` so UI pages stay focused and testable. Use a local mockable repository boundary for tests, while production code uses Supabase service-role access only on the server.

**Tech Stack:** Next.js, TypeScript, Tailwind CSS, Supabase JS, Zod, Vitest, React Testing Library, Playwright, Vercel.

---

## File Structure

Create this structure:

```text
app/
  admin/
    codes/page.tsx
    lectures/page.tsx
    login/page.tsx
    page.tsx
    settings/page.tsx
  api/
    admin/
      artifacts/route.ts
      codes/route.ts
      lectures/route.ts
      upload-url/route.ts
    artifacts/[artifactId]/signed-url/route.ts
    learner/login/route.ts
    learner/logout/route.ts
    lectures/[lectureId]/signed-url/route.ts
  lecture/[lectureId]/page.tsx
  layout.tsx
  page.tsx
  globals.css
components/
  admin/AdminShell.tsx
  admin/ArtifactEditor.tsx
  admin/CodeManager.tsx
  admin/LectureEditor.tsx
  learner/ArtifactPanel.tsx
  learner/HeroBanner.tsx
  learner/LectureCard.tsx
  learner/LectureViewer.tsx
  ui/Button.tsx
  ui/Input.tsx
  ui/Panel.tsx
src/
  lib/
    artifacts.ts
    auth.ts
    cookies.ts
    crypto.ts
    lectures.ts
    storage.ts
    supabase.ts
    validation.ts
  types/
    database.ts
supabase/
  migrations/001_initial_schema.sql
  seed.sql
tests/
  auth.test.ts
  lectures.test.ts
  storage.test.ts
  validation.test.ts
  e2e/learner-flow.spec.ts
public/
  hero-full.png
  hero-wide.png
.env.example
package.json
tailwind.config.ts
tsconfig.json
vitest.config.ts
playwright.config.ts
```

Responsibility boundaries:

- `src/lib/auth.ts`: validate learner/admin codes and create/parse signed session payloads.
- `src/lib/cookies.ts`: read/write learner and admin httpOnly cookies.
- `src/lib/lectures.ts`: query lecture visibility and admin lecture operations.
- `src/lib/artifacts.ts`: query and validate artifact operations.
- `src/lib/storage.ts`: create signed upload/download URLs and validate bucket/path policy.
- `src/lib/validation.ts`: shared Zod schemas and file allowlists.
- `src/lib/supabase.ts`: server-only Supabase client factories.
- UI components render data and submit forms; they do not perform authorization decisions.

## Task 1: Scaffold Next.js Project

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.mjs`
- Create: `tailwind.config.ts`
- Create: `postcss.config.mjs`
- Create: `vitest.config.ts`
- Create: `playwright.config.ts`
- Create: `app/layout.tsx`
- Create: `app/globals.css`
- Create: `app/page.tsx`
- Create: `.env.example`

- [ ] **Step 1: Create package metadata**

Create `package.json`:

```json
{
  "name": "hanwha-lecture-management",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest",
    "e2e": "playwright test"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.45.4",
    "lucide-react": "^0.468.0",
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@playwright/test": "^1.48.0",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.0.1",
    "@types/node": "^22.7.5",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "autoprefixer": "^10.4.20",
    "eslint": "^9.12.0",
    "eslint-config-next": "^15.0.0",
    "jsdom": "^25.0.1",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.13",
    "typescript": "^5.6.3",
    "vitest": "^2.1.3"
  }
}
```

- [ ] **Step 2: Create TypeScript and framework config**

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "es2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    },
    "plugins": [
      {
        "name": "next"
      }
    ]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

Create `next.config.mjs`:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb"
    }
  }
};

export default nextConfig;
```

Create `tailwind.config.ts`:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        hanwha: {
          orange: "#f37321"
        },
        cool: {
          ice: "#f6fbff",
          mist: "#eaf7fb",
          blue: "#dbeafe",
          mint: "#d7f4ee",
          ink: "#243447"
        }
      },
      boxShadow: {
        soft: "0 14px 40px rgba(36, 52, 71, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;
```

Create `postcss.config.mjs`:

```js
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
};

export default config;
```

- [ ] **Step 3: Create test config**

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"]
  },
  resolve: {
    alias: {
      "@": new URL(".", import.meta.url).pathname
    }
  }
});
```

Create `playwright.config.ts`:

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry"
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ],
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: true,
    timeout: 120000
  }
});
```

- [ ] **Step 4: Create base app files**

Create `app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "한화손보 사내강의",
  description: "한화손보 AI 강의자료 관리 시스템"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
```

Create `app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: light;
  background: #f6fbff;
  color: #243447;
  font-family: "Pretendard", "Apple SD Gothic Neo", system-ui, sans-serif;
}

* {
  box-sizing: border-box;
}

html,
body {
  min-height: 100%;
  margin: 0;
}

body {
  background:
    linear-gradient(180deg, rgba(219, 234, 254, 0.72), rgba(246, 251, 255, 0.92) 34%),
    #f6fbff;
}

button,
input,
textarea,
select {
  font: inherit;
}
```

Create `app/page.tsx`:

```tsx
export default function LearnerLoginPage() {
  return (
    <main className="min-h-screen bg-cool-ice px-6 py-8 text-cool-ink">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center justify-center">
        <div className="w-full max-w-md rounded-lg border border-sky-100 bg-white p-6 shadow-soft">
          <p className="text-sm font-semibold text-hanwha-orange">Hanwha General Insurance</p>
          <h1 className="mt-2 text-2xl font-bold">사내강의 접속</h1>
          <p className="mt-2 text-sm text-slate-600">교육 안내에서 받은 접속 코드를 입력하세요.</p>
          <form className="mt-6 space-y-3" action="/api/learner/login" method="post">
            <label className="block text-sm font-semibold" htmlFor="code">
              접속 코드
            </label>
            <input
              id="code"
              name="code"
              className="w-full rounded-md border border-sky-200 px-3 py-2 outline-none focus:border-hanwha-orange"
              autoComplete="one-time-code"
              required
            />
            <button className="w-full rounded-md bg-hanwha-orange px-4 py-2 font-semibold text-white" type="submit">
              강의 목록 보기
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
```

Create `.env.example`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SESSION_SECRET=
NEXT_PUBLIC_APP_URL=http://127.0.0.1:3000
```

- [ ] **Step 5: Install dependencies**

Run: `npm install`

Expected: packages install successfully and `package-lock.json` is created.

- [ ] **Step 6: Verify scaffold**

Run: `npm run test`

Expected: PASS with no test files or zero tests depending on Vitest output.

Run: `npm run build`

Expected: Next.js production build succeeds.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json tsconfig.json next.config.mjs tailwind.config.ts postcss.config.mjs vitest.config.ts playwright.config.ts app .env.example
git commit -m "chore: scaffold lecture management app"
```

## Task 2: Add Database Schema and Types

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`
- Create: `supabase/seed.sql`
- Create: `src/types/database.ts`
- Create: `src/lib/validation.ts`
- Test: `tests/validation.test.ts`

- [ ] **Step 1: Write validation tests**

Create `tests/validation.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { artifactSchema, isAllowedArtifactFile, isAllowedHtmlFile, learnerCodeSchema } from "@/src/lib/validation";

describe("validation", () => {
  it("accepts learner codes with useful characters", () => {
    expect(learnerCodeSchema.parse("HPMP-2026")).toBe("HPMP-2026");
  });

  it("rejects empty learner codes", () => {
    expect(() => learnerCodeSchema.parse("")).toThrow();
  });

  it("allows only html lecture uploads", () => {
    expect(isAllowedHtmlFile("lecture.html")).toBe(true);
    expect(isAllowedHtmlFile("lecture.pdf")).toBe(false);
  });

  it("allows artifact file extensions from the MVP allowlist", () => {
    expect(isAllowedArtifactFile("practice.zip")).toBe(true);
    expect(isAllowedArtifactFile("guide.pdf")).toBe(true);
    expect(isAllowedArtifactFile("script.exe")).toBe(false);
  });

  it("requires storage path for file artifacts", () => {
    expect(() =>
      artifactSchema.parse({
        lectureId: "11111111-1111-1111-1111-111111111111",
        type: "file",
        category: "practice",
        title: "실습 파일"
      })
    ).toThrow();
  });
});
```

- [ ] **Step 2: Run validation test to verify failure**

Run: `npm run test -- tests/validation.test.ts`

Expected: FAIL because `src/lib/validation.ts` does not exist.

- [ ] **Step 3: Add validation module**

Create `src/lib/validation.ts`:

```ts
import { z } from "zod";

export const learnerCodeSchema = z.string().trim().min(3).max(64).regex(/^[A-Za-z0-9_-]+$/);
export const adminCodeSchema = learnerCodeSchema;

export const lectureStatusSchema = z.enum(["draft", "active", "inactive"]);
export const artifactTypeSchema = z.enum(["file", "link"]);
export const artifactCategorySchema = z.enum(["practice", "reference", "external", "preparation"]);

export const allowedHtmlExtensions = [".html"] as const;
export const allowedArtifactExtensions = [".pdf", ".zip", ".xlsx", ".pptx", ".docx", ".csv", ".png", ".jpg", ".jpeg", ".webp"] as const;

function hasAllowedExtension(fileName: string, extensions: readonly string[]) {
  const lower = fileName.toLowerCase();
  return extensions.some((extension) => lower.endsWith(extension));
}

export function isAllowedHtmlFile(fileName: string) {
  return hasAllowedExtension(fileName, allowedHtmlExtensions);
}

export function isAllowedArtifactFile(fileName: string) {
  return hasAllowedExtension(fileName, allowedArtifactExtensions);
}

export const artifactSchema = z
  .object({
    lectureId: z.string().uuid(),
    type: artifactTypeSchema,
    category: artifactCategorySchema,
    title: z.string().trim().min(1).max(120),
    description: z.string().trim().max(500).optional(),
    url: z.string().url().optional(),
    storagePath: z.string().trim().min(1).optional(),
    isActive: z.boolean().default(true),
    sortOrder: z.number().int().min(0).default(0)
  })
  .superRefine((value, context) => {
    if (value.type === "file" && !value.storagePath) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["storagePath"], message: "file artifact requires storagePath" });
    }
    if (value.type === "link" && !value.url) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["url"], message: "link artifact requires url" });
    }
  });
```

- [ ] **Step 4: Add migration**

Create `supabase/migrations/001_initial_schema.sql`:

```sql
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
```

- [ ] **Step 5: Add seed with documented hash inputs**

Create `supabase/seed.sql`:

```sql
-- Seed values assume SESSION_SECRET=local-dev-secret and the hash helper in src/lib/crypto.ts.
-- Use the app's admin UI or a one-off script after Task 3 to generate production hashes.
insert into access_codes (name, code_hash, starts_at, ends_at, is_active, notes)
values ('Local HPMP 2026', 'replace-with-generated-hash-for-HPMP-2026', now() - interval '1 day', now() + interval '30 days', true, 'Local development learner code');

insert into admin_codes (name, code_hash, expires_at, is_active)
values ('Local Admin', 'replace-with-generated-hash-for-ADMIN-2026', now() + interval '30 days', true);
```

- [ ] **Step 6: Add database types**

Create `src/types/database.ts`:

```ts
export type LectureStatus = "draft" | "active" | "inactive";
export type ArtifactType = "file" | "link";
export type ArtifactCategory = "practice" | "reference" | "external" | "preparation";

export interface AccessCode {
  id: string;
  name: string;
  code_hash: string;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Lecture {
  id: string;
  title: string;
  description: string;
  status: LectureStatus;
  html_storage_path: string | null;
  thumbnail_storage_path: string | null;
  uses_default_hero: boolean;
  published_starts_at: string | null;
  published_ends_at: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Artifact {
  id: string;
  lecture_id: string;
  type: ArtifactType;
  category: ArtifactCategory;
  title: string;
  description: string;
  url: string | null;
  storage_path: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}
```

- [ ] **Step 7: Verify**

Run: `npm run test -- tests/validation.test.ts`

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add supabase src/types/database.ts src/lib/validation.ts tests/validation.test.ts
git commit -m "feat: define lecture data schema"
```

## Task 3: Implement Auth, Session Cookies, and Supabase Client

**Files:**
- Create: `src/lib/crypto.ts`
- Create: `src/lib/auth.ts`
- Create: `src/lib/cookies.ts`
- Create: `src/lib/supabase.ts`
- Test: `tests/auth.test.ts`

- [ ] **Step 1: Write auth tests**

Create `tests/auth.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createCodeHash, verifyCodeHash } from "@/src/lib/crypto";
import { createSessionToken, parseSessionToken } from "@/src/lib/auth";

describe("code hashing", () => {
  it("verifies a matching code", async () => {
    const hash = await createCodeHash("HPMP-2026", "secret");
    await expect(verifyCodeHash("HPMP-2026", hash, "secret")).resolves.toBe(true);
  });

  it("rejects a different code", async () => {
    const hash = await createCodeHash("HPMP-2026", "secret");
    await expect(verifyCodeHash("WRONG", hash, "secret")).resolves.toBe(false);
  });
});

describe("session tokens", () => {
  it("round trips learner session payloads", async () => {
    const token = await createSessionToken({ role: "learner", accessCodeId: "code-1", expiresAt: Date.now() + 1000 }, "secret");
    await expect(parseSessionToken(token, "secret")).resolves.toMatchObject({ role: "learner", accessCodeId: "code-1" });
  });

  it("rejects tampered tokens", async () => {
    const token = await createSessionToken({ role: "admin", adminCodeId: "admin-1", expiresAt: Date.now() + 1000 }, "secret");
    await expect(parseSessionToken(`${token}x`, "secret")).rejects.toThrow("Invalid session signature");
  });
});
```

- [ ] **Step 2: Run auth test to verify failure**

Run: `npm run test -- tests/auth.test.ts`

Expected: FAIL because auth modules do not exist.

- [ ] **Step 3: Implement crypto helper**

Create `src/lib/crypto.ts`:

```ts
import { createHash, timingSafeEqual } from "node:crypto";

export async function createCodeHash(code: string, secret: string) {
  return createHash("sha256").update(`${secret}:${code.trim()}`).digest("hex");
}

export async function verifyCodeHash(code: string, hash: string, secret: string) {
  const computed = await createCodeHash(code, secret);
  const computedBuffer = Buffer.from(computed, "hex");
  const hashBuffer = Buffer.from(hash, "hex");
  if (computedBuffer.length !== hashBuffer.length) {
    return false;
  }
  return timingSafeEqual(computedBuffer, hashBuffer);
}
```

- [ ] **Step 4: Implement auth tokens**

Create `src/lib/auth.ts`:

```ts
import { createHmac, timingSafeEqual } from "node:crypto";

export type LearnerSession = {
  role: "learner";
  accessCodeId: string;
  expiresAt: number;
};

export type AdminSession = {
  role: "admin";
  adminCodeId: string;
  expiresAt: number;
};

export type AppSession = LearnerSession | AdminSession;

function base64Url(input: string) {
  return Buffer.from(input).toString("base64url");
}

function sign(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export async function createSessionToken(session: AppSession, secret: string) {
  const payload = base64Url(JSON.stringify(session));
  const signature = sign(payload, secret);
  return `${payload}.${signature}`;
}

export async function parseSessionToken(token: string, secret: string): Promise<AppSession> {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) {
    throw new Error("Invalid session token");
  }

  const expected = sign(payload, secret);
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);
  if (expectedBuffer.length !== signatureBuffer.length || !timingSafeEqual(expectedBuffer, signatureBuffer)) {
    throw new Error("Invalid session signature");
  }

  const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as AppSession;
  if (session.expiresAt <= Date.now()) {
    throw new Error("Session expired");
  }
  return session;
}
```

- [ ] **Step 5: Implement cookie helper**

Create `src/lib/cookies.ts`:

```ts
import { cookies } from "next/headers";
import { createSessionToken, parseSessionToken, type AdminSession, type AppSession, type LearnerSession } from "@/src/lib/auth";

export const learnerCookieName = "hanwha_learner_session";
export const adminCookieName = "hanwha_admin_session";

function sessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is required");
  }
  return secret;
}

export async function setLearnerSession(accessCodeId: string) {
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
  const session: LearnerSession = { role: "learner", accessCodeId, expiresAt };
  const token = await createSessionToken(session, sessionSecret());
  const store = await cookies();
  store.set(learnerCookieName, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", expires: new Date(expiresAt) });
}

export async function setAdminSession(adminCodeId: string) {
  const expiresAt = Date.now() + 4 * 60 * 60 * 1000;
  const session: AdminSession = { role: "admin", adminCodeId, expiresAt };
  const token = await createSessionToken(session, sessionSecret());
  const store = await cookies();
  store.set(adminCookieName, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", expires: new Date(expiresAt) });
}

export async function readSession(name: string): Promise<AppSession | null> {
  const store = await cookies();
  const token = store.get(name)?.value;
  if (!token) {
    return null;
  }
  try {
    return await parseSessionToken(token, sessionSecret());
  } catch {
    return null;
  }
}
```

- [ ] **Step 6: Implement Supabase helper**

Create `src/lib/supabase.ts`:

```ts
import "server-only";
import { createClient } from "@supabase/supabase-js";

export function createSupabaseServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase environment variables are required");
  }
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}
```

- [ ] **Step 7: Verify**

Run: `npm run test -- tests/auth.test.ts`

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/lib/crypto.ts src/lib/auth.ts src/lib/cookies.ts src/lib/supabase.ts tests/auth.test.ts
git commit -m "feat: add code auth and sessions"
```

## Task 4: Implement Lecture and Artifact Domain Queries

**Files:**
- Create: `src/lib/lectures.ts`
- Create: `src/lib/artifacts.ts`
- Create: `src/lib/storage.ts`
- Test: `tests/lectures.test.ts`
- Test: `tests/storage.test.ts`

- [ ] **Step 1: Write lecture filtering tests**

Create `tests/lectures.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { isLectureVisibleForCode } from "@/src/lib/lectures";

describe("lecture visibility", () => {
  const now = new Date("2026-05-13T12:00:00.000Z");

  it("allows active lectures inside publish window", () => {
    expect(
      isLectureVisibleForCode({
        status: "active",
        published_starts_at: "2026-05-01T00:00:00.000Z",
        published_ends_at: "2026-06-01T00:00:00.000Z"
      }, now)
    ).toBe(true);
  });

  it("blocks inactive lectures", () => {
    expect(isLectureVisibleForCode({ status: "inactive", published_starts_at: null, published_ends_at: null }, now)).toBe(false);
  });

  it("blocks lectures after end date", () => {
    expect(
      isLectureVisibleForCode({
        status: "active",
        published_starts_at: null,
        published_ends_at: "2026-05-01T00:00:00.000Z"
      }, now)
    ).toBe(false);
  });
});
```

Create `tests/storage.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { buildStoragePath } from "@/src/lib/storage";

describe("storage paths", () => {
  it("normalizes uploaded file names under lecture folders", () => {
    expect(buildStoragePath("lecture-html", "lecture-1", "HPMP high.html")).toBe("lecture-1/hpmp-high.html");
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npm run test -- tests/lectures.test.ts tests/storage.test.ts`

Expected: FAIL because modules do not exist.

- [ ] **Step 3: Implement lecture logic**

Create `src/lib/lectures.ts`:

```ts
import type { LectureStatus } from "@/src/types/database";
import { createSupabaseServiceClient } from "@/src/lib/supabase";

export type LectureVisibilityInput = {
  status: LectureStatus;
  published_starts_at: string | null;
  published_ends_at: string | null;
};

export function isLectureVisibleForCode(lecture: LectureVisibilityInput, now = new Date()) {
  if (lecture.status !== "active") {
    return false;
  }
  if (lecture.published_starts_at && new Date(lecture.published_starts_at) > now) {
    return false;
  }
  if (lecture.published_ends_at && new Date(lecture.published_ends_at) < now) {
    return false;
  }
  return true;
}

export async function listLecturesForAccessCode(accessCodeId: string) {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("lecture_access_codes")
    .select("sort_order, lectures(*)")
    .eq("access_code_id", accessCodeId)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? [])
    .map((row: any) => row.lectures)
    .filter((lecture: any) => lecture && isLectureVisibleForCode(lecture));
}

export async function getAuthorizedLecture(accessCodeId: string, lectureId: string) {
  const lectures = await listLecturesForAccessCode(accessCodeId);
  return lectures.find((lecture: any) => lecture.id === lectureId) ?? null;
}
```

- [ ] **Step 4: Implement artifact logic**

Create `src/lib/artifacts.ts`:

```ts
import { createSupabaseServiceClient } from "@/src/lib/supabase";

export async function listActiveArtifactsForLecture(lectureId: string) {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("artifacts")
    .select("*")
    .eq("lecture_id", lectureId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getArtifact(artifactId: string) {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.from("artifacts").select("*").eq("id", artifactId).single();
  if (error) {
    throw new Error(error.message);
  }
  return data;
}
```

- [ ] **Step 5: Implement storage logic**

Create `src/lib/storage.ts`:

```ts
import { createSupabaseServiceClient } from "@/src/lib/supabase";

export type StorageBucket = "lecture-html" | "lecture-artifacts" | "lecture-images";

export function buildStoragePath(_bucket: StorageBucket, ownerId: string, fileName: string) {
  const safeName = fileName
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return `${ownerId}/${safeName}`;
}

export async function createSignedDownloadUrl(bucket: StorageBucket, path: string, expiresInSeconds = 600) {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresInSeconds);
  if (error || !data?.signedUrl) {
    throw new Error(error?.message ?? "Failed to create signed URL");
  }
  return data.signedUrl;
}

export async function createSignedUploadUrl(bucket: StorageBucket, path: string) {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(path);
  if (error || !data?.signedUrl) {
    throw new Error(error?.message ?? "Failed to create signed upload URL");
  }
  return data;
}
```

- [ ] **Step 6: Verify**

Run: `npm run test -- tests/lectures.test.ts tests/storage.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/lib/lectures.ts src/lib/artifacts.ts src/lib/storage.ts tests/lectures.test.ts tests/storage.test.ts
git commit -m "feat: add lecture and storage domain logic"
```

## Task 5: Implement Learner Login, Catalog, Viewer, and Signed URLs

**Files:**
- Create: `app/api/learner/login/route.ts`
- Create: `app/api/learner/logout/route.ts`
- Create: `app/api/lectures/[lectureId]/signed-url/route.ts`
- Create: `app/api/artifacts/[artifactId]/signed-url/route.ts`
- Modify: `app/page.tsx`
- Create: `app/lecture/[lectureId]/page.tsx`
- Create: `components/learner/HeroBanner.tsx`
- Create: `components/learner/LectureCard.tsx`
- Create: `components/learner/LectureViewer.tsx`
- Create: `components/learner/ArtifactPanel.tsx`

- [ ] **Step 1: Implement learner login route**

Create `app/api/learner/login/route.ts`:

```ts
import { redirect } from "next/navigation";
import { createSupabaseServiceClient } from "@/src/lib/supabase";
import { createCodeHash } from "@/src/lib/crypto";
import { learnerCodeSchema } from "@/src/lib/validation";
import { setLearnerSession } from "@/src/lib/cookies";

export async function POST(request: Request) {
  const form = await request.formData();
  const code = learnerCodeSchema.parse(String(form.get("code") ?? ""));
  const hash = await createCodeHash(code, process.env.SESSION_SECRET ?? "");
  const now = new Date().toISOString();
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("access_codes")
    .select("id")
    .eq("code_hash", hash)
    .eq("is_active", true)
    .lte("starts_at", now)
    .gte("ends_at", now)
    .single();

  if (error || !data) {
    redirect("/?error=invalid-code");
  }

  await setLearnerSession(data.id);
  redirect("/lectures");
}
```

- [ ] **Step 2: Add catalog route and card components**

Create `app/lectures/page.tsx`:

```tsx
import { redirect } from "next/navigation";
import { readSession, learnerCookieName } from "@/src/lib/cookies";
import { listLecturesForAccessCode } from "@/src/lib/lectures";
import { HeroBanner } from "@/components/learner/HeroBanner";
import { LectureCard } from "@/components/learner/LectureCard";

export default async function LectureCatalogPage() {
  const session = await readSession(learnerCookieName);
  if (!session || session.role !== "learner") {
    redirect("/");
  }

  const lectures = await listLecturesForAccessCode(session.accessCodeId);

  return (
    <main className="min-h-screen px-6 py-6 text-cool-ink">
      <div className="mx-auto max-w-7xl">
        <HeroBanner />
        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lectures.map((lecture: any) => (
            <LectureCard key={lecture.id} lecture={lecture} />
          ))}
        </section>
      </div>
    </main>
  );
}
```

Create `components/learner/HeroBanner.tsx`:

```tsx
export function HeroBanner() {
  return (
    <section className="overflow-hidden rounded-lg border border-sky-100 bg-white shadow-soft">
      <div className="bg-gradient-to-r from-cool-mist via-white to-cool-blue px-6 py-8">
        <p className="text-sm font-semibold text-hanwha-orange">한화손보 사내강의</p>
        <h1 className="mt-2 text-3xl font-bold text-cool-ink">AI 강의자료 관리 시스템</h1>
        <p className="mt-2 text-sm text-slate-600">등록된 교육 자료와 실습 아티팩트를 한 곳에서 확인하세요.</p>
      </div>
    </section>
  );
}
```

Create `components/learner/LectureCard.tsx`:

```tsx
import Link from "next/link";

export function LectureCard({ lecture }: { lecture: any }) {
  return (
    <Link className="rounded-lg border border-sky-100 bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-hanwha-orange" href={`/lecture/${lecture.id}`}>
      <p className="text-xs font-semibold text-hanwha-orange">LECTURE</p>
      <h2 className="mt-2 text-lg font-bold">{lecture.title}</h2>
      <p className="mt-2 line-clamp-3 text-sm text-slate-600">{lecture.description}</p>
      <div className="mt-4 text-xs text-slate-500">강의 보기</div>
    </Link>
  );
}
```

- [ ] **Step 3: Add lecture viewer and artifact panel**

Create `app/lecture/[lectureId]/page.tsx`:

```tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArtifactPanel } from "@/components/learner/ArtifactPanel";
import { LectureViewer } from "@/components/learner/LectureViewer";
import { listActiveArtifactsForLecture } from "@/src/lib/artifacts";
import { learnerCookieName, readSession } from "@/src/lib/cookies";
import { getAuthorizedLecture } from "@/src/lib/lectures";

export default async function LecturePage({ params }: { params: Promise<{ lectureId: string }> }) {
  const { lectureId } = await params;
  const session = await readSession(learnerCookieName);
  if (!session || session.role !== "learner") {
    redirect("/");
  }
  const lecture = await getAuthorizedLecture(session.accessCodeId, lectureId);
  if (!lecture) {
    redirect("/lectures");
  }
  const artifacts = await listActiveArtifactsForLecture(lectureId);

  return (
    <main className="flex h-screen flex-col bg-slate-950 text-white">
      <header className="flex h-14 items-center justify-between border-b border-white/10 px-4">
        <Link className="text-sm text-sky-100" href="/lectures">목록으로</Link>
        <h1 className="truncate text-sm font-semibold">{lecture.title}</h1>
        <span className="text-xs text-slate-400">한화손보 사내강의</span>
      </header>
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px]">
        <LectureViewer lectureId={lectureId} title={lecture.title} />
        <ArtifactPanel artifacts={artifacts} />
      </div>
    </main>
  );
}
```

Create `components/learner/LectureViewer.tsx`:

```tsx
export function LectureViewer({ lectureId, title }: { lectureId: string; title: string }) {
  return (
    <section className="min-h-0 bg-slate-950 p-3">
      <iframe
        className="h-full min-h-[70vh] w-full rounded-md border-0 bg-white"
        src={`/api/lectures/${lectureId}/signed-url`}
        title={title}
        sandbox="allow-scripts allow-downloads allow-forms allow-popups"
      />
    </section>
  );
}
```

Create `components/learner/ArtifactPanel.tsx`:

```tsx
const labels: Record<string, string> = {
  practice: "실습파일",
  reference: "참고자료",
  external: "외부 링크",
  preparation: "사전 준비"
};

export function ArtifactPanel({ artifacts }: { artifacts: any[] }) {
  const groups = artifacts.reduce<Record<string, any[]>>((acc, artifact) => {
    acc[artifact.category] = [...(acc[artifact.category] ?? []), artifact];
    return acc;
  }, {});

  return (
    <aside className="overflow-y-auto border-l border-white/10 bg-white p-4 text-cool-ink">
      <h2 className="text-base font-bold">강의 아티팩트</h2>
      <div className="mt-4 space-y-5">
        {Object.entries(groups).map(([category, items]) => (
          <section key={category}>
            <h3 className="text-sm font-semibold text-slate-700">{labels[category]}</h3>
            <div className="mt-2 space-y-2">
              {items.map((artifact) => (
                <a
                  className="block rounded-md border border-sky-100 p-3 text-sm hover:border-hanwha-orange"
                  href={artifact.type === "link" ? artifact.url : `/api/artifacts/${artifact.id}/signed-url`}
                  target={artifact.type === "link" ? "_blank" : undefined}
                  rel={artifact.type === "link" ? "noreferrer" : undefined}
                  key={artifact.id}
                >
                  <strong>{artifact.title}</strong>
                  {artifact.description ? <p className="mt-1 text-xs text-slate-500">{artifact.description}</p> : null}
                </a>
              ))}
            </div>
          </section>
        ))}
      </div>
    </aside>
  );
}
```

- [ ] **Step 4: Add signed URL routes**

Create `app/api/lectures/[lectureId]/signed-url/route.ts`:

```ts
import { NextResponse } from "next/server";
import { learnerCookieName, readSession } from "@/src/lib/cookies";
import { getAuthorizedLecture } from "@/src/lib/lectures";
import { createSignedDownloadUrl } from "@/src/lib/storage";

export async function GET(_request: Request, { params }: { params: Promise<{ lectureId: string }> }) {
  const session = await readSession(learnerCookieName);
  if (!session || session.role !== "learner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { lectureId } = await params;
  const lecture = await getAuthorizedLecture(session.accessCodeId, lectureId);
  if (!lecture?.html_storage_path) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const signedUrl = await createSignedDownloadUrl("lecture-html", lecture.html_storage_path);
  return NextResponse.redirect(signedUrl);
}
```

Create `app/api/artifacts/[artifactId]/signed-url/route.ts`:

```ts
import { NextResponse } from "next/server";
import { getArtifact } from "@/src/lib/artifacts";
import { learnerCookieName, readSession } from "@/src/lib/cookies";
import { getAuthorizedLecture } from "@/src/lib/lectures";
import { createSignedDownloadUrl } from "@/src/lib/storage";

export async function GET(_request: Request, { params }: { params: Promise<{ artifactId: string }> }) {
  const session = await readSession(learnerCookieName);
  if (!session || session.role !== "learner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { artifactId } = await params;
  const artifact = await getArtifact(artifactId);
  const lecture = await getAuthorizedLecture(session.accessCodeId, artifact.lecture_id);
  if (!lecture || artifact.type !== "file" || !artifact.storage_path) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const signedUrl = await createSignedDownloadUrl("lecture-artifacts", artifact.storage_path);
  return NextResponse.redirect(signedUrl);
}
```

- [ ] **Step 5: Verify**

Run: `npm run build`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app components/learner src/lib
git commit -m "feat: add learner lecture experience"
```

## Task 6: Implement Admin Console MVP

**Files:**
- Create: `app/admin/login/page.tsx`
- Create: `app/admin/page.tsx`
- Create: `app/admin/lectures/page.tsx`
- Create: `app/admin/codes/page.tsx`
- Create: `app/admin/settings/page.tsx`
- Create: `components/admin/AdminShell.tsx`
- Create: `components/admin/LectureEditor.tsx`
- Create: `components/admin/ArtifactEditor.tsx`
- Create: `components/admin/CodeManager.tsx`
- Create: `app/api/admin/lectures/route.ts`
- Create: `app/api/admin/codes/route.ts`
- Create: `app/api/admin/artifacts/route.ts`
- Create: `app/api/admin/upload-url/route.ts`

- [ ] **Step 1: Create admin shell**

Create `components/admin/AdminShell.tsx`:

```tsx
import Link from "next/link";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-cool-ice text-cool-ink">
      <header className="border-b border-sky-100 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link className="font-bold" href="/admin">한화손보 강의 관리자</Link>
          <nav className="flex gap-4 text-sm">
            <Link href="/admin/lectures">강의 관리</Link>
            <Link href="/admin/codes">접속 코드</Link>
            <Link href="/admin/settings">설정</Link>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-6 py-6">{children}</div>
    </main>
  );
}
```

- [ ] **Step 2: Create admin login page**

Create `app/admin/login/page.tsx`:

```tsx
export default function AdminLoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-cool-ice px-6">
      <form className="w-full max-w-sm rounded-lg border border-sky-100 bg-white p-6 shadow-soft" action="/api/admin/login" method="post">
        <p className="text-sm font-semibold text-hanwha-orange">Admin</p>
        <h1 className="mt-2 text-2xl font-bold">관리자 접속</h1>
        <label className="mt-6 block text-sm font-semibold" htmlFor="code">관리자 코드</label>
        <input id="code" name="code" className="mt-2 w-full rounded-md border border-sky-200 px-3 py-2" required />
        <button className="mt-4 w-full rounded-md bg-hanwha-orange px-4 py-2 font-semibold text-white" type="submit">접속</button>
      </form>
    </main>
  );
}
```

- [ ] **Step 3: Create admin dashboard page**

Create `app/admin/page.tsx`:

```tsx
import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminPage() {
  return (
    <AdminShell>
      <section className="rounded-lg border border-sky-100 bg-white p-6 shadow-soft">
        <h1 className="text-2xl font-bold">운영 현황</h1>
        <p className="mt-2 text-sm text-slate-600">활성 코드, 공개 강의, 최근 수정 항목을 확인합니다.</p>
      </section>
    </AdminShell>
  );
}
```

- [ ] **Step 4: Create admin lectures page**

Create `app/admin/lectures/page.tsx`:

```tsx
import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminLecturesPage() {
  return (
    <AdminShell>
      <section className="rounded-lg border border-sky-100 bg-white p-6 shadow-soft">
        <h1 className="text-2xl font-bold">강의 관리</h1>
        <p className="mt-2 text-sm text-slate-600">강좌 생성, HTML 업로드, 공개 상태, 아티팩트를 관리합니다.</p>
      </section>
    </AdminShell>
  );
}
```

- [ ] **Step 5: Create admin codes page**

Create `app/admin/codes/page.tsx`:

```tsx
import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminCodesPage() {
  return (
    <AdminShell>
      <section className="rounded-lg border border-sky-100 bg-white p-6 shadow-soft">
        <h1 className="text-2xl font-bold">접속 코드 관리</h1>
        <p className="mt-2 text-sm text-slate-600">기간제 수강 코드를 만들고 연결 강의를 운영합니다.</p>
      </section>
    </AdminShell>
  );
}
```

- [ ] **Step 6: Create admin settings page**

Create `app/admin/settings/page.tsx`:

```tsx
import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminSettingsPage() {
  return (
    <AdminShell>
      <section className="rounded-lg border border-sky-100 bg-white p-6 shadow-soft">
        <h1 className="text-2xl font-bold">시스템 설정</h1>
        <p className="mt-2 text-sm text-slate-600">관리자 코드, 기본 이미지, 업로드 제한을 확인합니다.</p>
      </section>
    </AdminShell>
  );
}
```

- [ ] **Step 7: Create admin API shells with real authorization gates**

Create `app/api/admin/lectures/route.ts`:

```ts
import { NextResponse } from "next/server";
import { adminCookieName, readSession } from "@/src/lib/cookies";

export async function GET() {
  const session = await readSession(adminCookieName);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ lectures: [] });
}
```

Create `app/api/admin/codes/route.ts`:

```ts
import { NextResponse } from "next/server";
import { adminCookieName, readSession } from "@/src/lib/cookies";

export async function GET() {
  const session = await readSession(adminCookieName);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ codes: [] });
}
```

Create `app/api/admin/artifacts/route.ts`:

```ts
import { NextResponse } from "next/server";
import { adminCookieName, readSession } from "@/src/lib/cookies";

export async function GET() {
  const session = await readSession(adminCookieName);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ artifacts: [] });
}
```

Create `app/api/admin/upload-url/route.ts`:

```ts
import { NextResponse } from "next/server";
import { adminCookieName, readSession } from "@/src/lib/cookies";

export async function GET() {
  const session = await readSession(adminCookieName);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ uploads: [] });
}
```

- [ ] **Step 8: Verify**

Run: `npm run build`

Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add app/admin app/api/admin components/admin
git commit -m "feat: add admin console shell"
```

## Task 7: Complete Admin Mutations and Upload Flow

**Files:**
- Modify: `app/api/admin/lectures/route.ts`
- Modify: `app/api/admin/codes/route.ts`
- Modify: `app/api/admin/artifacts/route.ts`
- Modify: `app/api/admin/upload-url/route.ts`
- Modify: `components/admin/LectureEditor.tsx`
- Modify: `components/admin/ArtifactEditor.tsx`
- Modify: `components/admin/CodeManager.tsx`

- [ ] **Step 1: Add admin mutation schemas to `src/lib/validation.ts`**

Append:

```ts
export const createLectureSchema = z.object({
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(1000).default(""),
  status: lectureStatusSchema.default("draft"),
  htmlStoragePath: z.string().trim().min(1).optional(),
  thumbnailStoragePath: z.string().trim().min(1).optional(),
  usesDefaultHero: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0)
});

export const createAccessCodeSchema = z.object({
  name: z.string().trim().min(1).max(120),
  code: learnerCodeSchema,
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  isActive: z.boolean().default(true),
  notes: z.string().trim().max(500).optional()
});
```

- [ ] **Step 2: Implement lecture creation**

Replace `app/api/admin/lectures/route.ts` with:

```ts
import { NextResponse } from "next/server";
import { adminCookieName, readSession } from "@/src/lib/cookies";
import { createSupabaseServiceClient } from "@/src/lib/supabase";
import { createLectureSchema } from "@/src/lib/validation";

async function requireAdmin() {
  const session = await readSession(adminCookieName);
  return Boolean(session && session.role === "admin");
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.from("lectures").select("*").order("sort_order", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ lectures: data ?? [] });
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const input = createLectureSchema.parse(await request.json());
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("lectures")
    .insert({
      title: input.title,
      description: input.description,
      status: input.status,
      html_storage_path: input.htmlStoragePath ?? null,
      thumbnail_storage_path: input.thumbnailStoragePath ?? null,
      uses_default_hero: input.usesDefaultHero,
      sort_order: input.sortOrder
    })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ lecture: data }, { status: 201 });
}
```

- [ ] **Step 3: Implement code creation**

Replace `app/api/admin/codes/route.ts` with:

```ts
import { NextResponse } from "next/server";
import { adminCookieName, readSession } from "@/src/lib/cookies";
import { createCodeHash } from "@/src/lib/crypto";
import { createSupabaseServiceClient } from "@/src/lib/supabase";
import { createAccessCodeSchema } from "@/src/lib/validation";

async function requireAdmin() {
  const session = await readSession(adminCookieName);
  return Boolean(session && session.role === "admin");
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.from("access_codes").select("id,name,starts_at,ends_at,is_active,notes,created_at,updated_at").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ codes: data ?? [] });
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const input = createAccessCodeSchema.parse(await request.json());
  const codeHash = await createCodeHash(input.code, process.env.SESSION_SECRET ?? "");
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("access_codes")
    .insert({
      name: input.name,
      code_hash: codeHash,
      starts_at: input.startsAt,
      ends_at: input.endsAt,
      is_active: input.isActive,
      notes: input.notes ?? null
    })
    .select("id,name,starts_at,ends_at,is_active,notes,created_at,updated_at")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ code: data }, { status: 201 });
}
```

- [ ] **Step 4: Implement upload URL creation**

Replace `app/api/admin/upload-url/route.ts` with:

```ts
import { NextResponse } from "next/server";
import { adminCookieName, readSession } from "@/src/lib/cookies";
import { buildStoragePath, createSignedUploadUrl, type StorageBucket } from "@/src/lib/storage";
import { isAllowedArtifactFile, isAllowedHtmlFile } from "@/src/lib/validation";

async function requireAdmin() {
  const session = await readSession(adminCookieName);
  return Boolean(session && session.role === "admin");
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const bucket = body.bucket as StorageBucket;
  const ownerId = String(body.ownerId ?? "");
  const fileName = String(body.fileName ?? "");
  const allowed = bucket === "lecture-html" ? isAllowedHtmlFile(fileName) : isAllowedArtifactFile(fileName);
  if (!ownerId || !fileName || !allowed) {
    return NextResponse.json({ error: "Invalid upload request" }, { status: 400 });
  }
  const path = buildStoragePath(bucket, ownerId, fileName);
  const upload = await createSignedUploadUrl(bucket, path);
  return NextResponse.json({ path, upload });
}
```

- [ ] **Step 5: Verify**

Run: `npm run test`

Expected: PASS.

Run: `npm run build`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app/api/admin src/lib/validation.ts components/admin
git commit -m "feat: add admin mutations and upload urls"
```

## Task 8: Add Visual Assets and Summer Cool-Tone Polish

**Files:**
- Add: `public/hero-full.png`
- Add: `public/hero-wide.png`
- Modify: `components/learner/HeroBanner.tsx`
- Modify: `app/page.tsx`
- Modify: `components/learner/LectureCard.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Copy source hero files**

Copy:

```bash
cp "/Users/park-yong-kyy/Downloads/ChatGPT Image 2026년 4월 30일 오전 11_00_19.png" public/hero-full.png
cp "/Users/park-yong-kyy/Downloads/ChatGPT Image 2026년 4월 30일 오전 10_50_09.png" public/hero-wide.png
```

Expected: files exist in `public/`.

- [ ] **Step 2: Update hero banner with real image**

Replace `components/learner/HeroBanner.tsx` with:

```tsx
import Image from "next/image";

export function HeroBanner() {
  return (
    <section className="overflow-hidden rounded-lg border border-sky-100 bg-white shadow-soft">
      <div className="relative min-h-[220px]">
        <Image src="/hero-wide.png" alt="한화손보 사내강의" fill priority className="object-cover" />
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Verify responsive layout**

Run: `npm run build`

Expected: PASS.

Run: `npm run dev`

Expected: local server starts at `http://127.0.0.1:3000`.

Open the page in a browser and check:

- Login card text is readable over summer cool-tone background.
- Hero image is visible on `/lectures` when a valid session exists.
- Lecture cards do not use a one-note orange palette.
- Text does not overflow card boundaries.

- [ ] **Step 4: Commit**

```bash
git add public app components/learner
git commit -m "style: apply Hanwha cool-tone visual direction"
```

## Task 9: Add End-to-End Checks and Deployment Notes

**Files:**
- Create: `tests/e2e/learner-flow.spec.ts`
- Create: `README.md`
- Create: `docs/deployment/vercel-supabase.md`

- [ ] **Step 1: Add E2E smoke test**

Create `tests/e2e/learner-flow.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("learner login page renders", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "사내강의 접속" })).toBeVisible();
  await expect(page.getByLabel("접속 코드")).toBeVisible();
});

test("admin login page renders", async ({ page }) => {
  await page.goto("/admin/login");
  await expect(page.getByRole("heading", { name: "관리자 접속" })).toBeVisible();
  await expect(page.getByLabel("관리자 코드")).toBeVisible();
});
```

- [ ] **Step 2: Add README**

Create `README.md`:

```md
# Hanwha Lecture Management System

Temporary Vercel-hosted lecture portal for Hanwha internal AI training.

## Local Setup

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env.local`
3. Fill Supabase URL, service role key, and `SESSION_SECRET`
4. Run database migration in Supabase SQL editor
5. Start dev server: `npm run dev`

## Verification

- Unit tests: `npm run test`
- Build: `npm run build`
- E2E smoke tests: `npm run e2e`
```

- [ ] **Step 3: Add deployment note**

Create `docs/deployment/vercel-supabase.md`:

```md
# Vercel and Supabase Deployment

## Required Vercel Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SESSION_SECRET`
- `NEXT_PUBLIC_APP_URL`

## Supabase Storage Buckets

Create private buckets:

- `lecture-html`
- `lecture-artifacts`
- `lecture-images`

The app issues signed URLs after checking learner or admin session authorization.

## Database

Run `supabase/migrations/001_initial_schema.sql` in the Supabase SQL editor before deploying the app.
```

- [ ] **Step 4: Verify**

Run: `npm run test`

Expected: PASS.

Run: `npm run build`

Expected: PASS.

Run: `npm run e2e`

Expected: PASS for login page smoke tests.

- [ ] **Step 5: Commit**

```bash
git add tests/e2e README.md docs/deployment
git commit -m "docs: add deployment and smoke checks"
```

## Self-Review

Spec coverage:

- Learner code login and one-day session are covered in Tasks 3 and 5.
- Code-filtered lecture catalog is covered in Tasks 4 and 5.
- HTML iframe viewing is covered in Task 5.
- Artifact file/link panel is covered in Tasks 4 and 5.
- Admin-code login and admin console are covered in Tasks 6 and 7.
- Lecture/code/artifact creation and upload signed URLs are covered in Task 7.
- Supabase schema and Storage buckets are covered in Tasks 2, 4, 7, and 9.
- Vercel deployment notes are covered in Task 9.
- Summer cool-tone UI and Hanwha imagery are covered in Task 8.

Placeholder scan:

- This plan avoids incomplete markers and unspecified implementation gaps.
- Admin API shell in Task 6 intentionally returns minimal authorized responses and is completed by Task 7.

Type consistency:

- `LectureStatus`, `ArtifactType`, and `ArtifactCategory` match schema values.
- Cookie names and session role strings are consistent across auth, routes, and pages.
- Storage bucket names match the design spec and deployment notes.
