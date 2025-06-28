"use client";
import { useRef, useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";
import { Button, Form, Spinner, Alert } from "react-bootstrap";

interface ImageUploadProps {
  bucket?: string; // Supabase Storage bucket adı (varsayılan: "uploads")
  folder?: string; // Alt klasör (ör: "gallery")
  value?: string; // Mevcut url
  onChange: (url: string) => void;
  label?: string;
}

export default function ImageUpload({ bucket = "uploads", folder = "uploads", value, onChange, label = "Görsel Yükle" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    const supabase = getSupabase();
    // uploads/uploads/filename.jpg gibi iki kez uploads olmasın diye düzeltildi
    const filePath = `${folder && folder !== bucket ? folder + '/' : ''}${Date.now()}_${file.name}`;
    if (!supabase) {
      setError("Supabase bağlantısı yok.");
      setUploading(false);
      return;
    }
    const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file, { upsert: true });
    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    if (data?.publicUrl) {
      onChange(data.publicUrl);
    } else {
      setError("Görsel URL alınamadı.");
    }
    setUploading(false);
  };

  return (
    <div className="mb-2">
      <Form.Label>{label}</Form.Label>
      <div className="d-flex align-items-center gap-2">
        <Form.Control type="text" value={value || ""} onChange={e => onChange(e.target.value)} placeholder="Görsel URL" style={{ maxWidth: 300 }} />
        <Button variant="secondary" onClick={() => inputRef.current?.click()} disabled={uploading} size="sm">
          {uploading ? <Spinner size="sm" animation="border" /> : "Yükle"}
        </Button>
        <input type="file" accept="image/*" ref={inputRef} style={{ display: "none" }} onChange={handleFileChange} />
      </div>
      {value && <img src={value} alt="görsel" style={{ maxHeight: 60, marginTop: 8, borderRadius: 4 }} />}
      {error && <Alert variant="danger" className="mt-2 py-1">{error}</Alert>}
    </div>
  );
}
