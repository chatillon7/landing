"use client";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";
import { Table, Button, Form, Modal, Spinner, Alert } from "react-bootstrap";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  order_index: number;
  created_at: string;
}

export default function FAQManager() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editFAQ, setEditFAQ] = useState<FAQ | null>(null);
  const [form, setForm] = useState<Omit<FAQ, "id" | "created_at">>({ question: "", answer: "", order_index: 0 });
  const [error, setError] = useState("");

  const supabase = getSupabase();

  const fetchFaqs = async () => {
    setLoading(true);
    if (!supabase) return;
    const { data, error } = await supabase.from("faqs").select("*").order("order_index", { ascending: true });
    if (error) setError(error.message);
    setFaqs(Array.isArray(data) ? (data as unknown as FAQ[]) : []);
    setLoading(false);
  };

  useEffect(() => {
    fetchFaqs();
    // eslint-disable-next-line
  }, []);

  const handleShowModal = (faq: FAQ | null = null) => {
    setEditFAQ(faq);
    setForm(faq ? {
      question: faq.question,
      answer: faq.answer,
      order_index: faq.order_index || 0
    } : { question: "", answer: "", order_index: 0 });
    setShowModal(true);
    setError("");
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditFAQ(null);
    setForm({ question: "", answer: "", order_index: 0 });
    setError("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.question || !form.answer) return setError("Soru ve cevap zorunlu!");
    if (!supabase) return;
    setError("");
    if (editFAQ) {
      // Update
      const { error } = await supabase.from("faqs").update(form).eq("id", editFAQ.id);
      if (error) return setError(error.message);
    } else {
      // Insert
      // order_index otomatik belirleniyor
      const { data: maxData, error: maxError } = await supabase
        .from("faqs")
        .select("order_index")
        .order("order_index", { ascending: false })
        .limit(1);
      if (maxError) return setError(maxError.message);
      const maxOrder = maxData && maxData.length > 0 && typeof maxData[0].order_index === 'number' ? maxData[0].order_index : 0;
      const newFAQ = { ...form, order_index: maxOrder + 1 };
      const { error } = await supabase.from("faqs").insert([newFAQ]);
      if (error) return setError(error.message);
    }
    handleCloseModal();
    fetchFaqs();
  };

  const handleDelete = async (id: string) => {
    if (!supabase) return;
    if (!window.confirm("Silmek istediğinize emin misiniz?")) return;
    const { error } = await supabase.from("faqs").delete().eq("id", id);
    if (error) setError(error.message);
    fetchFaqs();
  };

  function truncateText(text: string, maxLength = 48) {
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, maxLength) + '…' : text;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold">SSS Yönetimi</h4>
        <Button onClick={() => handleShowModal()} variant="success">+ Yeni SSS</Button>
      </div>
      {error && <Alert variant="danger">{error}</Alert>}
      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" /></div>
      ) : (
        <Table striped bordered hover responsive className="rounded overflow-hidden" style={{ borderRadius: 24 }}>
          <thead>
            <tr>
              <th>Soru</th>
              <th>Cevap</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {faqs.map((faq) => (
              <tr key={faq.id}>
                <td>{faq.question}</td>
                <td>{truncateText(faq.answer)}</td>
                <td>
                  <Button size="sm" variant="primary" className="me-2" onClick={() => handleShowModal(faq)}>Düzenle</Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(faq.id)}>Sil</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" container={typeof window !== 'undefined' ? (document.querySelector('.admin-panel-root') as HTMLElement | null) : undefined}>
        <Modal.Header closeButton>
          <Modal.Title>{editFAQ ? "SSS'yi Düzenle" : "Yeni SSS"}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="formQuestion">
              <Form.Label>Soru</Form.Label>
              <Form.Control name="question" value={form.question} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formAnswer">
              <Form.Label>Cevap</Form.Label>
              <Form.Control as="textarea" name="answer" value={form.answer} onChange={handleChange} />
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
