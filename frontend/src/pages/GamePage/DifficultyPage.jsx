import React from "react";
import "./DifficultyPage.css";
import { useNavigate } from "react-router-dom";
import easyImg from "../../assets/DifficultyPage/easy.png";
import mediumImg from "../../assets/DifficultyPage/medium.png";
import hardImg from "../../assets/DifficultyPage/hard.png";

const DIFFICULTY_SETTINGS = {
  easy: {
    roadChance: 0.4,
    speedMin: 1.2,
    speedMax: 2.0,
    carCountMin: 1,
    carCountMax: 2,
    coinChance: 0.6,
  },
  medium: {
    roadChance: 0.55,
    speedMin: 1.8,
    speedMax: 2.8,
    carCountMin: 2,
    carCountMax: 3,
    coinChance: 0.5,
  },
  hard: {
    roadChance: 0.7,
    speedMin: 2.4,
    speedMax: 3.6,
    carCountMin: 2,
    carCountMax: 4,
    coinChance: 0.45,
  },
};


export default function DifficultyPage() {
  const navigate = useNavigate();

  const selectDifficulty = (level) => {
    navigate("/game", { state: { difficulty: level } });
  };

  return (
    <div className="df-wrap">
      {/* Background sky */}
      <div className="df-sky">
        <div className="df-cloud c1" />
        <div className="df-cloud c2" />
        <div className="df-cloud c3" />
      </div>

      {/* Page title */}
      <h1 className="df-title">
        Choose <span>Difficulty</span>
      </h1>
      <div className="df-cards">
        <div className="df-card" onClick={() => selectDifficulty("easy")}>
          <img src={easyImg} alt="easy" className="df-img" />
        </div>

        <div className="df-card" onClick={() => selectDifficulty("medium")}>
          <img src={mediumImg} alt="medium" className="df-img" />
        </div>

        <div className="df-card" onClick={() => selectDifficulty("hard")}>
          <img src={hardImg} alt="hard" className="df-img" />
        </div>
      </div>

      <div className="df-coin coin-1" />
      <div className="df-coin coin-2" />
      <div className="df-coin coin-3" />
      <div className="df-ground" />
    </div>
  );
}
