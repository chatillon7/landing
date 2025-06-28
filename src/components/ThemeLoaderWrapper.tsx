"use client";
import { ReactNode } from "react";
import { useTheme } from "../context/ThemeContext";
import FullPageLoader from "./FullPageLoader";
import LayoutWithNavFooter from '../app/LayoutWithNavFooter';

export default function ThemeLoaderWrapper({ children }: { children: ReactNode }) {
  const { loading } = useTheme();
  if (loading) return <FullPageLoader />;
  return <LayoutWithNavFooter>{children}</LayoutWithNavFooter>;
}
