-- İçerik tablosu
create table if not exists public.contents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Galeri tablosu
delete table if exists public.gallery;
create table if not exists public.gallery (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  image_url text not null,
  description text,
  date date,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Tema tablosu
create table if not exists public.themes (
  id uuid primary key default gen_random_uuid(),
  description text,
  primary_color text,
  secondary_color text,
  font text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- İletişim tablosu
create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  address text,
  phone text,
  email text,
  social text,
  map_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Özellikler tablosu
create table if not exists public.features (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  icon text,
  order_index int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- İstatistikler tablosu
create table if not exists public.statistics (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  value int not null,
  icon text,
  order_index int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- SSS tablosu
create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  order_index int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Referanslar tablosu
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  content text not null,
  avatar_url text,
  order_index int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Linkler tablosu
create table if not exists public.links (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  url text not null,
  icon text,
  order_index int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Row Level Security ve izinler (geliştirme için)
alter table public.contents enable row level security;
create policy "Allow all" on public.contents for all using (true);
alter table public.gallery enable row level security;
create policy "Allow all" on public.gallery for all using (true);
alter table public.themes enable row level security;
create policy "Allow all" on public.themes for all using (true);
alter table public.contacts enable row level security;
create policy "Allow all" on public.contacts for all using (true);
alter table public.features enable row level security;
create policy "Allow all" on public.features for all using (true);
alter table public.statistics enable row level security;
create policy "Allow all" on public.statistics for all using (true);
alter table public.faqs enable row level security;
create policy "Allow all" on public.faqs for all using (true);
alter table public.testimonials enable row level security;
create policy "Allow all" on public.testimonials for all using (true);
alter table public.links enable row level security;
create policy "Allow all" on public.links for all using (true);
