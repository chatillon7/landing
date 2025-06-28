import { createClient } from '@supabase/supabase-js';

export async function getCompanyNameAndFavicon() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase
    .from('themes')
    .select('*')
    .eq('is_active', true)
    .single();
  return {
    company: data?.company_name || 'Landing Page',
    favicon: data?.logo_url || '/favicon.ico', // logo_url favicon olarak kullanılıyor
  };
}
