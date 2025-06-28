"use client";
import { Container, Row, Col, Table } from "react-bootstrap";
import { useEffect, useState, useRef } from "react";
import { getSupabase } from "@/lib/supabaseClient";
import { motion, useInView } from "framer-motion";

interface Statistic {
  id: string;
  label: string;
  value: number;
  icon: string;
  order_index: number;
}

export default function Statistics() {
  const [stats, setStats] = useState<Statistic[]>([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    supabase
      .from("statistics")
      .select("*")
      .order("order_index", { ascending: true })
      .then(({ data }) => {
        setStats(
          Array.isArray(data)
            ? data.map((s) => ({
                id: String(s.id),
                label: String(s.label),
                value: Number(s.value),
                icon: String(s.icon),
                order_index: Number(s.order_index),
              }))
            : []
        );
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
              transition={{ duration: 0.6, type: "spring" }}
              viewport={{ once: true }}
            >
              İstatistikler
            </motion.h2>
          </Col>
        </Row>
        <Row className="justify-content-center">
          <Col md={8}>
            {loading ? (
              <div className="text-center py-5">Yükleniyor...</div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6 }}
              >
                <Table striped bordered hover className="text-center">
                  <tbody>
                    {stats.map((s, i) => (
                      <motion.tr
                        key={s.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: inView ? i * 0.1 : 0 }}
                      >
                        <td className="fw-bold">
                          {s.icon && <i className={`${s.icon} me-2`}></i>}
                          {s.label}
                        </td>
                        <td>{s.value}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </Table>
              </motion.div>
            )}
          </Col>
        </Row>
      </Container>
    </section>
  );
}
