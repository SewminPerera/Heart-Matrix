import React from 'react';
import './GamePage.css';

export default function PuzzleModal({ onSolve }) {
  return (
    <div className="ui-overlay">
      <div className="puzzle-modal" onClick={onSolve}>
        Play Puzzle to Retry
      </div>
    </div>
  );
}
