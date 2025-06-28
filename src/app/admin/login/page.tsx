"use client";
import { Container, Row, Col, Card, Button, Form } from "react-bootstrap";
import { useState, useEffect } from "react";
import { getSupabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import '../../admin-panel-isolation.css';

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.replace("/admin");
    });
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const supabase = getSupabase();
    if (!supabase) return;
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        return;
      }
      if (!data.session) {
        setError('Oturum başlatılamadı, lütfen tekrar deneyin.');
        return;
      }
      window.location.href = "/admin";
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err) {
        setError('Bilinmeyen bir hata oluştu: ' + (err as { message?: string }).message);
      } else {
        setError('Bilinmeyen bir hata oluştu.');
      }
    }
  };

  return (
    <Container className="py-5" style={{ minHeight: '100vh' }}>
      <Row className="justify-content-center">
        <Col md={12}>
          <Card className="shadow-sm">
            <Card.Body>
              <h3 className="mb-4 text-center">Admin Giriş</h3>
              <Form onSubmit={handleLogin} autoComplete="on">
                <Form.Group className="mb-3">
                  <Form.Label>E-posta</Form.Label>
                  <Form.Control type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="username" />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Şifre</Form.Label>
                  <Form.Control type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
                </Form.Group>
                {error && <div className="alert alert-danger py-2">{error}</div>}
                <Button type="submit" variant="primary" className="w-100 fw-bold">Giriş Yap</Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
