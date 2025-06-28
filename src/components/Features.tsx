"use client";
import { useEffect, useState, useRef } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { motion, useInView } from "framer-motion";
import { getSupabase } from "@/lib/supabaseClient";

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
  order_index: number;
}

export default function Features() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    supabase.from("features").select("*").order("order_index", { ascending: true })
      .then(({ data }) => {
        setFeatures(Array.isArray(data) ? data.map(f => ({
          id: String(f.id),
          title: String(f.title),
          description: String(f.description),
          icon: String(f.icon),
          order_index: Number(f.order_index)
        })) : []);
        setLoading(false);
      });
  }, []);

  return (
    <section className="py-5 bg-white" ref={ref}>
      <Container>
        <Row className="text-center mb-4">
          <Col>
            <motion.h2
              className="fw-bold"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, type: 'spring' }}
              viewport={{ once: true }}
            >
              Özelliklerimiz
            </motion.h2>
          </Col>
        </Row>
        {loading ? (
          <div className="text-center py-5">Yükleniyor...</div>
        ) : (
          <Row className="g-4">
            {features.map((f, i) => (
              <Col md={4} key={f.id}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  initial={{ opacity: 0, y: 40 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: inView ? i * 0.1 : 0 }}
                  className="p-4 border rounded shadow-sm h-100"
                >
                  {f.icon && <i className={`${f.icon} fa-2x text-secondary mb-3`}></i>}
                  <h5>{f.title}</h5>
                  <p>{f.description}</p>
                </motion.div>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </section>
  );
}
