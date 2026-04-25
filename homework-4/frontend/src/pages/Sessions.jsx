import React, { useEffect, useMemo, useState } from "react";
import "./Sessions.css";

function formatDate(dateString) {
  if (!dateString) return "Unknown date";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString();
}

function formatHoursFromMinutes(minutes) {
  const value = Number(minutes) || 0;
  if (value < 60) return `${value} min`;

  const hours = Math.floor(value / 60);
  const remaining = value % 60;

  if (remaining === 0) return `${hours}h`;
  return `${hours}h ${remaining}m`;
}

export default function Sessions() {
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingSessionId, setEditingSessionId] = useState(null);

  const [sessionForm, setSessionForm] = useState({
    date: new Date().toISOString().split("T")[0],
    duration_minutes: 60,
  });

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await fetch("/api/games/");
        if (res.ok) {
          const data = await res.json();
          setGames(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to load games:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  const handleSelectGame = async (game) => {
    setSelectedGame(game);
    setEditingSessionId(null);
    resetForm();

    try {
      const res = await fetch(`/api/games/${game.id}/sessions`);
      if (res.ok) {
        const data = await res.json();
        data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setSessions(data);
      } else {
        setSessions([]);
      }
    } catch (err) {
      console.error("Failed to load sessions:", err);
      setSessions([]);
    }
  };

  const handleSaveSession = async (e) => {
    e.preventDefault();
    if (!selectedGame) return;

    try {
      if (editingSessionId) {
        const res = await fetch(`/api/sessions/${editingSessionId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sessionForm),
        });

        if (!res.ok) throw new Error("Failed to update session");
        const updatedSession = await res.json();

        setSessions((prev) =>
          prev
            .map((session) =>
              session.id === editingSessionId ? updatedSession : session
            )
            .sort((a, b) => new Date(b.date) - new Date(a.date))
        );
      } else {
        const res = await fetch(`/api/games/${selectedGame.id}/sessions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sessionForm),
        });

        if (!res.ok) throw new Error("Failed to add session");
        const newSession = await res.json();

        setSessions((prev) =>
          [newSession, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date))
        );
      }

      resetForm();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm("Delete this session?")) return;

    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete session");

      setSessions((prev) => prev.filter((session) => session.id !== sessionId));

      if (editingSessionId === sessionId) {
        resetForm();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEditClick = (session) => {
    setEditingSessionId(session.id);
    setSessionForm({
      date: session.date,
      duration_minutes: session.duration_minutes,
    });
  };

  const resetForm = () => {
    setEditingSessionId(null);
    setSessionForm({
      date: new Date().toISOString().split("T")[0],
      duration_minutes: 60,
    });
  };

  const totalMinutes = useMemo(() => {
    return sessions.reduce(
      (sum, session) => sum + (Number(session.duration_minutes) || 0),
      0
    );
  }, [sessions]);

  const totalSessions = sessions.length;
  const latestSession = sessions.length > 0 ? sessions[0] : null;

  if (loading) {
    return (
      <section className="sessions-page">
        <div className="sessions-loading">
          <div className="sessions-spinner" />
          <p>Loading your games...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="sessions-page">
      <div className="sessions-shell">
        <header className="sessions-header">
          <h1 className="sessions-title">Play Sessions</h1>
          <p className="sessions-subtitle">
            Track your playtime, update old sessions and keep a clean history for
            each game in your library.
          </p>
        </header>

        <div className="sessions-layout">
          <aside className="sessions-sidebar">
            <div className="sessions-sidebar-head">
              <h2>Your Games</h2>
              <p>Select a title to manage its sessions.</p>
            </div>

            {games.length === 0 ? (
              <div className="sessions-empty-small">
                <p>No games in library yet.</p>
              </div>
            ) : (
              <div className="sessions-games-list">
                {games.map((game) => (
                  <button
                    key={game.id}
                    className={`sessions-game-btn ${
                      selectedGame?.id === game.id ? "is-active" : ""
                    }`}
                    onClick={() => handleSelectGame(game)}
                  >
                    <div className="sessions-game-meta">
                      <span className="sessions-game-name">{game.title}</span>
                      <span className="sessions-game-platform">{game.platform}</span>
                    </div>

                    <span className="sessions-game-arrow">→</span>
                  </button>
                ))}
              </div>
            )}
          </aside>

          <main className="sessions-main">
            {!selectedGame ? (
              <div className="sessions-empty-state">
                <h2>No game selected</h2>
                <p>Choose a game from the left to log or edit sessions.</p>
              </div>
            ) : (
              <>
                <section className="sessions-hero-card">
                  <div className="sessions-hero-top">
                    <div>
                      <span className="sessions-eyebrow">Selected Game</span>
                      <h2>{selectedGame.title}</h2>
                      <p>{selectedGame.platform}</p>
                    </div>

                    <div className="sessions-status-chip">
                      {editingSessionId ? "Editing mode" : "Tracking active"}
                    </div>
                  </div>

                  <div className="sessions-overview-grid">
                    <article className="sessions-overview-card">
                      <span>Total Sessions</span>
                      <strong>{totalSessions}</strong>
                    </article>

                    <article className="sessions-overview-card">
                      <span>Total Playtime</span>
                      <strong>{formatHoursFromMinutes(totalMinutes)}</strong>
                    </article>

                    <article className="sessions-overview-card sessions-overview-card--accent">
                      <span>Latest Session</span>
                      <strong>
                        {latestSession ? formatDate(latestSession.date) : "None"}
                      </strong>
                    </article>
                  </div>
                </section>

                <section
                  className={`sessions-form-card ${
                    editingSessionId ? "is-editing" : ""
                  }`}
                >
                  <div className="sessions-section-head">
                    <h3>{editingSessionId ? "Edit Session" : "Log New Session"}</h3>
                    <p>
                      {editingSessionId
                        ? "Update the selected session below."
                        : "Add a new play session for this game."}
                    </p>
                  </div>

                  <form onSubmit={handleSaveSession} className="sessions-form">
                    <div className="sessions-form-group">
                      <label>Date</label>
                      <input
                        type="date"
                        value={sessionForm.date}
                        max={new Date().toISOString().split("T")[0]}
                        onChange={(e) =>
                          setSessionForm({
                            ...sessionForm,
                            date: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="sessions-form-group">
                      <label>Duration (Minutes)</label>
                      <input
                        type="number"
                        min="1"
                        value={sessionForm.duration_minutes}
                        onChange={(e) =>
                          setSessionForm({
                            ...sessionForm,
                            duration_minutes: parseInt(e.target.value, 10) || 0,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="sessions-form-actions">
                      {editingSessionId && (
                        <button
                          type="button"
                          className="sessions-secondary-btn"
                          onClick={resetForm}
                        >
                          Cancel
                        </button>
                      )}

                      <button type="submit" className="sessions-primary-btn">
                        {editingSessionId ? "Update Session" : "Add Session"}
                      </button>
                    </div>
                  </form>
                </section>

                <section className="sessions-history-card">
                  <div className="sessions-section-head">
                    <h3>Session History</h3>
                    <p>Your most recent sessions appear first.</p>
                  </div>

                  {sessions.length === 0 ? (
                    <div className="sessions-empty-small">
                      <p>No sessions logged yet.</p>
                    </div>
                  ) : (
                    <div className="sessions-history-list">
                      {sessions.map((session) => (
                        <article
                          key={session.id}
                          className={`sessions-history-item ${
                            editingSessionId === session.id ? "is-being-edited" : ""
                          }`}
                        >
                          <div className="sessions-history-main">
                            <div className="sessions-history-badges">
                              <span className="sessions-history-pill">
                                📅 {formatDate(session.date)}
                              </span>
                              <span className="sessions-history-pill sessions-history-pill--time">
                                ⏱️ {formatHoursFromMinutes(session.duration_minutes)}
                              </span>
                            </div>
                          </div>

                          <div className="sessions-history-actions">
                            <button
                              className="sessions-icon-btn"
                              onClick={() => handleEditClick(session)}
                              title="Edit Session"
                            >
                              ✎
                            </button>

                            <button
                              className="sessions-icon-btn sessions-icon-btn--danger"
                              onClick={() => handleDeleteSession(session.id)}
                              title="Delete Session"
                            >
                              ✕
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}
          </main>
        </div>
      </div>
    </section>
  );
}