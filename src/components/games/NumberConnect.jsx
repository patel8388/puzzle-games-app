import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { RotateCcw, Lightbulb, Home } from 'lucide-react';

const NumberConnect = ({ level = 1, onLevelComplete, onBack }) => {
  const getGridSize = (levelNum) => {
    if (levelNum <= 10) return 5; // 5x5
    if (levelNum <= 25) return 7; // 7x7
    return 9; // 9x9
  };

  const generatePuzzle = (size) => {
    const grid = Array(size).fill(null).map(() => Array(size).fill(0));
    const pairs = [];
    const numbers = Array.from({ length: Math.floor(size * size / 5) }, (_, i) => i + 1);
    
    // Place numbers randomly
    numbers.forEach(num => {
      let placed = 0;
      while (placed < 2) { // Place two instances of each number
        const r = Math.floor(Math.random() * size);
        const c = Math.floor(Math.random() * size);
        if (grid[r][c] === 0) {
          grid[r][c] = num;
          pairs.push({ num, r, c });
          placed++;
        }
      }
    });

    return { grid, pairs };
  };

  const [gameState, setGameState] = useState(() => {
    const size = getGridSize(level);
    const { grid, pairs } = generatePuzzle(size);
    return {
      grid,
      size,
      pairs,
      paths: {},
      selectedStart: null,
      moves: 0,
      completed: false,
      hint: false,
    };
  });

  const isValidMove = (r1, c1, r2, c2, num) => {
    // Check if move is within bounds
    if (r2 < 0 || r2 >= gameState.size || c2 < 0 || c2 >= gameState.size) return false;
    // Check if target cell is empty or the other end of the current path
    const targetCell = gameState.grid[r2][c2];
    const isPathCell = gameState.paths[num]?.some(p => p.r === r2 && p.c === c2);
    return targetCell === 0 || (targetCell === num && !isPathCell);
  };

  const handleMouseDown = (r, c, num) => {
    if (gameState.completed || num === 0) return;
    const startPair = gameState.pairs.find(p => p.r === r && p.c === c && p.num === num);
    if (startPair) {
      setGameState(prev => ({
        ...prev,
        selectedStart: { r, c, num },
        paths: { ...prev.paths, [num]: [{ r, c }] }, // Start new path
      }));
    }
  };

  const handleMouseEnter = (r, c) => {
    if (!gameState.selectedStart || gameState.completed) return;

    const { r: prevR, c: prevC, num } = gameState.selectedStart;
    const currentPath = gameState.paths[num];
    const lastPoint = currentPath[currentPath.length - 1];

    // Only allow adjacent moves (horizontal or vertical)
    const isAdjacent = (Math.abs(r - lastPoint.r) + Math.abs(c - lastPoint.c) === 1);

    if (isAdjacent && isValidMove(lastPoint.r, lastPoint.c, r, c, num)) {
      setGameState(prev => ({
        ...prev,
        paths: { ...prev.paths, [num]: [...currentPath, { r, c }] },
      }));
    }
  };

  const handleMouseUp = () => {
    if (!gameState.selectedStart || gameState.completed) return;

    const { num } = gameState.selectedStart;
    const currentPath = gameState.paths[num];
    const endPoint = currentPath[currentPath.length - 1];

    const otherEnd = gameState.pairs.find(p => p.num === num && !(p.r === gameState.selectedStart.r && p.c === gameState.selectedStart.c));

    if (endPoint.r === otherEnd.r && endPoint.c === otherEnd.c) {
      // Path completed
      setGameState(prev => ({
        ...prev,
        selectedStart: null,
        moves: prev.moves + 1,
      }));
      checkCompletion();
    } else {
      // Path not completed, reset if not valid
      setGameState(prev => ({
        ...prev,
        selectedStart: null,
        paths: { ...prev.paths, [num]: [currentPath[0]] }, // Reset path to just the start point
      }));
    }
  };

  const checkCompletion = () => {
    const allConnected = gameState.pairs.every(pair => {
      const path = gameState.paths[pair.num];
      if (!path || path.length < 2) return false;
      const otherEnd = gameState.pairs.find(p => p.num === pair.num && !(p.r === path[0].r && p.c === path[0].c));
      return path[path.length - 1].r === otherEnd.r && path[path.length - 1].c === otherEnd.c;
    });

    if (allConnected) {
      setGameState(prev => ({ ...prev, completed: true }));
      setTimeout(() => onLevelComplete(), 1500);
    }
  };

  const resetGame = () => {
    const size = getGridSize(level);
    const { grid, pairs } = generatePuzzle(size);
    setGameState({
      grid,
      size,
      pairs,
      paths: {},
      selectedStart: null,
      moves: 0,
      completed: false,
      hint: false,
    });
  };

  const showHint = () => {
    setGameState(prev => ({ ...prev, hint: !prev.hint }));
  };

  const getPathColor = (num) => {
    const colors = [
      '#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#f97316', '#14b8a6', '#6b7280', '#ec4899'
    ];
    return colors[(num - 1) % colors.length];
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
            <h1 className="text-3xl font-bold text-white mb-1">🔗 Number Connect</h1>
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
              {gameState.hint ? "💡 Connect matching numbers by drawing paths. Paths cannot cross!" : "Connect all matching numbers"}
            </p>
          </div>
        </div>

        {/* Game Board */}
        <div className="flex justify-center mb-8">
          <div className="bg-white bg-opacity-10 p-4 rounded-xl shadow-2xl backdrop-blur-sm">
            <div
              className="grid gap-0.5"
              style={{
                gridTemplateColumns: `repeat(${gameState.size}, 1fr)`,
                gridTemplateRows: `repeat(${gameState.size}, 1fr)`,
              }}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp} // End path if mouse leaves grid
            >
              {gameState.grid.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`w-12 h-12 flex items-center justify-center text-xl font-bold rounded-lg
                      ${cell !== 0 ? `bg-[${getPathColor(cell)}] text-white` : 'bg-gray-300'}
                      ${gameState.paths[cell]?.some(p => p.r === rowIndex && p.c === colIndex) ? `bg-[${getPathColor(cell)}]` : ''}
                    `}
                    onMouseDown={() => handleMouseDown(rowIndex, colIndex, cell)}
                    onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                  >
                    {cell !== 0 ? cell : ''}
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
              <p className="text-lg">You connected all numbers in {gameState.moves} moves!</p>
              <div className="mt-4 text-3xl">⭐⭐⭐</div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-center mt-8">
          <div className="bg-white bg-opacity-10 rounded-lg p-4 max-w-2xl mx-auto backdrop-blur-sm">
            <h3 className="text-white font-semibold mb-2">How to Play:</h3>
            <p className="text-blue-200 text-sm">
              Click and drag from one number to its matching pair to draw a path. Paths cannot cross or go through other numbers. Fill the entire grid to win.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NumberConnect;


