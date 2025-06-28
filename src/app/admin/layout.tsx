import React from "react";
import '@fortawesome/fontawesome-free/css/all.min.css';
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
    title: `${company} | Yönetici`,
    icons: { icon: [{ url: favicon, type }] },
  };
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-panel-root">
      {children}
    </div>
  );
}
