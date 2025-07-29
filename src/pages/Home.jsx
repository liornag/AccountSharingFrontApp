import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Home page</h1>
      <div>
        <button onClick={() => navigate("/login")}>Sign in</button>
      </div>
    </div>
  );
}

export default Home;
