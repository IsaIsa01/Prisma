-- Paste this into the Supabase SQL editor and press Run.

create table if not exists players (
  name    text primary key,
  xp      integer     not null default 0,
  level   integer     not null default 1,
  solved  integer     not null default 0,
  profile jsonb,
  updated timestamptz not null default now()
);

alter table players enable row level security;

-- Anyone with the link can read the board and save their own row.
-- This is a game between friends, not a bank: there is no password on a name.
drop policy if exists players_read   on players;
drop policy if exists players_insert on players;
drop policy if exists players_update on players;

create policy players_read   on players for select using (true);
create policy players_insert on players for insert with check (true);
create policy players_update on players for update using (true) with check (true);
