import { Link, useNavigate } from "react-router-dom";
import { getToken, logout } from "../api.js";

function TopNav() {
  const navigate = useNavigate();
  const token = getToken();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="top-nav">
      <div className="nav-brand">TaskFlow</div>
      <div className="nav-links">
        {token ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/projects">Projects</Link>
            <button className="link-button" type="button" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default TopNav;
