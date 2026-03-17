import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./GameDetails.css";

function formatDate(dateString) {
  if (!dateString) return "TBA";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString();
}

function formatRating(value) {
  if (value == null || Number(value) <= 0) return "N/A";
  return Number(value).toFixed(1);
}

export default function GameDetails() {
  const { id } = useParams();

  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [progress, setProgress] = useState("Playing");
  const [platform, setPlatform] = useState("");
  const [addStatus, setAddStatus] = useState("");

  const [heroImageFailed, setHeroImageFailed] = useState(false);
  const [coverImageFailed, setCoverImageFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchGameDetails() {
      try {
        setLoading(true);
        setError("");
        setHeroImageFailed(false);
        setCoverImageFailed(false);

        const response = await fetch(`/api/external/games/${id}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Game not found.");
          }

          throw new Error("Error loading game details.");
        }

        const data = await response.json();

        if (!cancelled) {
          setGame(data);

          if (data.platforms?.length > 0) {
            setPlatform(data.platforms[0]);
          } else {
            setPlatform("");
          }
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

    fetchGameDetails();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleAddToLibrary = async (e) => {
    e.preventDefault();
    setAddStatus("");

    const gameData = {
      title: game.name,
      platform,
      progress,
      rawg_id: game.rawg_id,
    };

    try {
      const response = await fetch("/api/games/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(gameData),
      });

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error("Game is already in your library!");
        }

        throw new Error("Failed to add game.");
      }

      setAddStatus("success");

      setTimeout(() => {
        setIsModalOpen(false);
        setAddStatus("");
      }, 1800);
    } catch (err) {
      setAddStatus(err.message || "Failed to add game.");
    }
  };

  const heroStyle = useMemo(() => {
    if (!game?.background_image || heroImageFailed) {
      return {};
    }

    return {
      backgroundImage: `url(${game.background_image})`,
    };
  }, [game, heroImageFailed]);

  if (loading) {
    return (
      <section className="game-details-page">
        <div className="game-details-loading">
          <div className="game-details-spinner" />
          <p>Loading game details...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="game-details-page">
        <div className="game-details-empty-state">
          <h2>Couldn’t load this game</h2>
          <p>{error}</p>
          <Link to="/browse" className="game-details-back-link">
            ← Back to Browse
          </Link>
        </div>
      </section>
    );
  }

  if (!game) return null;

  return (
    <section className="game-details-page">
      <div className="game-details-shell">
        <Link to="/browse" className="game-details-back-link">
          ← Back to Browse
        </Link>

        <section
          className={`game-hero ${heroImageFailed || !game.background_image ? "is-fallback" : ""}`}
        >
          {!heroImageFailed && game.background_image && (
            <div className="game-hero-image" style={heroStyle} />
          )}

          <div className="game-hero-backdrop" />

          <div className="game-hero-content">
            <div className="game-cover-wrap">
              {!coverImageFailed && game.background_image ? (
                <img
                  src={game.background_image}
                  alt={game.name}
                  className="game-cover"
                  onError={() => setCoverImageFailed(true)}
                />
              ) : (
                <div className="game-cover-fallback">
                  <span>Game Details</span>
                </div>
              )}
            </div>

            <div className="game-main-info">
              <h1 className="game-title">{game.name}</h1>

              <div className="game-badges">
                {game.metacritic ? (
                  <span className="game-badge game-badge--metacritic">
                    Metacritic: {game.metacritic}
                  </span>
                ) : null}

                <span className="game-badge game-badge--rating">
                  ⭐ {formatRating(game.rating)}
                </span>

                <span className="game-badge game-badge--date">
                  📅 {formatDate(game.released)}
                </span>
              </div>

              <div className="game-info-block">
                <h3>Platforms</h3>
                <div className="game-tag-list">
                  {game.platforms?.length ? (
                    game.platforms.map((item) => (
                      <span key={item} className="game-tag game-tag--platform">
                        {item}
                      </span>
                    ))
                  ) : (
                    <span className="game-muted">No platform data available.</span>
                  )}
                </div>
              </div>

              <div className="game-info-block">
                <h3>Genres</h3>
                <div className="game-tag-list">
                  {game.genres?.length ? (
                    game.genres.map((item) => (
                      <span key={item} className="game-tag game-tag--genre">
                        {item}
                      </span>
                    ))
                  ) : (
                    <span className="game-muted">No genre data available.</span>
                  )}
                </div>
              </div>

              <div className="game-actions">
                <button
                  type="button"
                  className="game-primary-btn"
                  onClick={() => {
                    setAddStatus("");
                    setIsModalOpen(true);
                  }}
                >
                  + Add to Library
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {isModalOpen && (
        <div
          className="game-modal-overlay"
          onClick={() => {
            setIsModalOpen(false);
            setAddStatus("");
          }}
        >
          <div
            className="game-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="game-modal-header">
              <h2>Add to Library</h2>
              <p>{game.name}</p>
            </div>

            <form className="game-modal-form" onSubmit={handleAddToLibrary}>
              <div className="game-form-group">
                <label htmlFor="progress">Progress</label>
                <select
                  id="progress"
                  value={progress}
                  onChange={(e) => setProgress(e.target.value)}
                >
                  <option value="Playing">Playing</option>
                  <option value="Completed">Completed</option>
                  <option value="Abandoned">Abandoned</option>
                </select>
              </div>

              <div className="game-form-group">
                <label htmlFor="platform">Platform</label>
                <select
                  id="platform"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                >
                  {game.platforms?.length ? (
                    game.platforms.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))
                  ) : (
                    <option value="">Unknown</option>
                  )}
                </select>
              </div>

              {addStatus === "success" && (
                <p className="game-status game-status--success">
                  Successfully added!
                </p>
              )}

              {addStatus && addStatus !== "success" && (
                <p className="game-status game-status--error">{addStatus}</p>
              )}

              <div className="game-modal-actions">
                <button
                  type="button"
                  className="game-secondary-btn"
                  onClick={() => {
                    setIsModalOpen(false);
                    setAddStatus("");
                  }}
                >
                  Cancel
                </button>

                <button type="submit" className="game-primary-btn">
                  Save Game
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}