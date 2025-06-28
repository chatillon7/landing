"use client";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";
import { Table, Button, Form, Modal, Spinner, Alert } from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconName } from '@fortawesome/fontawesome-svg-core';

interface LinkItem {
  id: string;
  label: string;
  url: string;
  icon: string;
  order_index: number;
  created_at: string;
}

export default function LinksManager() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editLink, setEditLink] = useState<LinkItem | null>(null);
  const [form, setForm] = useState<Omit<LinkItem, "id" | "created_at">>({ label: "", url: "", icon: "", order_index: 0 });
  const [error, setError] = useState("");

  const supabase = getSupabase();

  const fetchLinks = async () => {
    setLoading(true);
    if (!supabase) return;
    const { data, error } = await supabase.from("links").select("*").order("order_index", { ascending: true });
    if (error) setError(error.message);
    setLinks(Array.isArray(data) ? (data as unknown as LinkItem[]) : []);
    setLoading(false);
  };

  useEffect(() => {
    fetchLinks();
    // eslint-disable-next-line
  }, []);

  const handleShowModal = (link: LinkItem | null = null) => {
    setEditLink(link);
    setForm(link ? {
      label: link.label,
      url: link.url,
      icon: link.icon,
      order_index: link.order_index || 0
    } : { label: "", url: "", icon: "", order_index: 0 });
    setShowModal(true);
    setError("");
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditLink(null);
    setForm({ label: "", url: "", icon: "", order_index: 0 });
    setError("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.label || !form.url) return setError("Etiket ve URL zorunlu!");
    if (!supabase) return;
    setError("");
    if (editLink) {
      // Update
      const { error } = await supabase.from("links").update(form).eq("id", editLink.id);
      if (error) return setError(error.message);
    } else {
      // Insert
      // order_index otomatik belirleniyor
      const { data: maxData, error: maxError } = await supabase
        .from("links")
        .select("order_index")
        .order("order_index", { ascending: false })
        .limit(1);
      if (maxError) return setError(maxError.message);
      const maxOrder = maxData && maxData.length > 0 && typeof maxData[0].order_index === 'number' ? maxData[0].order_index : 0;
      const newLink = { ...form, order_index: maxOrder + 1 };
      const { error } = await supabase.from("links").insert([newLink]);
      if (error) return setError(error.message);
    }
    handleCloseModal();
    fetchLinks();
  };

  const handleDelete = async (id: string) => {
    if (!supabase) return;
    if (!window.confirm("Silmek istediğinize emin misiniz?")) return;
    const { error } = await supabase.from("links").delete().eq("id", id);
    if (error) setError(error.message);
    fetchLinks();
  };

  // Yardımcı fonksiyon: FA ön eklerini temizle ve prefix belirle
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
  function getFaPrefix(icon: string) {
    if (!icon) return 'fas';
    const lower = icon.toLowerCase();
    if (lower.includes('brands') || lower.includes('fab')) return 'fab';
    if (lower.includes('regular') || lower.includes('far')) return 'far';
    if (lower.includes('solid') || lower.includes('fas')) return 'fas';
    // Kısa isim ise, önce brands, sonra regular, sonra solid denenir
    // FontAwesomeIcon, prefix sırasına göre bulur
    return 'fas';
  }

  function truncateText(text: string, maxLength = 48) {
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, maxLength) + '…' : text;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold">Linkler Yönetimi</h4>
        <Button onClick={() => handleShowModal()} variant="success">+ Yeni Link</Button>
      </div>
      {error && <Alert variant="danger">{error}</Alert>}
      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" /></div>
      ) : (
        <Table striped bordered hover responsive className="rounded overflow-hidden" style={{ borderRadius: 24 }}>
          <thead>
            <tr>
              <th>Başlık</th>
              <th>URL</th>
              <th>İkon</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {links.map((l) => (
              <tr key={l.id}>
                <td>{l.label}</td>
                <td>{truncateText(l.url, 48)}</td>
                <td>{l.icon ? <FontAwesomeIcon icon={[getFaPrefix(l.icon), normalizeFaIconName(l.icon) as IconName]} fixedWidth aria-hidden="true" title={l.icon} /> : <span style={{opacity:0.3}}>—</span>}</td>
                <td>
                  <Button size="sm" variant="primary" className="me-2" onClick={() => handleShowModal(l)}>Düzenle</Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(l.id)}>Sil</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" container={typeof window !== 'undefined' ? (document.querySelector('.admin-panel-root') as HTMLElement | null) : undefined}>
        <Modal.Header closeButton>
          <Modal.Title>{editLink ? "Linki Düzenle" : "Yeni Link"}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="formLabel">
              <Form.Label>Başlık</Form.Label>
              <Form.Control name="label" value={form.label} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formUrl">
              <Form.Label>URL</Form.Label>
              <Form.Control name="url" value={form.url} onChange={handleChange} />
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
