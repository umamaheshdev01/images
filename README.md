# Image Gallery

Upload images, tag them, and search by tag. Built with **Next.js (App Router) +
TypeScript + Tailwind** and **Supabase** (Auth, Storage, Postgres).

## Features

- Email sign-in / sign-up (Supabase Auth)
- Upload images to a private Storage bucket
- Add / remove multiple tags per image
- Filter the gallery by one or more tags
- Delete images (file + metadata)
- Per-user isolation via Row-Level Security

## Setup

### 1. Create a Supabase project
Go to [supabase.com](https://supabase.com), create a project, and grab from
**Project Settings → API**:
- Project URL
- `anon` public key

### 2. Configure environment
```bash
cp .env.local.example .env.local
```
Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### 3. Create the database schema
In the Supabase **SQL Editor**, run:

```sql
create table images (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  created_at timestamptz not null default now()
);

create table tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  unique (user_id, name)
);

create table image_tags (
  image_id uuid not null references images(id) on delete cascade,
  tag_id   uuid not null references tags(id)   on delete cascade,
  primary key (image_id, tag_id)
);

alter table images     enable row level security;
alter table tags       enable row level security;
alter table image_tags enable row level security;

create policy "own images" on images for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own tags" on tags for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own join" on image_tags for all
  using (exists (select 1 from images i where i.id = image_id and i.user_id = auth.uid()))
  with check (exists (select 1 from images i where i.id = image_id and i.user_id = auth.uid()));
```

### 4. Create the Storage bucket
In **Storage**, create a **private** bucket named `images`. Then add policies so
authenticated users can only touch their own folder (run in SQL Editor):

```sql
create policy "own files read" on storage.objects for select
  using (bucket_id = 'images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "own files insert" on storage.objects for insert
  with check (bucket_id = 'images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "own files delete" on storage.objects for delete
  using (bucket_id = 'images' and (storage.foldername(name))[1] = auth.uid()::text);
```

> For faster local testing, you can disable email confirmation under
> **Authentication → Providers → Email** ("Confirm email" off).

### 5. Run
```bash
npm install
npm run dev
```
Open http://localhost:3000 — you'll be redirected to `/login`.

## How it works

- Files live in the `images` bucket under `{user_id}/{uuid}-{filename}`.
- Each file has a row in `images`; tags are normalized in `tags` and linked via
  `image_tags`.
- The gallery loads rows + nested tags, generates signed URLs for display, and
  filters client-side by selected tags.
- RLS ensures every user only ever sees and modifies their own data.
# images
