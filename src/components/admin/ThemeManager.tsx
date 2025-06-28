"use client";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";
import { Table, Button, Form, Modal, Spinner, Alert, Row, Col } from "react-bootstrap";
import ImageUpload from "@/components/admin/ImageUpload";
import { useTheme } from "@/context/ThemeContext";

// Bootstrap renk anahtarları
const COLOR_KEYS = [
  "primary","secondary","success","danger","warning","info","light","dark","muted"
] as const;
type ColorKey = typeof COLOR_KEYS[number];

type ThemeForm = {
  description: string;
  company_name: string;
  font: string;
  logo_url: string;
  is_active: boolean;
} & {
  [K in `${ColorKey}_color`]: string;
};

const defaultForm: ThemeForm = {
  description: "",
  company_name: "",
  font: "",
  logo_url: "",
  is_active: false,
  primary_color: "",
  secondary_color: "",
  success_color: "",
  danger_color: "",
  warning_color: "",
  info_color: "",
  light_color: "",
  dark_color: "",
  muted_color: ""
};

// Renk anahtarlarının Türkçe karşılıkları
const COLOR_LABELS: Record<ColorKey, string> = {
  primary: 'Temel',
  secondary: 'İkincil',
  success: 'Başarı',
  danger: 'Hata',
  warning: 'Uyarı',
  info: 'Bilgi',
  light: 'Açık',
  dark: 'Koyu',
  muted: 'Soluk',
};

export type ThemeRow = ThemeForm & { id: string; created_at?: string };

