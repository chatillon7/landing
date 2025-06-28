"use client";
import { Container, Row, Col } from "react-bootstrap";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";

// Partner tipini tanımla
interface Partner {
	id: string;
	name: string;
	logo_url: string;
	website_url?: string;
	created_at?: string;
}

export default function Infrastructure() {
	const ref = useRef(null);
	const inView = useInView(ref, { once: true, margin: "-100px" });
	const [partners, setPartners] = useState<Partner[]>([]);
	useEffect(() => {
		const supabase = getSupabase();
		if (!supabase) return;
		supabase
			.from("partners")
			.select("*")
			.order("created_at", { ascending: false })
			.then(({ data }) => {
				setPartners(Array.isArray(data)
          ? data.map((item) => ({
              id: String(item.id),
              name: String(item.name),
              logo_url: String(item.logo_url),
              website_url: item.website_url ? String(item.website_url) : undefined,
              created_at: item.created_at ? String(item.created_at) : undefined,
            }))
          : []);
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
							Altyapı Partnerlerimiz
						</motion.h2>
					</Col>
				</Row>
				<Row className="g-4 justify-content-center align-items-center">
					{partners.map((partner, i) => (
						<Col
							key={partner.id}
							xs={6}
							md={3}
							className="d-flex align-items-center justify-content-center text-center"
							style={{ paddingLeft: 0, paddingRight: 0 }}
						>
							{partner.logo_url ? (
								<motion.a
									href={partner.website_url || "#"}
									target="_blank"
									rel="noopener noreferrer"
									initial={{ opacity: 0, y: 20 }}
									animate={inView ? { opacity: 1, y: 0 } : {}}
									transition={{ delay: inView ? i * 0.2 : 0 }}
									style={{ display: "inline-block" }}
								>
									<img
										src={partner.logo_url}
										alt={partner.name}
										className="img-fluid p-0"
										style={{ maxHeight: 48, maxWidth: "100%" }}
									/>
								</motion.a>
							) : null}
						</Col>
					))}
				</Row>
			</Container>
		</section>
	);
}
