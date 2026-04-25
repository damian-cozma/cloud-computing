import React from "react";
import { Link } from "react-router-dom";
import "./HomePage.css";

export default function HomePage() {
  return (
    <section className="home-page">
      <div className="home-bg-orb home-bg-orb--left" />
      <div className="home-bg-orb home-bg-orb--right" />

      <div className="home-shell">
        <div className="home-controller">
          <svg
            width="220"
            height="220"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M7.5 7H16.5C19.5 7 22 9.5 22 12.5V14.5C22 17.5 19.5 20 16.5 20H15.5L14 18H10L8.5 20H7.5C4.5 20 2 17.5 2 14.5V12.5C2 9.5 4.5 7 7.5 7Z"
              fill="#1b1b27"
              stroke="#8b5cf6"
              strokeWidth="1"
            />
            <circle cx="17" cy="11" r="1" fill="#8b5cf6" />
            <circle cx="18.5" cy="12.5" r="1" fill="#8b5cf6" />
            <circle cx="17" cy="14" r="1" fill="#8b5cf6" />
            <circle cx="15.5" cy="12.5" r="1" fill="#8b5cf6" />
            <rect x="5" y="12" width="3" height="1" fill="#6b7280" />
            <rect x="6" y="11" width="1" height="3" fill="#6b7280" />
            <rect x="9.5" y="10" width="2" height="1" rx="0.5" fill="#4b5563" />
            <rect x="12.5" y="10" width="2" height="1" rx="0.5" fill="#4b5563" />
          </svg>
        </div>

        <div className="home-hero-card">
          <span className="home-eyebrow">Track. Review. Analyze.</span>

          <h1 className="home-title">Game Tracker</h1>

          <p className="home-subtitle">
            Build your gaming collection, log play sessions, write reviews and
            explore your stats in one clean place.
          </p>

          <div className="home-actions">
            <Link to="/browse" className="home-primary-link">
              Browse Games
            </Link>

            <Link to="/library" className="home-secondary-link">
              Open My Library
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}