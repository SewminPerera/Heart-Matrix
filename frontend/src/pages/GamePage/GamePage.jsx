import React, {Suspense, useRef, useState, useCallback, useEffect,} from "react";
import { Canvas } from "@react-three/fiber";
import { useLocation, useNavigate } from "react-router-dom";
import GameScene from "./GameScene";
import PuzzleModal from "./PuzzleModal";
import "./GamePage.css";
import { submitScore } from "../../api/apiService";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useSound } from "../../contexts/SoundContext.jsx";

export default function GamePage() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const initialDifficulty = location.state?.difficulty || "easy";
  const [difficulty] = useState(initialDifficulty);
  const [gameState, setGameState] = useState("playing");
  const [puzzle, setPuzzle] = useState(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [modalView, setModalView] = useState(null);
  const playerRef = useRef();
  const audioRef = useRef(null);
  const { isMuted, toggleMute } = useSound();

  useEffect(() => {
    const audio = new Audio("/sounds/ambient.mp3");
    audio.loop = true;
    audio.volume = 0.2;
    audio.muted = isMuted;
    audioRef.current = audio;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {})
        .catch((error) => {
          console.warn("Audio autoplay was blocked. Waiting for user click.");
          const playOnFirstClick = () => {
            audio.play().catch(err => console.error("Audio failed to play after click:", err));
            window.removeEventListener("click", playOnFirstClick);
          };
          window.addEventListener("click", playOnFirstClick);
          return () => {
            window.removeEventListener("click", playOnFirstClick);
          };
        });
    }

    return () => {
      if (audio) {
        audio.pause();
        audio.src = "";
        audioRef.current = null;
      }
    };
  }, []);

  // mute toggle 
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // puzzle fetch
  const fetchHeartPuzzle = async () => {
    try {
      const res = await fetch("https://marcconrad.com/uob/heart/api.php");
      const data = await res.json();
      setPuzzle(data);
    } catch (err) {
      console.error("Puzzle fetch failed:", err);
    }
  };

  // scoring step
  const handleStepScore = useCallback(
    (fromType, toType) => {
      if (gameState !== "playing") return;
      if (!fromType || !toType) return;
      if (fromType === "road" && (toType === "road" || toType === "grass")) {
        setScore((prev) => prev + 10);
      }
    },
    [gameState]
  );

  // scoring coin 
  const handleCoinPickup = useCallback(() => {
    if (gameState !== "playing") return;
    setScore((prev) => prev + 5);
  }, [gameState]);

  // update collison handler
  const handleCollision = useCallback(async () => {
    if (gameState !== "playing") return;

    setGameState("crashed");
    setModalView("crashed_prompt"); 

    if (!user?.token) {
      console.warn("No token, cannot submit score");
      return;
    }

    try {
      await submitScore(user.token, score);
      await fetch("http://localhost:8080/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          username: user.username,
          score,
          difficulty: difficulty,
        }),
      });
      setHighScore((prev) => (score > prev ? score : prev));
    } catch (err) {
      console.error("Failed to submit score:", err);
    }
  }, [gameState, score, user, difficulty]);

  const handleShowPuzzle = () => {
    fetchHeartPuzzle();
    setModalView("puzzle_prompt"); 
  };

  // update puzzle solved
  const handlePuzzleSolved = useCallback(() => {
    setPuzzle(null);
    setModalView(null);
    setScore(0);
    setGameState("playing");
    if (playerRef.current?.resetPosition) {
      playerRef.current.resetPosition();
    }
  }, []);

  // update quit game
  const handleQuit = useCallback(() => {
    setPuzzle(null);
    setModalView(null); 
    setGameState("stopped");
    navigate("/");
  }, [navigate]);

  useEffect(() => {
  }, []);

  return (
    <div className="game-container">
      <div className="game-hud">
        <div>Score: {score}</div>
        <div>High Score: {highScore}</div>
        <div>Mode: {difficulty}</div>
      </div>
      <button onClick={toggleMute} className="mute-btn">
        {isMuted ? "🔇" : "🔊"}
      </button>

      <Canvas
        shadows
        camera={{
          position: [12, 14, 18],
          fov: 50,
          near: 0.1,
          far: 200,
        }}
      >
        <Suspense fallback={null}>
          <GameScene
            gameState={gameState}
            difficulty={difficulty}
            onCollision={handleCollision}
            onCoinPickup={handleCoinPickup}
            onStepScore={handleStepScore}
            playerRef={playerRef}
          />
        </Suspense>
      </Canvas>

      {gameState === "crashed" && modalView && (
        <PuzzleModal
          view={modalView}
          puzzle={puzzle}
          onSolve={handlePuzzleSolved}
          onQuit={handleQuit}
          onShowPuzzle={handleShowPuzzle} 
        />
      )}
    </div>
  );
}