-- Cook-Walden IABA map — Supabase schema
-- =========================================
-- Run this ONCE in the Supabase SQL editor (Dashboard → SQL Editor → New query
-- → paste → Run) when you first create the project. It is safe to re-run.
--
-- The design in one sentence: the mutable *records* (status, owner, burial info)
-- live here in `plots`; the public website is ONLY ever allowed to read the
-- filtered `public_plots` view, so private fields can never reach a visitor.
--
--   * plots          — the full record. Only a logged-in admin can read/write it.
--   * public_plots   — a filtered VIEW the anonymous website reads. It hides the
--                      internal notes and only shows an owner name on VACANT plots.
--
-- Plot geometry (the polygons) is NOT stored here — it lives as a static file in
-- the repo (data/plots-geometry.geojson) because shapes aren't sensitive and never
-- change. The website joins geometry (by id) to the records it fetches from here.

-- ---------------------------------------------------------------------------
-- 1. The records table
-- ---------------------------------------------------------------------------
create table if not exists public.plots (
  id             text primary key,            -- '14-B3' (lot + space)
  lot            integer not null,
  space          text    not null,
  status         text    not null
                   check (status in ('buried','occupied','vacant',
                                     'unowned','bohri','other','unusable')),
  color          text,                        -- original diagram color (derivable from status)
  owner          text,                         -- deed holder; only published when vacant
  person_name    text,                         -- deceased ("LAST, First")
  person_burial  date,                         -- burial date
  internal_notes text,                         -- PRIVATE: never exposed by the public view
  updated_at     timestamptz not null default now()
);

-- Keep updated_at fresh on every edit (nice audit trail for the admin).
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists plots_touch_updated_at on public.plots;
create trigger plots_touch_updated_at
  before update on public.plots
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- 2. Lock the base table down (Row Level Security)
-- ---------------------------------------------------------------------------
-- With RLS on and no policy for the anonymous role, the public `anon` key cannot
-- read this table AT ALL. Only logged-in (admin) users can, via the policy below.
alter table public.plots enable row level security;

-- The anonymous website role must never touch the raw table.
revoke all on public.plots from anon;

-- Logged-in admins can do everything. (Keep Supabase Auth sign-ups DISABLED so the
-- only accounts that exist are admins you invite — see docs/DEPLOY.md.)
grant select, insert, update, delete on public.plots to authenticated;

drop policy if exists "admins manage plots" on public.plots;
create policy "admins manage plots"
  on public.plots for all
  to authenticated
  using (true) with check (true);

-- ---------------------------------------------------------------------------
-- 3. The public, filtered view (this is the ONLY thing visitors read)
-- ---------------------------------------------------------------------------
-- A normal view runs with its owner's privileges, so it can read `plots` even
-- though `anon` cannot. We expose only the publishable columns, and blank out the
-- owner unless the plot is vacant. internal_notes is simply not selected here.
create or replace view public.public_plots as
  select
    id,
    lot,
    space,
    status,
    color,
    person_name,
    person_burial,
    case when status = 'vacant' then owner else null end as owner
  from public.plots;

-- Let the website (anon) and admins read the safe view.
grant select on public.public_plots to anon, authenticated;

-- Belt-and-suspenders: make sure the view runs as its owner, not the caller,
-- so RLS on the base table can't accidentally hide rows from the public site.
alter view public.public_plots set (security_invoker = false);
