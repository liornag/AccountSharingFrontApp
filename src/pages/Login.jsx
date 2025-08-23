import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { BsPersonCircle } from "react-icons/bs";
import "./Login.css";
import {useAuth} from "../hooks/useAuth";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();  
  const { login } = useAuth();

  //if exist redirect
  const params = new URLSearchParams(location.search); 
  //const redirect = params.get("redirect")
  const redirect = sessionStorage.getItem('redirectAfterLogin')

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/login`, { email, password });
      const { token, username } = res.data;
      await login({ username, token }, redirect); //to the useAuth
    } catch (err) {
      console.error("Login failed:", err);
      if (err.response?.status === 400) setErrorMessage("User not exist");
      else setErrorMessage("Server failed");
    }
  };

  return (
    <div className="login-page">
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
