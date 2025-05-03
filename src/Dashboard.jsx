import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      alert("You must log in first!");
      navigate("/login");
    }
  }, [token, navigate]);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    alert("You have been signed out.");
    navigate("/login");
  };

  return token ? (
    <div className="dashboard">
      <h1>Welcome to your dashboard!</h1>
      <button onClick={handleSignOut} className="signout-button">
        Sign Out
      </button>
    </div>
  ) : null;
}

export default Dashboard;
