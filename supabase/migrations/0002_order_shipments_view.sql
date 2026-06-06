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
  o.product_name,
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
left join public.shipments s
  on s.order_id = o.id
 and s.owner_user_id = o.owner_user_id;

grant select on public.order_shipments to authenticated;

comment on view public.order_shipments is
  'Bảng nhìn gộp đơn hàng và vận đơn theo quan hệ 1-1 để giao diện có thể đọc từ một nguồn dữ liệu chung.';
