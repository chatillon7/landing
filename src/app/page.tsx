"use client";
import { Container, Row, Col } from "react-bootstrap";
import { motion, useInView } from "framer-motion";
import Infrastructure from "../components/Infrastructure";
import Testimonials from "../components/Testimonials";
import FAQ from "../components/FAQ";
import Statistics from "../components/Statistics";
import LinksSection from "../components/LinksSection";
import { useEffect, useState, useRef } from "react";
import { getSupabase } from "@/lib/supabaseClient";
import Features from "@/components/Features";
import Link from "next/link";
import { useTheme } from '../context/ThemeContext';

type Content = { id: string; title: string; description: string; image_url?: string; created_at?: string };

function ContentCard({ content, delay }: { content: Content; delay: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <motion.div
      ref={ref}
      className="p-4 border rounded shadow-sm h-100 bg-white"
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: inView ? delay : 0 }}
      whileHover={{ scale: 1.03, boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}
    >
      {content.image_url && <img src={content.image_url} alt="görsel" className="img-fluid mb-3 rounded" style={{ maxHeight: 120 }} />}
      <h5>{content.title}</h5>
      <p>{content.description}</p>
      <div className="text-muted small">{content.created_at && new Date(content.created_at).toLocaleString()}</div>
    </motion.div>
  );
}

export default function Home() {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    supabase.from("contents").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      setContents(Array.isArray(data) ? (data as Content[]) : []);
      setLoading(false);
    });
  }, []);

  return (
    <main>
      {/* Giriş görseli ve başlık */}
      <section className="bg-primary text-white text-center py-5 position-relative overflow-hidden">
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <Container>
            <motion.h1
              className="display-4 fw-bold mb-3"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, type: 'spring' }}
              viewport={{ once: true }}
            >
              {theme?.companyName || "Şirketinizin Dijital Yüzü"}
            </motion.h1>
            {theme?.description && (
              <motion.p
                className="lead mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2, type: 'spring' }}
                viewport={{ once: true }}
              >
                {theme.description}
                <br />
                <Link className="btn btn-light btn-lg mt-5" href="/contact">
                  İletişime Geç</Link>
              </motion.p>
            )}
          </Container>
        </motion.div>
      </section>
      <Features />
      <section className="py-5 bg-light">
        <Container>
          <Row className="mb-4">
            <Col>
              <motion.h2
                className="fw-bold"
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, type: 'spring' }}
                viewport={{ once: true, margin: '-100px' }}
              >
                İçerik
              </motion.h2>
            </Col>
          </Row>
          {loading ? <div>Yükleniyor...</div> : (
            <Row className="g-4">
              {contents.map((content, i) => (
                <Col md={4} key={content.id}>
                  <ContentCard content={content} delay={i * 0.12} />
                </Col>
              ))}
            </Row>
          )}
        </Container>
      </section>
      <Infrastructure />
      <Testimonials />
      <FAQ />
      <Statistics />
      <LinksSection />
    </main>
  );
}
