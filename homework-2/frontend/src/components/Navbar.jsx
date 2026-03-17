import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">
          <span className="brand-icon">🎮</span> GameTracker
        </Link>
      </div>
      <div className="nav-links">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/browse" className="nav-link">Browse</Link>
        <Link to="/library" className="nav-link">My Library</Link>
          <Link to="/sessions" className="nav-link">Sessions</Link>
          <Link to="/analytics" className="nav-link">Analytics</Link>
      </div>
    </nav>
  );
}