-- LinkStash v1 — initial schema
-- bookmarks, tags, bookmark_tags with Row Level Security

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.bookmarks (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id),
  url         text        not null,
  title       text,
  description text,
  favicon_url text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.tags (
  id      uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  name    text not null,
  unique (user_id, name)
);

create table if not exists public.bookmark_tags (
  bookmark_id uuid not null references public.bookmarks(id) on delete cascade,
  tag_id      uuid not null references public.tags(id)      on delete cascade,
  primary key (bookmark_id, tag_id)
);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.bookmarks     enable row level security;
alter table public.tags          enable row level security;
alter table public.bookmark_tags enable row level security;

-- bookmarks
create policy "bookmarks: select own"
  on public.bookmarks for select
  using (user_id = auth.uid());

create policy "bookmarks: insert own"
  on public.bookmarks for insert
  with check (user_id = auth.uid());

create policy "bookmarks: update own"
  on public.bookmarks for update
  using (user_id = auth.uid());

create policy "bookmarks: delete own"
  on public.bookmarks for delete
  using (user_id = auth.uid());

-- tags
create policy "tags: select own"
  on public.tags for select
  using (user_id = auth.uid());

create policy "tags: insert own"
  on public.tags for insert
  with check (user_id = auth.uid());

create policy "tags: update own"
  on public.tags for update
  using (user_id = auth.uid());

create policy "tags: delete own"
  on public.tags for delete
  using (user_id = auth.uid());

-- bookmark_tags — no direct user_id column; ownership checked via parent rows
create policy "bookmark_tags: select own"
  on public.bookmark_tags for select
  using (
    exists (
      select 1 from public.bookmarks
      where bookmarks.id = bookmark_tags.bookmark_id
        and bookmarks.user_id = auth.uid()
    )
  );

create policy "bookmark_tags: insert own"
  on public.bookmark_tags for insert
  with check (
    exists (
      select 1 from public.bookmarks
      where bookmarks.id = bookmark_tags.bookmark_id
        and bookmarks.user_id = auth.uid()
    )
    and
    exists (
      select 1 from public.tags
      where tags.id = bookmark_tags.tag_id
        and tags.user_id = auth.uid()
    )
  );

create policy "bookmark_tags: delete own"
  on public.bookmark_tags for delete
  using (
    exists (
      select 1 from public.bookmarks
      where bookmarks.id = bookmark_tags.bookmark_id
        and bookmarks.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger bookmarks_updated_at
  before update on public.bookmarks
  for each row execute function public.handle_updated_at();
