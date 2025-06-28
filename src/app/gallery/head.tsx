import { getCompanyNameAndFavicon } from '@/lib/getCompanyNameAndFavicon';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const { company, favicon } = await getCompanyNameAndFavicon();
  return {
    title: `${company} | Galeri`,
    icons: { icon: favicon },
  };
}
