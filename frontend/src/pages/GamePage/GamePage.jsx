import React, { useState, useCallback, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import GameScene from "./GameScene.jsx";
import "./GamePage.css";

export default function GamePage() {
  const playerRef = useRef();
  const [gameState, setGameState] = useState("playing"); // playing | paused | puzzle
  const [showPuzzle, setShowPuzzle] = useState(false);
  const [puzzle, setPuzzle] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [error, setError] = useState("");

  // --- Handle crash from GameScene ---
  const handleCollision = useCallback(async () => {
    setGameState("puzzle");
    setShowPuzzle(true);
    try {
      const response = await fetch(
        "https://marcconrad.com/uob/heart/api.php?out=json"
      );
      const data = await response.json();
      setPuzzle(data);
      console.log("🧩 Puzzle loaded:", data);
    } catch (err) {
      console.error("❌ Error fetching puzzle:", err);
    }
  }, []);

  const handleCheckAnswer = () => {
    if (!puzzle) return;
    if (parseInt(userAnswer) === parseInt(puzzle.solution)) {
      setShowPuzzle(false);
      setUserAnswer("");
      setError("");
      setGameState("playing");
    } else {
      setError("Wrong answer! Try again or quit.");
    }
  };

  const handleQuit = () => {
    window.location.href = "/";
  };

  return (
    <div className="game-container">
      {/* 3D Game */}
      <Canvas camera={{ position: [0, 12, 20], fov: 55 }}>
        <GameScene
          playerRef={playerRef}
          gameState={gameState}
          onCollision={handleCollision}
        />
      </Canvas>

      {/* Puzzle Overlay */}
      {showPuzzle && puzzle && (
        <div className="puzzle-overlay">
          <div className="puzzle-modal">
            <h2>💥 You Crashed! Solve to Continue</h2>

            <div className="puzzle-image-container">
              <img
                src={puzzle.question}
                alt="Heart Puzzle"
                className="puzzle-image"
              />
            </div>

            <p className="puzzle-question">What is the missing value?</p>

            <div className="puzzle-input-group">
              <input
                type="number"
                placeholder="Your answer..."
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
              />
              <button onClick={handleCheckAnswer}>Submit</button>
            </div>

            {error && <p className="error-text">{error}</p>}

            <button className="quit-button" onClick={handleQuit}>
              Quit Game
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
