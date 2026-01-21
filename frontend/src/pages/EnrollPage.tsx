import { useState } from "react";
import WebcamPanel from "../components/WebcamPanel";
import { api } from "../api";
import type { EnrollRequest } from "../types";

export default function EnrollPage() {
  const [fullName, setFullName] = useState("Roberto Dev");
  const [documentId, setDocumentId] = useState("0102030405");
  const [role, setRole] = useState("Admin");

  const [payload, setPayload] = useState<{ descriptor: number[]; photoBase64?: string } | null>(null);
  const [msg, setMsg] = useState<string>("");

  async function enroll() {
    if (!payload) return;

    const body: EnrollRequest = {
      fullName,
      documentId,
      role,
      descriptor: payload.descriptor,
      photoBase64: payload.photoBase64, // opcional
    };

    try {
      setMsg("Enviando enrolamiento...");
      const res = await api.post("/users/enroll", body);
      setMsg(`✅ Enrolled: ${JSON.stringify(res.data)}`);
    } catch (e: any) {
      setMsg(`❌ Error: ${e?.response?.data ?? e.message}`);
    }
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <h2>Enroll (Registro facial)</h2>

      <div style={{ display: "grid", gap: 8, maxWidth: 520 }}>
        <label>
          FullName
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </label>
        <label>
          DocumentId
          <input value={documentId} onChange={(e) => setDocumentId(e.target.value)} />
        </label>
        <label>
          Role
          <input value={role} onChange={(e) => setRole(e.target.value)} />
        </label>
      </div>

      <WebcamPanel onCapture={setPayload} withPhoto />

      <button onClick={enroll} disabled={!payload}>Enviar Enroll</button>

      {payload && (
        <small>Descriptor listo (len={payload.descriptor.length}).</small>
      )}

      <pre style={{ whiteSpace: "pre-wrap" }}>{msg}</pre>
    </div>
  );
}
