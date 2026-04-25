import React from "react";
import { Link, NavLink } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-shell">
        <div className="nav-brand">
          <Link to="/" className="nav-brand-link">
            <span className="nav-brand-text">Game Tracker</span>
          </Link>
        </div>

        <div className="nav-links">
          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? "is-active" : ""}`}>
            Home
          </NavLink>

          <NavLink to="/browse" className={({ isActive }) => `nav-link ${isActive ? "is-active" : ""}`}>
            Browse
          </NavLink>

          <NavLink to="/library" className={({ isActive }) => `nav-link ${isActive ? "is-active" : ""}`}>
            My Library
          </NavLink>

          <NavLink to="/sessions" className={({ isActive }) => `nav-link ${isActive ? "is-active" : ""}`}>
            Sessions
          </NavLink>

          <NavLink to="/analytics" className={({ isActive }) => `nav-link ${isActive ? "is-active" : ""}`}>
            Analytics
          </NavLink>

          <NavLink to="/news" className={({ isActive }) => `nav-link ${isActive ? "is-active" : ""}`}>
            News
          </NavLink>
        </div>
      </div>
    </nav>
  );
}