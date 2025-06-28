"use client";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";
import { Table, Button, Form, Modal, Spinner, Alert } from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { IconName } from '@fortawesome/fontawesome-svg-core';

library.add(fas);
library.add(fab);

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
  order_index: number;
  created_at: string;
}

export default function FeaturesManager() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editFeature, setEditFeature] = useState<Feature | null>(null);
  const [form, setForm] = useState<Omit<Feature, "id" | "created_at">>({ title: "", description: "", icon: "", order_index: 0 });
  const [error, setError] = useState("");

  const supabase = getSupabase();

  const fetchFeatures = async () => {
    setLoading(true);
    if (!supabase) return;
    const { data, error } = await supabase.from("features").select("*").order("order_index", { ascending: true });
    if (error) setError(error.message);
    setFeatures(Array.isArray(data) ? (data as unknown as Feature[]) : []);
    setLoading(false);
  };

  useEffect(() => {
    fetchFeatures();
    // eslint-disable-next-line
  }, []);

  const handleShowModal = (feature: Feature | null = null) => {
    setEditFeature(feature);
    setForm(feature ? {
      title: feature.title,
      description: feature.description,
      icon: feature.icon,
      order_index: feature.order_index || 0
    } : { title: "", description: "", icon: "", order_index: 0 });
    setShowModal(true);
    setError("");
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditFeature(null);
    setForm({ title: "", description: "", icon: "", order_index: 0 });
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
    if (editFeature) {
      // Update
      const { error } = await supabase.from("features").update(form).eq("id", editFeature.id);
      if (error) return setError(error.message);
    } else {
      // Insert
      // order_index otomatik belirleniyor
      const { data: maxData, error: maxError } = await supabase
        .from("features")
        .select("order_index")
        .order("order_index", { ascending: false })
        .limit(1);
      if (maxError) return setError(maxError.message);
      const maxOrder = maxData && maxData.length > 0 && typeof maxData[0].order_index === 'number' ? maxData[0].order_index : 0;
      const newFeature = { ...form, order_index: maxOrder + 1 };
      const { error } = await supabase.from("features").insert([newFeature]);
      if (error) return setError(error.message);
    }
    handleCloseModal();
    fetchFeatures();
  };

  const handleDelete = async (id: string) => {
    if (!supabase) return;
    if (!window.confirm("Silmek istediğinize emin misiniz?")) return;
    const { error } = await supabase.from("features").delete().eq("id", id);
    if (error) setError(error.message);
    fetchFeatures();
  };

  // Yardımcı fonksiyon: FA ön eklerini temizle
  function normalizeFaIconName(icon: string) {
    if (!icon) return '';
    return icon
      .replace(/^(fa[srb]?) /, '') // fa, fas, far, fab başında varsa sil
      .replace(/^fa-/, '')         // fa- başında varsa sil
      .replace(/^(solid|regular|brands) /, '') // solid, regular, brands başında varsa sil
      .replace(/^fa[srb]?-/, '')  // fa-, fas-, far-, fab- başında varsa sil
      .replace(/ /g, '-')         // boşlukları tireye çevir
      .trim();
  }

  function truncateText(text: string, maxLength = 48) {
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, maxLength) + '…' : text;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold">Özellikler Yönetimi</h4>
        <Button onClick={() => handleShowModal()} variant="success">+ Yeni Özellik</Button>
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
              <th>İkon</th>
              <th>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {features.map((f) => (
              <tr key={f.id}>
                <td>{f.title}</td>
                <td>{truncateText(f.description)}</td>
                <td>{f.icon ? <FontAwesomeIcon icon={['fas', normalizeFaIconName(f.icon) as IconName]} fixedWidth aria-hidden="true" title={f.icon} /> : <span style={{opacity:0.3}}>—</span>}</td>
                <td>
                  <Button size="sm" variant="primary" className="me-2" onClick={() => handleShowModal(f)}>Düzenle</Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(f.id)}>Sil</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" container={typeof window !== 'undefined' ? (document.querySelector('.admin-panel-root') as HTMLElement | null) : undefined}>
        <Modal.Header closeButton>
          <Modal.Title>{editFeature ? "Özelliği Düzenle" : "Yeni Özellik"}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="formTitle">
              <Form.Label>Başlık</Form.Label>
              <Form.Control name="title" value={form.title} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formDescription">
              <Form.Label>Açıklama</Form.Label>
              <Form.Control as="textarea" name="description" value={form.description} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formIcon">
              <Form.Label>İkon</Form.Label>
              <Form.Control name="icon" value={form.icon} onChange={handleChange} />
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
