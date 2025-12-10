import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/Navbar.css";

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-buttons">
        <Link
          to="/caso"
          className={`navbar-link ${location.pathname === "/caso" ? "active" : ""}`}
        >
          CASO
        </Link>

        <Link
          to="/expediente"
          className={`navbar-link ${location.pathname === "/expediente" ? "active" : ""}`}
        >
          EXPEDIENTE
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
