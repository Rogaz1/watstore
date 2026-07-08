-- Corrected merchant data isolation policies for Watstore.
-- Fixes an incorrect assumption in the Codex-generated version: merchants.id
-- is NOT the same as the logged-in user's auth ID. The link is via
-- merchants.user_id, which references auth.users. Run this in the Supabase
-- SQL Editor.

alter table public.merchants enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;

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

-- Note: order INSERT is intentionally left to the public-facing policy
-- ("Anyone can create an order") set up in the original schema, since
-- customers placing orders are not logged-in merchants.

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