"use client";
import { Spinner } from "react-bootstrap";

export default function FullPageLoader() {
  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: "#fff",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div className="text-center">
        <Spinner animation="border" variant="dark" style={{ width: 64, height: 64 }} />
      </div>
    </div>
  );
}
