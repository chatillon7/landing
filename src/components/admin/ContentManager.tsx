"use client";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";
import { Table, Button, Form, Modal, Spinner, Alert } from "react-bootstrap";
import ImageUpload from "@/components/admin/ImageUpload";

// İçerik tipi
interface Content {
  id: string;
  title: string;
  description: string;
  image_url: string;
  created_at: string;
  updated_at: string;
}

export default function ContentManager() {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editContent, setEditContent] = useState<Content | null>(null);
  const [form, setForm] = useState<Omit<Content, "id" | "created_at" | "updated_at">>({ title: "", description: "", image_url: "" });
  const [error, setError] = useState("");

  const supabase = getSupabase();

  const fetchContents = async () => {
    setLoading(true);
    if (!supabase) return;
    const { data, error } = await supabase.from("contents").select("*").order("created_at", { ascending: false });
    if (error) setError(error.message);
    setContents(Array.isArray(data) ? (data as unknown as Content[]) : []);
    setLoading(false);
  };

  useEffect(() => {
    fetchContents();
    // eslint-disable-next-line
  }, []);

  const handleShowModal = (content: Content | null = null) => {
    setEditContent(content);
    setForm(content ? {
      title: content.title,
      description: content.description,
      image_url: content.image_url
    } : { title: "", description: "", image_url: "" });
    setShowModal(true);
    setError("");
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditContent(null);
    setForm({ title: "", description: "", image_url: "" });
    setError("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) return setError("Başlık zorunlu!");
    if (!supabase) return;
    setError("");
    if (editContent) {
      // Update
      const { error } = await supabase.from("contents").update(form).eq("id", editContent.id);
      if (error) return setError(error.message);
    } else {
      // Insert
      const { error } = await supabase.from("contents").insert([form]);
      if (error) return setError(error.message);
    }
    handleCloseModal();
    fetchContents();
  };

  const handleDelete = async (id: string) => {
    if (!supabase) return;
    if (!window.confirm("Silmek istediğinize emin misiniz?")) return;
    const { error } = await supabase.from("contents").delete().eq("id", id);
    if (error) setError(error.message);
    fetchContents();
  };

  // Yardımcı: Uzun metinleri kısalt
  function truncateText(text: string, maxLength = 48) {
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, maxLength) + '…' : text;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold">İçerik Yönetimi</h4>
        <Button onClick={() => handleShowModal()} variant="success">+ Yeni İçerik</Button>
      </div>
      {error && <Alert variant="danger">{error}</Alert>}
      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" /></div>
      ) : (
        <Table striped bordered hover responsive className="rounded overflow-hidden" style={{ borderRadius: 24 }}>
          <thead>
            <tr>
              <th>Başlık</th>
              <th>Açıklama</th>
              <th>Görsel</th>
              <th>Tarih</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {contents.map((c) => (
              <tr key={c.id}>
                <td>{c.title}</td>
                <td>{truncateText(c.description)}</td>
                <td>{c.image_url && <img src={c.image_url} alt="görsel" style={{ maxWidth: 80, maxHeight: 40 }} />}</td>
                <td>{c.created_at && new Date(c.created_at).toLocaleString()}</td>
                <td>
                  <Button size="sm" variant="primary" className="me-2" onClick={() => handleShowModal(c)}>Düzenle</Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(c.id)}>Sil</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" container={typeof window !== 'undefined' ? (document.querySelector('.admin-panel-root') as HTMLElement | null) : undefined}>
        <Modal.Header closeButton>
          <Modal.Title>{editContent ? "İçeriği Düzenle" : "Yeni İçerik"}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Başlık</Form.Label>
              <Form.Control name="title" value={form.title} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Açıklama</Form.Label>
              <Form.Control name="description" value={form.description} onChange={handleChange} as="textarea" rows={2} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Görsel</Form.Label>
              <ImageUpload value={form.image_url} onChange={url => setForm({ ...form, image_url: url })} label="Görsel Yükle" />
            </Form.Group>
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
