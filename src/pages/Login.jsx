import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { BsPersonCircle } from "react-icons/bs";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    try {
      const res = await axios.post("http://localhost:5000/login", { email, password });
      const { token, username } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("username", username);
      navigate("/uploadBill");
    } catch (err) {
      console.error("Login failed:", err);
      if (err.response?.status === 400) setErrorMessage("User not exist");
      else setErrorMessage("Server failed");
    }
  };

  return (
    <div className="login-page">
      <div className="background-image" />
      <div className="login-container">
        <div className="login-card">
          <BsPersonCircle className="login-icon" />
          <h2 className="login-title">Login</h2>
          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <span className="input-icon">📧</span>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <span className="input-icon">🔒</span>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {errorMessage && <p className="error-text">{errorMessage}</p>}
            <button type="submit" className="login-button">Login</button>
          </form>
          <button onClick={() => navigate("/")} className="back-button">
            ← Back to Home
          </button>
          <p className="bottom-text">
            Don't have an account? <Link to="/register" className="signup-link">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
