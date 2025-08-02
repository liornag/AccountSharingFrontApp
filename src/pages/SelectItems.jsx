import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

const SelectItems = () => {
  const location = useLocation();
  const initialItems = (location.state?.items || []).map((item, idx) => ({
    ...item,
    id: idx,
    assignedCounts: {}
  }));

  const [items, setItems] = useState(initialItems);
  const [participants, setParticipants] = useState([]);
  const [newParticipantName, setNewParticipantName] = useState("");
  const [splitMode, setSplitMode] = useState("byItem");
  const [activeParticipant, setActiveParticipant] = useState("");

  const addParticipant = () => {
    const name = newParticipantName.trim();
    if (!name || participants.includes(name)) return;
    setParticipants([...participants, name]);
    setNewParticipantName("");
    if (!activeParticipant) setActiveParticipant(name);
  };

  const updateAssignedCount = (itemId, delta) => {
    setItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      const prevCount = item.assignedCounts[activeParticipant] || 0;
      const newCount = Math.min(Math.max(prevCount + delta, 0), item.quantity);
      return {
        ...item,
        assignedCounts: {
          ...item.assignedCounts,
          [activeParticipant]: newCount
        }
      };
    }));
  };

  const calculateTotalFor = (name) => {
    return items.reduce((sum, item) => {
      const cnt = item.assignedCounts[name] || 0;
      return sum + cnt * (item.price || 0);
    }, 0).toFixed(2);
  };

  const calculateEqualSplit = () => {
    const total = items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
    return participants.length > 0 ? (total / participants.length).toFixed(2) : "0.00";
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Scanned Receipt Items</h2>

      {/* Split Mode Toggle */}
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

      {/* Add Participants */}
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

      {/* Select Active Participant */}
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

      {/* Item List */}
      <h4>Items</h4>
      {items.map(item => (
        <div key={item.id} style={{ marginBottom: '15px' }}>
          <strong>{item.name}</strong> x{item.quantity} @ ₪{item.price}
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

      {/* Summary */}
      <div style={{ marginTop: '30px' }}>
        <h3>Summary</h3>
        {participants.map((p, i) => (
          <div key={i} style={{ marginBottom: '15px' }}>
            <strong>{p}:</strong> ₪
            {splitMode === "equal" ? calculateEqualSplit() : calculateTotalFor(p)}
            {splitMode === "byItem" && (
              <ul>
                {items.filter(item => (item.assignedCounts[p] || 0) > 0).map(item => (
                  <li key={item.id}>
                    {item.name} x{item.assignedCounts[p]} = ₪{(item.assignedCounts[p] * item.price).toFixed(2)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelectItems;
