import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { BsPersonCircle } from "react-icons/bs";
import "./Register.css";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!email.includes("@")) newErrors.email = "Email not valid";
    if (password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    return newErrors;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setServerError("");
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await axios.post("http://localhost:5000/register", {
        username,
        email,
        password
      });
      alert("ההרשמה הצליחה!");
      navigate("/login");
    } catch (err) {
      console.error("Registration failed:", err);
      setServerError("Registration failed. Try again.");
    }
  };

  return (
    <div className="auth-page">
      <div className="background-image" />
      <div className="auth-container">
        <div className="auth-card">
          <BsPersonCircle className="auth-icon" />
          <h2 className="auth-title">Register</h2>
          <form onSubmit={handleRegister} className="auth-form">
            <div className="input-group">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {errors.email && <p className="error-text">{errors.email}</p>}
            <div className="input-group">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {errors.password && <p className="error-text">{errors.password}</p>}
            <div className="input-group">
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            {errors.confirmPassword && <p className="error-text">{errors.confirmPassword}</p>}
            {serverError && <p className="error-text">{serverError}</p>}

            <button type="submit" className="auth-button">Register</button>

            <button type="button" className="back-button" onClick={() => navigate("/")}>
              ← Back to Home
            </button>

            <p className="bottom-text">
              Already have an account? <Link to="/login" className="signup-link">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
