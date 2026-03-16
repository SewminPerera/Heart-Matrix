import { Link, NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();

  const onLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link to="/" className="brand">Heart Matrix</Link>
        <nav className="links">
          <NavLink className={({isActive}) => isActive ? "a active" : "a"} to="/about">
            About
          </NavLink>
          <NavLink className={({isActive}) => isActive ? "a active" : "a"} to="/leaderboard">
            Leaderboard
          </NavLink>
          <button className="logout" onClick={onLogout}>Log Out</button>
        </nav>
      </div>
    </header>
  );
}
