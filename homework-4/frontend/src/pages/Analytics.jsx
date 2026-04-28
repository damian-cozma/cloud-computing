import React, { useEffect, useMemo, useState } from "react";
import "./Analytics.css";
import { API_BASE } from "../api";

function formatHours(value) {
  if (value == null || Number.isNaN(Number(value))) return "0 h";
  return `${Number(value)} h`;
}

function formatRating(value) {
  if (value == null || Number(value) <= 0) return "N/A";
  return Number(value).toFixed(1);
}

export default function Analytics() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [sortOrder, setSortOrder] = useState("desc");
  const [platformFilter, setPlatformFilter] = useState("All");

  useEffect(() => {
    let cancelled = false;

    async function fetchAnalytics() {
      try {
        setLoading(true);
        setError("");

        let leaderboardUrl = `${API_BASE}/analytics/leaderboard?sort=${sortOrder}`;
        if (platformFilter !== "All") {
          leaderboardUrl += `&platform=${encodeURIComponent(platformFilter)}`;
        }

        const [statsRes, leaderboardRes] = await Promise.all([
          fetch(`${API_BASE}/analytics/statistics`),
          fetch(leaderboardUrl),
        ]);

        if (!statsRes.ok || !leaderboardRes.ok) {
          throw new Error("Failed to load analytics data.");
        }

        const [statsData, leaderboardData] = await Promise.all([
          statsRes.json(),
          leaderboardRes.json(),
        ]);

        if (!cancelled) {
          setStats(statsData);
          setLeaderboard(Array.isArray(leaderboardData) ? leaderboardData : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Something went wrong.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchAnalytics();

    return () => {
      cancelled = true;
    };
  }, [sortOrder, platformFilter]);

  const platformOptions = useMemo(() => {
    if (!stats?.games_per_platform) return [];
    return Object.keys(stats.games_per_platform);
  }, [stats]);

  const progress = stats?.overall_progress || {};
  const playingCount = progress.Playing || 0;
  const completedCount = progress.Completed || 0;
  const abandonedCount = progress.Abandoned || 0;
  const totalProgressCount = playingCount + completedCount + abandonedCount;

  const playingWidth =
    totalProgressCount > 0 ? (playingCount / totalProgressCount) * 100 : 0;
  const completedWidth =
    totalProgressCount > 0 ? (completedCount / totalProgressCount) * 100 : 0;
  const abandonedWidth =
    totalProgressCount > 0 ? (abandonedCount / totalProgressCount) * 100 : 0;

  if (loading && !stats) {
    return (
      <section className="analytics-page">
        <div className="analytics-loading">
          <div className="analytics-spinner" />
          <p>Loading your analytics...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="analytics-page">
        <div className="analytics-empty-state">
          <h2>Couldn’t load analytics</h2>
          <p>{error}</p>
        </div>
      </section>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <section className="analytics-page">
      <div className="analytics-shell">
        <header className="analytics-header">
          <h1 className="analytics-title">Your Gaming Analytics</h1>
          <p className="analytics-subtitle">
            A cleaner look at your library, reviews, playtime and top-rated games.
          </p>
        </header>

        <section className="analytics-overview">
          <div className="analytics-section-head">
            <h2>Overview</h2>
            <p>Your core numbers at a glance.</p>
          </div>

          <div className="analytics-stats-grid">
            <article className="analytics-stat-card">
              <span className="analytics-stat-label">Total Games</span>
              <strong className="analytics-stat-value">{stats.total_games ?? 0}</strong>
            </article>

            <article className="analytics-stat-card">
              <span className="analytics-stat-label">Reviews Written</span>
              <strong className="analytics-stat-value">{stats.total_reviews ?? 0}</strong>
            </article>

            <article className="analytics-stat-card analytics-stat-card--accent">
              <span className="analytics-stat-label">Favorite Platform</span>
              <strong className="analytics-stat-value analytics-stat-value--small">
                {stats.favorite_platforms?.length
                  ? stats.favorite_platforms.join(", ")
                  : "N/A"}
              </strong>
            </article>

            <article className="analytics-stat-card">
              <span className="analytics-stat-label">Total Hours Played</span>
              <strong className="analytics-stat-value">
                {formatHours(stats.total_hours_played)}
              </strong>
            </article>
          </div>
        </section>

        <div className="analytics-main-grid">
          <section className="analytics-panel analytics-progress-panel">
            <div className="analytics-section-head">
              <h2>Library Status</h2>
              <p>See how your collection is split right now.</p>
            </div>

            <div className="analytics-progress-card">
              <div className="analytics-progress-bar">
                <div
                  className="analytics-progress-segment analytics-progress-segment--playing"
                  style={{ width: `${playingWidth}%` }}
                />
                <div
                  className="analytics-progress-segment analytics-progress-segment--completed"
                  style={{ width: `${completedWidth}%` }}
                />
                <div
                  className="analytics-progress-segment analytics-progress-segment--abandoned"
                  style={{ width: `${abandonedWidth}%` }}
                />
              </div>

              <div className="analytics-progress-legend">
                <div className="analytics-legend-item">
                  <span className="analytics-legend-dot analytics-legend-dot--playing" />
                  <span>Playing</span>
                  <strong>{playingCount}</strong>
                </div>

                <div className="analytics-legend-item">
                  <span className="analytics-legend-dot analytics-legend-dot--completed" />
                  <span>Completed</span>
                  <strong>{completedCount}</strong>
                </div>

                <div className="analytics-legend-item">
                  <span className="analytics-legend-dot analytics-legend-dot--abandoned" />
                  <span>Abandoned</span>
                  <strong>{abandonedCount}</strong>
                </div>
              </div>
            </div>

            <div className="analytics-platform-card">
              <h3>Games per Platform</h3>

              {platformOptions.length === 0 ? (
                <p className="analytics-muted">No platform data available.</p>
              ) : (
                <div className="analytics-platform-list">
                  {platformOptions.map((platform) => (
                    <div key={platform} className="analytics-platform-row">
                      <span>{platform}</span>
                      <strong>{stats.games_per_platform[platform]}</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="analytics-panel analytics-leaderboard-panel">
            <div className="analytics-leaderboard-top">
              <div className="analytics-section-head">
                <h2>Top Rated Games</h2>
                <p>Sort and filter your ratings however you want.</p>
              </div>

              <div className="analytics-controls">
                <label className="analytics-control">
                  <span>Sort</span>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                  >
                    <option value="desc">Highest Rated</option>
                    <option value="asc">Lowest Rated</option>
                  </select>
                </label>

                <label className="analytics-control">
                  <span>Platform</span>
                  <select
                    value={platformFilter}
                    onChange={(e) => setPlatformFilter(e.target.value)}
                  >
                    <option value="All">All Platforms</option>
                    {platformOptions.map((platform) => (
                      <option key={platform} value={platform}>
                        {platform}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            {leaderboard.length === 0 ? (
              <div className="analytics-empty-state analytics-empty-state--small">
                <h3>No games found</h3>
                <p>Try another filter combination.</p>
              </div>
            ) : (
              <div className="analytics-leaderboard-list">
                {leaderboard.map((item, index) => (
                  <article key={item.id} className="analytics-leaderboard-row">
                    <div className="analytics-rank-badge">
                      {sortOrder === "desc" ? `#${index + 1}` : "•"}
                    </div>

                    <div className="analytics-game-meta">
                      <h3>{item.title}</h3>
                      <span>{item.platform}</span>
                    </div>

                    <div className="analytics-rating-pill">
                      ⭐ {formatRating(item.rating)}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </section>
  );
}