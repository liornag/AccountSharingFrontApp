import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
  const [email, setEmail] = useState("");   
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // reset error before submitting

    try {
      const res = await axios.post("http://localhost:5000/login", {
        email,
        password
      });

      const { token, username } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("username", username);

      alert("התחברת בהצלחה!");
      navigate("/uploadBill");

    } catch (err) {
      console.error("Login failed:", err);
      if (err.response?.status === 400) {
        setErrorMessage("User not exist");
      } else {
        setErrorMessage("Server failed");
      }
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <br />

        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <br />

        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

        <button type="submit">Login</button>
      </form>

      <p>Don't have an account?</p>
      <Link to="/register"><button>Sign up</button></Link>
    </div>
  );
}

export default Login;