export default function ThemeManager() {
  const [themes, setThemes] = useState<ThemeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTheme, setEditTheme] = useState<ThemeRow | null>(null);
  const [form, setForm] = useState<ThemeForm>(defaultForm);
  const [error, setError] = useState("");

  const supabase = getSupabase();
  const { refreshTheme } = useTheme();

  const fetchThemes = async () => {
    setLoading(true);
    if (!supabase) return;
    const { data, error } = await supabase.from("themes").select("*").order("created_at", { ascending: false });
    if (error) setError(error.message);
    setThemes(Array.isArray(data) ? (data as ThemeRow[]) : []);
    setLoading(false);
  };

  useEffect(() => {
    fetchThemes();
    // eslint-disable-next-line
  }, []);

  const handleShowModal = (theme: ThemeRow | null = null) => {
    setEditTheme(theme);
    setForm(theme ? {
      description: theme.description || "",
      company_name: theme.company_name || "",
      font: theme.font || "",
      logo_url: theme.logo_url || "",
      is_active: theme.is_active || false,
      primary_color: theme.primary_color || "",
      secondary_color: theme.secondary_color || "",
      success_color: theme.success_color || "",
      danger_color: theme.danger_color || "",
      warning_color: theme.warning_color || "",
      info_color: theme.info_color || "",
      light_color: theme.light_color || "",
      dark_color: theme.dark_color || "",
      muted_color: theme.muted_color || ""
    } : defaultForm);
    setShowModal(true);
    setError("");
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditTheme(null);
    setForm(defaultForm);
    setError("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description) return setError("Kısa açıklama zorunlu!");
    if (!supabase) return;
    setError("");
    // Renk alanları için default değerler
    const defaultColors = {
      primary_color: "#0d6efd",
      secondary_color: "#6c757d",
      success_color: "#198754",
      info_color: "#0dcaf0",
      warning_color: "#ffc107",
      danger_color: "#dc3545",
      light_color: "#f8f9fa",
      dark_color: "#212529",
      muted_color: "#6c757d"
    };
    const filledForm = { ...form };
    (COLOR_KEYS as readonly string[]).forEach((key) => {
      const colorKey = `${key}_color` as keyof ThemeForm;
      if (!filledForm[colorKey]) (filledForm as Record<string, string | boolean>)[colorKey] = defaultColors[colorKey as keyof typeof defaultColors];
    });
    // Eğer aktif tema seçildiyse, diğer tüm temaların is_active'ını false yap
    if (filledForm.is_active) {
      // Önce diğer tüm temaların is_active'ını false yap
      await supabase.from("themes").update({ is_active: false });
    }
    let newThemeId: string | undefined;
    if (editTheme) {
      // Update
      const { error } = await supabase.from("themes").update(filledForm).eq("id", editTheme.id);
      if (error) return setError(error.message);
      newThemeId = editTheme.id;
    } else {
      // Insert
      const { data, error } = await supabase.from("themes").insert([filledForm]).select("id").single();
      if (error) return setError(error.message);
      newThemeId = typeof data?.id === 'string' ? data.id : undefined;
    }
    if (filledForm.is_active && newThemeId) {
      await supabase.from("themes").update({ is_active: false }).neq("id", newThemeId);
      await supabase.from("themes").update({ is_active: true }).eq("id", newThemeId);
    }
    await fetchThemes();
    refreshTheme(); // Tema güncellendikten sonra context'i anında güncelle
  };

  const handleDelete = async (id: string) => {
    if (!supabase) return;
    if (!window.confirm("Silmek istediğinize emin misiniz?")) return;
    const { error } = await supabase.from("themes").delete().eq("id", id);
    if (error) setError(error.message);
    fetchThemes();
  };

  const handleLogoChange = (url: string) => setForm({ ...form, logo_url: url });

  function truncateText(text: string, maxLength = 48) {
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, maxLength) + '…' : text;
  }

  // Yardımcı fonksiyon: Arka plan rengine göre kontrastlı yazı rengi belirle
  function getContrastYIQ(hexColor: string) {
    let hex = hexColor?.replace('#', '') || 'ffffff';
    if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
    const r = parseInt(hex.substr(0,2),16);
    const g = parseInt(hex.substr(2,2),16);
    const b = parseInt(hex.substr(4,2),16);
    const yiq = ((r*299)+(g*587)+(b*114))/1000;
    return yiq >= 128 ? '#222' : '#fff';
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold">Tema Yönetimi</h4>
        <Button onClick={() => handleShowModal()} variant="success">+ Yeni Tema</Button>
      </div>
      {error && <Alert variant="danger">{error}</Alert>}
      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" /></div>
      ) : (
        <Table striped bordered hover responsive className="rounded overflow-hidden" style={{ borderRadius: 24 }}>
          <thead>
            <tr>
              {/* <th>#</th> */}
              <th>Açıklama</th>
              <th>Şirket Adı</th>
              <th>Logo/Favicon</th>
              <th>Renkler</th>
              <th>Font</th>
              <th>Durum</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {themes.map((theme) => {
              const rowBg = theme.is_active ? theme.primary_color || '#0d6efd' : undefined;
              const rowColor = theme.is_active ? getContrastYIQ(theme.primary_color || '#0d6efd') : undefined;
              return (
                <tr key={theme.id} style={theme.is_active ? { background: rowBg, color: rowColor, transition: 'background 0.2s' } : {}}>
                  {/* <td>{i + 1}</td> */}
                  <td>{truncateText(theme.description)}</td>
                  <td>{theme.company_name}</td>
                  <td>{theme.logo_url && <img src={theme.logo_url} alt="logo" style={{ maxHeight: 32, marginRight: 8 }} />}</td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {COLOR_KEYS.map(key => theme[`${key}_color`] && (
                        <span
                          key={key}
                          className="theme-color-box-override"
                          style={{
                            // CSS custom property ile renkleri aktar
                            ['--theme-color-bg']: theme[`${key}_color`] ?? '#fff',
                            ['--theme-color-fg']: getContrastYIQ(theme[`${key}_color`] ?? '#fff'),
                        } as React.CSSProperties}
                        >
                          <span className="theme-color-dot" />
                          {COLOR_LABELS[key]}
                          {theme.is_active && (
                            <span style={{
                              marginLeft: 4,
                              fontWeight: 700,
                              fontSize: 15,
                              color: getContrastYIQ(theme[`${key}_color`] ?? '#fff'),
                              textShadow: '0 1px 2px #0008',
                              verticalAlign: 'middle',
                            }}></span>
                          )}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>{theme.font}</td>
                  <td>{theme.is_active ? <span>Aktif</span> : <span>Deaktif</span>}</td>
                  <td>
                    <Button size="sm" variant="primary" className="me-2" onClick={() => handleShowModal(theme)}>Düzenle</Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(theme.id)}>Sil</Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" container={typeof window !== 'undefined' ? (document.querySelector('.admin-panel-root') as HTMLElement | null) : undefined}>
        <Modal.Header closeButton>
          <Modal.Title>Tema Düzenle / Ekle</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Check type="checkbox" label="Bu temayı aktif yap" name="is_active" checked={form.is_active} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Kısa Açıklama</Form.Label>
              <Form.Control name="description" value={form.description} onChange={handleChange} required maxLength={80} placeholder="Örn: Modern, hızlı ve yönetilebilir web çözümleri" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Şirket Adı</Form.Label>
              <Form.Control name="company_name" value={form.company_name} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Logo / Favicon</Form.Label>
              <ImageUpload value={form.logo_url} onChange={handleLogoChange} label="Logo veya Favicon Yükle" folder="themes" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Font</Form.Label>
              <Form.Control name="font" value={form.font} onChange={handleChange} placeholder="Roboto, Arial, ..." />
            </Form.Group>
            <Form.Label>Renkler</Form.Label>
            <Row>
              {COLOR_KEYS.map(key => (
                <Col md={4} key={key} className="mb-2">
                  <Form.Group>
                    <Form.Label>{key.charAt(0).toUpperCase() + key.slice(1)} Renk</Form.Label>
                    <Form.Control type="color" name={`${key}_color`} value={form[`${key}_color`] || '#000000'} onChange={handleChange} />
                  </Form.Group>
                </Col>
              ))}
            </Row>
            {error && <Alert variant="danger">{error}</Alert>}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>İptal</Button>
            <Button type="submit" variant="primary">Kaydet</Button>
          </Modal.Footer>
        </Form>
      </Modal>
      {/* ThemeManager kutucakları için dinamik stil */}
      <style>{`
        .theme-color-box-override {
          display: inline-flex;
          align-items: center;
          border-radius: 10px !important;
          font-size: 13px;
          font-family: monospace;
          font-weight: 600;
          min-width: 64px;
          padding: 1px 4px !important;
          margin: 2px !important;
          gap: 6px;
          box-sizing: border-box;
          background: var(--theme-color-bg, #fff) !important;
          color: var(--theme-color-fg, #222) !important;
          border: 6px solid var(--theme-color-bg, #ccc) !important;
          position: relative;
          z-index: 10;
          transition: border-radius 0.2s;
        }
        .theme-color-box-override .theme-color-dot {
          display: inline-block;
          width: 16px;
          height: 16px;
          border-radius: 50% !important;
          background: var(--theme-color-bg, #fff) !important;
          border: 1px solid #fff;
          margin-right: 6px;
          box-sizing: border-box;
          transition: border-radius 0.2s;
        }
      `}</style>
    </div>
  );
}
