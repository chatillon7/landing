"use client";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";
import { Table, Button, Form, Modal, Spinner, Alert } from "react-bootstrap";
import ImageUpload from "@/components/admin/ImageUpload";

interface GalleryItem {
  id: string;
  title: string;
  image_url: string;
  description: string;
  date: string;
  created_at: string;
}

export default function GalleryManager() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<GalleryItem | null>(null);
  const [form, setForm] = useState<Omit<GalleryItem, "id" | "created_at">>({ title: "", image_url: "", description: "", date: "" });
  const [error, setError] = useState("");

  const supabase = getSupabase();

  const fetchItems = async () => {
    setLoading(true);
    if (!supabase) return;
    const { data, error } = await supabase.from("gallery").select("*").order("date", { ascending: false });
    if (error) setError(error.message);
    setItems(Array.isArray(data) ? (data as unknown as GalleryItem[]) : []);
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line
  }, []);

  const handleShowModal = (item: GalleryItem | null = null) => {
    setEditItem(item);
    setForm(item ? {
      title: item.title,
      image_url: item.image_url,
      description: item.description,
      date: item.date ? item.date.substring(0, 10) : ""
    } : { title: "", image_url: "", description: "", date: "" });
    setShowModal(true);
    setError("");
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditItem(null);
    setForm({ title: "", image_url: "", description: "", date: "" });
    setError("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.image_url) return setError("Başlık ve görsel zorunlu!");
    if (!supabase) return;
    setError("");
    if (editItem) {
      // Update
      const { error } = await supabase.from("gallery").update(form).eq("id", editItem.id);
      if (error) return setError(error.message);
    } else {
      // Insert
      const { error } = await supabase.from("gallery").insert([form]);
      if (error) return setError(error.message);
    }
    handleCloseModal();
    fetchItems();
  };

  const handleDelete = async (id: string) => {
    if (!supabase) return;
    if (!window.confirm("Silmek istediğinize emin misiniz?")) return;
    const { error } = await supabase.from("gallery").delete().eq("id", id);
    if (error) setError(error.message);
    fetchItems();
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold">Galeri Yönetimi</h4>
        <Button onClick={() => handleShowModal()} variant="success">+ Yeni Görsel</Button>
      </div>
      {error && <Alert variant="danger">{error}</Alert>}
      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" /></div>
      ) : (
        <Table striped bordered hover responsive className="rounded overflow-hidden" style={{ borderRadius: 24 }}>
          <thead>
            <tr>
              <th>Başlık</th>
              <th>Görsel</th>
              <th>Açıklama</th>
              <th>Tarih</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.title}</td>
                <td>{item.image_url && <img src={item.image_url} alt="görsel" style={{ maxWidth: 80, maxHeight: 40 }} />}</td>
                <td>{item.description}</td>
                <td>{item.date}</td>
                <td>
                  <Button size="sm" variant="primary" className="me-2" onClick={() => handleShowModal(item)}>Düzenle</Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(item.id)}>Sil</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" container={typeof window !== 'undefined' ? (document.querySelector('.admin-panel-root') as HTMLElement | null) : undefined}>
        <Modal.Header closeButton>
          <Modal.Title>{editItem ? "Görseli Düzenle" : "Yeni Görsel"}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Başlık</Form.Label>
              <Form.Control name="title" value={form.title} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Görsel</Form.Label>
              <ImageUpload value={form.image_url} onChange={url => setForm({ ...form, image_url: url })} label="Görsel Yükle" folder="gallery" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Açıklama</Form.Label>
              <Form.Control name="description" value={form.description} onChange={handleChange} as="textarea" rows={2} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Tarih</Form.Label>
              <Form.Control name="date" type="date" value={form.date} onChange={handleChange} />
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
