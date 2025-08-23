// src/lib/api.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  // withCredentials: false,
});


export const setAuthToken = (token) => {
  if (token) {
    const clean = String(token).replace(/^Bearer\s+/i, ""); // מסיר "Bearer " אם הגיע מהשרת
    api.defaults.headers.common.Authorization = `Bearer ${clean}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

// restart from local storage
(() => {
  try {
    const raw = sessionStorage.getItem("user");
    if (raw) {
      const { token } = JSON.parse(raw);
      if (token) setAuthToken(token);
    }
  } catch {}
})();

export default api;
