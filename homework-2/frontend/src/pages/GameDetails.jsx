import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import "./GameDetails.css";

export default function GameDetails() {
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [progress, setProgress] = useState("Playing");
  const [platform, setPlatform] = useState("");
  const [addStatus, setAddStatus] = useState(null);

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

        if (data.platforms && data.platforms.length > 0) {
          setPlatform(data.platforms[0]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGameDetails();
  }, [id]);

  const handleAddToLibrary = async (e) => {
    e.preventDefault();
    setAddStatus(null);

    const gameData = {
      title: game.name,
      platform: platform,
      progress: progress,
      rawg_id: game.rawg_id
    };

    try {
      const response = await fetch(`/api/games/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(gameData),
      });

      if (!response.ok) {
        if (response.status === 409) throw new Error("Game is already in your library!");
        throw new Error("Failed to add game.");
      }

      setAddStatus("success");
      setTimeout(() => {
        setIsModalOpen(false);
        setAddStatus(null);
      }, 2000);
    } catch (err) {
      setAddStatus(err.message);
    }
  };

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
              {game.platforms?.map(p => (
                <span key={p} className="tag platform-tag">{p}</span>
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

          <button className="add-library-btn" onClick={() => setIsModalOpen(true)}>
            + Add to Library
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add to Library</h2>
            <p className="modal-game-title">{game.name}</p>

            <form onSubmit={handleAddToLibrary} className="modal-form">
              <div className="form-group">
                <label>Progress</label>
                <select value={progress} onChange={(e) => setProgress(e.target.value)}>
                  <option value="Playing">Playing</option>
                  <option value="Completed">Completed</option>
                  <option value="Abandoned">Abandoned</option>
                </select>
              </div>

              <div className="form-group">
                <label>Platform</label>
                <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
                  {game.platforms?.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              {addStatus === "success" && <p className="success-msg">Successfully added!</p>}
              {addStatus && addStatus !== "success" && <p className="error-msg">{addStatus}</p>}

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="submit-btn">Save Game</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}