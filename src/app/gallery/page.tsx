"use client";
import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Modal } from "react-bootstrap";
import { motion } from "framer-motion";
import { getSupabase } from "@/lib/supabaseClient";
import './gallery-modal-override.css';

type GalleryItem = { id: string; title?: string; image_url: string; date?: string; description?: string };

export default function GalleryPage() {
	const [gallery, setGallery] = useState<GalleryItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [modalImg, setModalImg] = useState<string | null>(null);

	useEffect(() => {
		const supabase = getSupabase();
		if (!supabase) return;
		supabase
			.from("gallery")
			.select("*")
			.order("date", { ascending: false })
			.then(({ data }) => {
				setGallery(Array.isArray(data) ? (data as GalleryItem[]) : []);
				setLoading(false);
			});
	}, []);

	return (
		<motion.div
			initial={{ opacity: 0, y: 40 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.7 }}
		>
			<Container className="py-5">
				<motion.h2
					className="fw-bold text-center mb-4"
					initial={{ opacity: 0, scale: 0.8 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ delay: 0.2, duration: 0.5 }}
				>
					Galeri
				</motion.h2>
				{loading ? (
					<div>Yükleniyor...</div>
				) : (
					<Row className="g-4">
						{gallery.map((item, i) => (
							<Col key={item.id} md={2} sm={4} xs={6}>
								<motion.div
									whileHover={{
										scale: 1.05,
										boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
									}}
									initial={{ opacity: 0, y: 30 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.1 + i * 0.05, duration: 0.4 }}
								>
									<Card className="shadow-sm h-100" style={{ maxHeight: 360, display: 'flex', flexDirection: 'column' }}>
										<Card.Img
											variant="top"
											src={item.image_url}
											alt={item.title}
											style={{
												cursor: "pointer",
												objectFit: "cover",
												width: "100%",
												height: 160,
												aspectRatio: '1/1',
												background: '#f8f9fa',
												borderRadius: '0.5rem 0.5rem 0 0'
											}}
											onClick={() => setModalImg(item.image_url)}
										/>
										<Card.Body style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
											<Card.Title>{item.title}</Card.Title>
											<Card.Text style={{
												maxHeight: 64,
												overflow: 'hidden',
												textOverflow: 'ellipsis',
												display: '-webkit-box',
												WebkitLineClamp: 4,
												WebkitBoxOrient: 'vertical',
												whiteSpace: 'normal',
												fontSize: 14
											}}>
												{item.description}
											</Card.Text>
											<Card.Text className="text-muted small">
												{" "}
												{item.date
													? new Date(item.date).toLocaleDateString("tr-TR", {
															year: "numeric",
															month: "long",
															day: "numeric",
													  })
													: ""}
											</Card.Text>
										</Card.Body>
									</Card>
								</motion.div>
							</Col>
						))}
					</Row>
				)}
			</Container>

			<Modal show={!!modalImg} onHide={() => setModalImg(null)} centered size="xl">
				<Modal.Body className="p-0 text-center" style={{ background: 'transparent', position: 'relative' }}>
					{modalImg && (
						<>
							{/* Açıklama kutusu */}
							<div style={{
								position: 'absolute',
								top: -40,
								left: '50%',
								transform: 'translateX(-50%)',
								zIndex: 20,
								background: 'rgba(0, 0, 0, 0)',
								color: '#fff',
								padding: '8px 20px',
								borderRadius: 16,
								maxWidth: '80%',
								fontSize: 16,
								fontWeight: 500,
								boxShadow: '0 2px 8px rgba(0, 0, 0, 0)',
								pointerEvents: 'none',
								whiteSpace: 'pre-line',
							}}>
								{gallery.find(g => g.image_url === modalImg)?.description || ''}
							</div>
							<img
								src={modalImg}
								alt="Büyük Görsel"
								style={{
									maxWidth: "100%",
									maxHeight: "80vh",
									margin: '0',
									objectFit: "contain",
									background: 'transparent',
								}}
								className="img-fluid rounded"
							/>
							<button
								type="button"
								aria-label="Kapat"
								onClick={() => setModalImg(null)}
								style={{
									position: 'absolute',
									left: '50%',
									bottom: 24,
									transform: 'translateX(-50%)',
									zIndex: 10,
									background: 'rgba(0,0,0,0.5)',
									border: 'none',
									borderRadius: '50%',
									width: 44,
									height: 44,
									color: '#fff',
									fontSize: 28,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									cursor: 'pointer',
									boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
								}}
							>
								&times;
							</button>
						</>
					)}
				</Modal.Body>
			</Modal>
		</motion.div>
	);
}
