import React, { useState, useEffect } from "react";
import "./GamePage.css";

export default function PuzzleModal({
  view,
  puzzle,
  onSolve,
  onQuit,
  onShowPuzzle,
}) {
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");

  
  useEffect(() => {
    setAnswer("");
    setFeedback("");
  }, [puzzle]);

  if (view === "crashed_prompt") {
    return (
      <div className="overlay">
        <div className="modal">
          <h2 className="modal-title"><span>💥</span> You Crashed!</h2>
          <p className="modal-text">
            Solve a puzzle to continue playing.
          </p>
          <div className="modal-buttons">
            <button onClick={onShowPuzzle} className="submit-btn">
              Solve Puzzle
            </button>
            <button onClick={onQuit} className="quit-btn">
              Quit Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === "puzzle_prompt") {
    if (!puzzle) {
      return (
        <div className="overlay">
          <div className="modal">
            <h2 className="modal-title">Loading Puzzle...</h2>
          </div>
        </div>
      );
    }
    const handleSubmit = (e) => {
      e.preventDefault();
      const correct = parseInt(answer) === parseInt(puzzle.solution);
      if (correct) {
        setFeedback("✅ Correct! Continue...");
        setTimeout(onSolve, 800);
      } else {
        setFeedback("❌ Wrong answer! Try again.");
      }
    };

    // Render the puzzle
    return (
      <div className="overlay">
        <div className="modal">
         <h2 className="modal-title"><span>Solve</span> to Continue</h2>
          <div className="puzzle-box">
            <img
              src={puzzle.question}
              alt="Heart Puzzle"
              className="puzzle-image"
            />
          </div>

          <form className="puzzle-form" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Enter the missing value..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              required
            />
            <button type="submit" className="submit-btn">
              Submit
            </button>
          </form>

          {feedback && <p className="feedback">{feedback}</p>}

          <button onClick={onQuit} className="quit-btn">
            Quit Game
          </button>
        </div>
      </div>
    );
  }
  return null;
}