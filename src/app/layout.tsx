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

export async function generateMetadata(): Promise<Metadata> {
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
    icons: { icon: [{ url: favicon, type }] },
  };
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
