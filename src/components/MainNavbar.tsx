"use client";
import Link from "next/link";
import { Navbar, Nav, Container } from "react-bootstrap";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useTheme } from '../context/ThemeContext';
import { useState } from "react";
import './main-navbar-animated.css';

export default function MainNavbar() {
  const [expanded, setExpanded] = useState(false);
  const pathname = usePathname();
  const { theme } = useTheme();
  const handleNavClick = () => setExpanded(false);
  return (
    <motion.div initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, type: "spring" }}>
      <Navbar
        expand="lg"
        className="shadow-lg py-3 navbar-gradient-animated"
        expanded={expanded}
      >
        <Container>
          <Navbar.Brand as={Link} href="/" className="fw-bold">
            {theme?.logoUrl ? (
              <img src={theme.logoUrl} alt="Logo" height={32} className="me-2" style={{ maxHeight: 32, verticalAlign: 'middle' }} />
            ) : (
              <i className="fas fa-rocket me-2"></i>
            )}
          </Navbar.Brand>
          <Navbar.Toggle className="shadow-lg" aria-controls="main-navbar-nav" onClick={() => setExpanded(!expanded)} />
          <Navbar.Collapse id="main-navbar-nav">
            <Nav className="ms-auto main-navbar-nav text-end">
              <Nav.Link
                as={Link}
                href="/"
                active={pathname === "/"}
                onClick={handleNavClick}
                className={`nav-link-animated${pathname === "/" ? " text-light active" : " nav-link-primary-dark"}`}
              >
                Anasayfa
              </Nav.Link>
              <Nav.Link
                as={Link}
                href="/gallery"
                active={pathname === "/gallery"}
                onClick={handleNavClick}
                className={`nav-link-animated${pathname === "/gallery" ? " text-light active" : " nav-link-primary-dark"}`}
              >
                Galeri
              </Nav.Link>
              <Nav.Link
                as={Link}
                href="/contact"
                active={pathname === "/contact"}
                onClick={handleNavClick}
                className={`nav-link-animated${pathname === "/contact" ? " text-light active" : " nav-link-primary-dark"}`}
              >
                İletişim
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </motion.div>
  );
}
