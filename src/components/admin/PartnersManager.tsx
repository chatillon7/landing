"use client";
import { useEffect, useState, useCallback } from "react";
import { getSupabase } from "@/lib/supabaseClient";
import { Table, Button, Form, Modal, Spinner, Alert } from "react-bootstrap";
import ImageUpload from "@/components/admin/ImageUpload";

type Partner = { id: string; name: string; logo_url: string; website_url: string; created_at?: string };

export default function PartnersManager() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editPartner, setEditPartner] = useState<Partner | null>(null);
  const [form, setForm] = useState<{ name: string; logo_url: string; website_url: string }>({ name: "", logo_url: "", website_url: "" });
  const [error, setError] = useState("");
  const supabase = getSupabase();

  const fetchPartners = useCallback(async () => {
    setLoading(true);
    if (!supabase) {
      setError("Supabase client is not initialized.");
      setLoading(false);
      return;
    }
    const { data, error } = await supabase.from("partners").select("*").order("created_at", { ascending: false });
    if (error) setError(error.message);
    setPartners(Array.isArray(data) ? (data as Partner[]) : []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchPartners(); }, [fetchPartners]);

  const handleShowModal = (partner: Partner | null = null) => {
    setEditPartner(partner);
    setForm(partner ? { name: partner.name, logo_url: partner.logo_url, website_url: partner.website_url } : { name: "", logo_url: "", website_url: "" });
    setShowModal(true);
    setError("");
  };
  const handleCloseModal = () => { setShowModal(false); setEditPartner(null); setForm({ name: "", logo_url: "", website_url: "" }); setError(""); };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => { const { name, value } = e.target; setForm({ ...form, [name]: value }); };
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return setError("Partner adı zorunlu!");
    if (!supabase) {
      setError("Supabase client is not initialized.");
      return;
    }
    if (editPartner) {
      const { error } = await supabase.from("partners").update(form).eq("id", editPartner.id);
      if (error) return setError(error.message);
    } else {
      const { error } = await supabase.from("partners").insert([form]);
      if (error) return setError(error.message);
    }
    handleCloseModal();
    fetchPartners();
  };
  const handleDelete = async (id: string) => {
    if (!window.confirm("Silmek istediğinize emin misiniz?")) return;
    if (!supabase) {
      setError("Supabase client is not initialized.");
      return;
    }
    const { error } = await supabase.from("partners").delete().eq("id", id);
    if (error) setError(error.message);
    fetchPartners();
  };
  const handleLogoChange = (url: string) => setForm({ ...form, logo_url: url });

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold">Altyapı Partnerleri</h4>
        <Button onClick={() => handleShowModal()} variant="success">+ Yeni Partner</Button>
      </div>
      {error && <Alert variant="danger">{error}</Alert>}
      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" /></div>
      ) : (
        <Table striped bordered hover responsive className="rounded overflow-hidden" style={{ borderRadius: 24 }}>
          <thead>
            <tr>
              {/* <th>#</th> */}
              <th>Görsel</th>
              <th>Başlık</th>
              <th>URL</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {partners.map((p) => (
              <tr key={p.id}>
                {/* <td>{i + 1}</td> */}
                <td>{p.logo_url && <img src={p.logo_url} alt={p.name} style={{ maxHeight: 32 }} />}</td>
                <td>{p.name}</td>
                <td>{p.website_url && <a href={p.website_url} target="_blank" rel="noopener noreferrer">{p.website_url}</a>}</td>
                <td>
                  <Button size="sm" variant="primary" className="me-2" onClick={() => handleShowModal(p)}>Düzenle</Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(p.id)}>Sil</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" container={typeof window !== 'undefined' ? (document.querySelector('.admin-panel-root') as HTMLElement | null) : undefined}>
        <Modal.Header closeButton>
          <Modal.Title>Partner Düzenle / Ekle</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Adı</Form.Label>
              <Form.Control name="name" value={form.name} onChange={handleChange} required maxLength={80} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Görsel</Form.Label>
              <ImageUpload value={form.logo_url} onChange={handleLogoChange} label="Görsel Yükle" folder="partners" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Web Sitesi</Form.Label>
              <Form.Control name="website_url" value={form.website_url} onChange={handleChange} placeholder="https://" />
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
