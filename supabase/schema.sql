create extension if not exists "pgcrypto";

create table if not exists public.rooms (
  id                uuid primary key default gen_random_uuid(),
  code              text not null unique check (code ~ '^[A-Z0-9]{5}$'),
  name              text not null,
  price_range       text not null,
  reveal_at         timestamptz not null,
  wishlist_deadline timestamptz not null,
  admin_token       text not null unique,
  drawn_at          timestamptz,
  created_at        timestamptz not null default now()
);
create index if not exists rooms_code_idx on public.rooms (code);

create table if not exists public.members (
  id           uuid primary key default gen_random_uuid(),
  room_id      uuid not null references public.rooms(id) on delete cascade,
  name         text not null,
  access_token text not null unique,
  pin_hash     text,
  is_admin     boolean not null default false,
  joined_at    timestamptz not null default now(),
  unique (room_id, name)
);
create index if not exists members_room_idx on public.members (room_id);

create table if not exists public.wishlists (
  id         uuid primary key default gen_random_uuid(),
  member_id  uuid not null references public.members(id) on delete cascade,
  position   int  not null check (position between 1 and 3),
  text       text not null,
  url        text,
  unique (member_id, position)
);

create table if not exists public.assignments (
  id                 uuid primary key default gen_random_uuid(),
  room_id            uuid not null references public.rooms(id) on delete cascade,
  giver_member_id    uuid not null references public.members(id) on delete cascade,
  receiver_member_id uuid not null references public.members(id) on delete cascade,
  created_at         timestamptz not null default now(),
  unique (room_id, giver_member_id),
  unique (room_id, receiver_member_id),
  check (giver_member_id <> receiver_member_id)
);
create index if not exists assignments_room_idx on public.assignments (room_id);

alter table public.rooms       enable row level security;
alter table public.members     enable row level security;
alter table public.wishlists   enable row level security;
alter table public.assignments enable row level security;