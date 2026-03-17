import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Browse.css";

export default function Browse() {
  const [query, setQuery] = useState("Minecraft");
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchGames = async (searchQuery) => {
    if (!searchQuery) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/external/games/search?q=${searchQuery}`);

      if (!response.ok) {
        throw new Error("Eroare la încărcarea jocurilor");
      }

      const data = await response.json();
      setGames(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    searchGames(query);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    searchGames(query);
  };

  return (
    <div className="browse-container">
      <h1 className="browse-title">Explore Games</h1>

      <form onSubmit={handleSearch} className="search-bar">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a game..."
          className="search-input"
        />
        <button type="submit" className="search-button">Search</button>
      </form>

      {loading && <p className="loading-text">Loading...</p>}
      {error && <p className="error-text">{error}</p>}

      <div className="games-grid">
        {!loading && games.map((game) => (
          <Link
            to={`/game/${game.rawg_id}`}
            key={game.rawg_id}
            className="game-card"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            {game.background_image ? (
              <img src={game.background_image} alt={game.name} className="game-image" />
            ) : (
              <div className="game-image-placeholder">No Image</div>
            )}
            <div className="game-info">
              <h3>{game.name}</h3>
              <div className="game-meta">
                <span>⭐ {game.rating || "N/A"}</span>
                <span>📅 {game.released || "TBA"}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}