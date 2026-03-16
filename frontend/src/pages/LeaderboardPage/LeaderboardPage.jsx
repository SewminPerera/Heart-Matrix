import { useEffect, useState } from "react";
import "./LeaderboardPage.css"; 

export default function LeaderboardPage() {
  const [rows, setRows] = useState([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState("easy");

  useEffect(() => {
    const API = import.meta.env.VITE_API_BASE || "http://localhost:8080/api";

    function load() {
      fetch(`${API}/scores?difficulty=${selectedDifficulty}`)
        .then((r) => (r.ok ? r.json() : []))
        .then(setRows)
        .catch(() => setRows([]));
    }

    load();
    const interval = setInterval(load, 2000); 

    return () => clearInterval(interval);
  
  }, [selectedDifficulty]); 

  return (
    <div className="lb-wrap">
      <div className="lb-sky">
        <div className="cloud" />
        <div className="cloud slow" />
      </div>

      <div className="lb-card">
        <h1 className="lb-title">Leaderboard</h1>
        <div className="lb-tabs">
          <button
            className={`lb-tab ${selectedDifficulty === 'easy' ? 'active' : ''}`}
            onClick={() => setSelectedDifficulty('easy')}
          >
            Easy
          </button>
          <button
            className={`lb-tab ${selectedDifficulty === 'medium' ? 'active' : ''}`}
            onClick={() => setSelectedDifficulty('medium')}
          >
            Medium
          </button>
          <button
            className={`lb-tab ${selectedDifficulty === 'hard' ? 'active' : ''}`}
            onClick={() => setSelectedDifficulty('hard')}
          >
            Hard
          </button>
        </div>
        
        <div className="lb-table">
          {rows.length === 0 && <p className="muted">No scores yet for this difficulty</p>}
          {rows.map((r, i) => (
            <div className="lb-row" key={r._id || i}>
              <span className="pos">{i + 1}</span>
              <img
                className="ava"
                src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(
                  r.username || "Player"
                )}`}
                alt=""
              />
              <span className="name">{r.username ?? "Player"}</span>
              <strong className="score">{r.score ?? 0}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="lb-ground" />
    </div>
  );
}