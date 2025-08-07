import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import ShareBillModal from "./ShareBillModal";
import "./SelectItems.css";

const SelectItems = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const itemsFromOCR = location.state?.items || [];

  const [items, setItems] = useState(
    itemsFromOCR.map((item, idx) => ({ ...item, id: idx, assignedCounts: {} }))
  );
  const [splitMode, setSplitMode] = useState("byItem");
  const [numParticipants, setNumParticipants] = useState(1);
  const [participants, setParticipants] = useState([]);
  const [activeParticipant, setActiveParticipant] = useState("");
  const [newParticipantName, setNewParticipantName] = useState("");
  const [currency, setCurrency] = useState("₪");
  const [billId, setBillId] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const sessionId = location.state?.sessionId;

  useEffect(() => {
    if (!sessionId || billId) return;

    axios.post("http://localhost:5000/create-bill", { sessionId }, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
    .then(res => {
      setBillId(res.data.billId);
    })
    .catch(err => {
      if (err.response?.status === 409) {
        console.warn("Bill already exists for this sessionId.");
      } else {
        console.error("Failed to create bill:", err.response?.data || err.message);
      }
    });
  }, [sessionId, billId]);

  useEffect(() => {
    if (splitMode === "equal") {
      const arr = Array.from({ length: Math.max(numParticipants, 1) }, (_, i) => `Person ${i + 1}`);
      setParticipants(arr);
      setActiveParticipant(arr[0] || "");
    }
  }, [splitMode, numParticipants]);

  const addParticipant = () => {
    const name = newParticipantName.trim();
    if (!name || participants.includes(name)) return;
    setParticipants(prev => [...prev, name]);
    setNewParticipantName("");
    setActiveParticipant(name);
  };

  const toggleParticipantSelection = (itemId) => {
    setItems(prevItems =>
      prevItems.map(item => {
        if (item.id !== itemId) return item;
        const currentValue = !!item.assignedCounts[activeParticipant];
        return {
          ...item,
          assignedCounts: {
            ...item.assignedCounts,
            [activeParticipant]: !currentValue
          }
        };
      })
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleGoBackToScan = () => {
    navigate("/uploadBill");
  };

  const totalSum = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <div className="si-wrapper">
      <div className="si-container">
        <div className="top-controls">
          <button className="btn-secondary" onClick={handleGoBackToScan}>Back to Scan</button>
          <button className="btn-logout" onClick={handleLogout}>Logout</button>
        </div>


        <h2>Scanned Receipt Items</h2>

        <div className="controls-row">
          <div className="control-group">
            <label>Currency:</label>
            <select value={currency} onChange={e => setCurrency(e.target.value)}>
              {Object.keys({ "₪": "shekel", "$": "dollar", "€": "euro" }).map(sym => (
                <option key={sym} value={sym}>{sym}</option>
              ))}
            </select>
          </div>
          <div className="control-group">
            <label><input type="radio" name="mode" value="equal"
              checked={splitMode === "equal"}
              onChange={() => setSplitMode("equal")} /> Split Equally</label>
            <label><input type="radio" name="mode" value="byItem"
              checked={splitMode === "byItem"}
              onChange={() => setSplitMode("byItem")} /> Split by Items</label>
          </div>
        </div>

        {splitMode === "equal" && (
          <div className="equal-split-input">
            <label>How many participants?</label>
            <input type="number" min="1" value={numParticipants}
              onChange={e => setNumParticipants(parseInt(e.target.value) || 1)} />
            <div className="equal-payment">
              Each pays: {currency}{(totalSum / numParticipants).toFixed(2)}
            </div>
          </div>
        )}

        {splitMode === "byItem" && (
          <>
            <div className="add-participant">
              <input placeholder="Enter participant name" value={newParticipantName}
                onChange={e => setNewParticipantName(e.target.value)} />
              <button className="btn-add" onClick={addParticipant}>Add</button>
            </div>
            {participants.length > 0 && (
              <div className="active-participant">
                <label>Active participant:</label>
                <select value={activeParticipant} onChange={e => setActiveParticipant(e.target.value)}>
                  {participants.map((p, i) => <option key={i}>{p}</option>)}
                </select>
              </div>
            )}
            <div className="items-list">
              {items.map(item => (
                <div key={item.id} className="item-row">
                  <div>{item.name} ×{item.quantity} @ {currency}{item.price}</div>
                  {participants.length > 0 && (
                    <div className="assign-controls">
                      <label>
                        <input
                          type="checkbox"
                          checked={!!item.assignedCounts[activeParticipant]}
                          onChange={() => toggleParticipantSelection(item.id)}
                        />
                      </label>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="totals">
              <div className="total-row"><strong>Total: {currency}{totalSum.toFixed(2)}</strong></div>
              {participants.map((p, i) => (
                <div key={i} className="participant-total">
                  <strong>{p}:</strong> {currency}{
                    items.reduce((sum, it) => {
                      const totalSelected = Object.values(it.assignedCounts || {}).filter(Boolean).length;
                      const isSelected = !!it.assignedCounts[p];
                      if (!isSelected || totalSelected === 0) return sum;
                      const portion = it.price / totalSelected;
                      return sum + portion;
                    }, 0).toFixed(2)
                  }
                </div>
              ))}
            </div>
          </>
        )}

        <button className="share-button" onClick={() => setIsShareModalOpen(true)}>
          Share with friends
        </button>
        {isShareModalOpen && <ShareBillModal billId={billId} onClose={() => setIsShareModalOpen(false)} />}
      </div>
    </div>
  );
};

export default SelectItems;
