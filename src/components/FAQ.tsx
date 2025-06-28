"use client";
import { Container, Row, Col, Accordion } from "react-bootstrap";
import { useEffect, useState, useRef } from "react";
import { getSupabase } from "@/lib/supabaseClient";
import { motion, useInView } from "framer-motion";

interface FAQItem {
	id: string;
	question: string;
	answer: string;
	order_index: number;
}

export default function FAQ() {
	const [faqs, setFaqs] = useState<FAQItem[]>([]);
	const [loading, setLoading] = useState(true);
	const ref = useRef(null);
	const inView = useInView(ref, { once: true, margin: "-100px" });

	useEffect(() => {
		const supabase = getSupabase();
		if (!supabase) return;
		supabase
			.from("faqs")
			.select("*")
			.order("order_index", { ascending: true })
			.then(({ data }) => {
				setFaqs(Array.isArray(data) ? data.map(f => ({
          id: String(f.id),
          question: String(f.question),
          answer: String(f.answer),
          order_index: Number(f.order_index)
        })) : []);
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
							transition={{ duration: 0.6, type: 'spring' }}
							viewport={{ once: true }}
						>
							Sıkça Sorulan Sorular
						</motion.h2>
					</Col>
				</Row>
				<Row className="justify-content-center">
					<Col md={8}>
						{loading ? (
							<div className="text-center py-5">Yükleniyor...</div>
						) : (
							<motion.div initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}>
								<Accordion defaultActiveKey="0">
									{faqs.map((f, i) => (
										<Accordion.Item eventKey={i.toString()} key={f.id}>
											<Accordion.Header>{f.question}</Accordion.Header>
											<Accordion.Body>{f.answer}</Accordion.Body>
										</Accordion.Item>
									))}
								</Accordion>
							</motion.div>
						)}
					</Col>
				</Row>
			</Container>
		</section>
	);
}
