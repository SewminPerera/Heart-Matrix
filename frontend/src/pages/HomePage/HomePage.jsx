import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserProfile } from "../../api/apiService";
import "./HomePage.css";

export default function HomePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ gamesPlayed: 0, highScore: 0 });

  useEffect(() => {
    async function load() {
      const raw = localStorage.getItem("user");
      if (!raw) return;
      const parsed = JSON.parse(raw);

      try {
        const profile = await getUserProfile(parsed.token);
        setUser(profile);
        setStats({
          gamesPlayed: profile.gamesPlayed,
          highScore: profile.highScore,
        });
      } catch (err) {
        console.error("Failed loading profile", err);
      }
    }

    load();
  }, []);

  const displayName =
    user?.username || user?.nickname || user?.email?.split("@")[0] || "Player";

  const avatarUrl = useMemo(() => {
    const seed = displayName || "Player";
    return `https://api.dicebear.com/7.x/adventurer/svg?radius=50&seed=${encodeURIComponent(
      seed
    )}`;
  }, [displayName]);

  return (
    <div className="hm-wrap">
      <div className="hm-sky">
        <div className="hm-cloud c1" />
        <div className="hm-cloud c2" />
        <div className="hm-cloud c3" />
        <div className="hm-cloud c4" />
      </div>

      <div className="hm-content">
        <h1 className="hm-title">
          Welcome back,<br />
          <span>{displayName}</span>
        </h1>

        <section className="hm-middle">
          <article className="hm-card">
            <div className="hm-ava-wrap">
              <img src={avatarUrl} alt="avatar" className="hm-ava" />
            </div>

            <h2 className="hm-name">{displayName}</h2>

            <ul className="hm-stats">
              <li>
                <span>Games Played</span>
                <strong>{stats.gamesPlayed ?? 0}</strong>
              </li>
              <li>
                <span>High Score</span>
                <strong>{stats.highScore ?? 0}</strong>
              </li>
            </ul>

            <button className="hm-play" onClick={() => navigate("/play")}>
              <span className="tri">▶</span> Play Now
            </button>
          </article>
        </section>
      </div>

      <div className="coin coin-1" />
      <div className="coin coin-2" />
      <div className="coin coin-3" />

      <div className="hm-ground" />
    </div>
  );
}
