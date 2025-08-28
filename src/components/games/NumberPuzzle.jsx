import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { RotateCcw, Lightbulb, Home } from 'lucide-react';

const NumberPuzzle = ({ level = 1, onLevelComplete, onBack }) => {
  const getGridSize = (levelNum) => {
    if (levelNum <= 10) return 5; // 5x5
    if (levelNum <= 25) return 6; // 6x6
    return 7; // 7x7
  };

  const generatePuzzle = (size) => {
    const grid = Array(size).fill(null).map(() => Array(size).fill(0));
    const numbers = Array.from({ length: size * size }, (_, i) => i + 1);
    let shuffledNumbers = numbers.sort(() => Math.random() - 0.5);

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        grid[r][c] = shuffledNumbers.pop();
      }
    }
    return grid;
  };

  const [gameState, setGameState] = useState(() => {
    const size = getGridSize(level);
    return {
      grid: generatePuzzle(size),
      size,
      moves: 0,
      completed: false,
      hint: false,
    };
  });

  const checkCompletion = (currentGrid) => {
    for (let r = 0; r < gameState.size; r++) {
      for (let c = 0; c < gameState.size; c++) {
        if (currentGrid[r][c] !== (r * gameState.size + c + 1)) {
          return false;
        }
      }
    }
    return true;
  };

  const handleCellClick = (row, col) => {
    if (gameState.completed) return;

    // Implement game logic here (e.g., swap with adjacent empty cell, or other puzzle mechanics)
    // For now, let's just simulate a move
    setGameState(prev => ({
      ...prev,
      moves: prev.moves + 1,
    }));

    // Simulate completion for testing
    if (gameState.moves >= 5) { // After 5 moves, simulate completion
      setGameState(prev => ({ ...prev, completed: true }));
      setTimeout(() => onLevelComplete(), 1500);
    }
  };

  const resetGame = () => {
    const size = getGridSize(level);
    setGameState({
      grid: generatePuzzle(size),
      size,
      moves: 0,
      completed: false,
      hint: false,
    });
  };

  const showHint = () => {
    setGameState(prev => ({ ...prev, hint: !prev.hint }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-700 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button onClick={onBack} variant="outline" className="text-white border-white hover:bg-white hover:text-black">
            <Home className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-1">🔢 Number Puzzle</h1>
            <p className="text-blue-200">Level {level} - {gameState.size}x{gameState.size} Grid</p>
          </div>
          <div className="flex space-x-2">
            <Button onClick={showHint} variant="outline" size="sm" className="text-white border-white hover:bg-yellow-500">
              <Lightbulb className="w-4 h-4" />
            </Button>
            <Button onClick={resetGame} variant="outline" size="sm" className="text-white border-white hover:bg-blue-500">
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Game Stats */}
        <div className="text-center mb-6">
          <div className="bg-white bg-opacity-20 rounded-lg p-4 inline-block backdrop-blur-sm">
            <div className="flex items-center justify-center space-x-6 text-white">
              <div>
                <p className="text-lg font-semibold">Moves: {gameState.moves}</p>
              </div>
            </div>
            <p className="text-blue-200 text-sm mt-2">
              {gameState.hint ? "💡 Arrange the numbers in ascending order!" : "Arrange the numbers in ascending order"}
            </p>
          </div>
        </div>

        {/* Game Board */}
        <div className="flex justify-center mb-8">
          <div className="bg-white bg-opacity-10 p-4 rounded-xl shadow-2xl backdrop-blur-sm">
            <div
              className="grid gap-1"
              style={{
                gridTemplateColumns: `repeat(${gameState.size}, 1fr)`,
                gridTemplateRows: `repeat(${gameState.size}, 1fr)`,
              }}
            >
              {gameState.grid.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`w-16 h-16 flex items-center justify-center text-2xl font-bold rounded-lg
                      ${cell === (rowIndex * gameState.size + colIndex + 1) ? 'bg-green-500' : 'bg-blue-500'}
                      text-white cursor-pointer
                    `}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                  >
                    {cell}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Win Message */}
        {gameState.completed && (
          <div className="text-center">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6 rounded-xl inline-block shadow-2xl border-4 border-white">
              <div className="text-4xl mb-2">🎉</div>
              <h2 className="text-2xl font-bold mb-2">Level Complete!</h2>
              <p className="text-lg">You solved the puzzle in {gameState.moves} moves!</p>
              <div className="mt-4 text-3xl">⭐⭐⭐</div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-center mt-8">
          <div className="bg-white bg-opacity-10 rounded-lg p-4 max-w-2xl mx-auto backdrop-blur-sm">
            <h3 className="text-white font-semibold mb-2">How to Play:</h3>
            <p className="text-blue-200 text-sm">
              Click on numbers to move them. Arrange all numbers in ascending order from left to right, top to bottom.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NumberPuzzle;


