import React, { useState, useEffect } from "react";
import axios from "axios";

const ShareBillModal = ({ billId, onClose }) => {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      if (search.length < 2) return;
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:5000/users/search?q=${search}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (Array.isArray(res.data)) {
          setResults(res.data);
        } else if (Array.isArray(res.data.users)) {
          setResults(res.data.users);
        } else {
          console.warn("⚠️ Unexpected response format:", res.data);
          setResults([]);
        }
      } catch (err) {
        console.error("❌ Error fetching users:", err);
        setResults([]);
      }
    };

    fetchUsers();
  }, [search]);

  const handleShare = async () => {
    try {
      const token = localStorage.getItem("token");
      setLoading(true);

      await axios.post(`http://localhost:5000/bills/${billId}/share`, {
        userIds: selectedUsers
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      alert("✅ Shared successfully!");
      onClose();
    } catch (err) {
      console.error("❌ Error sharing bill:", err);
      alert(err?.response?.data?.error || "Sharing failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <div className="modal" style={{ padding: 20 }}>
      <h2>Share with friends</h2>

      <input
        type="text"
        placeholder="Enter username or email"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: 10, padding: 5 }}
      />

      <ul style={{ listStyle: "none", padding: 0 }}>
        {results.length > 0 ? (
          results.map(user => (
            <li key={user._id} style={{ marginBottom: 8 }}>
              <label style={{ cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user._id)}
                  onChange={() => handleCheckboxChange(user._id)}
                  style={{ marginRight: 8 }}
                />
                {user.username} ({user.email})
              </label>
            </li>
          ))
        ) : (
          <li style={{ color: "#aaa" }}>No users found</li>
        )}
      </ul>

      <div style={{ marginTop: 20 }}>
        <button
          onClick={handleShare}
          disabled={loading || selectedUsers.length === 0}
        >
          {loading ? "Sharing..." : "Share"}
        </button>
        <button onClick={onClose} style={{ marginLeft: 10 }}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ShareBillModal;
