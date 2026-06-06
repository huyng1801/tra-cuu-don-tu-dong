create extension if not exists "pgcrypto";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'order_status_enum') then
    create type public.order_status_enum as enum (
      'new',
      'confirmed',
      'preparing',
      'shipping',
      'completed',
      'cancelled'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'shipping_status_enum') then
    create type public.shipping_status_enum as enum (
      'pending_pickup',
      'picking_up',
      'in_transit',
      'delivered',
      'returned',
      'cancelled'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'carrier_code_enum') then
    create type public.carrier_code_enum as enum (
      'ghn',
      'ghtk',
      'viettel_post',
      'jt_express',
      'shopee_express',
      'other'
    );
  end if;
end
$$;

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references public.users (id) on delete cascade,
  name text not null,
  phone text not null,
  facebook_url text,
  facebook_uid text,
  address text,
  note text,
  created_at timestamptz not null default timezone('utc', now()),
  constraint customers_owner_phone_key unique (owner_user_id, phone)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references public.users (id) on delete cascade,
  order_code text not null unique,
  customer_id uuid not null references public.customers (id) on delete restrict,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price integer not null check (unit_price >= 0),
  total_price integer not null check (total_price = quantity * unit_price),
  status public.order_status_enum not null default 'new',
  note text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.shipments (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references public.users (id) on delete cascade,
  order_id uuid not null unique references public.orders (id) on delete cascade,
  carrier public.carrier_code_enum not null,
  tracking_code text not null,
  tracking_url text,
  shipping_status public.shipping_status_enum not null default 'pending_pickup',
  last_sync_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.facebook_events (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references public.users (id) on delete cascade,
  event_type text not null,
  payload_json jsonb not null,
  received_at timestamptz not null default timezone('utc', now())
);

create index if not exists customers_owner_created_at_idx on public.customers (owner_user_id, created_at desc);
create index if not exists customers_owner_name_idx on public.customers (owner_user_id, name);
create index if not exists orders_owner_created_at_idx on public.orders (owner_user_id, created_at desc);
create index if not exists orders_owner_status_idx on public.orders (owner_user_id, status);
create index if not exists shipments_owner_created_at_idx on public.shipments (owner_user_id, created_at desc);
create index if not exists shipments_owner_status_idx on public.shipments (owner_user_id, shipping_status);
create index if not exists facebook_events_owner_received_at_idx on public.facebook_events (owner_user_id, received_at desc);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.users.full_name);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.users enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.shipments enable row level security;
alter table public.facebook_events enable row level security;

drop policy if exists "users_select_self" on public.users;
create policy "users_select_self"
on public.users for select
to authenticated
using (auth.uid() = id);

drop policy if exists "users_insert_self" on public.users;
create policy "users_insert_self"
on public.users for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "users_update_self" on public.users;
create policy "users_update_self"
on public.users for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "customers_owner_policy" on public.customers;
create policy "customers_owner_policy"
on public.customers for all
to authenticated
using (auth.uid() = owner_user_id)
with check (auth.uid() = owner_user_id);

drop policy if exists "orders_owner_policy" on public.orders;
create policy "orders_owner_policy"
on public.orders for all
to authenticated
using (auth.uid() = owner_user_id)
with check (auth.uid() = owner_user_id);

drop policy if exists "shipments_owner_policy" on public.shipments;
create policy "shipments_owner_policy"
on public.shipments for all
to authenticated
using (auth.uid() = owner_user_id)
with check (auth.uid() = owner_user_id);

drop policy if exists "facebook_events_owner_policy" on public.facebook_events;
create policy "facebook_events_owner_policy"
on public.facebook_events for all
to authenticated
using (auth.uid() = owner_user_id)
with check (auth.uid() = owner_user_id);

