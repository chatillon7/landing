"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const navbar = document.querySelector("nav.navbar");
      if (!navbar) return;
      const navbarRect = navbar.getBoundingClientRect();
      setVisible(navbarRect.bottom < 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          className="scroll-to-top-btn"
          initial={{ opacity: 0, scale: 0.7, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.7, y: 40 }}
          transition={{ duration: 0.4, type: "spring" }}
          style={{
            position: "fixed",
            left: 24,
            bottom: 24,
            zIndex: 1050,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "var(--bs-primary)",
            color: "#fff",
            border: "none",
            boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
            cursor: "pointer",
            transition: "box-shadow 0.3s, background 0.3s",
          }}
          aria-label="Yukarı Çık"
          onClick={handleClick}
          whileHover={{
            scale: 1.12,
            boxShadow: "0 8px 32px rgba(0,0,0,0.22)",
            background: "color-mix(in srgb, var(--bs-primary), #000 25%)",
          }}
          whileTap={{ scale: 0.95 }}
        >
          <i className="fas fa-arrow-up fa-lg"></i>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
