import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

const SelectItems = () => {
  const location = useLocation();
  const items = location.state?.items || [];

  const [participants, setParticipants] = useState([]);
  const [newParticipantName, setNewParticipantName] = useState("");

  const addParticipant = () => {
    if (!newParticipantName.trim()) return;

    const newParticipant = {
      name: newParticipantName.trim(),
      selectedItems: []
    };

    setParticipants([...participants, newParticipant]);
    setNewParticipantName("");
  };

  const toggleItemForParticipant = (participantIndex, itemIndex) => {
    const updated = [...participants];
    const participant = updated[participantIndex];
    const alreadySelected = participant.selectedItems.includes(itemIndex);

    if (alreadySelected) {
      participant.selectedItems = participant.selectedItems.filter(i => i !== itemIndex);
    } else {
      participant.selectedItems.push(itemIndex);
    }

    setParticipants(updated);
  };

  // מחשב את הסכום הכולל של משתתף לפי הפריטים שנבחרו
  const calculateTotal = (selectedIndices) => {
    return selectedIndices.reduce((sum, i) => {
      const price = items[i]?.price;
      return sum + (typeof price === 'number' ? price : 0);
    }, 0).toFixed(2);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Assign Items to Participants</h2>

      <div>
        <input
          type="text"
          value={newParticipantName}
          placeholder="Participant name"
          onChange={(e) => setNewParticipantName(e.target.value)}
        />
        <button onClick={addParticipant}>Add Participant</button>
      </div>

      <div style={{ marginTop: '20px' }}>
        {participants.map((participant, pIndex) => (
          <div key={pIndex} style={{ marginBottom: '30px', border: '1px solid #ccc', padding: '10px' }}>
            <h3>{participant.name} - Total: ₪{calculateTotal(participant.selectedItems)}</h3>
            <ul>
              {items.map((item, itemIndex) => (
                <li key={itemIndex}>
                  <label>
                    <input
                      type="checkbox"
                      checked={participant.selectedItems.includes(itemIndex)}
                      onChange={() => toggleItemForParticipant(pIndex, itemIndex)}
                    />
                    {item.name} - ₪{item.price}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <pre style={{ background: "#eee", padding: "10px" }}>
        🧾 Debug Participants State:{'\n'}
        {JSON.stringify(participants, null, 2)}
      </pre>
    </div>
  );
};

export default SelectItems;
