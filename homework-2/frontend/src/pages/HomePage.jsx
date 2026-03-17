import React from 'react';
import { Link } from "react-router-dom";
import "./HomePage.css";

export default function HomePage() {
  return (
    <div className="home-container">
      <div className="controller-wrapper">
        <svg width="180" height="180" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7.5 7H16.5C19.5 7 22 9.5 22 12.5V14.5C22 17.5 19.5 20 16.5 20H15.5L14 18H10L8.5 20H7.5C4.5 20 2 17.5 2 14.5V12.5C2 9.5 4.5 7 7.5 7Z" fill="#2d2d2d" stroke="#8b5cf6" strokeWidth="1"/>
          <circle cx="17" cy="11" r="1" fill="#8b5cf6"/>
          <circle cx="18.5" cy="12.5" r="1" fill="#8b5cf6"/>
          <circle cx="17" cy="14" r="1" fill="#8b5cf6"/>
          <circle cx="15.5" cy="12.5" r="1" fill="#8b5cf6"/>
          <rect x="5" y="12" width="3" height="1" fill="#555"/>
          <rect x="6" y="11" width="1" height="3" fill="#555"/>
          <rect x="9.5" y="10" width="2" height="1" rx="0.5" fill="#444"/>
          <rect x="12.5" y="10" width="2" height="1" rx="0.5" fill="#444"/>
        </svg>
      </div>

      <div className="content">
        <h1 className="hero-title">Game Tracker</h1>
        <p className="hero-subtitle">
          Don't just play. Track your journey, analyze your stats, and build your ultimate collection.
        </p>
        <Link to="/browse">
          <button className="cta-button">Browse Library</button>
        </Link>
      </div>
    </div>
  );
}