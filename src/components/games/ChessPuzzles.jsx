import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { RotateCcw, Lightbulb, Home } from 'lucide-react';

const ChessPuzzles = ({ level = 1, onLevelComplete, onBack }) => {
  const puzzles = [
    // Level 1: Basic checkmate in 1
    {
      id: 1,
      fen: '8/8/8/8/8/8/R1k5/K7 w - - 0 1', // White Rook on a2, Black King on c2, White King on a1
      solution: 'Ra2a1', // Example: Rook moves from a2 to a1 (checkmate)
      hint: 'Look for a checkmate in one move with the Rook.',
    },
    // Level 2: Another basic checkmate in 1
    {
      id: 2,
      fen: '8/8/8/8/8/8/1K6/1R6 w - - 0 1', // White Rook on b1, White King on b2
      solution: 'Rb1b8', // Example: Rook moves from b1 to b8 (checkmate)
      hint: 'Can the Rook deliver checkmate on the back rank?',
    },
    // Level 3: Simple fork
    {
      id: 3,
      fen: '8/8/8/8/8/3k4/8/3N4 w - - 0 1', // White Knight on d1, Black King on d3
      solution: 'Nd1f2', // Example: Knight moves from d1 to f2 (forks king and another piece, if present)
      hint: 'Look for a move that attacks two pieces at once.',
    },
    // Add more puzzles as needed for higher levels
  ];

  const [currentPuzzle, setCurrentPuzzle] = useState(null);
  const [userMove, setUserMove] = useState('');
  const [message, setMessage] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);

  useEffect(() => {
    loadPuzzle(level);
  }, [level]);

  const loadPuzzle = (levelNum) => {
    const puzzle = puzzles.find(p => p.id === levelNum) || puzzles[0]; // Fallback to first puzzle
    setCurrentPuzzle(puzzle);
    setUserMove('');
    setMessage('');
    setGameOver(false);
    setHintVisible(false);
  };

  const handleSubmitMove = () => {
    if (!currentPuzzle) return;

    if (userMove.trim() === currentPuzzle.solution) {
      setMessage('Correct! Puzzle solved!');
      setGameOver(true);
      setTimeout(() => onLevelComplete(), 1500);
    } else {
      setMessage('Incorrect move. Try again!');
    }
  };

  const resetPuzzle = () => {
    loadPuzzle(level);
  };

  const showHint = () => {
    setHintVisible(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-700 to-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button onClick={onBack} variant="outline" className="text-white border-white hover:bg-white hover:text-black">
            <Home className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-1">♞ Chess Puzzles</h1>
            <p className="text-gray-200">Level {level}</p>
          </div>
          <div className="flex space-x-2">
            <Button onClick={showHint} variant="outline" size="sm" className="text-white border-white hover:bg-yellow-500">
              <Lightbulb className="w-4 h-4" />
            </Button>
            <Button onClick={resetPuzzle} variant="outline" size="sm" className="text-white border-white hover:bg-blue-500">
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Game Content */}
        <div className="text-center mb-6">
          <div className="bg-white bg-opacity-20 rounded-lg p-4 inline-block backdrop-blur-sm">
            <p className="text-gray-200 text-sm mt-2">
              {hintVisible ? currentPuzzle?.hint : "Solve the chess puzzle!"}
            </p>
          </div>
        </div>

        {/* Chess Board Placeholder (replace with actual chess board component) */}
        <div className="flex justify-center mb-8">
          <div className="w-96 h-96 bg-gray-800 rounded-lg flex items-center justify-center text-white text-xl">
            Chess Board Placeholder (FEN: {currentPuzzle?.fen})
          </div>
        </div>

        {/* User Input */}
        <div className="flex justify-center mb-4">
          <input
            type="text"
            className="p-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your move (e.g., e2e4)"
            value={userMove}
            onChange={(e) => setUserMove(e.target.value)}
            disabled={gameOver}
          />
          <Button onClick={handleSubmitMove} className="ml-2 bg-blue-500 hover:bg-blue-600 text-white" disabled={gameOver}>
            Submit
          </Button>
        </div>

        {/* Message */}
        {message && (
          <div className="text-center text-lg font-semibold text-white mb-4">
            {message}
          </div>
        )}

        {/* Win Message */}
        {gameOver && (
          <div className="text-center">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6 rounded-xl inline-block shadow-2xl border-4 border-white">
              <div className="text-4xl mb-2">🎉</div>
              <h2 className="text-2xl font-bold mb-2">Puzzle Solved!</h2>
              <p className="text-lg">You found the correct move!</p>
              <div className="mt-4 text-3xl">⭐⭐⭐</div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-center mt-8">
          <div className="bg-white bg-opacity-10 rounded-lg p-4 max-w-2xl mx-auto backdrop-blur-sm">
            <h3 className="text-white font-semibold mb-2">How to Play:</h3>
            <p className="text-gray-200 text-sm">
              Analyze the chess position and enter the correct move to solve the puzzle. Moves are in algebraic notation (e.g., e2e4).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChessPuzzles;


