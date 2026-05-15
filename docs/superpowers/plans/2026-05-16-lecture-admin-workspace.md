# Lecture Admin Workspace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the admin lecture management page around a lecture list and selected lecture workspace.

**Architecture:** Add one focused client component, `LectureAdminWorkspace`, that owns lecture selection and coordinates lecture editing, material upload, artifact creation, and access-code visibility. Keep existing API routes and legacy editor components intact to minimize backend risk.

**Tech Stack:** Next.js App Router, React client component, Supabase-backed admin APIs, Tailwind CSS, lucide-react, Vitest/Testing Library.

---

### Task 1: Workspace Component

**Files:**
- Create: `components/admin/LectureAdminWorkspace.tsx`
- Modify: `app/admin/lectures/page.tsx`

- [ ] Build a two-column layout: left lecture list with search/filter/create, right selected lecture detail workspace.
- [ ] Support tabs: 기본 정보, 강의자료, 학습자료, 접속 코드.
- [ ] Reuse existing `/api/admin/lectures`, `/api/admin/artifacts`, `/api/admin/codes`, `/api/admin/lecture-access`, `/api/admin/upload-url`.
- [ ] Preserve create/update lecture and create artifact flows.
- [ ] Auto-select the saved lecture after creating.

### Task 2: Visual Polish and Guardrails

**Files:**
- Modify: `components/admin/LectureAdminWorkspace.tsx`
- Modify: `.gitignore`

- [ ] Add visible validity badges: 공개 가능, 자료 없음, 코드 미연결, 초안, 비공개.
- [ ] Add learner preview link when a saved lecture is selected.
- [ ] Ignore `.superpowers/` brainstorming artifacts.

### Task 3: Verification

**Files:**
- Test existing suite.

- [ ] Run `npm run test`.
- [ ] Run `npm run lint`.
- [ ] Run `./node_modules/.bin/tsc --noEmit`.
- [ ] Run `npm run build`.
- [ ] Commit, push, deploy to Vercel production.
