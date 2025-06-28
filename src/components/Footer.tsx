"use client";
import Link from "next/link";
import { Container, Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";
import { useTheme } from '../context/ThemeContext';

interface ContactInfo {
  address: string;
  phone: string;
  email: string;
  social: string;
  map_url?: string;
  description?: string;
}

export default function Footer() {
  const [contact, setContact] = useState<ContactInfo | null>(null);
  const { theme } = useTheme();
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    supabase.from("contacts").select("*").order("created_at", { ascending: false }).limit(1)
      .then(({ data }) => {
        setContact(Array.isArray(data) && data.length > 0 ? {
          address: String(data[0].address),
          phone: String(data[0].phone),
          email: String(data[0].email),
          social: String(data[0].social),
          map_url: data[0].map_url ? String(data[0].map_url) : undefined,
          description: data[0].description ? String(data[0].description) : undefined
        } : null);
      });
  }, []);

  return (
    <footer className="bg-dark text-white pt-5 mt-5">
      <Container>
        <Row>
          <Col md={4} className="mb-3 mb-md-0">
            <h5><Link href="/" className="text-white text-decoration-none">
              {theme?.logoUrl ? (
                <img src={theme.logoUrl} alt="Logo" height={32} style={{ maxHeight: 32, verticalAlign: 'middle' }} />
              ) : (
                <i className="fas fa-rocket"></i>
              )}</Link>
            </h5>
            {theme?.description && (
              <div className="small text-white-50 mb-2">{theme.description}</div>
            )}
            <p className="small mt-2">
            © {new Date().getFullYear()} {theme?.companyName || 'ŞirketLogo'}
            <br /> Tüm Hakları Saklıdır.
            </p>
          </Col>
          <Col md={4} className="mb-3 mb-md-0">
          </Col>
          <Col md={4}>
            <div className="text-end">
            <p className="mb-1 me-1"><i className="fas fa-map-marker-alt me-2"></i>{contact?.address || "İstanbul, Türkiye"}</p>
            <Link
                className="btn btn-success btn-sm mt-1 me-1"
                href={`https://wa.me/${contact?.phone.replace(/[^0-9]/g, '').replace(/^0/, '90') || ''}`}
                target="_blank"
                rel="noopener noreferrer"
            >
            <i className="fa-brands fa-whatsapp"></i> +9{contact?.phone || "05555555555"}
            </Link>
            <br />
            <Link
                className="btn btn-primary btn-sm mt-1 me-1"
                href={`mailto:${contact?.email || ''}`}
            >
            <i className="fa-solid fa-envelope"></i> {contact?.email || "info@sirket.com"}
            </Link>
            </div>
          </Col>
        </Row>
        <Row className="mt-4">
        </Row>
      </Container>
    </footer>
  );
}
