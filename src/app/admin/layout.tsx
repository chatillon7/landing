import React from "react";
import '@fortawesome/fontawesome-free/css/all.min.css';
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
      title: `${company} | Yönetici`,
      icons: { 
        icon: [{ url: favicon, type }],
        shortcut: [{ url: favicon, type }],
        apple: [{ url: favicon, type }]
      },
    };
  } catch (error) {
    console.error('Admin metadata generation error:', error);
    return {
      title: 'Landing Page | Yönetici',
      icons: { icon: [{ url: '/favicon.ico', type: 'image/x-icon' }] },
    };
  }
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-panel-root">
      {children}
    </div>
  );
}
