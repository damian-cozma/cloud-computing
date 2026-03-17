import React, { useState, useEffect } from "react";
import "./MyLibrary.css";

export default function MyLibrary() {
  const [games, setGames] = useState([]);
  const [reviewedGameIds, setReviewedGameIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPlatform, setFilterPlatform] = useState("All");

  const [reviewModal, setReviewModal] = useState({ isOpen: false, game: null });
  const [isUpdating, setIsUpdating] = useState(false);
  const [reviewMsg, setReviewMsg] = useState(null);

  const [reviewForm, setReviewForm] = useState({
    text: "", graphics: 5, mechanics: 5, story: 5, sound: 5
  });

  const fetchData = async () => {
    try {
      const [gamesRes, reviewsRes] = await Promise.all([
        fetch("/api/games/"),
        fetch("/api/reviews")
      ]);

      if (!gamesRes.ok) throw new Error("Failed to load library.");

      const gamesData = await gamesRes.json();
      setGames(gamesData);

      if (reviewsRes.ok) {
        const reviewsData = await reviewsRes.json();
        setReviewedGameIds(reviewsData.map(r => r.game_id));
      }
    } catch (err) {
      setError(err.message);
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
      const response = await fetch(`/api/games/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete game.");

      setGames(games.filter(game => game.id !== id));
      setReviewedGameIds(prev => prev.filter(gameId => gameId !== id));
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
        rawg_id: game.rawg_id
      };

      const response = await fetch(`/api/games/${game.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData)
      });

      if (!response.ok) throw new Error("Failed to update progress.");
      setGames(games.map(g => g.id === game.id ? { ...g, progress: newProgress } : g));

    } catch (err) {
      alert("Error updating status: " + err.message);
    }
  };

  const openReviewModal = async (game) => {
    setReviewModal({ isOpen: true, game });
    setReviewMsg(null);

    try {
      const res = await fetch(`/api/games/${game.id}/review`);
      if (res.ok) {
        const data = await res.json();
        setReviewForm({
          text: data.text, graphics: data.graphics,
          mechanics: data.mechanics, story: data.story, sound: data.sound
        });
        setIsUpdating(true);
      } else {
        setReviewForm({ text: "", graphics: 5, mechanics: 5, story: 5, sound: 5 });
        setIsUpdating(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const closeReviewModal = () => setReviewModal({ isOpen: false, game: null });

  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setReviewForm(prev => ({
      ...prev,
      [name]: name === "text" ? value : parseInt(value, 10)
    }));
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewMsg(null);
    const method = isUpdating ? "PUT" : "POST";

    try {
      const res = await fetch(`/api/games/${reviewModal.game.id}/review`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewForm)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Error saving review.");
      }

      setReviewMsg({ type: "success", text: "Review saved successfully!" });
      if (!isUpdating) setReviewedGameIds(prev => [...prev, reviewModal.game.id]);
      setTimeout(() => closeReviewModal(), 1500);
    } catch (err) {
      setReviewMsg({ type: "error", text: err.message });
    }
  };

  const handleDeleteReview = async () => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      const res = await fetch(`/api/games/${reviewModal.game.id}/review`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete review.");

      setReviewMsg({ type: "success", text: "Review deleted." });
      setReviewedGameIds(prev => prev.filter(id => id !== reviewModal.game.id));
      setTimeout(() => closeReviewModal(), 1500);
    } catch (err) {
      setReviewMsg({ type: "error", text: err.message });
    }
  };

  const availablePlatforms = ["All", ...new Set(games.map(g => g.platform))];

  const filteredGames = games.filter(game => {
    const matchStatus = filterStatus === "All" || game.progress === filterStatus;
    const matchPlatform = filterPlatform === "All" || game.platform === filterPlatform;
    return matchStatus && matchPlatform;
  });

  if (loading) return <div className="library-container"><h2 className="loading">Loading library...</h2></div>;
  if (error) return <div className="library-container"><h2 className="error">{error}</h2></div>;

  return (
    <div className="library-container">
      <h1 className="library-title">My Collection</h1>

      {games.length > 0 && (
        <div className="filters-bar">
          <div className="filter-group">
            <label>Filter by Status</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="Playing">Playing</option>
              <option value="Completed">Completed</option>
              <option value="Abandoned">Abandoned</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Filter by Platform</label>
            <select value={filterPlatform} onChange={(e) => setFilterPlatform(e.target.value)}>
              {availablePlatforms.map(platform => (
                <option key={platform} value={platform}>
                  {platform === "All" ? "All Platforms" : platform}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {games.length === 0 ? (
        <div className="empty-state">
          <p>Your library is empty. Time to add some games!</p>
        </div>
      ) : filteredGames.length === 0 ? (
        <div className="empty-state">
          <p>No games match your current filters.</p>
          <button className="cancel-btn" onClick={() => { setFilterStatus("All"); setFilterPlatform("All"); }}>
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="library-grid">
          {filteredGames.map(game => {
            const hasReview = reviewedGameIds.includes(game.id);

            return (
              <div key={game.id} className="library-card">
                <div className="card-header">
                  <h3>{game.title}</h3>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteGame(game.id)}
                    title="Remove from library"
                  >✕</button>
                </div>

                <div className="card-body">
                  <span className="lib-platform">{game.platform}</span>

                  <select
                    className={`lib-progress status-${game.progress.toLowerCase()}`}
                    value={game.progress}
                    onChange={(e) => handleProgressChange(game, e.target.value)}
                    title="Change progress status"
                  >
                    <option value="Playing">Playing</option>
                    <option value="Completed">Completed</option>
                    <option value="Abandoned">Abandoned</option>
                  </select>
                </div>

                <button
                  className={`review-trigger-btn ${hasReview ? 'has-review' : ''}`}
                  onClick={() => openReviewModal(game)}
                  style={hasReview ? { borderColor: '#4ade80', color: '#4ade80' } : {}}
                >
                  {hasReview ? "Edit Review ✎" : "Review Game ✎"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {reviewModal.isOpen && (
        <div className="modal-overlay" onClick={closeReviewModal}>
          <div className="modal-content review-modal" onClick={e => e.stopPropagation()}>
            <h2>{isUpdating ? "Edit Review" : "Write a Review"}</h2>
            <p className="modal-game-title">{reviewModal.game.title}</p>

            <form onSubmit={handleReviewSubmit} className="modal-form">
              <div className="form-group full-width">
                <label>Review Text</label>
                <textarea
                  name="text"
                  rows="4"
                  value={reviewForm.text}
                  onChange={handleReviewChange}
                  placeholder="What did you think about the game?"
                  required
                />
              </div>

              <div className="scores-grid">
                {["graphics", "mechanics", "story", "sound"].map(category => (
                  <div className="score-group" key={category}>
                    <label>{category.charAt(0).toUpperCase() + category.slice(1)}: <span>{reviewForm[category]}</span></label>
                    <input
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
                <p className={reviewMsg.type === "success" ? "success-msg" : "error-msg"}>
                  {reviewMsg.text}
                </p>
              )}

              <div className="modal-actions review-actions">
                {isUpdating && (
                  <button type="button" className="delete-review-btn" onClick={handleDeleteReview}>
                    Delete Review
                  </button>
                )}
                <div className="right-actions">
                  <button type="button" className="cancel-btn" onClick={closeReviewModal}>Cancel</button>
                  <button type="submit" className="submit-btn">Save Review</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}