import React, { useState, useEffect } from "react";
import "./ShareBillModal.css";
import api from "../lib/api"; 
import { useAuth } from "../hooks/useAuth";

const safeDecodeUserId = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub || payload.id || payload.userId || null;
  } catch {
    return null;
  }
};

const ShareBillModal = ({ billId, onClose }) => {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth(); //according to authprovider

  useEffect(() => {
    const fetchUsers = async () => {
      if (search.length < 2) return;
      try {
        //we have automatic authorization when we usen this api
        const res = await api.get(`/users/search`, { params: { q: search } });
        const currentUserId = user?.token ? safeDecodeUserId(user.token) : null;
        const data = (Array.isArray(res.data) ? res.data : res.data.users || []);
        setResults(
          currentUserId ? data.filter(u => u._id !== currentUserId) : data
        );
      } catch {
        console.warn("users/search failed:", e?.response?.data || e.message);
        setResults([]);
      }
    };
    fetchUsers();
  }, [search, user]);

  const handleShare = async () => {
    if (!billId) {
      alert("Error: Bill ID is missing. Cannot share.");
      return;
    }
    setLoading(true);
    try {
      await api.post(`/bills/${billId}/share`, { userIds: selectedUsers });
      alert("Shared successfully!");
      onClose();
    } catch (err) {
      alert(err?.response?.data?.error || "Sharing failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleUser = (id) => {
    setSelectedUsers(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  console.log("ShareBillModal received billId:", billId);

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <h2>Share with friends</h2>
        <input
          type="text"
          className="search-input"
          placeholder="Enter username or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <ul className="results-list">
          {results.length ? results.map(u => (
            <li key={u._id}>
              <label>
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(u._id)}
                  onChange={() => toggleUser(u._id)}
                />
                <span>{u.username} ({u.email})</span>
              </label>
            </li>
          )) : (
            <li className="no-results">No users found</li>
          )}
        </ul>
        <div className="buttons-row">
          <button
            className="btn primary"
            onClick={handleShare}
            disabled={loading || !selectedUsers.length}
          >
            {loading ? "Sharing..." : "Share"}
          </button>
          <button className="btn secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default ShareBillModal;
