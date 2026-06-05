# LinkStash

Personal bookmark manager. Save a URL, auto-fetch its metadata, tag it, find it later.
Single-user per account — every user sees only their own data.

> Full requirements live in `LinkStash-PRD.md`. Treat the PRD as the source of truth.
> If a feature is not in the PRD, do not build it — ask first.

## Tech Stack
- Next.js 16 (App Router) + TypeScript (strict)
- Tailwind CSS + shadcn/ui
- Supabase (Postgres + Auth)
- Deployed on Vercel
- Metadata scraping: `open-graph-scraper` in a server Route Handler

## Architecture
- `app/` — routes (App Router). Server Components by default; add `"use client"` only when needed.
- `app/api/` — Route Handlers (e.g. `app/api/metadata/route.ts`).
- `components/` — UI components. shadcn/ui primitives in `components/ui/`.
- `lib/` — shared helpers (`lib/supabase/` for client/server clients).
- `supabase/migrations/` — SQL migrations (source of truth for the schema).

## Coding Standards
- TypeScript strict mode. No `any` — use `unknown` + narrowing if unsure.
- Server-side data access through the Supabase server client. Never expose the service-role key to the client.
- Validate all external input (URLs, form data) with `zod`.
- Keep components small and focused. Co-locate component-only logic.
- Errors: handle and surface user-friendly messages; never swallow silently.

## Database Conventions
- Every schema change is a new file in `supabase/migrations/` — never edit applied migrations.
- All tables have Row Level Security ENABLED with a policy `user_id = auth.uid()`.
- Use `gen_random_uuid()` for primary keys, `timestamptz` for time columns.
- Foreign keys to `bookmarks`/`tags` use `on delete cascade` where appropriate.

## Design
- กฎดีไซน์ทั้งหมดอยู่ใน BRAND.md — อ่านก่อนทำงาน UI ทุกครั้ง

## Commands
- `npm run dev` — local dev server
- `npm run build` — production build (must pass — fails on type errors)
- `npm run lint` — ESLint
- `npm run test:e2e` — Playwright e2e smoke suite (requires TEST_USER_EMAIL / TEST_USER_PASSWORD / E2E_SECRET in .env.local)
- `npx supabase db push` — apply migrations to the linked project

## Workflow Rules
- For any non-trivial feature, use **Plan Mode** first and wait for my approval before editing.
- Work one feature at a time, in the order listed in the PRD must-haves.
- After changing code, run `npm run lint` and `npm run build` before considering it done.
- Keep `.env.local` out of git. Reference secrets via `process.env`, never hardcode.
- Commit messages: `feat: ...`, `fix: ...`, `chore: ...`. One logical change per commit.

## Definition of Done (per feature)
- [ ] Matches the PRD acceptance for that feature
- [ ] `npm run build` and `npm run lint` pass
- [ ] No secrets or keys in the diff
- [ ] RLS verified if the feature touches the database

## Scope Guard — do NOT build in v1
Browser extension · public/shared links · AI summaries · multi-user workspaces · mobile app · bookmark import.
If a request implies one of these, flag it and confirm before proceeding.
