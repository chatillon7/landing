"use client";

import { useTheme } from '../context/ThemeContext';
import { useEffect, useRef } from 'react';

export default function ThemeStyleInjector() {
  const { theme } = useTheme();
  const prevFont = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!theme) return;
    const root = document.documentElement;
    // Renkleri root CSS değişkenlerine aktar
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--bs-${key}`, value);
    });
    // Fontu uygula
    root.style.setProperty('--bs-font-sans-serif', theme.font);
    document.body.style.fontFamily = theme.font;
    // Ana Bootstrap bileşenlerine fontu uygula
    const selectors = ['.container', '.navbar', '.footer', '.btn', '.card', '.form-control', '.nav', '.dropdown-menu'];
    selectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        (el as HTMLElement).style.fontFamily = theme.font;
      });
    });
    // Google Fonts otomatik import
    if (theme.font && prevFont.current !== theme.font) {
      const fontName = theme.font.split(',')[0].replace(/['"]/g, '').trim();
      if (/^[A-Za-z0-9\s]+$/.test(fontName)) {
        const fontParam = fontName.replace(/\s+/g, '+');
        const fontUrl = `https://fonts.googleapis.com/css2?family=${fontParam}:wght@400;700&display=swap`;
        let link = document.getElementById('dynamic-google-font') as HTMLLinkElement | null;
        if (!link) {
          link = document.createElement('link');
          link.id = 'dynamic-google-font';
          link.rel = 'stylesheet';
          document.head.appendChild(link);
        }
        link.href = fontUrl;
      }
      prevFont.current = theme.font;
    }
  }, [theme]);

  return null;
}
