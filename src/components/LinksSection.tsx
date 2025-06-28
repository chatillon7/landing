"use client";
import { Container, Row, Col } from "react-bootstrap";
import { useEffect, useState, useRef } from "react";
import { getSupabase } from "@/lib/supabaseClient";
import { motion, useInView } from "framer-motion";

interface LinkItem {
  id: string;
  label: string;
  url: string;
  icon: string;
  order_index: number;
}

export default function LinksSection() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    supabase
      .from("links")
      .select("*")
      .order("order_index", { ascending: true })
      .then(({ data }) => {
        setLinks(
          Array.isArray(data)
            ? data.map((l) => ({
                id: String(l.id),
                label: String(l.label),
                url: String(l.url),
                icon: String(l.icon),
                order_index: Number(l.order_index),
              }))
            : []
        );
        setLoading(false);
      });
  }, []);

  return (
    <section className="py-5 bg-light" ref={ref}>
      <Container>
        <Row className="text-center mb-4">
          <Col>
            <motion.h2
              className="fw-bold"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, type: "spring" }}
              viewport={{ once: true }}
            >
              Faydalı Bağlantılar
            </motion.h2>
          </Col>
        </Row>
        <Row className="justify-content-center">
          <Col md={8}>
            {loading ? (
              <div className="text-center py-5">Yükleniyor...</div>
            ) : (
              <motion.ul
                className="list-group list-group-flush"
                initial={{ opacity: 0, y: 40 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6 }}
              >
                {links.map((l, i) => (
                  <motion.li
                    key={l.id}
                    initial={{ opacity: 0, x: 40 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: inView ? i * 0.08 : 0 }}
                    whileHover={{
                      scale: 1.04,
                      backgroundColor: "#f1f3f9",
                    }}
                    className="list-group-item p-0 border-0"
                    style={{ cursor: "pointer", overflow: "hidden" }}
                    onClick={() => window.open(l.url, "_blank", "noopener")}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ")
                        window.open(l.url, "_blank", "noopener");
                    }}
                    role="link"
                    aria-label={l.label}
                  >
                    <div
                      className="w-100 h-100 px-4 py-3 d-flex align-items-center text-secondary"
                      style={{ minHeight: 48 }}
                    >
                      {l.icon && <i className={`${l.icon} me-2`}></i>}
                      {l.label}
                    </div>
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </Col>
        </Row>
      </Container>
    </section>
  );
}
