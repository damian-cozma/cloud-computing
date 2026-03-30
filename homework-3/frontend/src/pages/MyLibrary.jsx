import React, { useEffect, useMemo, useState } from "react";
import "./MyLibrary.css";
const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

const REVIEW_CATEGORIES = ["graphics", "mechanics", "story", "sound"];

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function getProgressClass(progress) {
  if (!progress) return "";
  return `status-${progress.toLowerCase()}`;
}

export default function MyLibrary() {
  const [games, setGames] = useState([]);
  const [reviewedGameIds, setReviewedGameIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPlatform, setFilterPlatform] = useState("All");

  const [reviewModal, setReviewModal] = useState({ isOpen: false, game: null });
  const [isUpdating, setIsUpdating] = useState(false);
  const [reviewMsg, setReviewMsg] = useState(null);

  const [reviewForm, setReviewForm] = useState({
    text: "",
    graphics: 5,
    mechanics: 5,
    story: 5,
    sound: 5,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [gamesRes, reviewsRes] = await Promise.all([
        fetch(`${API_BASE}/api/games/`),
        fetch(`${API_BASE}/api/reviews`),
      ]);

      if (!gamesRes.ok) {
        throw new Error("Failed to load library.");
      }

      const gamesData = await gamesRes.json();
      setGames(Array.isArray(gamesData) ? gamesData : []);

      if (reviewsRes.ok) {
        const reviewsData = await reviewsRes.json();
        setReviewedGameIds(reviewsData.map((review) => review.game_id));
      } else {
        setReviewedGameIds([]);
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteGame = async (id) => {
    if (!window.confirm("Are you sure you want to remove this game?")) return;

    try {
      const response = await fetch(`${API_BASE}/api/games/${id}`, { method: "DELETE" });

      if (!response.ok) {
        throw new Error("Failed to delete game.");
      }

      setGames((prev) => prev.filter((game) => game.id !== id));
      setReviewedGameIds((prev) => prev.filter((gameId) => gameId !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleProgressChange = async (game, newProgress) => {
    try {
      const updatedData = {
        title: game.title,
        platform: game.platform,
        progress: newProgress,
        rawg_id: game.rawg_id,
      };

      const response = await fetch(`${API_BASE}/api/games/${game.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error("Failed to update progress.");
      }

      setGames((prev) =>
        prev.map((currentGame) =>
          currentGame.id === game.id
            ? { ...currentGame, progress: newProgress }
            : currentGame
        )
      );
    } catch (err) {
      alert("Error updating status: " + err.message);
    }
  };

  const openReviewModal = async (game) => {
    setReviewModal({ isOpen: true, game });
    setReviewMsg(null);

    try {
      const res = await fetch(`${API_BASE}/api/games/${game.id}/review`);

      if (res.ok) {
        const data = await res.json();

        setReviewForm({
          text: data.text,
          graphics: data.graphics,
          mechanics: data.mechanics,
          story: data.story,
          sound: data.sound,
        });

        setIsUpdating(true);
      } else {
        setReviewForm({
          text: "",
          graphics: 5,
          mechanics: 5,
          story: 5,
          sound: 5,
        });

        setIsUpdating(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const closeReviewModal = () => {
    setReviewModal({ isOpen: false, game: null });
    setReviewMsg(null);
  };

  const handleReviewChange = (e) => {
    const { name, value } = e.target;

    setReviewForm((prev) => ({
      ...prev,
      [name]: name === "text" ? value : parseInt(value, 10),
    }));
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewMsg(null);

    const method = isUpdating ? "PUT" : "POST";

    try {
      const res = await fetch(`${API_BASE}/api/games/${reviewModal.game.id}/review`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewForm),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Error saving review.");
      }

      setReviewMsg({ type: "success", text: "Review saved successfully!" });

      if (!isUpdating) {
        setReviewedGameIds((prev) => [...prev, reviewModal.game.id]);
      }

      setTimeout(() => {
        closeReviewModal();
      }, 1400);
    } catch (err) {
      setReviewMsg({ type: "error", text: err.message });
    }
  };

  const handleDeleteReview = async () => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;

    try {
      const res = await fetch(`${API_BASE}/api/games/${reviewModal.game.id}/review`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete review.");
      }

      setReviewMsg({ type: "success", text: "Review deleted." });
      setReviewedGameIds((prev) =>
        prev.filter((id) => id !== reviewModal.game.id)
      );

      setTimeout(() => {
        closeReviewModal();
      }, 1400);
    } catch (err) {
      setReviewMsg({ type: "error", text: err.message });
    }
  };

  const availablePlatforms = useMemo(() => {
    return ["All", ...new Set(games.map((game) => game.platform))];
  }, [games]);

  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      const matchStatus =
        filterStatus === "All" || game.progress === filterStatus;
      const matchPlatform =
        filterPlatform === "All" || game.platform === filterPlatform;

      return matchStatus && matchPlatform;
    });
  }, [games, filterStatus, filterPlatform]);

  const totalReviewed = reviewedGameIds.length;

  if (loading) {
    return (
      <section className="library-page">
        <div className="library-loading">
          <div className="library-spinner" />
          <p>Loading your library...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="library-page">
        <div className="library-empty-state">
          <h2>Couldn’t load your library</h2>
          <p>{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="library-page">
      <div className="library-shell">
        <header className="library-header">
          <h1 className="library-title">My Collection</h1>
          <p className="library-subtitle">
            Organize your games, track progress and manage reviews in one place.
          </p>
        </header>

        <section className="library-overview">
          <article className="library-overview-card">
            <span className="library-overview-label">Total Games</span>
            <strong className="library-overview-value">{games.length}</strong>
          </article>

          <article className="library-overview-card">
            <span className="library-overview-label">Reviewed Games</span>
            <strong className="library-overview-value">{totalReviewed}</strong>
          </article>

          <article className="library-overview-card library-overview-card--accent">
            <span className="library-overview-label">Visible Now</span>
            <strong className="library-overview-value">
              {filteredGames.length}
            </strong>
          </article>
        </section>

        {games.length > 0 && (
          <section className="library-filters">
            <div className="library-filters-head">
              <span>Filters</span>
            </div>

            <div className="library-filters-controls">
              <label className="library-filter-group">
                <span>Status</span>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Playing">Playing</option>
                  <option value="Completed">Completed</option>
                  <option value="Abandoned">Abandoned</option>
                </select>
              </label>

              <label className="library-filter-group">
                <span>Platform</span>
                <select
                  value={filterPlatform}
                  onChange={(e) => setFilterPlatform(e.target.value)}
                >
                  {availablePlatforms.map((platform) => (
                    <option key={platform} value={platform}>
                      {platform === "All" ? "All Platforms" : platform}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                className="library-reset-btn"
                onClick={() => {
                  setFilterStatus("All");
                  setFilterPlatform("All");
                }}
              >
                Reset
              </button>
            </div>
          </section>
        )}

        {games.length === 0 ? (
          <div className="library-empty-state">
            <h2>Your library is empty</h2>
            <p>Time to add some games and start building your collection.</p>
          </div>
        ) : filteredGames.length === 0 ? (
          <div className="library-empty-state">
            <h2>No games match your filters</h2>
            <p>Try resetting the filters and check again.</p>
          </div>
        ) : (
          <div className="library-grid">
            {filteredGames.map((game) => {
              const hasReview = reviewedGameIds.includes(game.id);

              return (
                <article key={game.id} className="library-card">

                  {/* --- ZONA CU IMAGINEA --- */}
                  <div className="library-card-image-wrapper">
                    <img
                      src={game.background_image || "https://placehold.co/600x400/1a1a2e/8b5cf6?text=No+Image"}
                      alt={game.title}
                      className="library-card-image"
                      loading="lazy"
                    />
                    <button
                      className="library-delete-btn-overlay"
                      onClick={() => handleDeleteGame(game.id)}
                      title="Remove from library"
                    >
                      ✕
                    </button>
                  </div>

                  {/* --- CONTINUTUL TEXT --- */}
                  <div className="library-card-content">
                    <div className="library-card-title-wrap">
                      <h3>{game.title}</h3>
                      <p>{game.platform}</p>
                    </div>

                    <div className="library-card-tags">
                      <span className="library-platform-pill">{game.platform}</span>

                      <select
                        className={`library-progress-select ${getProgressClass(game.progress)}`}
                        value={game.progress}
                        onChange={(e) =>
                          handleProgressChange(game, e.target.value)
                        }
                        title="Change progress status"
                      >
                        <option value="Playing">Playing</option>
                        <option value="Completed">Completed</option>
                        <option value="Abandoned">Abandoned</option>
                      </select>
                    </div>

                    <div className="library-card-footer">
                      <div className="library-review-state">
                        <span
                          className={`library-review-dot ${
                            hasReview ? "has-review" : "no-review"
                          }`}
                        />
                        <span>{hasReview ? "Review saved" : "No review yet"}</span>
                      </div>

                      <button
                        className={`library-review-btn ${
                          hasReview ? "has-review" : ""
                        }`}
                        onClick={() => openReviewModal(game)}
                      >
                        {hasReview ? "Edit Review ✎" : "Write Review ✎"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {reviewModal.isOpen && (
        <div className="library-modal-overlay" onClick={closeReviewModal}>
          <div
            className="library-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="library-modal-header">
              <h2>{isUpdating ? "Edit Review" : "Write a Review"}</h2>
              <p>{reviewModal.game.title}</p>
            </div>

            <form onSubmit={handleReviewSubmit} className="library-modal-form">
              <div className="library-form-group">
                <label htmlFor="text">Review Text</label>
                <textarea
                  id="text"
                  name="text"
                  rows="5"
                  value={reviewForm.text}
                  onChange={handleReviewChange}
                  placeholder="What did you think about the game?"
                  required
                />
              </div>

              <div className="library-scores-grid">
                {REVIEW_CATEGORIES.map((category) => (
                  <div className="library-score-group" key={category}>
                    <label htmlFor={category}>
                      {capitalize(category)}
                      <span>{reviewForm[category]}/10</span>
                    </label>
                    <input
                      id={category}
                      type="range"
                      name={category}
                      min="1"
                      max="10"
                      value={reviewForm[category]}
                      onChange={handleReviewChange}
                    />
                  </div>
                ))}
              </div>

              {reviewMsg && (
                <p
                  className={
                    reviewMsg.type === "success"
                      ? "library-message success"
                      : "library-message error"
                  }
                >
                  {reviewMsg.text}
                </p>
              )}

              <div className="library-modal-actions">
                <div className="library-modal-left">
                  {isUpdating && (
                    <button
                      type="button"
                      className="library-danger-btn"
                      onClick={handleDeleteReview}
                    >
                      Delete Review
                    </button>
                  )}
                </div>

                <div className="library-modal-right">
                  <button
                    type="button"
                    className="library-secondary-btn"
                    onClick={closeReviewModal}
                  >
                    Cancel
                  </button>

                  <button type="submit" className="library-primary-btn">
                    Save Review
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}