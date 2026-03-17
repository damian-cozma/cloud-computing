import React, { useState, useEffect } from "react";
import "./Analytics.css";

export default function Analytics() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [sortOrder, setSortOrder] = useState("desc");
  const [platformFilter, setPlatformFilter] = useState("All");

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        let leaderboardUrl = `/api/analytics/leaderboard?sort=${sortOrder}`;
        if (platformFilter !== "All") {
          leaderboardUrl += `&platform=${encodeURIComponent(platformFilter)}`;
        }

        const [statsRes, leaderboardRes] = await Promise.all([
          fetch("/api/analytics/statistics"), //
          fetch(leaderboardUrl)
        ]);

        if (!statsRes.ok || !leaderboardRes.ok) {
          throw new Error("Failed to load analytics data.");
        }

        const statsData = await statsRes.json();
        const leaderboardData = await leaderboardRes.json();

        setStats(statsData);
        setLeaderboard(leaderboardData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [sortOrder, platformFilter]);

  if (loading && !stats) return <div className="analytics-container"><h2 className="loading">Loading data...</h2></div>;
  if (error) return <div className="analytics-container"><h2 className="error">{error}</h2></div>;
  if (!stats) return null;

  return (
    <div className="analytics-container">
      <h1 className="analytics-title">Your Gaming Analytics</h1>

      <div className="analytics-content">

        <section className="stats-section">
          <h2>Overview</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Games</h3>
              <p className="stat-value">{stats.total_games}</p> {/* */}
            </div>

            <div className="stat-card">
              <h3>Reviews Written</h3>
              <p className="stat-value">{stats.total_reviews}</p> {/* */}
            </div>

            <div className="stat-card highlight-card">
              <h3>Favorite Platform</h3>
              <p className="stat-value text-accent">
                {stats.favorite_platforms.length > 0
                  ? stats.favorite_platforms.join(", ")
                  : "N/A"} {/* */}
              </p>
            </div>

            <div className="stat-card">
                <h3>Total Hours Played</h3>
                <p className="stat-value">{stats.total_hours_played} h</p>
            </div>
          </div>

          <div className="progress-stats">
            <h3>Library Status</h3>
            <div className="progress-bar-container">
              <div className="progress-segment playing" style={{ flex: stats.overall_progress.Playing || 1 }}>
                Playing ({stats.overall_progress.Playing}) {/* */}
              </div>
              <div className="progress-segment completed" style={{ flex: stats.overall_progress.Completed || 1 }}>
                Completed ({stats.overall_progress.Completed})
              </div>
              <div className="progress-segment abandoned" style={{ flex: stats.overall_progress.Abandoned || 1 }}>
                Abandoned ({stats.overall_progress.Abandoned})
              </div>
            </div>
          </div>
        </section>

        <section className="leaderboard-section">
          <div className="leaderboard-header">
            <h2>Top Rated Games</h2>

            <div className="leaderboard-controls">
              <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                <option value="desc">Highest Rated</option>
                <option value="asc">Lowest Rated</option>
              </select>

              <select value={platformFilter} onChange={(e) => setPlatformFilter(e.target.value)}>
                <option value="All">All Platforms</option>
                {/* */}
                {Object.keys(stats.games_per_platform).map(plat => (
                  <option key={plat} value={plat}>{plat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="leaderboard-list">
            {leaderboard.length === 0 ? (
              <p className="empty-leaderboard">No games found for these filters.</p>
            ) : (
              leaderboard.map((item, index) => (
                <div key={item.id} className="leaderboard-row">
                  <div className="rank">
                    {sortOrder === "desc" ? `#${index + 1}` : `-`}
                  </div>
                  <div className="game-info">
                    <h4>{item.title}</h4>
                    <span className="platform-tag">{item.platform}</span>
                  </div>
                  <div className="game-rating">
                    ⭐ {item.rating > 0 ? item.rating.toFixed(1) : "N/A"}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

      </div>
    </div>
  );
}