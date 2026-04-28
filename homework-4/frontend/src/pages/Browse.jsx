import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./Browse.css";
import { API_BASE } from "../api";

function formatReleaseDate(dateString) {
  if (!dateString) return "TBA";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString();
}

function formatRating(value) {
  if (value == null || Number(value) <= 0) return "N/A";
  return Number(value).toFixed(1);
}

export default function Browse() {
  const [query, setQuery] = useState("Minecraft");
  const [submittedQuery, setSubmittedQuery] = useState("Minecraft");
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageErrors, setImageErrors] = useState({});

  const searchGames = async (searchQuery) => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE}/external/games/search?q=${encodeURIComponent(trimmedQuery)}`
      );

      if (!response.ok) {
        throw new Error("Could not load games.");
      }

      const data = await response.json();
      setGames(Array.isArray(data) ? data : []);
      setSubmittedQuery(trimmedQuery);
    } catch (err) {
      setError(err.message || "Something went wrong.");
      setGames([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    searchGames("Minecraft");
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    searchGames(query);
  };

  const handleImageError = (gameId) => {
    setImageErrors((prev) => ({
      ...prev,
      [gameId]: true,
    }));
  };

  const uniqueGames = useMemo(() => {
    const seen = new Set();

    return games.filter((game) => {
      const key = game.rawg_id || `${game.name}-${game.released}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [games]);

  return (
    <section className="browse-page">
      <div className="browse-shell">
        <header className="browse-header">
          <h1 className="browse-title">Explore Games</h1>
          <p className="browse-subtitle">
            Search across games, discover new titles and jump straight into details.
          </p>
        </header>

        <form className="browse-search-bar" onSubmit={handleSubmit}>
          <div className="browse-search-input-wrap">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a game..."
              className="browse-search-input"
            />
          </div>

          <button type="submit" className="browse-search-button">
            Search
          </button>
        </form>

        <div className="browse-search-summary">
          <span>
            Results for <strong>{submittedQuery}</strong>
          </span>
          {!loading && !error && (
            <span className="browse-search-count">
              {uniqueGames.length} result{uniqueGames.length === 1 ? "" : "s"}
            </span>
          )}
        </div>

        {loading && (
          <div className="browse-loading">
            <div className="browse-spinner" />
            <p>Searching games...</p>
          </div>
        )}

        {!loading && error && (
          <div className="browse-empty-state">
            <h2>Couldn’t load games</h2>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && uniqueGames.length === 0 && (
          <div className="browse-empty-state">
            <h2>No games found</h2>
            <p>Try a different title or a broader search.</p>
          </div>
        )}

        {!loading && !error && uniqueGames.length > 0 && (
          <div className="browse-grid">
            {uniqueGames.map((game) => {
              const gameKey = game.rawg_id || `${game.name}-${game.released}`;
              const imageFailed = Boolean(imageErrors[gameKey]);

              return (
                <Link
                  to={`/game/${game.rawg_id}`}
                  key={gameKey}
                  className="browse-card"
                >
                  <div className={`browse-card-media ${imageFailed ? "is-fallback" : ""}`}>
                    {!imageFailed && game.background_image ? (
                      <img
                        src={game.background_image}
                        alt={game.name}
                        className="browse-card-image"
                        onError={() => handleImageError(gameKey)}
                      />
                    ) : (
                      <div className="browse-card-fallback">
                        <span>Game Library</span>
                      </div>
                    )}
                  </div>

                  <div className="browse-card-body">
                    <h3 className="browse-card-title">{game.name}</h3>

                    <div className="browse-card-meta">
                      <div className="browse-meta-pill">
                        <span className="browse-meta-label">Rating</span>
                        <strong>⭐ {formatRating(game.rating)}</strong>
                      </div>

                      <div className="browse-meta-pill">
                        <span className="browse-meta-label">Release</span>
                        <strong>{formatReleaseDate(game.released)}</strong>
                      </div>
                    </div>

                    <div className="browse-card-footer">
                      <span className="browse-card-link">View details →</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}