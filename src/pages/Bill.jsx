import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../lib/api";

export default function Bill() {
  // rout paramter /bill/:sessionId
  const { sessionId } = useParams();

  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const didFetch = useRef(false);

  useEffect(() => {
    if (!sessionId || didFetch.current) return;
    didFetch.current = true;

    (async () => {
      try {
        // server GET /bills/:sessionId
        const { data } = await api.get(`/bills/${sessionId}`);
        setBill(data);
      } catch (e) {
        setErr(e?.response?.data?.error || e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [sessionId]);

  if (!sessionId) return <div>Missing sessionId in URL.</div>;
  if (loading) return <div>Loading bill…</div>;
  if (err) return <div style={{ color: "crimson" }}>Error: {err}</div>;

  return (
    <div style={{ padding: 24 }}>
      <h1>Bill – {bill.sessionId}</h1>
      <div><b>Owner:</b> {bill.ownerId}</div>
      {/* כאן תוסיפ/י הצגת פריטים, משתתפים וכו' */}
    </div>
  );
}
