"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getSupabase } from '../lib/supabaseClient';

export type Theme = {
  id: string;
  description: string;
  colors: Record<string, string>; // { primary: '#...', secondary: '#...', ... }
  font: string;
  logoUrl: string;
  faviconUrl: string;
  companyName: string;
};

interface ThemeContextType {
  theme: Theme | null;
  loading: boolean;
  refreshTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: null,
  loading: true,
  refreshTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTheme = async () => {
    setLoading(true);
    const supabase = getSupabase();
    if (!supabase) {
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('themes')
      .select('*')
      .eq('is_active', true)
      .single();
    // DEBUG: Supabase'den gelen ham veriyi logla
    // console.log('Supabase theme data:', data, 'error:', error);
    if (!error && data) {
      setTheme({
        id: String(data.id),
        description: String(data.description || ''),
        colors: {
          primary: String(data.primary_color || '#0d6efd'),
          secondary: String(data.secondary_color || '#6c757d'),
          success: String(data.success_color || '#198754'),
          info: String(data.info_color || '#0dcaf0'),
          warning: String(data.warning_color || '#ffc107'),
          danger: String(data.danger_color || '#dc3545'),
          light: String(data.light_color || '#f8f9fa'),
          dark: String(data.dark_color || '#212529'),
        },
        font: String(data.font || 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif'),
        logoUrl: String(data.logo_url || ''),
        faviconUrl: String(data.favicon_url || ''),
        companyName: String(data.company_name || ''),
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTheme();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, loading, refreshTheme: fetchTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
