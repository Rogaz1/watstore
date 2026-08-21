-- Corrected merchant data isolation policies for Floxto.
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
  add column if not exists tagline text,
  add column if not exists delivery_info text,
  add column if not exists payment_options text,
  add column if not exists why_choose_us text,
  add column if not exists currency_code text default 'GHS',
  add column if not exists whatsapp_number text,
  add column if not exists logo_url text,
  add column if not exists subscription_expired_from text;

alter table public.merchants
  alter column trial_start_date set default now(),
  alter column subscription_status set default 'trial';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'merchants_subscription_status_check'
  ) then
    alter table public.merchants
      add constraint merchants_subscription_status_check
      check (subscription_status in ('trial', 'active', 'expired'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'merchants_billing_cycle_months_check'
  ) then
    alter table public.merchants
      add constraint merchants_billing_cycle_months_check
      check (billing_cycle_months is null or billing_cycle_months in (1, 12));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'merchants_subscription_expired_from_check'
  ) then
    alter table public.merchants
      add constraint merchants_subscription_expired_from_check
      check (subscription_expired_from is null or subscription_expired_from in ('trial', 'active'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'merchants_currency_code_check'
  ) then
    alter table public.merchants
      add constraint merchants_currency_code_check
      check (currency_code in ('GHS', 'NGN', 'XOF', 'XAF', 'USD', 'GBP', 'EUR'));
  end if;
end $$;

create unique index if not exists merchants_slug_key
on public.merchants (slug)
where slug is not null;

-- Product FAQs are merchant-authored question/answer rows used on product pages.
-- deleted_at enables soft deletes so existing orders can keep their product FK.
alter table public.products
  add column if not exists faqs jsonb,
  add column if not exists deleted_at timestamptz default null;

alter table public.products
  alter column sale_price drop not null;

create index if not exists products_active_merchant_name_idx
on public.products (merchant_id, name)
where deleted_at is null;

-- Public order fields used by the storefront WhatsApp order flow.
alter table public.orders
  add column if not exists product_id uuid,
  add column if not exists product_name text,
  add column if not exists product_sale_price numeric,
  add column if not exists product_photo_url text,
  add column if not exists currency_code text,
  add column if not exists quantity integer,
  add column if not exists customer_name text,
  add column if not exists delivery_location text,
  add column if not exists total numeric,
  add column if not exists status text,
  add column if not exists order_number integer;

alter table public.orders
  alter column total drop not null;

create unique index if not exists orders_merchant_order_number_key
on public.orders (merchant_id, order_number)
where order_number is not null;

create table if not exists public.product_chat_clicks (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null,
  product_id uuid not null,
  created_at timestamptz not null default now()
);

alter table public.product_chat_clicks enable row level security;
revoke all on public.product_chat_clicks from anon, authenticated;

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

create or replace function public.refresh_merchant_subscription(
  requested_merchant_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_merchant public.merchants%rowtype;
  expiry_date timestamptz;
  expired_from text;
begin
  select *
  into selected_merchant
  from public.merchants
  where id = requested_merchant_id;

  if not found then
    raise exception 'Merchant not found.';
  end if;

  if selected_merchant.subscription_status = 'expired' then
    return jsonb_build_object(
      'subscription_status', 'expired',
      'subscription_expired_from', selected_merchant.subscription_expired_from
    );
  end if;

  if selected_merchant.subscription_status = 'trial' then
    expiry_date := selected_merchant.trial_start_date + interval '30 days';
    expired_from := 'trial';
  elsif selected_merchant.subscription_status = 'active' then
    if selected_merchant.billing_cycle_months not in (1, 12)
      or selected_merchant.last_payment_date is null then
      expiry_date := now();
    else
      expiry_date := selected_merchant.last_payment_date
        + (selected_merchant.billing_cycle_months * interval '30 days');
    end if;
    expired_from := 'active';
  else
    expiry_date := now();
    expired_from := 'trial';
  end if;

  if now() >= expiry_date then
    update public.merchants
    set subscription_status = 'expired',
        subscription_expired_from = expired_from
    where id = requested_merchant_id;

    return jsonb_build_object(
      'subscription_status', 'expired',
      'subscription_expired_from', expired_from
    );
  end if;

  return jsonb_build_object(
    'subscription_status', selected_merchant.subscription_status,
    'subscription_expired_from', selected_merchant.subscription_expired_from
  );
end;
$$;

grant execute on function public.refresh_merchant_subscription(uuid) to anon, authenticated;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
revoke all on public.admin_users from anon, authenticated;

-- Add your admin account once, replacing the UUID with your auth.users.id:
-- insert into public.admin_users (user_id)
-- values ('00000000-0000-0000-0000-000000000000')
-- on conflict (user_id) do nothing;

create or replace function public.get_admin_renewals()
returns table (
  id uuid,
  business_name text,
  slug text,
  billing_cycle_months integer,
  last_payment_date timestamp,
  expiry_date timestamp
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  ) then
    raise exception 'Not authorized.';
  end if;

  return query
  select
    merchants.id,
    merchants.business_name,
    merchants.slug,
    merchants.billing_cycle_months,
    merchants.last_payment_date,
    (
      merchants.last_payment_date
      + (merchants.billing_cycle_months * interval '30 days')
    )::timestamp as expiry_date
  from public.merchants
  where merchants.subscription_status = 'active'
    and merchants.billing_cycle_months in (1, 12)
    and merchants.last_payment_date is not null
  order by expiry_date asc;
end;
$$;

grant execute on function public.get_admin_renewals() to authenticated;

drop function if exists public.get_current_merchant_profile();

create or replace function public.get_current_merchant_profile()
returns table (
  id uuid,
  user_id uuid,
  business_name text,
  tagline text,
  delivery_info text,
  payment_options text,
  why_choose_us text,
  currency_code text,
  slug text,
  whatsapp_number text,
  logo_url text,
  trial_start_date timestamp,
  subscription_status text,
  billing_cycle_months integer,
  last_payment_date timestamp,
  subscription_expired_from text
)
language sql
security definer
set search_path = public
as $$
  select
    id,
    user_id,
    business_name,
    tagline,
    delivery_info,
    payment_options,
    why_choose_us,
    coalesce(currency_code, 'GHS') as currency_code,
    slug,
    whatsapp_number,
    logo_url,
    trial_start_date,
    subscription_status,
    billing_cycle_months,
    last_payment_date,
    subscription_expired_from
  from public.merchants
  where user_id = auth.uid()
  limit 1;
$$;

grant execute on function public.get_current_merchant_profile() to authenticated;

create or replace function public.is_own_merchant(check_merchant_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.merchants
    where id = check_merchant_id
      and user_id = auth.uid()
  );
$$;

grant execute on function public.is_own_merchant(uuid) to authenticated;

drop function if exists public.get_public_merchant_by_slug(text);

create or replace function public.get_public_merchant_by_slug(requested_slug text)
returns table (
  id uuid,
  business_name text,
  tagline text,
  delivery_info text,
  payment_options text,
  why_choose_us text,
  currency_code text,
  slug text,
  whatsapp_number text,
  logo_url text,
  is_available boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_merchant public.merchants%rowtype;
begin
  select *
  into selected_merchant
  from public.merchants
  where merchants.slug = requested_slug;

  if not found then
    return;
  end if;

  perform public.refresh_merchant_subscription(selected_merchant.id);

  return query
  select
    merchants.id,
    merchants.business_name,
    merchants.tagline,
    merchants.delivery_info,
    merchants.payment_options,
    merchants.why_choose_us,
    coalesce(merchants.currency_code, 'GHS') as currency_code,
    merchants.slug,
    merchants.whatsapp_number,
    merchants.logo_url,
    merchants.subscription_status <> 'expired' as is_available
  from public.merchants
  where merchants.id = selected_merchant.id;
end;
$$;

grant execute on function public.get_public_merchant_by_slug(text) to anon, authenticated;

create or replace function public.record_product_chat_click(
  requested_product_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_product public.products%rowtype;
  selected_merchant public.merchants%rowtype;
begin
  select *
  into selected_product
  from public.products
  where id = requested_product_id
    and deleted_at is null;

  if not found then
    return;
  end if;

  perform public.refresh_merchant_subscription(selected_product.merchant_id);

  select *
  into selected_merchant
  from public.merchants
  where id = selected_product.merchant_id;

  if selected_merchant.subscription_status = 'expired' then
    return;
  end if;

  insert into public.product_chat_clicks (merchant_id, product_id)
  values (selected_product.merchant_id, selected_product.id);
end;
$$;

grant execute on function public.record_product_chat_click(uuid) to anon, authenticated;

create or replace function public.get_current_merchant_today_chat_count()
returns integer
language sql
security definer
set search_path = public
as $$
  select count(*)::integer
  from public.product_chat_clicks
  where merchant_id in (
    select id from public.merchants where user_id = auth.uid()
  )
    and created_at >= date_trunc('day', now())
    and created_at < date_trunc('day', now()) + interval '1 day';
$$;

grant execute on function public.get_current_merchant_today_chat_count() to authenticated;

-- Keep storefront-safe merchant columns public, but prevent direct browser
-- queries from reading subscription and billing internals. Table-level SELECT
-- would expose every column, so revoke it and grant back only safe columns.
revoke select on public.merchants from anon, authenticated;
grant select (
  id,
  business_name,
  tagline,
  delivery_info,
  payment_options,
  why_choose_us,
  currency_code,
  slug,
  whatsapp_number,
  logo_url
) on public.merchants to anon, authenticated;

-- Merchants can write their row through normal PostgREST table-level grants.
-- A trigger below strips subscription/billing fields from browser writes so
-- PostgREST can behave normally without exposing billing control to merchants.
revoke update on public.merchants from authenticated;
grant update on public.merchants to authenticated;

revoke insert on public.merchants from authenticated;
revoke insert on public.merchants from anon;
grant insert on public.merchants to authenticated;

create or replace function public.strip_subscription_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Only strip values coming from public API clients. Direct SQL/admin
  -- operations must still be able to set renewals and paid subscriptions.
  if coalesce(auth.role(), '') not in ('anon', 'authenticated') then
    return NEW;
  end if;

  if TG_OP = 'INSERT' then
    NEW.subscription_status := 'trial';
    NEW.trial_start_date := now();
    NEW.billing_cycle_months := null;
    NEW.last_payment_date := null;
    NEW.subscription_expired_from := null;
  end if;

  if TG_OP = 'UPDATE' then
    NEW.subscription_status := OLD.subscription_status;
    NEW.trial_start_date := OLD.trial_start_date;
    NEW.billing_cycle_months := OLD.billing_cycle_months;
    NEW.last_payment_date := OLD.last_payment_date;
    NEW.subscription_expired_from := OLD.subscription_expired_from;
  end if;

  return NEW;
end;
$$;

drop trigger if exists enforce_subscription_fields
on public.merchants;

create trigger enforce_subscription_fields
before insert or update on public.merchants
for each row
execute function public.strip_subscription_fields();

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
  selected_merchant public.merchants%rowtype;
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
  where id = requested_product_id
    and deleted_at is null;

  if not found then
    raise exception 'Product not found.';
  end if;

  if selected_product.in_stock is not true then
    raise exception 'Product is currently unavailable.';
  end if;

  perform public.refresh_merchant_subscription(selected_product.merchant_id);

  select *
  into selected_merchant
  from public.merchants
  where id = selected_product.merchant_id;

  if selected_merchant.subscription_status = 'expired' then
    raise exception 'This store is temporarily unavailable.';
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
    product_name,
    product_sale_price,
    product_photo_url,
    currency_code,
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
    selected_product.name,
    selected_product.sale_price,
    selected_product.photo_urls[1],
    coalesce(selected_merchant.currency_code, 'GHS'),
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

-- Merchant self-delete is intentionally not recreated. There is no account
-- deletion flow, and deleting a merchant row can break store/order history.

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
  public.is_own_merchant(merchant_id)
  and deleted_at is null
);

create policy "Anyone can read public products"
on public.products
for select
to anon, authenticated
using (deleted_at is null);

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
  public.is_own_merchant(merchant_id)
  and deleted_at is null
);

create policy "Merchants can update own products"
on public.products
for update
to authenticated
using (
  public.is_own_merchant(merchant_id)
  and deleted_at is null
)
with check (public.is_own_merchant(merchant_id));

create policy "Merchants can delete own products"
on public.products
for delete
to authenticated
using (
  public.is_own_merchant(merchant_id)
  and deleted_at is null
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
using (public.is_own_merchant(merchant_id));

-- Merchants can only update order status from the browser.
revoke update, delete on public.orders from authenticated;
grant update (status) on public.orders to authenticated;

create policy "Merchants can update own orders"
on public.orders
for update
to authenticated
using (public.is_own_merchant(merchant_id))
with check (public.is_own_merchant(merchant_id));

-- Order hard-delete is intentionally not recreated. Orders are business
-- history and should remain available to the owning merchant.

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
  and public.is_own_merchant(((storage.foldername(name))[1])::uuid)
);

create policy "Merchants can update own product media"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'product-media'
  and public.is_own_merchant(((storage.foldername(name))[1])::uuid)
)
with check (
  bucket_id = 'product-media'
  and public.is_own_merchant(((storage.foldername(name))[1])::uuid)
);

create policy "Merchants can delete own product media"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'product-media'
  and public.is_own_merchant(((storage.foldername(name))[1])::uuid)
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
