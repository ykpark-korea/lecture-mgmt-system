# Hanwha Lecture Management System Design

## Summary

Build a temporary Hanwha General Insurance internal lecture management system on Vercel. Learners enter a time-limited shared access code, see only the active lectures attached to that code, open a lecture in a full-screen HTML viewer, and use a right-side artifact panel for practice files, reference files, preparation notes, and external links.

Admins initially enter with an admin code rather than a full account system. The admin console lets operators create lectures, upload self-contained HTML lecture materials, upload optional thumbnails, register artifacts, create learner access codes, set code validity periods, and open or disable lectures per code.

The MVP uses Next.js on Vercel and Supabase for Postgres data plus Storage. Vercel must not be treated as persistent file storage.

## Decisions

- Learner access uses multiple time-limited shared codes, such as a code per training cohort.
- Admin access starts with admin codes, while the data model leaves room for later account-based admin login.
- Uploaded HTML lectures are shown through an iframe in the MVP.
- Future versions may parse HTML slide data for thumbnails, slide search, or slide-specific artifacts.
- Artifacts support file downloads and external links, with category and description metadata.
- Sessions last for one day after successful learner code entry.
- The system is deployed temporarily on Vercel.
- Supabase stores all durable data and uploaded assets.
- Default hero and course imagery can use the provided Hanwha lecture images, with optional lecture-specific thumbnail upload.
- Visual design should use a summer cool-tone base: airy white, cool blue, pale cyan, soft mint, and light gray, with Hanwha orange reserved as a restrained accent.

## Product Areas

### Learner Portal

The learner enters a shared access code. The server hashes and validates the code against active `access_codes`, checks the validity window, and issues a one-day httpOnly session cookie.

After login, the learner sees a lecture catalog filtered by the access code. Only active lectures attached to the valid code are visible. The catalog uses a compact card grid with title, description, validity or course period, artifact count, status hint, and thumbnail.

The top banner uses the provided Hanwha lecture hero imagery by default. The styling should feel like an internal learning portal rather than a marketing landing page.

### Lecture Viewer

The lecture viewer prioritizes the uploaded HTML. The center or left content area contains a large iframe. The attached sample files are self-contained slide players of about 14 MB and 18 MB, containing 25 and 39 slides respectively, so the MVP preserves the original HTML behavior.

The right-side artifact panel is available throughout the lecture. It groups artifacts by category:

- `practice`: 실습파일
- `reference`: 참고자료
- `external`: 외부 링크
- `preparation`: 사전 준비

File artifacts download through access-checked signed URLs. Link artifacts open in a new tab. The panel can collapse on desktop and becomes a drawer or overlay on narrow screens.

### Admin Console

Admins enter an admin code. The server validates it against `admin_codes`, checks expiry and active status, and issues a short-lived httpOnly admin session cookie.

The console has three primary areas:

- `강의 관리`: create and edit lectures, upload HTML, set thumbnail/default image, set status, connect access codes, and manage artifacts.
- `접속 코드 관리`: create learner codes, set start/end dates, activate/deactivate codes, attach lectures, and copy issued codes.
- `시스템 설정`: rotate admin code, manage default hero imagery, and view upload constraints.

The admin landing view should summarize what is currently open: active learner codes, connected lectures, expired codes, inactive lectures, and recent edits.

## Data Model

### `access_codes`

Learner access code definitions.

- `id`
- `name`
- `code_hash`
- `starts_at`
- `ends_at`
- `is_active`
- `notes`
- `created_at`
- `updated_at`

Plaintext learner codes are not stored. Codes are compared through server-side hashing.

### `admin_codes`

Temporary admin-code access for MVP.

- `id`
- `name`
- `code_hash`
- `expires_at`
- `is_active`
- `created_at`
- `updated_at`

This table can later be replaced or supplemented by `admin_users` or Supabase Auth.

### `lectures`

Lecture metadata.

- `id`
- `title`
- `description`
- `status`: `draft`, `active`, or `inactive`
- `html_storage_path`
- `thumbnail_storage_path`
- `uses_default_hero`
- `published_starts_at`
- `published_ends_at`
- `sort_order`
- `created_at`
- `updated_at`

Lecture visibility requires both lecture status and access-code linkage to pass.

### `lecture_access_codes`

Many-to-many mapping between learner codes and lectures.

