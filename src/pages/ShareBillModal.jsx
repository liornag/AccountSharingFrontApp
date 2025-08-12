import React, { useState, useEffect } from "react";
import "./ShareBillModal.css";
import api from "../lib/api";

const ShareBillModal = ({ billId, onClose }) => {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = search.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    const id = setTimeout(async () => {
      try {
        const res = await api.get("/users/search", {
          params: { q },
          signal: controller.signal, // Axios v1
        });
        const data = Array.isArray(res.data) ? res.data : res.data.users || [];
        setResults(data);
      } catch (e) {
        if (e.name !== "CanceledError" && e.name !== "AbortError") {
          console.warn("users/search failed:", e?.response?.data || e.message);
          setResults([]);
        }
      }
    }, 300); // debounce

    return () => {
      clearTimeout(id);
      controller.abort();
    };
  }, [search]);

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
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
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
          {results.length ? (
            results.map((u) => (
              <li key={u._id}>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(u._id)}
                    onChange={() => toggleUser(u._id)}
                  />
                  <span>
                    {u.username} ({u.email})
                  </span>
                </label>
              </li>
            ))
          ) : (
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
          <button className="btn secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareBillModal;
