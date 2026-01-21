import { useEffect, useState } from "react";
import { api } from "../api";
import type { UserDto } from "../types";

export default function UsersPage() {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<UserDto[]>("/api/users");
        setUsers(res.data);
      } catch (e: any) {
        setErr(e?.response?.data ?? e.message);
      }
    })();
  }, []);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <h2>Users (Postgres)</h2>

      {err && <pre>{err}</pre>}

      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", borderBottom: "1px solid #444" }}>Id</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #444" }}>FullName</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #444" }}>DocumentId</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #444" }}>Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td style={{ padding: 6, borderBottom: "1px solid #222" }}>{u.id}</td>
              <td style={{ padding: 6, borderBottom: "1px solid #222" }}>{u.fullName}</td>
              <td style={{ padding: 6, borderBottom: "1px solid #222" }}>{u.documentId}</td>
              <td style={{ padding: 6, borderBottom: "1px solid #222" }}>{u.role}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <small>Tip: copia el Id de aquí para Verify.</small>
    </div>
  );
}
