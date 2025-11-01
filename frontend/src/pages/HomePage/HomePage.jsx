import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";

export default function HomePage() {
  const [nickname, setNickname] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Get the user object saved after login
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser && storedUser.username) {
      setNickname(storedUser.username); // ✅ set nickname to user's username
    }
  }, []);

  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="home-title">
          {nickname ? `Welcome, ${nickname}` : "Welcome!"}
        </h1>
        <button className="play-button" onClick={() => navigate("/game")}>
          Play
        </button>
      </div>
    </div>
  );
}
