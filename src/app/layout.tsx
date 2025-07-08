import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './globals.css';
import './custom-bootstrap-override.css';
import type { Metadata } from "next";
import { ReactNode } from 'react';
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from '../context/ThemeContext';
import ThemeLoaderWrapper from '../components/ThemeLoaderWrapper';
import ThemeStyleInjector from '../components/ThemeStyleInjector';
import { getCompanyNameAndFavicon } from '@/lib/getCompanyNameAndFavicon';
import ScrollToTopButton from '../components/ScrollToTopButton';
import '../fontawesome';

// Metadata'nın her seferinde yeniden oluşturulmasını sağla
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  try {
    const { company, favicon } = await getCompanyNameAndFavicon();
    // Dosya uzantısına göre type belirle
    let type = 'image/png';
    if (favicon.endsWith('.jpg') || favicon.endsWith('.jpeg')) {
      type = 'image/jpeg';
    } else if (favicon.endsWith('.ico')) {
      type = 'image/x-icon';
    } else if (favicon.endsWith('.svg')) {
      type = 'image/svg+xml';
    }
    return {
      title: `${company} | Anasayfa`,
      icons: { 
        icon: [{ url: favicon, type }],
        shortcut: [{ url: favicon, type }],
        apple: [{ url: favicon, type }]
      },
    };
  } catch (error) {
    console.error('Metadata generation error:', error);
    return {
      title: 'Landing Page | Anasayfa',
      icons: { icon: [{ url: '/favicon.ico', type: 'image/x-icon' }] },
    };
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="bg-light" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AuthProvider>
          <ThemeProvider>
            <ThemeStyleInjector />
            <ThemeLoaderWrapper>{children}</ThemeLoaderWrapper>
            <ScrollToTopButton />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
