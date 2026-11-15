import { useState } from "react";
import api from "./api/client";
import "./App.css";

function App() {
  const [status, setStatus] = useState("未確認");
  const [loading, setLoading] = useState(false);

  async function checkHealth() {
    setLoading(true);

    try {
      const { data } = await api.get("/health");
      setStatus(data?.status ?? "応答形式を確認してください");
    } catch {
      setStatus("接続に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <h1>SISA Final Project</h1>

      <button type="button" onClick={checkHealth} disabled={loading}>
        {loading ? "確認中…" : "バックエンド接続確認"}
      </button>

      <p>API・DBの状態：{status}</p>
    </main>
  );
}

export default App;
