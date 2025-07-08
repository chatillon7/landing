import type { Metadata } from 'next';
import { getCompanyNameAndFavicon } from '@/lib/getCompanyNameAndFavicon';

// Metadata'nın her seferinde yeniden oluşturulmasını sağla
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  try {
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
      icons: { 
        icon: [{ url: favicon, type }],
        shortcut: [{ url: favicon, type }],
        apple: [{ url: favicon, type }]
      },
    };
  } catch (error) {
    console.error('Contact metadata generation error:', error);
    return {
      title: 'Landing Page | İletişim',
      icons: { icon: [{ url: '/favicon.ico', type: 'image/x-icon' }] },
    };
  }
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
