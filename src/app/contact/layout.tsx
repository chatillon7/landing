import type { Metadata } from 'next';
import { getCompanyNameAndFavicon } from '@/lib/getCompanyNameAndFavicon';

export async function generateMetadata(): Promise<Metadata> {
  const { company, favicon } = await getCompanyNameAndFavicon();
  let type = 'image/png';
  if (favicon.endsWith('.jpg') || favicon.endsWith('.jpeg')) {
    type = 'image/jpeg';
  } else if (favicon.endsWith('.ico')) {
    type = 'image/x-icon';
  } else if (favicon.endsWith('.svg')) {
    type = 'image/svg+xml';
  }
  return {
    title: `${company} | İletişim`,
    icons: { icon: [{ url: favicon, type }] },
  };
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