- `id`
- `lecture_id`
- `access_code_id`
- `sort_order`
- `created_at`

This allows one lecture to be reused across multiple cohorts and one code to open multiple lectures.

### `artifacts`

Lecture artifacts shown in the right-side panel.

- `id`
- `lecture_id`
- `type`: `file` or `link`
- `category`: `practice`, `reference`, `external`, or `preparation`
- `title`
- `description`
- `url`
- `storage_path`
- `is_active`
- `sort_order`
- `created_at`
- `updated_at`

For `file`, `storage_path` is required. For `link`, `url` is required.

## Supabase Storage

Use separate buckets:

- `lecture-html`: uploaded HTML lecture files.
- `lecture-artifacts`: downloadable files such as PDF, ZIP, XLSX, PPTX, DOCX, CSV, images, and zipped code samples.
- `lecture-images`: hero images and lecture thumbnails.

The app should not expose permanent public URLs for private course assets. Server routes should validate the current learner or admin session, confirm lecture access, and then issue short-lived signed URLs.

## Security

### Learner Authorization

Learner APIs require a valid learner session cookie. The session stores or references the validated `access_code_id`. Every lecture list, lecture URL request, artifact list, and file download request checks that the lecture is connected to that access code and currently active.

### Admin Authorization

Admin APIs require a valid admin session cookie. Only admin sessions can create, update, upload, activate, deactivate, or connect records.

### Uploaded HTML

Uploaded HTML is trusted admin content, but it still runs in an iframe with a restrictive sandbox. The sandbox should allow scripts needed by the self-contained slide player while blocking parent-page access and top-level navigation where possible.

Because uploaded HTML may include scripts and data URLs, only trusted admins should upload lecture HTML. The MVP should not accept learner uploads.

### Upload Rules

HTML uploads accept `.html` only. Artifact uploads accept a limited allowlist: `pdf`, `zip`, `xlsx`, `pptx`, `docx`, `csv`, common image files, and code sample archives. The UI should show the max upload size before upload.

The initial file-size target should handle at least the provided 14 MB and 18 MB HTML files. A practical MVP limit is 50 MB per lecture HTML file unless Supabase/Vercel request limits require a client-direct upload flow.

## UX Direction

The system should feel like a polished internal learning workspace:

- Bright summer cool-tone foundation.
- White and cool gray surfaces.
- Pale cyan or blue page background.
- Mint or blue status accents.
- Hanwha orange used for brand marks, primary action emphasis, progress highlights, and small separators.
- Dense but readable cards and tables.
- No oversized marketing hero copy after login.

The learner-facing screens should stay calm and simple. The admin console should prioritize scanability, current operating state, and fast toggles for code and lecture availability.

## MVP Scope

Included:

- Learner code login with one-day session.
- Code-filtered active lecture catalog.
- HTML lecture iframe viewer.
- Right-side artifact panel.
- File and link artifacts.
- Admin-code login.
- Lecture creation, editing, activation, and deactivation.
- HTML, thumbnail, and artifact uploads.
- Learner access code creation, validity dates, activation, and lecture linking.
- Supabase Postgres and Storage integration.
- Vercel environment variable design.

Excluded:

- Individual learner accounts.
- Employee number login.
- Progress or completion tracking.
- Slide-specific artifact syncing.
- Automatic HTML slide parsing.
- Automatic thumbnail extraction from HTML.
- Multiple admin roles.
- Approval workflow.
- Large video streaming.

## Validation Criteria

The MVP is ready when:

1. An admin can create a learner code with a validity period.
2. An admin can create a lecture, upload an HTML file, attach artifacts, and connect the lecture to the learner code.
3. A learner can enter the code and see only lectures connected to that active code.
4. A learner can open a lecture and operate the embedded HTML slide player.
5. A learner can download file artifacts and open link artifacts from the side panel.
6. Deactivating a lecture removes it from the learner catalog and prevents direct lecture access.
7. Deactivating or expiring an access code prevents catalog, lecture, and artifact access.
8. Uploaded file access uses signed URLs after server-side authorization.

## Future Extensions

- Admin account login with Supabase Auth.
- Per-learner attendance or completion tracking.
- Slide parsing for search, thumbnails, and slide-specific artifacts.
- Automatic thumbnail generation from first slide.
- Audit log for admin changes.
- Bulk import/export of lectures and access-code mappings.
- Korean-language analytics dashboard for temporary education operations.
