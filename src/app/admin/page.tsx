"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabaseClient";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import ContentManager from "@/components/admin/ContentManager";
import GalleryManager from "@/components/admin/GalleryManager";
import ThemeManager from "@/components/admin/ThemeManager";
import ContactManager from "@/components/admin/ContactManager";
import FeaturesManager from "@/components/admin/FeaturesManager";
import StatisticsManager from "@/components/admin/StatisticsManager";
import FAQManager from "@/components/admin/FAQManager";
import TestimonialsManager from "@/components/admin/TestimonialsManager";
import LinksManager from "@/components/admin/LinksManager";
import PartnersManager from "@/components/admin/PartnersManager";
import { User } from '@supabase/supabase-js';
import '../admin-panel-isolation.css';

export default function AdminPanel() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [activeKey, setActiveKey] = useState<string>("content");
  const [menuCollapsed, setMenuCollapsed] = useState(false);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
      if (!data.user) router.replace("/admin/login");
    });
  }, [router]);

  useEffect(() => {
    const handleResize = () => {
      setMenuCollapsed(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMenuItemClick = (key: string) => {
    setActiveKey(key);
    if (window.innerWidth < 768 && !menuCollapsed) {
      setMenuCollapsed(true);
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" />
        <div>Yükleniyor...</div>
      </Container>
    );
  }
  if (!user) return null;

  return (
    <Container fluid className="py-5 px-0 admin-panel-root" style={{ minHeight: '100vh', overflow: 'hidden' }}>
      <Row className="g-0">
        <Col md="auto" className="">
          <div style={{ position: 'fixed', left: 0, top: 0, height: '100vh', width: menuCollapsed ? 48 : 96, background: '#fff', borderRight: '1px solid rgb(54, 59, 63)', zIndex: 100, transition: 'width 0.3s', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <div className="d-flex flex-column align-items-center py-2" style={{ height: '100%' }}>
              <button className="btn btn-link mb-3 d-md-none" style={{ fontSize: 20, padding: 0, margin: '8px 0 16px 0', lineHeight: 1, height: 32, width: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setMenuCollapsed(!menuCollapsed)}>
                <i className={`fas ${menuCollapsed ? 'fa-angle-right' : 'fa-angle-left'}`} style={{ fontSize: 20, margin: 0, padding: 0, width: 20, height: 20, display: 'inline-block', textAlign: 'center' }}></i>
              </button>
              <div className="list-group list-group-flush w-100" style={{ borderRadius: 0 }}>
                <button className={`ps-4 list-group-item list-group-item-action d-flex align-items-center justify-content-center${activeKey === "content" ? " active" : ""}`} onClick={() => handleMenuItemClick("content") } title="İçerik Yönetimi">
                  <i className="fas fa-file-alt"></i> {!menuCollapsed}
                </button>
                <button className={`ps-4 list-group-item list-group-item-action d-flex align-items-center justify-content-center${activeKey === "gallery" ? " active" : ""}`} onClick={() => handleMenuItemClick("gallery") } title="Galeri">
                  <i className="fas fa-images"></i> {!menuCollapsed}
                </button>
                <button className={`ps-4 list-group-item list-group-item-action d-flex align-items-center justify-content-center${activeKey === "theme" ? " active" : ""}`} onClick={() => handleMenuItemClick("theme") } title="Tema">
                  <i className="fas fa-palette"></i> {!menuCollapsed}
                </button>
                <button className={`ps-4 list-group-item list-group-item-action d-flex align-items-center justify-content-center${activeKey === "contact" ? " active" : ""}`} onClick={() => handleMenuItemClick("contact") } title="İletişim">
                  <i className="fas fa-phone"></i> {!menuCollapsed}
                </button>
                <button className={`ps-4 list-group-item list-group-item-action d-flex align-items-center justify-content-center${activeKey === "features" ? " active" : ""}`} onClick={() => handleMenuItemClick("features") } title="Özellikler">
                  <i className="fas fa-star"></i> {!menuCollapsed}
                </button>
                <button className={`ps-4 list-group-item list-group-item-action d-flex align-items-center justify-content-center${activeKey === "statistics" ? " active" : ""}`} onClick={() => handleMenuItemClick("statistics") } title="İstatistikler">
                  <i className="fas fa-chart-bar"></i> {!menuCollapsed}
                </button>
                <button className={`ps-4 list-group-item list-group-item-action d-flex align-items-center justify-content-center${activeKey === "faqs" ? " active" : ""}`} onClick={() => handleMenuItemClick("faqs") } title="SSS">
                  <i className="fas fa-question-circle"></i> {!menuCollapsed}
                </button>
                <button className={`ps-4 list-group-item list-group-item-action d-flex align-items-center justify-content-center${activeKey === "testimonials" ? " active" : ""}`} onClick={() => handleMenuItemClick("testimonials") } title="Referanslar">
                  <i className="fas fa-quote-right"></i> {!menuCollapsed}
                </button>
                <button className={`ps-4 list-group-item list-group-item-action d-flex align-items-center justify-content-center${activeKey === "links" ? " active" : ""}`} onClick={() => handleMenuItemClick("links") } title="Bağlantılar">
                  <i className="fas fa-link"></i> {!menuCollapsed}
                </button>
                <button className={`ps-4 list-group-item list-group-item-action d-flex align-items-center justify-content-center${activeKey === "partners" ? " active" : ""}`} onClick={() => handleMenuItemClick("partners") } title="Altyapı Partnerleri">
                  <i className="fas fa-layer-group"></i> {!menuCollapsed}
                </button>
              </div>
              {/* Çıkış butonu en alta sabit */}
              <div style={{ flexGrow: 1 }} />
              <button
                className="btn btn-link mb-3"
                style={{ color: '#dc3545', fontSize: 22, padding: 0, margin: '0 0 16px 0', lineHeight: 1, height: 32, width: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Çıkış Yap"
                onClick={async () => {
                  const supabase = getSupabase();
                  await supabase?.auth.signOut();
                  window.location.href = '/admin/login';
                }}
              >
                <i className="fas fa-sign-out-alt"></i>
              </button>
            </div>
          </div>
        </Col>
        <Col
          style={{
            marginLeft: menuCollapsed ? 48 : 96,
            padding: '0 24px 24px 24px',
            transition: 'margin-left 0.3s',
            minWidth: 0,
            width: '100%',
            maxWidth: '100vw',
            overflowX: 'auto',
          }}
        >
          <h2 className="fw-bold mb-4">Admin Paneli</h2>
          <div className="mb-4" />
          {activeKey === "content" && <ContentManager />}
          {activeKey === "gallery" && <GalleryManager />}
          {activeKey === "theme" && <ThemeManager />}
          {activeKey === "contact" && <ContactManager />}
          {activeKey === "features" && <FeaturesManager />}
          {activeKey === "statistics" && <StatisticsManager />}
          {activeKey === "faqs" && <FAQManager />}
          {activeKey === "testimonials" && <TestimonialsManager />}
          {activeKey === "links" && <LinksManager />}
          {activeKey === "partners" && <PartnersManager />}
        </Col>
      </Row>
    </Container>
  );
}
