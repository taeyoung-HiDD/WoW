-- HiDD WoW — Supabase 초기 스키마
-- Supabase Dashboard → SQL Editor 에서 이 파일 전체를 실행하세요.
--
-- 설정 권장: Authentication → Providers → Email → "Confirm email" 비활성화
-- (팀 내부용이면 가입 후 바로 로그인되도록)

-- ── profiles (auth.users 확장) ─────────────────────────────────────────────

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null unique,
  role text not null default 'user' check (role in ('admin', 'user')),
  status text not null default 'pending' check (status in ('approved', 'pending', 'rejected')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  user_count int;
begin
  select count(*) into user_count from public.profiles;

  insert into public.profiles (id, name, email, role, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    lower(new.email),
    case when user_count = 0 then 'admin' else 'user' end,
    case when user_count = 0 then 'approved' else 'pending' end
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ── projects ─────────────────────────────────────────────────────────────────

create table if not exists public.projects (
  id text primary key,
  name text not null,
  description text not null default '',
  start_date date not null,
  end_date date not null,
  status text not null default 'not_started',
  color text not null,
  notes text not null default '',
  archived boolean not null default false,
  members text[] not null default '{}',
  milestones jsonb not null default '[]',
  files jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_archived_idx on public.projects (archived);

-- ── RLS helpers ─────────────────────────────────────────────────────────────

create or replace function public.is_approved_user()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and status = 'approved'
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
      and status = 'approved'
  );
$$;

-- ── profiles RLS ────────────────────────────────────────────────────────────

alter table public.profiles enable row level security;

drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

drop policy if exists "Admins read all profiles" on public.profiles;
create policy "Admins read all profiles"
  on public.profiles
  for select
  using (public.is_admin());

drop policy if exists "Admins update profiles" on public.profiles;
create policy "Admins update profiles"
  on public.profiles
  for update
  using (public.is_admin());

-- ── projects RLS ────────────────────────────────────────────────────────────

alter table public.projects enable row level security;

drop policy if exists "Approved users read projects" on public.projects;
create policy "Approved users read projects"
  on public.projects
  for select
  using (public.is_approved_user());

drop policy if exists "Approved users insert projects" on public.projects;
create policy "Approved users insert projects"
  on public.projects
  for insert
  with check (public.is_approved_user());

drop policy if exists "Approved users update projects" on public.projects;
create policy "Approved users update projects"
  on public.projects
  for update
  using (public.is_approved_user());

drop policy if exists "Approved users delete projects" on public.projects;
create policy "Approved users delete projects"
  on public.projects
  for delete
  using (public.is_approved_user());
