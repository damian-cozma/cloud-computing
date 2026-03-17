import React, { useState, useEffect } from "react";
import "./Sessions.css";

export default function Sessions() {
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingSessionId, setEditingSessionId] = useState(null);

  const [sessionForm, setSessionForm] = useState({
    date: new Date().toISOString().split('T')[0],
    duration_minutes: 60
  });

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await fetch("/api/games/");
        if (res.ok) {
          const data = await res.json();
          setGames(data);
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
      }
    } catch (err) {
      console.error("Failed to load sessions:", err);
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
          body: JSON.stringify(sessionForm)
        });

        if (!res.ok) throw new Error("Failed to update session");
        const updatedSession = await res.json();

        setSessions(prev => prev.map(s => s.id === editingSessionId ? updatedSession : s)
                                .sort((a, b) => new Date(b.date) - new Date(a.date)));
      } else {
        const res = await fetch(`/api/games/${selectedGame.id}/sessions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sessionForm)
        });

        if (!res.ok) throw new Error("Failed to add session");
        const newSession = await res.json();

        setSessions(prev => [newSession, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date)));
      }

      resetForm();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm("Delete this session?")) return;

    try {
      const res = await fetch(`/api/sessions/${sessionId}`, { method: "DELETE" }); //
      if (!res.ok) throw new Error("Failed to delete session");

      setSessions(prev => prev.filter(s => s.id !== sessionId));

      if (editingSessionId === sessionId) resetForm();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEditClick = (session) => {
    setEditingSessionId(session.id);
    setSessionForm({
      date: session.date,
      duration_minutes: session.duration_minutes
    });
  };

  const resetForm = () => {
    setEditingSessionId(null);
    setSessionForm({
      date: new Date().toISOString().split('T')[0],
      duration_minutes: 60
    });
  };

  if (loading) return <div className="sessions-page"><h2 className="loading">Loading games...</h2></div>;

  return (
    <div className="sessions-page">
      <h1 className="sessions-title">Playtime Tracking</h1>

      <div className="sessions-container">
        <div className="games-sidebar">
          <h3>Select a Game</h3>
          {games.length === 0 ? (
            <p className="text-muted">No games in library.</p>
          ) : (
            <div className="games-list">
              {games.map(game => (
                <button
                  key={game.id}
                  className={`game-select-btn ${selectedGame?.id === game.id ? 'active' : ''}`}
                  onClick={() => handleSelectGame(game)}
                >
                  <span className="game-name">{game.title}</span>
                  <span className="game-platform">{game.platform}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* MAIN AREA */}
        <div className="sessions-main">
          {!selectedGame ? (
            <div className="no-selection">
              <p>Select a game from the list to view or log sessions.</p>
            </div>
          ) : (
            <>
              <h2>{selectedGame.title}</h2>

              <div className={`log-session-box ${editingSessionId ? 'editing-mode' : ''}`}>
                <h3>{editingSessionId ? "Edit Session" : "Log New Session"}</h3>
                <form onSubmit={handleSaveSession} className="session-form">
                  <div className="form-group">
                    <label>Date</label>
                    <input
                      type="date"
                      value={sessionForm.date}
                      max={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setSessionForm({...sessionForm, date: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Duration (Minutes)</label>
                    <input
                      type="number"
                      min="1"
                      value={sessionForm.duration_minutes}
                      onChange={(e) => setSessionForm({...sessionForm, duration_minutes: parseInt(e.target.value) || 0})}
                      required
                    />
                  </div>

                  <div className="form-actions">
                    {editingSessionId && (
                      <button type="button" className="cancel-edit-btn" onClick={resetForm}>
                        Cancel
                      </button>
                    )}
                    <button type="submit" className="submit-btn session-btn">
                      {editingSessionId ? "Update" : "Add Session"}
                    </button>
                  </div>
                </form>
              </div>

              <div className="session-history">
                <h3>History</h3>
                {sessions.length === 0 ? (
                  <p className="text-muted">No sessions logged yet.</p>
                ) : (
                  <div className="history-list">
                    {sessions.map(session => (
                      <div key={session.id} className={`session-card ${editingSessionId === session.id ? 'being-edited' : ''}`}>
                        <div className="session-info">
                          <span className="session-date">📅 {session.date}</span>
                          <span className="session-duration">⏱️ {session.duration_minutes} mins</span>
                        </div>

                        <div className="session-actions">
                          <button
                            className="edit-btn"
                            onClick={() => handleEditClick(session)}
                            title="Edit Session"
                          >✎</button>

                          <button
                            className="delete-btn"
                            onClick={() => handleDeleteSession(session.id)}
                            title="Delete Session"
                          >✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}