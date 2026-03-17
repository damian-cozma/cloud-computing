import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import "./GameDetails.css";

export default function GameDetails() {
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGameDetails = async () => {
      try {
        const response = await fetch(`/api/external/games/${id}`);

        if (!response.ok) {
          if (response.status === 404) throw new Error("Game not found.");
          throw new Error("Error loading game details.");
        }

        const data = await response.json();
        setGame(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGameDetails();
  }, [id]);

  if (loading) return <div className="details-container"><h2 className="loading">Loading...</h2></div>;
  if (error) return <div className="details-container"><h2 className="error">{error}</h2></div>;
  if (!game) return null;

  return (
    <div className="details-container">
      <Link to="/browse" className="back-button">← Back to Browse</Link>

      <div className="details-header" style={{ backgroundImage: `linear-gradient(rgba(15, 15, 15, 0.8), rgba(15, 15, 15, 1)), url(${game.background_image})` }}>
        <img src={game.background_image} alt={game.name} className="details-cover" />

        <div className="details-info">
          <h1>{game.name}</h1>

          <div className="badges-row">
            {game.metacritic && <span className="badge metacritic">Metacritic: {game.metacritic}</span>}
            <span className="badge rating">⭐ {game.rating}</span>
            <span className="badge date">📅 {game.released}</span>
          </div>

          <div className="tags-section">
            <h3>Platforms</h3>
            <div className="tags-list">
              {game.platforms?.map(platform => (
                <span key={platform} className="tag platform-tag">{platform}</span>
              ))}
            </div>
          </div>

          <div className="tags-section">
            <h3>Genres</h3>
            <div className="tags-list">
              {game.genres?.map(genre => (
                <span key={genre} className="tag genre-tag">{genre}</span>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}