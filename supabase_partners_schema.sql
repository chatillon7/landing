-- Altyapı partnerleri için tablo
create table if not exists partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  website_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Row Level Security
alter table partners enable row level security;

-- Adminler için full erişim policy
create policy "Allow all for admin" on partners
  for all
  using (auth.role() = 'authenticated');
