import { createClient } from '@supabase/supabase-js';

export async function getCompanyNameAndFavicon() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase
      .from('themes')
      .select('company_name, logo_url')
      .eq('is_active', true)
      .single();

    if (error) {
      console.warn('Theme fetch error:', error);
      return {
        company: 'Landing Page',
        favicon: '/favicon.ico',
      };
    }

    return {
      company: data?.company_name || 'Landing Page',
      favicon: data?.logo_url || '/favicon.ico',
    };
  } catch (error) {
    console.error('getCompanyNameAndFavicon error:', error);
    return {
      company: 'Landing Page',
      favicon: '/favicon.ico',
    };
  }
}
