"use client";
import { useEffect, useState } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { getSupabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import Link from "next/link";

type Contact = { id: string; name: string; email: string; phone?: string; address?: string; map_url?: string; created_at?: string };

export default function ContactPage() {
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    supabase
      .from("contacts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .then(({ data }) => {
        setContact(Array.isArray(data) && data.length > 0 ? (data[0] as Contact) : null);
        setLoading(false);
      });
  }, []);

  // Harita url'si için contact.map_url kullanılabilir, otomatik embed url'ye çevrilir
  function convertMapUrl(url: string): string {
    const match = url?.match(/#map=([0-9]+)\/(\d+\.\d+)\/(\d+\.\d+)/);
    if (match) {
      const lat = match[2];
      const lon = match[3];
      const delta = 0.002;
      const bbox = `${parseFloat(lon)-delta}%2C${parseFloat(lat)-delta}%2C${parseFloat(lon)+delta}%2C${parseFloat(lat)+delta}`;
      return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lon}`;
    }
    if (url?.includes("/export/embed.html?")) return url;
    return url;
  }
  const mapUrl = convertMapUrl(contact?.map_url || "") || "https://www.openstreetmap.org/export/embed.html?bbox=28.9784%2C41.0082%2C28.9784%2C41.0082&layer=mapnik";

  return (
    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
      <Container className="py-5">
        <motion.h2 className="fw-bold text-center mb-4" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.5 }}>
          İletişim
        </motion.h2>
        {loading ? (
          <div>Yükleniyor...</div>
        ) : contact ? (
          <Row>
            <Col md={6} className="mb-3 mb-md-0">
              <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.5 }}>
                <Card className="h-100 shadow-sm">
                  <Card.Body>
                    <h5 className="mb-3">
                      <i className="fas fa-map-marker-alt me-2"></i>Açık Adres
                    </h5>
                    {contact.address}
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
            <Col md={6}>
              <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 0.5 }}>
                <Card className="h-100 shadow-sm">
                  <Card.Body>
                    <h5 className="mb-3">
                      <i className="fas fa-phone me-2"></i>İletişim
                    </h5>
                    {contact.phone && (
                    <Link
                        className="btn btn-success btn-sm mb-2"
                        href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, '').replace(/^0/, '90')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                    <i className="fa-brands fa-whatsapp"></i> +9{contact.phone}
                    </Link>
                    )}
                    <br />
                    {contact.email && (
                    <Link
                        className="btn btn-primary btn-sm"
                        href={`mailto:${contact.email}`}
                    >
                    <i className="fa-solid fa-envelope"></i> {contact.email}
                    </Link>
                    )}
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
          </Row>
        ) : (
          <div className="mb-1">İletişim bilgisi bulunamadı.</div>
        )}
        <Row>
          <Col>
          <hr />
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.7 }}>
              <iframe
                title="Harita"
                src={mapUrl}
                style={{ width: "100%", height: 300, border: 0 }}
                allowFullScreen
                loading="lazy"
                className="rounded"
              ></iframe>
            </motion.div>
          </Col>
        </Row>
      </Container>
    </motion.div>
  );
}
