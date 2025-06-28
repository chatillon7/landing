import { createClient } from '@supabase/supabase-js';
import type { Metadata } from "next";

const PAGE_TITLES: Record<string, string> = {
  '/': 'Anasayfa',
  '/gallery': 'Galeri',
  '/contact': 'İletişim',
  '/admin': 'Admin Paneli',
};

export async function generateMetadata({ pathname }: { pathname?: string } = {}): Promise<Metadata> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase
    .from('themes')
    .select('*')
    .eq('is_active', true)
    .single();
  const company = data?.company_name || 'Landing Page';
  let page = 'Sayfa';
  if (pathname && PAGE_TITLES[pathname]) {
    page = PAGE_TITLES[pathname];
  }
  return {
    title: `${company} | ${page}`,
    icons: {
      icon: data?.favicon_url || '/favicon.ico',
    },
  };
}
