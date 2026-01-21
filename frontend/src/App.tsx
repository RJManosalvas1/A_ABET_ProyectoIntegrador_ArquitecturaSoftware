import { useState } from "react";
import EnrollPage from "./pages/EnrollPage";
import VerifyPage from "./pages/VerifyPage";
import UsersPage from "./pages/UsersPage";


type Page = "enroll" | "verify" | "users";

export default function App() {
  const [page, setPage] = useState<Page>("enroll");

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 16, fontFamily: "system-ui" }}>
      <h1>Biometric Demo</h1>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button onClick={() => setPage("enroll")}>Enroll</button>
        <button onClick={() => setPage("verify")}>Verify</button>
        <button onClick={() => setPage("users")}>Users</button>
      </div>

      {page === "enroll" && <EnrollPage />}
      {page === "verify" && <VerifyPage />}
      {page === "users" && <UsersPage />}

      <hr style={{ margin: "24px 0", opacity: 0.25 }} />
      <small>API Base: {import.meta.env.VITE_API_BASE}</small>
    </div>
  );
}
