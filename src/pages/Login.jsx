import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  


  const handleSubmit = (e) => {
    e.preventDefault();

    const savedUser = JSON.parse(localStorage.getItem("registeredUser"));

    if (
      savedUser &&
      username === savedUser.username &&
      password === savedUser.password
    ) {
      alert("You have successfully connected!");
      localStorage.setItem("isLoggedIn", "true");
      login(savedUser);
      console.log("Navigated to /uploadBill");
    } else {
      alert("Incorrect username or password");
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <label>Username:</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
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
        <button type="submit">Login</button>
      </form>
      <p>Don't have an account?</p>
      <Link to="/register"><button>Sign up</button></Link>
    </div>
  );
}

export default Login;
