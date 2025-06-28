"use client";
import React from "react";
import { usePathname } from "next/navigation";
import MainNavbar from "../components/MainNavbar";
import Footer from "../components/Footer";

export default function LayoutWithNavFooter({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname ? pathname.startsWith("/admin") : false;
  return (
    <>
      {!isAdmin && <MainNavbar />}
        {children}
      {!isAdmin && <Footer />}
    </>
  );
}
