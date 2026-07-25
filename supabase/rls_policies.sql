-- Corrected merchant data isolation policies for Watstore.
-- Fixes an incorrect assumption in the Codex-generated version: merchants.id
-- is NOT the same as the logged-in user's auth ID. The link is via
-- merchants.user_id, which references auth.users. Run this in the Supabase
-- SQL Editor.

alter table public.merchants enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;

-- Merchant onboarding fields. Existing projects can run these safely.
alter table public.merchants
  add column if not exists business_name text,
  add column if not exists whatsapp_number text,
  add column if not exists logo_url text;

create unique index if not exists merchants_slug_key
on public.merchants (slug)
where slug is not null;

-- Public order fields used by the storefront WhatsApp order flow.
alter table public.orders
  add column if not exists product_id uuid,
  add column if not exists quantity integer,
  add column if not exists customer_name text,
  add column if not exists delivery_location text,
  add column if not exists total numeric,
  add column if not exists status text,
  add column if not exists order_number integer;

create unique index if not exists orders_merchant_order_number_key
on public.orders (merchant_id, order_number)
where order_number is not null;

create or replace function public.is_slug_available(requested_slug text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select not exists (
    select 1
    from public.merchants
    where slug = requested_slug
  );
$$;

grant execute on function public.is_slug_available(text) to authenticated;

create or replace function public.create_public_order(
  requested_product_id uuid,
  requested_quantity integer,
  requested_customer_name text,
  requested_delivery_location text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_product public.products%rowtype;
  next_order_number integer;
  order_total numeric;
begin
  if requested_quantity is null or requested_quantity < 1 then
    raise exception 'Quantity must be at least 1.';
  end if;

  if trim(coalesce(requested_customer_name, '')) = '' then
    raise exception 'Name is required.';
  end if;

  if trim(coalesce(requested_delivery_location, '')) = '' then
    raise exception 'Delivery location is required.';
  end if;

  select *
  into selected_product
  from public.products
  where id = requested_product_id;

  if not found then
    raise exception 'Product not found.';
  end if;

  if selected_product.in_stock is not true then
    raise exception 'Product is currently unavailable.';
  end if;

  perform pg_advisory_xact_lock(hashtext(selected_product.merchant_id::text));

  select coalesce(max(order_number), 1000) + 1
  into next_order_number
  from public.orders
  where merchant_id = selected_product.merchant_id;

  order_total := selected_product.sale_price * requested_quantity;

  insert into public.orders (
    merchant_id,
    product_id,
    quantity,
    customer_name,
    delivery_location,
    total,
    status,
    order_number
  )
  values (
    selected_product.merchant_id,
    selected_product.id,
    requested_quantity,
    trim(requested_customer_name),
    trim(requested_delivery_location),
    order_total,
    'pending',
    next_order_number
  );

  return jsonb_build_object('order_number', next_order_number);
end;
$$;

grant execute on function public.create_public_order(uuid, integer, text, text) to anon, authenticated;

-- Consolidate public storefront read policies so each table has exactly one
-- anon + authenticated SELECT policy. This removes older duplicate public
-- policies regardless of their previous names.
do $$
declare
  duplicate_policy record;
begin
  for duplicate_policy in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('merchants', 'products')
      and cmd = 'SELECT'
      and ('anon' = any(roles) or 'public' = any(roles))
  loop
    execute format(
      'drop policy if exists %I on %I.%I',
      duplicate_policy.policyname,
      duplicate_policy.schemaname,
      duplicate_policy.tablename
    );
  end loop;
end $$;

-- MERCHANTS: a merchant can only see/edit their own row, matched via user_id
drop policy if exists "Merchants can read own merchant row" on public.merchants;
drop policy if exists "Merchants can insert own merchant row" on public.merchants;
drop policy if exists "Merchants can update own merchant row" on public.merchants;
drop policy if exists "Merchants can delete own merchant row" on public.merchants;

create policy "Merchants can read own merchant row"
on public.merchants
for select
to authenticated
using (user_id = auth.uid());

create policy "Anyone can read public merchant storefronts"
on public.merchants
for select
to anon, authenticated
using (true);

create policy "Merchants can insert own merchant row"
on public.merchants
for insert
to authenticated
with check (user_id = auth.uid());

create policy "Merchants can update own merchant row"
on public.merchants
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Merchants can delete own merchant row"
on public.merchants
for delete
to authenticated
using (user_id = auth.uid());

-- PRODUCTS: matched via merchant_id -> merchants.id -> merchants.user_id
drop policy if exists "Merchants can read own products" on public.products;
drop policy if exists "Merchants can insert own products" on public.products;
drop policy if exists "Merchants can update own products" on public.products;
drop policy if exists "Merchants can delete own products" on public.products;

create policy "Merchants can read own products"
on public.products
for select
to authenticated
using (
  merchant_id in (select id from public.merchants where user_id = auth.uid())
);

create policy "Anyone can read public products"
on public.products
for select
to anon, authenticated
using (true);

-- Public read policy verification: after running this file, this should return
-- exactly one row for merchants and one row for products.
select
  tablename,
  policyname,
  cmd,
  roles
from pg_policies
where schemaname = 'public'
  and tablename in ('merchants', 'products')
  and cmd = 'SELECT'
  and ('anon' = any(roles) or 'public' = any(roles))
order by tablename, policyname;

create policy "Merchants can insert own products"
on public.products
for insert
to authenticated
with check (
  merchant_id in (select id from public.merchants where user_id = auth.uid())
);

create policy "Merchants can update own products"
on public.products
for update
to authenticated
using (
  merchant_id in (select id from public.merchants where user_id = auth.uid())
)
with check (
  merchant_id in (select id from public.merchants where user_id = auth.uid())
);

create policy "Merchants can delete own products"
on public.products
for delete
to authenticated
using (
  merchant_id in (select id from public.merchants where user_id = auth.uid())
);

-- ORDERS: same pattern as products
drop policy if exists "Merchants can read own orders" on public.orders;
drop policy if exists "Anyone can create a storefront order" on public.orders;
drop policy if exists "Anyone can create an order" on public.orders;
drop policy if exists "Merchants can update own orders" on public.orders;
drop policy if exists "Merchants can delete own orders" on public.orders;

create policy "Merchants can read own orders"
on public.orders
for select
to authenticated
using (
  merchant_id in (select id from public.merchants where user_id = auth.uid())
);

create policy "Merchants can update own orders"
on public.orders
for update
to authenticated
using (
  merchant_id in (select id from public.merchants where user_id = auth.uid())
)
with check (
  merchant_id in (select id from public.merchants where user_id = auth.uid())
);

create policy "Merchants can delete own orders"
on public.orders
for delete
to authenticated
using (
  merchant_id in (select id from public.merchants where user_id = auth.uid())
);

-- Public order creation is handled by the create_public_order RPC above so
-- order numbers are generated server-side and scoped per merchant.

-- Verification query: run this after the above to see all active policies
select
  schemaname,
  tablename,
  policyname,
  cmd,
  roles,
  qual,
  with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('merchants', 'products', 'orders')
order by tablename, policyname;

-- Product media bucket for merchant uploads. Files are stored under:
-- {merchant_id}/{generated-file-name}
insert into storage.buckets (id, name, public)
values ('product-media', 'product-media', true)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "Merchants can upload own product media" on storage.objects;
drop policy if exists "Merchants can update own product media" on storage.objects;
drop policy if exists "Merchants can delete own product media" on storage.objects;

create policy "Merchants can upload own product media"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'product-media'
  and (storage.foldername(name))[1] in (
    select id::text from public.merchants where user_id = auth.uid()
  )
);

create policy "Merchants can update own product media"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'product-media'
  and (storage.foldername(name))[1] in (
    select id::text from public.merchants where user_id = auth.uid()
  )
)
with check (
  bucket_id = 'product-media'
  and (storage.foldername(name))[1] in (
    select id::text from public.merchants where user_id = auth.uid()
  )
);

create policy "Merchants can delete own product media"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'product-media'
  and (storage.foldername(name))[1] in (
    select id::text from public.merchants where user_id = auth.uid()
  )
);

-- Merchant logo bucket. Setup uploads happen before a merchant row exists, so
-- logo files are stored under {auth_user_id}/{generated-file-name}.
insert into storage.buckets (id, name, public)
values ('merchant-logos', 'merchant-logos', true)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "Merchants can upload own logo" on storage.objects;
drop policy if exists "Merchants can update own logo" on storage.objects;
drop policy if exists "Merchants can delete own logo" on storage.objects;

create policy "Merchants can upload own logo"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'merchant-logos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Merchants can update own logo"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'merchant-logos'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'merchant-logos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Merchants can delete own logo"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'merchant-logos'
  and (storage.foldername(name))[1] = auth.uid()::text
);
