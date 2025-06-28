"use client";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";
import { Table, Button, Form, Modal, Spinner, Alert } from "react-bootstrap";
import '../../app/admin-panel-isolation.css';

interface Contact {
  id: string;
  address: string;
  phone: string;
  email: string;
  map_url?: string;
  created_at: string;
}

export default function ContactManager() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editContact, setEditContact] = useState<Contact | null>(null);
  const [form, setForm] = useState<Omit<Contact, "id" | "created_at">>({ address: "", phone: "", email: "", map_url: "" });
  const [error, setError] = useState("");

  const supabase = getSupabase();

  const fetchContacts = async () => {
    setLoading(true);
    if (!supabase) return;
    const { data, error } = await supabase.from("contacts").select("*").order("created_at", { ascending: false });
    if (error) setError(error.message);
    setContacts(Array.isArray(data) ? (data as unknown as Contact[]) : []);
    setLoading(false);
  };

  useEffect(() => {
    fetchContacts();
    // eslint-disable-next-line
  }, []);

  const handleShowModal = (contact: Contact | null = null) => {
    setEditContact(contact);
    setForm(contact ? {
      address: contact.address,
      phone: contact.phone,
      email: contact.email,
      map_url: contact.map_url || ""
    } : { address: "", phone: "", email: "", map_url: "" });
    setShowModal(true);
    setError("");
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditContact(null);
    setForm({ address: "", phone: "", email: "", map_url: "" });
    setError("");
  };

  // Harita url'sini otomatik embed'e çevir
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "map_url") {
      setForm({ ...form, [name]: convertMapUrl(value) });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // OpenStreetMap url'sini embed url'ye çeviren fonksiyon
  function convertMapUrl(url: string): string {
    // https://www.openstreetmap.org/#map=19/41.044889/40.591358
    const match = url.match(/#map=([0-9]+)\/(\d+\.\d+)\/(\d+\.\d+)/);
    if (match) {
      const lat = match[2];
      const lon = match[3];
      // Basit bir bbox oluştur (küçük bir alan)
      const delta = 0.002;
      const bbox = `${parseFloat(lon)-delta}%2C${parseFloat(lat)-delta}%2C${parseFloat(lon)+delta}%2C${parseFloat(lat)+delta}`;
      return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lon}`;
    }
    // Zaten embed url ise dokunma
    if (url.includes("/export/embed.html?")) return url;
    return url;
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email) return setError("E-posta zorunlu!");
    if (!supabase) return;
    setError("");
    if (editContact) {
      // Update
      const { error } = await supabase.from("contacts").update(form).eq("id", editContact.id);
      if (error) return setError(error.message);
    } else {
      // Insert
      const { error } = await supabase.from("contacts").insert([form]);
      if (error) return setError(error.message);
    }
    handleCloseModal();
    fetchContacts();
  };

  const handleDelete = async (id: string) => {
    if (!supabase) return;
    if (!window.confirm("Silmek istediğinize emin misiniz?")) return;
    const { error } = await supabase.from("contacts").delete().eq("id", id);
    if (error) setError(error.message);
    fetchContacts();
  };

  function truncateText(text: string, maxLength = 48) {
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, maxLength) + '…' : text;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold">İletişim Yönetimi</h4>
        <Button onClick={() => handleShowModal()} variant="success">+ Yeni İletişim</Button>
      </div>
      {error && <Alert variant="danger">{error}</Alert>}
      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" /></div>
      ) : (
        <Table striped bordered hover responsive className="rounded overflow-hidden" style={{ borderRadius: 24 }}>
          <thead>
            <tr>
              <th>Adres</th>
              <th>Telefon</th>
              <th>E-posta</th>
              <th>Harita URL</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr key={contact.id}>
                <td>{truncateText(contact.address)}</td>
                <td>{contact.phone}</td>
                <td>{contact.email}</td>
                <td><a href={contact.map_url} target="_blank" rel="noopener noreferrer">Harita</a></td>
                <td>
                  <Button size="sm" variant="primary" className="me-2" onClick={() => handleShowModal(contact)}>Düzenle</Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(contact.id)}>Sil</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <Modal show={showModal} onHide={handleCloseModal} container={typeof window !== 'undefined' ? (document.querySelector('.admin-panel-root') as HTMLElement | null) : undefined}>
        <Modal.Header closeButton>
          <Modal.Title>{editContact ? "İletişimi Düzenle" : "Yeni İletişim"}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Adres</Form.Label>
              <Form.Control name="address" value={form.address} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Telefon</Form.Label>
              <Form.Control name="phone" value={form.phone} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>E-posta</Form.Label>
              <Form.Control name="email" value={form.email} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Harita URL</Form.Label>
              <Form.Control name="map_url" value={form.map_url} onChange={handleChange} placeholder="https://www.openstreetmap.org/#map=19/41.044889/40.591358" />
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
