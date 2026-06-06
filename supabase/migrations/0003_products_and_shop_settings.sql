create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references public.users (id) on delete cascade,
  name text not null,
  sku_code text not null default '',
  unit text not null default '',
  default_unit_price integer not null default 0 check (default_unit_price >= 0),
  label_image_path text,
  created_at timestamptz not null default timezone('utc', now()),
  constraint products_owner_name_key unique (owner_user_id, name)
);

create table if not exists public.shop_settings (
  owner_user_id uuid primary key references public.users (id) on delete cascade,
  company_name text not null default '',
  company_address text not null default '',
  tax_code text not null default '',
  document_code text not null default '',
  slip_number_prefix text not null default '',
  warehouse_name text not null default '',
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.orders
  add column if not exists product_id uuid references public.products (id) on delete set null;

create index if not exists products_owner_created_at_idx on public.products (owner_user_id, created_at desc);
create index if not exists products_owner_name_idx on public.products (owner_user_id, name);
create index if not exists orders_product_id_idx on public.orders (product_id);

alter table public.products enable row level security;
alter table public.shop_settings enable row level security;

drop policy if exists "products_owner_policy" on public.products;
create policy "products_owner_policy"
on public.products for all
to authenticated
using (auth.uid() = owner_user_id)
with check (auth.uid() = owner_user_id);

drop policy if exists "shop_settings_owner_policy" on public.shop_settings;
create policy "shop_settings_owner_policy"
on public.shop_settings for all
to authenticated
using (auth.uid() = owner_user_id)
with check (auth.uid() = owner_user_id);

insert into storage.buckets (id, name, public)
values ('product-labels', 'product-labels', true)
on conflict (id) do nothing;

drop policy if exists "product_labels_select" on storage.objects;
create policy "product_labels_select"
on storage.objects for select
to public
using (bucket_id = 'product-labels');

drop policy if exists "product_labels_insert" on storage.objects;
create policy "product_labels_insert"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'product-labels'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "product_labels_update" on storage.objects;
create policy "product_labels_update"
on storage.objects for update
to authenticated
using (
  bucket_id = 'product-labels'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'product-labels'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "product_labels_delete" on storage.objects;
create policy "product_labels_delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'product-labels'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create or replace view public.order_shipments
with (security_invoker = true)
as
select
  o.id as order_id,
  o.owner_user_id,
  o.order_code,
  o.customer_id,
  c.name as customer_name,
  c.phone as customer_phone,
  c.address as customer_address,
  o.product_id,
  o.product_name,
  p.sku_code as product_sku_code,
  p.unit as product_unit,
  p.label_image_path as product_label_image_path,
  o.quantity,
  o.unit_price,
  o.total_price,
  o.status as order_status,
  o.note as order_note,
  o.created_at as order_created_at,
  s.id as shipment_id,
  s.carrier,
  s.tracking_code,
  s.tracking_url,
  s.shipping_status,
  s.last_sync_at,
  s.created_at as shipment_created_at
from public.orders o
join public.customers c
  on c.id = o.customer_id
 and c.owner_user_id = o.owner_user_id
left join public.products p
  on p.id = o.product_id
 and p.owner_user_id = o.owner_user_id
left join public.shipments s
  on s.order_id = o.id
 and s.owner_user_id = o.owner_user_id;

grant select on public.order_shipments to authenticated;
