-- TÜM TABLOLARI, ALANLARI, RLS ve POLICY'LERİ SIFIRLAYIP YENİDEN OLUŞTURAN TAM UYUMLU SUPABASE SQL DOSYASI

-- 1. VARSA ESKİ POLICY'LERİ SİL
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all' AND tablename = 'contents') THEN
    EXECUTE 'DROP POLICY "Allow all" ON public.contents';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all' AND tablename = 'gallery') THEN
    EXECUTE 'DROP POLICY "Allow all" ON public.gallery';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all' AND tablename = 'themes') THEN
    EXECUTE 'DROP POLICY "Allow all" ON public.themes';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all' AND tablename = 'contacts') THEN
    EXECUTE 'DROP POLICY "Allow all" ON public.contacts';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all' AND tablename = 'features') THEN
    EXECUTE 'DROP POLICY "Allow all" ON public.features';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all' AND tablename = 'statistics') THEN
    EXECUTE 'DROP POLICY "Allow all" ON public.statistics';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all' AND tablename = 'faqs') THEN
    EXECUTE 'DROP POLICY "Allow all" ON public.faqs';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all' AND tablename = 'testimonials') THEN
    EXECUTE 'DROP POLICY "Allow all" ON public.testimonials';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all' AND tablename = 'links') THEN
    EXECUTE 'DROP POLICY "Allow all" ON public.links';
  END IF;
END$$;

-- 2. VARSA ESKİ TABLOLARI SİL
DROP TABLE IF EXISTS public.contents CASCADE;
DROP TABLE IF EXISTS public.gallery CASCADE;
DROP TABLE IF EXISTS public.themes CASCADE;
DROP TABLE IF EXISTS public.contacts CASCADE;
DROP TABLE IF EXISTS public.features CASCADE;
DROP TABLE IF EXISTS public.statistics CASCADE;
DROP TABLE IF EXISTS public.faqs CASCADE;
DROP TABLE IF EXISTS public.testimonials CASCADE;
DROP TABLE IF EXISTS public.links CASCADE;

-- 3. TÜM TABLOLARI YENİDEN OLUŞTUR
CREATE TABLE public.contents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

CREATE TABLE public.gallery (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  image_url text not null,
  description text,
  date date,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

CREATE TABLE public.themes (
  id uuid primary key default gen_random_uuid(),
  description text,
  company_name text,
  primary_color text,
  secondary_color text,
  success_color text,
  danger_color text,
  warning_color text,
  info_color text,
  light_color text,
  dark_color text,
  muted_color text,
  font text,
  logo_url text,
  is_active boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

CREATE TABLE public.contacts (
  id uuid primary key default gen_random_uuid(),
  address text,
  phone text,
  email text,
  map_url text,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

CREATE TABLE public.features (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  icon text,
  order_index int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

CREATE TABLE public.statistics (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  value int not null,
  icon text,
  order_index int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

CREATE TABLE public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  order_index int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

CREATE TABLE public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  content text not null,
  avatar_url text,
  order_index int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

CREATE TABLE public.links (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  url text not null,
  icon text,
  order_index int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. TÜM TABLOLARDA RLS'Yİ AKTİF ET
ALTER TABLE public.contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;

-- 5. TÜM TABLOLARA "ALLOW ALL" POLICY EKLE
CREATE POLICY "Allow all" ON public.contents FOR ALL USING (true);
CREATE POLICY "Allow all" ON public.gallery FOR ALL USING (true);
CREATE POLICY "Allow all" ON public.themes FOR ALL USING (true);
CREATE POLICY "Allow all" ON public.contacts FOR ALL USING (true);
CREATE POLICY "Allow all" ON public.features FOR ALL USING (true);
CREATE POLICY "Allow all" ON public.statistics FOR ALL USING (true);
CREATE POLICY "Allow all" ON public.faqs FOR ALL USING (true);
CREATE POLICY "Allow all" ON public.testimonials FOR ALL USING (true);
CREATE POLICY "Allow all" ON public.links FOR ALL USING (true);

-- 6. STORAGE BUCKET "uploads" POLICY'LERİ (SQL ile doğrudan oluşturma)
-- VARSA SİL
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete" ON storage.objects;

-- PUBLIC READ POLICY
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT
USING (bucket_id = 'uploads');

-- AUTHENTICATED UPLOAD POLICY
CREATE POLICY "Authenticated upload" ON storage.objects
FOR INSERT
WITH CHECK (auth.role() = 'authenticated' AND bucket_id = 'uploads');

-- AUTHENTICATED UPDATE POLICY (opsiyonel)
CREATE POLICY "Authenticated update" ON storage.objects
FOR UPDATE
USING (auth.role() = 'authenticated' AND bucket_id = 'uploads');

-- AUTHENTICATED DELETE POLICY (opsiyonel)
CREATE POLICY "Authenticated delete" ON storage.objects
FOR DELETE
USING (auth.role() = 'authenticated' AND bucket_id = 'uploads');

-- RLS'yi aktif et (panelden yapılması önerilir, hata verirse kaldırın)
-- alter table storage.objects enable row level security;
