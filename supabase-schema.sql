-- Paws & Beans Cafe Supabase setup
create extension if not exists "pgcrypto";

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price text,
  category text default 'Menu',
  description text,
  image_url text,
  available boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now()
);

alter table public.menu_items enable row level security;

drop policy if exists "Public can view menu" on public.menu_items;
create policy "Public can view menu" on public.menu_items for select using (true);

drop policy if exists "Authenticated admins can insert menu" on public.menu_items;
create policy "Authenticated admins can insert menu" on public.menu_items for insert to authenticated with check (true);

drop policy if exists "Authenticated admins can update menu" on public.menu_items;
create policy "Authenticated admins can update menu" on public.menu_items for update to authenticated using (true) with check (true);

drop policy if exists "Authenticated admins can delete menu" on public.menu_items;
create policy "Authenticated admins can delete menu" on public.menu_items for delete to authenticated using (true);

insert into storage.buckets (id, name, public)
values ('menu-images', 'menu-images', true)
on conflict (id) do update set public = true;

-- Public read for menu images
drop policy if exists "Public can read menu images" on storage.objects;
create policy "Public can read menu images" on storage.objects for select using (bucket_id = 'menu-images');

-- Authenticated admin upload/update/delete for menu images
drop policy if exists "Authenticated can upload menu images" on storage.objects;
create policy "Authenticated can upload menu images" on storage.objects for insert to authenticated with check (bucket_id = 'menu-images');

drop policy if exists "Authenticated can update menu images" on storage.objects;
create policy "Authenticated can update menu images" on storage.objects for update to authenticated using (bucket_id = 'menu-images');

drop policy if exists "Authenticated can delete menu images" on storage.objects;
create policy "Authenticated can delete menu images" on storage.objects for delete to authenticated using (bucket_id = 'menu-images');
