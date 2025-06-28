"use client";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";
import { Table, Button, Form, Modal, Spinner, Alert } from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconName } from '@fortawesome/fontawesome-svg-core';

interface Statistic {
  id: string;
  label: string;
  value: number;
  icon: string;
  order_index: number;
  created_at: string;
}

export default function StatisticsManager() {
  const [statistics, setStatistics] = useState<Statistic[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editStatistic, setEditStatistic] = useState<Statistic | null>(null);
  const [form, setForm] = useState<Omit<Statistic, "id" | "created_at">>({ label: "", value: 0, icon: "", order_index: 0 });
  const [error, setError] = useState("");

  const supabase = getSupabase();

  const fetchStatistics = async () => {
    setLoading(true);
    if (!supabase) return;
    const { data, error } = await supabase.from("statistics").select("*").order("order_index", { ascending: true });
    if (error) setError(error.message);
    setStatistics(Array.isArray(data) ? (data as unknown as Statistic[]) : []);
    setLoading(false);
  };

  useEffect(() => {
    fetchStatistics();
    // eslint-disable-next-line
  }, []);

  const handleShowModal = (stat: Statistic | null = null) => {
    setEditStatistic(stat);
    setForm(stat ? {
      label: stat.label,
      value: stat.value,
      icon: stat.icon,
      order_index: stat.order_index || 0
    } : { label: "", value: 0, icon: "", order_index: 0 });
    setShowModal(true);
    setError("");
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditStatistic(null);
    setForm({ label: "", value: 0, icon: "", order_index: 0 });
    setError("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.label) return setError("Etiket zorunlu!");
    if (!supabase) return;
    setError("");
    if (editStatistic) {
      // Update
      const { error } = await supabase.from("statistics").update(form).eq("id", editStatistic.id);
      if (error) return setError(error.message);
    } else {
      // Insert
      // order_index otomatik belirleniyor
      const { data: maxData, error: maxError } = await supabase
        .from("statistics")
        .select("order_index")
        .order("order_index", { ascending: false })
        .limit(1);
      if (maxError) return setError(maxError.message);
      const maxOrder = maxData && maxData.length > 0 && typeof maxData[0].order_index === 'number' ? maxData[0].order_index : 0;
      const newStat = { ...form, order_index: maxOrder + 1 };
      const { error } = await supabase.from("statistics").insert([newStat]);
      if (error) return setError(error.message);
    }
    handleCloseModal();
    fetchStatistics();
  };

  const handleDelete = async (id: string) => {
    if (!supabase) return;
    if (!window.confirm("Silmek istediğinize emin misiniz?")) return;
    const { error } = await supabase.from("statistics").delete().eq("id", id);
    if (error) setError(error.message);
    fetchStatistics();
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

  function getFaPrefix(icon: string) {
    if (!icon) return 'fas';
    const lower = icon.toLowerCase();
    if (lower.includes('brands') || lower.includes('fab')) return 'fab';
    if (lower.includes('regular') || lower.includes('far')) return 'far';
    if (lower.includes('solid') || lower.includes('fas')) return 'fas';
    return 'fas';
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold">İstatistikler Yönetimi</h4>
        <Button onClick={() => handleShowModal()} variant="success">+ Yeni İstatistik</Button>
      </div>
      {error && <Alert variant="danger">{error}</Alert>}
      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" /></div>
      ) : (
        <Table striped bordered hover responsive className="rounded overflow-hidden" style={{ borderRadius: 24 }}>
          <thead>
            <tr>
              <th>Başlık</th>
              <th>Değer</th>
              <th>İkon</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {statistics.map((s) => (
              <tr key={s.id}>
                <td>{s.label}</td>
                <td>{s.value}</td>
                <td>{s.icon ? <FontAwesomeIcon icon={[getFaPrefix(s.icon), normalizeFaIconName(s.icon) as IconName]} fixedWidth aria-hidden="true" title={s.icon} /> : <span style={{opacity:0.3}}>—</span>}</td>
                <td>
                  <Button size="sm" variant="primary" className="me-2" onClick={() => handleShowModal(s)}>Düzenle</Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(s.id)}>Sil</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" container={typeof window !== 'undefined' ? (document.querySelector('.admin-panel-root') as HTMLElement | null) : undefined}>
        <Modal.Header closeButton>
          <Modal.Title>{editStatistic ? "İstatistiği Düzenle" : "Yeni İstatistik"}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="formLabel">
              <Form.Label>Başlık</Form.Label>
              <Form.Control name="label" value={form.label} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formValue">
              <Form.Label>Değer</Form.Label>
              <Form.Control name="value" type="number" value={form.value} onChange={handleChange} />
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
