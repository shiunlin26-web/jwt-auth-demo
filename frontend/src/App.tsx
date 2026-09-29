import { useState } from "react";

function App() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const callPing = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/ping");
      const data = await res.json();
      setMessage(data.message);
    } catch (err) {
      setMessage("錯誤：" + String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>JWT Auth Demo</h1>
      <button onClick={callPing} disabled={loading}>
        {loading ? "載入中..." : "呼叫 /ping"}
      </button>
      {message && <p>回應：{message}</p>}
    </div>
  );
}

export default App;