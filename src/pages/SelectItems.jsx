import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import ShareBillModal from './ShareBillModal';

const SelectItems = () => {
  const location = useLocation();
  const itemsFromOCR = location.state?.items || [];

  const [items, setItems] = useState(itemsFromOCR.map((item, idx) => ({
    ...item, id: idx, assignedCounts: {}
  })));

  const sessionId = location.state?.sessionId || "";
  const [billId, setBillId] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [newParticipantName, setNewParticipantName] = useState("");
  const [splitMode, setSplitMode] = useState("byItem");
  const [activeParticipant, setActiveParticipant] = useState("");
  const [currency, setCurrency] = useState("₪");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const currencySymbols = {
    "₪": "shekel",
    "$": "dollar",
    "€": "euro"
  };

  useEffect(() => {
    const createBill = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.post('http://localhost:5000/create-bill', {
          sessionId
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBillId(res.data.billId);
      } catch (err) {
        console.error("Failed to create bill:", err);
      }
    };

    if (sessionId) {
      createBill();
    }
  }, [sessionId]);

  const addParticipant = () => {
    const name = newParticipantName.trim();
    if (!name || participants.includes(name)) return;
    setParticipants([...participants, name]);
    setNewParticipantName("");
    if (!activeParticipant) setActiveParticipant(name);
  };

const updateAssignedCount = (itemId, delta) => {
  setItems(prev =>
    prev.map(item => {
      if (item.id !== itemId) return item;

      const prevCount = item.assignedCounts[activeParticipant] || 0;
      const totalAssigned = Object.values(item.assignedCounts).reduce((sum, val) => sum + val, 0);
      const totalAfter = totalAssigned - prevCount + (prevCount + delta);

      // according to quntity
      if (totalAfter > item.quantity) return item;

      const newCount = Math.min(Math.max(prevCount + delta, 0), item.quantity);
      return {
        ...item,
        assignedCounts: {
          ...item.assignedCounts,
          [activeParticipant]: newCount
        }
      };
    })
  );
};


  const calculateTotalFor = (name) =>
    items.reduce((sum, item) =>
      sum + (item.assignedCounts[name] || 0) * (item.price || 0), 0).toFixed(2);

  const calculateEqualSplit = () => {
    const total = items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
    return participants.length > 0 ? (total / participants.length).toFixed(2) : "0.00";
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Scanned Receipt Items</h2>

      <div style={{ marginBottom: '10px' }}>
        <label>Choose Currency: </label>
        <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
          {Object.keys(currencySymbols).map((symbol) => (
            <option key={symbol} value={symbol}>
              {currencySymbols[symbol]} ({symbol})
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label>
          <input
            type="radio"
            value="equal"
            checked={splitMode === "equal"}
            onChange={() => setSplitMode("equal")}
          />
          Split Equally
        </label>
        <label style={{ marginLeft: '20px' }}>
          <input
            type="radio"
            value="byItem"
            checked={splitMode === "byItem"}
            onChange={() => setSplitMode("byItem")}
          />
          Split by Items
        </label>
      </div>

      <h3>Add Participants</h3>
      <div style={{ marginBottom: '10px' }}>
        <input
          type="text"
          value={newParticipantName}
          placeholder="Enter participant name"
          onChange={(e) => setNewParticipantName(e.target.value)}
        />
        <button onClick={addParticipant}>Add</button>
      </div>

      {splitMode === "byItem" && participants.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <label>Active participant:</label>
          <select
            value={activeParticipant}
            onChange={(e) => setActiveParticipant(e.target.value)}
            style={{ marginLeft: '10px' }}
          >
            {participants.map((p, i) => (
              <option key={i} value={p}>{p}</option>
            ))}
          </select>
        </div>
      )}

      <h4>Items</h4>
      {items.map(item => (
        <div key={item.id} style={{ marginBottom: '15px' }}>
          <strong>{item.name}</strong> x{item.quantity} @ {currency}{item.price}
          {splitMode === "byItem" && participants.length > 0 && (
            <div style={{ marginTop: '5px', marginLeft: '20px' }}>
              <button disabled={!activeParticipant} onClick={() => updateAssignedCount(item.id, -1)}>-</button>
              <span style={{ margin: '0 10px' }}>
                {activeParticipant && (item.assignedCounts[activeParticipant] || 0)}
              </span>
              <button disabled={!activeParticipant} onClick={() => updateAssignedCount(item.id, 1)}>+</button>
            </div>
          )}
        </div>
      ))}

      <div style={{ marginTop: '30px' }}>
        <div style={{ marginBottom: '20px', fontWeight: 'bold', fontSize: '18px' }}>
          total: {currency}
          {items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0).toFixed(2)}
        </div>

        {participants.map((p, i) => (
          <div key={i} style={{ marginBottom: '15px' }}>
            <strong>{p}:</strong> {currency}
            {splitMode === "equal" ? calculateEqualSplit() : calculateTotalFor(p)}
            {splitMode === "byItem" && (
              <ul>
                {items.filter(item => (item.assignedCounts[p] || 0) > 0).map(item => (
                  <li key={item.id}>
                    {item.name} x{item.assignedCounts[p]} = {currency}{(item.assignedCounts[p] * item.price).toFixed(2)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '40px' }}>
        <button onClick={() => setIsShareModalOpen(true)}>
          Share with friends
        </button>
      </div>

      {isShareModalOpen && (
        <ShareBillModal
          billId={billId}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}
    </div>
  );
};

export default SelectItems;
