"use client";
import { Container, Row, Col, Card } from "react-bootstrap";
import { motion, useInView } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { getSupabase } from "@/lib/supabaseClient";

interface Testimonial {
	id: string;
	name: string;
	company: string;
	content: string;
	avatar_url: string;
	order_index: number;
}

export default function Testimonials() {
	const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
	const [loading, setLoading] = useState(true);
	const ref = useRef(null);
	const inView = useInView(ref, { once: true, margin: "-100px" });

	useEffect(() => {
		const supabase = getSupabase();
		if (!supabase) return;
		supabase
			.from("testimonials")
			.select("*")
			.order("order_index", { ascending: true })
			.then(({ data }) => {
				setTestimonials(
					Array.isArray(data)
						? data.map((t) => ({
								id: String(t.id),
								name: String(t.name),
								company: String(t.company),
								content: String(t.content),
								avatar_url: String(t.avatar_url),
								order_index: Number(t.order_index),
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
							Referanslar
						</motion.h2>
					</Col>
				</Row>
				<Row className="g-4 justify-content-center">
					{loading ? (
						<div className="text-center py-5">Yükleniyor...</div>
					) : (
						testimonials.map((t, i) => (
							<Col key={t.id} md={4}>
								<motion.div
									initial={{ opacity: 0, y: 30 }}
									animate={inView ? { opacity: 1, y: 0 } : {}}
									transition={{ delay: inView ? i * 0.2 : 0 }}
								>
									<Card className="shadow-sm h-100">
										<Card.Body>
											<blockquote className="blockquote mb-0">
												<p>&quot;{t.content}&quot;</p>
												<footer className="blockquote-footer mt-2">
													{t.avatar_url && (
														<img
															src={t.avatar_url}
															alt={t.name}
															style={{
																maxWidth: 32,
																maxHeight: 32,
																borderRadius: "50%",
																marginRight: 8,
															}}
														/>
													)}
													{t.name}{" "}
													{t.company && (
														<cite title="Company">
															({t.company})
														</cite>
													)}
												</footer>
											</blockquote>
										</Card.Body>
									</Card>
								</motion.div>
							</Col>
						))
					)}
				</Row>
			</Container>
		</section>
	);
}
