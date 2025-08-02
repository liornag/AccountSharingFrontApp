import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
  const navigate = useNavigate();
  return (
    <div className="home-container">
      <div className="background-image"></div>
      <div className="overlay">
        <h1>Welcome to <span className="brand">SplitEasy</span></h1>
        <div className="btn-group">
          <button onClick={() => navigate("/login")}>Sign In</button>
          <button onClick={() => navigate("/register")}>Register</button>
        </div>
      </div>
    </div>
  );
}

export default Home;
