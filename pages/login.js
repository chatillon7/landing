import { useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    const supabase = getSupabase();
    if (!supabase) return;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      return;
    }
    setUser(data.user);
  };

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", padding: 24, border: "1px solid #ccc", borderRadius: 8 }}>
      <h2>Login (Pages Router Test)</h2>
      <form onSubmit={handleLogin}>
        <input type="email" placeholder="E-posta" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: "100%", marginBottom: 8 }} />
        <input type="password" placeholder="Şifre" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: "100%", marginBottom: 8 }} />
        <button type="submit" style={{ width: "100%" }}>Giriş Yap</button>
      </form>
      {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
      {user && <pre style={{ marginTop: 16, background: "#eee", padding: 8 }}>{JSON.stringify(user, null, 2)}</pre>}
    </div>
  );
}
