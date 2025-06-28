"use client";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";
import { Table, Button, Form, Modal, Spinner, Alert } from "react-bootstrap";
import ImageUpload from "@/components/admin/ImageUpload";
import '../../app/admin-panel-isolation.css';

interface Testimonial {
  id: string;
  name: string;
  company: string;
  content: string;
  avatar_url: string;
  order_index: number;
  created_at: string;
}

export default function TestimonialsManager() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTestimonial, setEditTestimonial] = useState<Testimonial | null>(null);
  const [form, setForm] = useState<Omit<Testimonial, "id" | "created_at">>({ name: "", company: "", content: "", avatar_url: "", order_index: 0 });
  const [error, setError] = useState("");

  const supabase = getSupabase();

  const fetchTestimonials = async () => {
    setLoading(true);
    if (!supabase) return;
    const { data, error } = await supabase.from("testimonials").select("*").order("order_index", { ascending: true });
    if (error) setError(error.message);
    setTestimonials(Array.isArray(data) ? (data as unknown as Testimonial[]) : []);
    setLoading(false);
  };

  useEffect(() => {
    fetchTestimonials();
    // eslint-disable-next-line
  }, []);

  const handleShowModal = (testimonial: Testimonial | null = null) => {
    setEditTestimonial(testimonial);
    setForm(testimonial ? {
      name: testimonial.name,
      company: testimonial.company,
      content: testimonial.content,
      avatar_url: testimonial.avatar_url,
      order_index: testimonial.order_index || 0
    } : { name: "", company: "", content: "", avatar_url: "", order_index: 0 });
    setShowModal(true);
    setError("");
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditTestimonial(null);
    setForm({ name: "", company: "", content: "", avatar_url: "", order_index: 0 });
    setError("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.content) return setError("İsim ve içerik zorunlu!");
    if (!supabase) return;
    setError("");
    if (editTestimonial) {
      // Update
      const { error } = await supabase.from("testimonials").update(form).eq("id", editTestimonial.id);
      if (error) return setError(error.message);
    } else {
      // Insert
      // order_index otomatik belirleniyor
      const { data: maxData, error: maxError } = await supabase
        .from("testimonials")
        .select("order_index")
        .order("order_index", { ascending: false })
        .limit(1);
      if (maxError) return setError(maxError.message);
      const maxOrder = maxData && maxData.length > 0 && typeof maxData[0].order_index === 'number' ? maxData[0].order_index : 0;
      const newTestimonial = { ...form, order_index: maxOrder + 1 };
      const { error } = await supabase.from("testimonials").insert([newTestimonial]);
      if (error) return setError(error.message);
    }
    handleCloseModal();
    fetchTestimonials();
  };

  const handleDelete = async (id: string) => {
    if (!supabase) return;
    if (!window.confirm("Silmek istediğinize emin misiniz?")) return;
    const { error } = await supabase.from("testimonials").delete().eq("id", id);
    if (error) setError(error.message);
    fetchTestimonials();
  };

  function truncateText(text: string, maxLength = 48) {
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, maxLength) + '…' : text;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold">Referanslar Yönetimi</h4>
        <Button onClick={() => handleShowModal()} variant="success">+ Yeni Referans</Button>
      </div>
      {error && <Alert variant="danger">{error}</Alert>}
      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" /></div>
      ) : (
        <Table striped bordered hover responsive className="rounded overflow-hidden" style={{ borderRadius: 24 }}>
          <thead>
            <tr>
              <th>İsim</th>
              <th>Şirket</th>
              <th>İçerik</th>
              <th>Görsel</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {testimonials.map((t) => (
              <tr key={t.id}>
                <td>{t.name}</td>
                <td>{t.company}</td>
                <td>{truncateText(t.content)}</td>
                <td>{t.avatar_url && <img src={t.avatar_url} alt="avatar" style={{ maxWidth: 40, maxHeight: 40, borderRadius: "50%" }} />}</td>
                <td>
                  <Button size="sm" variant="primary" className="me-2" onClick={() => handleShowModal(t)}>Düzenle</Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(t.id)}>Sil</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <Modal show={showModal} onHide={handleCloseModal} container={typeof window !== 'undefined' ? (document.querySelector('.admin-panel-root') as HTMLElement | null) : undefined} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editTestimonial ? "Referansı Düzenle" : "Yeni Referans Ekle"}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="formName">
              <Form.Label>İsim</Form.Label>
              <Form.Control name="name" value={form.name} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formCompany">
              <Form.Label>Şirket</Form.Label>
              <Form.Control name="company" value={form.company} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formContent">
              <Form.Label>İçerik</Form.Label>
              <Form.Control as="textarea" rows={3} name="content" value={form.content} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formAvatar">
              <Form.Label>Görsel</Form.Label>
              <ImageUpload
                value={form.avatar_url}
                onChange={(url) => setForm({ ...form, avatar_url: url })}
                label="Görsel Yükle"
              />
            </Form.Group>
            {/* <Form.Group className="mb-3" controlId="formAvatar">
              <Form.Label>Avatar URL</Form.Label>
              <Form.Control name="avatar_url" value={form.avatar_url} onChange={handleChange} />
            </Form.Group> */}
            {error && <Alert variant="danger">{error}</Alert>}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>İptal</Button>
            <Button type="submit" variant="primary">Kaydet</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
