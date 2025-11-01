import React, { useEffect, useState } from "react";
import { getLeaderboard } from "../../api/apiService";
import "./LeaderboardPage.css";

export default function LeaderboardPage() {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    async function loadScores() {
      try {
        const data = await getLeaderboard();
        setScores(data);
      } catch (err) {
        console.error("Error loading leaderboard:", err);
      }
    }
    loadScores();
  }, []);

  return (
    <div className="leaderboard-page">
      <h1>🏆 Leaderboard</h1>
      <table className="leaderboard-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Player</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {scores.map((entry, i) => (
            <tr key={entry._id}>
              <td>{i + 1}</td>
              <td>{entry.username}</td>
              <td>{entry.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
