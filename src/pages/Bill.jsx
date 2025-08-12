import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/api";
import ShareBillModal from "./ShareBillModal";
import "./Bill.css";

const safeDecodeUserId = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub || payload.id || payload.userId || null;
  } catch {
    return null;
  }
};

export default function Bill() {
  // rout paramter /bill/:sessionId
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [isOwner, setIsOwner] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [currency, setCurrency] = useState("₪");
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [items, setItems] = useState([]);
  const didFetch = useRef(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    if (!sessionId || didFetch.current) return;
    didFetch.current = true;

    (async () => {
      try {
          // server GET /bills/:sessionId and get items from bill
          const [billRes, itemsRes] = await Promise.all([
          api.get(`/bills/${sessionId}`),
          api.get(`/bills/${sessionId}/items`),
        ]);
        const billData = billRes.data; 
        setBill(billData);
        setItems(itemsRes.data?.items ?? []);
        const rawUser = localStorage.getItem("user");
        if (rawUser) {
        const { token } = JSON.parse(rawUser);
        const me = token ? safeDecodeUserId(token) : null;
        const owner = String(billData.ownerId) === String(me);
        const shared = Array.isArray(billData.sharedWithUsers)
          ? billData.sharedWithUsers.map(String).includes(String(me))
          : false;

        setIsOwner(owner);
        setCanShare(owner || shared); 
      }
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
  if (!bill) return <div>Bill not found.</div>;

  //total sum of items price 
  const total = items.reduce((s, it) => s + (it.price || 0) * (it.quantity || 1), 0);

   return (
    <div className="bill-wrapper">
      <div className="bill-container">
        <div className="bill-top">
          <button className="bill-btn secondary" onClick={() => navigate(-1)}>
            Back
          </button>
        </div>

        <h2 className="bill-title">Shared Receipt</h2>

        <div className="bill-meta">
          <span className="bill-chip"><b>Bill:</b>&nbsp;{bill.sessionId}</span>
          <span className="bill-chip"><b>Owner:</b>&nbsp;{bill.ownerId}</span>

          {/* choose currence */}
          <label className="bill-chip bill-currency">
            <span style={{ marginRight: 6 }}>Currency:</span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bill-currency-select"
            >
              <option value="₪">₪</option>
              <option value="$">$</option>
              <option value="€">€</option>
            </select>
          </label>
        </div>

        <div className="receipt-card">
          {items.length === 0 ? (
            <div className="receipt-empty">No items found for this bill.</div>
          ) : (
            <>
              <div className="receipt-head">
                <div>Item</div>
                <div style={{ textAlign: "right" }}>Qty</div>
                <div style={{ textAlign: "right" }}>Price</div>
              </div>

              {items.map((it) => (
                <div key={it._id} className="receipt-row">
                  <div className="receipt-name">{it.name}</div>
                  <div className="receipt-qty">×{it.quantity}</div>
                  <div className="receipt-price">
                    {currency}{Number(it.price ?? 0).toFixed(2)}
                  </div>
                </div>
              ))}

              <div className="receipt-total">
                <div>Total</div>
                <div />
                <div style={{ textAlign: "right" }}>
                  {currency}{total.toFixed(2)}
                </div>
              </div>
            </>
          )}
        </div>

        {isOwner && isShareModalOpen && (
          <ShareBillModal billId={bill._id} onClose={() => setIsShareModalOpen(false)} />
        )}
      </div>
    </div>
  );
}