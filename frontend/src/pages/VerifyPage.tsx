import { useState } from "react";
import WebcamPanel from "../components/WebcamPanel";
import { api } from "../api";
import type { VerifyRequest } from "../types";

export default function VerifyPage() {
  const [userId, setUserId] = useState("");
  const [payload, setPayload] = useState<{ descriptor: number[] } | null>(null);
  const [msg, setMsg] = useState<string>("");

  async function verify() {
    if (!payload || !userId) {
      setMsg("Pon el userId y captura un rostro.");
      return;
    }

    const body: VerifyRequest = { userId, descriptor: payload.descriptor };

    try {
      setMsg("Verificando...");
      const res = await api.post("/api/users/verify", body);
      setMsg(`✅ Result: ${JSON.stringify(res.data)}`);
    } catch (e: any) {
      setMsg(`❌ Error: ${e?.response?.data ?? e.message}`);
    }
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <h2>Verify (Login facial)</h2>

      <label style={{ maxWidth: 520 }}>
        UserId (UUID)
        <input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="5fc78e2b-..." />
      </label>

      <WebcamPanel onCapture={({ descriptor }) => setPayload({ descriptor })} withPhoto={false} />

      <button onClick={verify} disabled={!payload || !userId}>Enviar Verify</button>

      <pre style={{ whiteSpace: "pre-wrap" }}>{msg}</pre>
    </div>
  );
}
