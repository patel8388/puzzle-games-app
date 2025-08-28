import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { RotateCcw, Lightbulb, Home } from 'lucide-react';

const WoodenBlocks = ({ level = 1, onLevelComplete, onBack }) => {
  const generateLevel = (levelNum) => {
    const gridSize = Math.min(8 + Math.floor(levelNum / 10), 12); // Grid size from 8x8 to 12x12
    const numShapes = Math.min(3 + Math.floor(levelNum / 5), 6); // Number of different shapes
    const targetScore = 100 + levelNum * 50; // Score needed to complete level

    const shapes = [
      [[1, 1], [1, 1]], // 2x2 square
      [[1, 1, 1, 1]], // 1x4 line
      [[1], [1], [1], [1]], // 4x1 line
      [[1, 1, 1], [0, 1, 0]], // T-shape
      [[1, 1, 0], [0, 1, 1]], // Z-shape
      [[0, 1, 1], [1, 1, 0]], // S-shape
      [[1, 1, 1]], // 1x3 line
      [[1], [1], [1]], // 3x1 line
      [[1, 1]], // 1x2 line
      [[1], [1]], // 2x1 line
      [[1]], // 1x1 block
    ];

    // Select a subset of shapes for the current level
    const availableShapes = shapes.slice(0, numShapes);

    return { gridSize, availableShapes, targetScore };
  };

  const [gameState, setGameState] = useState(() => {
    const levelData = generateLevel(level);
    const initialGrid = Array(levelData.gridSize).fill(null).map(() => Array(levelData.gridSize).fill(0));
    return {
      ...levelData,
      grid: initialGrid,
      currentShapes: [],
      score: 0,
      moves: 0,
      gameOver: false,
      completed: false,
      hint: false,
    };
  });

  // Function to generate new random shapes
  const generateNewShapes = () => {
    const newShapes = [];
    for (let i = 0; i < 3; i++) { // Generate 3 shapes at a time
      const randomShape = gameState.availableShapes[Math.floor(Math.random() * gameState.availableShapes.length)];
      newShapes.push(randomShape);
    }
    setGameState(prev => ({ ...prev, currentShapes: newShapes }));
  };

  useEffect(() => {
    if (gameState.currentShapes.length === 0 && !gameState.gameOver && !gameState.completed) {
      generateNewShapes();
    }
  }, [gameState.currentShapes, gameState.gameOver, gameState.completed]);

  const checkCollision = (grid, shape, row, col) => {
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[0].length; c++) {
        if (shape[r][c] === 1) {
          const gridRow = row + r;
          const gridCol = col + c;
          if (gridRow < 0 || gridRow >= gameState.gridSize || gridCol < 0 || gridCol >= gameState.gridSize || grid[gridRow][gridCol] !== 0) {
            return true; // Collision or out of bounds
          }
        }
      }
    }
    return false;
  };

  const placeShape = (grid, shape, row, col, value) => {
    const newGrid = grid.map(r => [...r]);
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[0].length; c++) {
        if (shape[r][c] === 1) {
          newGrid[row + r][col + c] = value;
        }
      }
    }
    return newGrid;
  };

  const clearLines = (grid) => {
    let linesCleared = 0;
    let newGrid = grid.map(r => [...r]);

    // Check rows
    for (let r = 0; r < gameState.gridSize; r++) {
      if (newGrid[r].every(cell => cell !== 0)) {
        newGrid[r].fill(0); // Clear row
        linesCleared++;
      }
    }

    // Check columns
    for (let c = 0; c < gameState.gridSize; c++) {
      let columnFull = true;
      for (let r = 0; r < gameState.gridSize; r++) {
        if (newGrid[r][c] === 0) {
          columnFull = false;
          break;
        }
      }
      if (columnFull) {
        for (let r = 0; r < gameState.gridSize; r++) {
          newGrid[r][c] = 0; // Clear column
        }
        linesCleared++;
      }
    }
    return { newGrid, linesCleared };
  };

  const handleDrop = (shapeIndex, row, col) => {
    const shape = gameState.currentShapes[shapeIndex];
    if (!shape) return;

    if (checkCollision(gameState.grid, shape, row, col)) {
      // Cannot place here
      return;
    }

    let newGrid = placeShape(gameState.grid, shape, row, col, 1); // Place the shape
    const { newGrid: clearedGrid, linesCleared } = clearLines(newGrid);

    const newScore = gameState.score + shape.flat().filter(b => b === 1).length * 10 + linesCleared * 100;
    const newMoves = gameState.moves + 1;

    const updatedShapes = gameState.currentShapes.filter((_, idx) => idx !== shapeIndex);

    setGameState(prev => ({
      ...prev,
      grid: clearedGrid,
      score: newScore,
      moves: newMoves,
      currentShapes: updatedShapes,
    }));

    // Check if level completed
    if (newScore >= gameState.targetScore) {
      setGameState(prev => ({ ...prev, completed: true }));
      setTimeout(() => onLevelComplete(), 1500);
    }

    // Check for game over (no more moves possible with remaining shapes)
    if (updatedShapes.length === 0) {
      generateNewShapes(); // Try to generate new shapes
    } else {
      // Check if any remaining shape can be placed
      const canPlaceAny = updatedShapes.some(s => {
        for (let r = 0; r < gameState.gridSize; r++) {
          for (let c = 0; c < gameState.gridSize; c++) {
            if (!checkCollision(clearedGrid, s, r, c)) {
              return true;
            }
          }
        }
        return false;
      });
      if (!canPlaceAny) {
        setGameState(prev => ({ ...prev, gameOver: true }));
      }
    }
  };

  const resetGame = () => {
    const levelData = generateLevel(level);
    const initialGrid = Array(levelData.gridSize).fill(null).map(() => Array(levelData.gridSize).fill(0));
    setGameState({
      ...levelData,
      grid: initialGrid,
      currentShapes: [],
      score: 0,
      moves: 0,
      gameOver: false,
      completed: false,
      hint: false,
    });
  };

  const showHint = () => {
    setGameState(prev => ({ ...prev, hint: !prev.hint }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-700 to-yellow-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button onClick={onBack} variant="outline" className="text-white border-white hover:bg-white hover:text-black">
            <Home className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-1">🪵 Wooden Blocks</h1>
            <p className="text-amber-200">Level {level}</p>
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
                <p className="text-lg font-semibold">Score: {gameState.score}</p>
                <p className="text-sm">Target: {gameState.targetScore}</p>
              </div>
              <div>
                <p className="text-lg font-semibold">Moves: {gameState.moves}</p>
              </div>
            </div>
            <div className="mt-2">
              <div className="w-64 bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-yellow-400 to-amber-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((gameState.score / gameState.targetScore) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            <p className="text-amber-200 text-sm mt-2">
              {gameState.hint ? "💡 Clear full rows or columns to score points. Try to place all shapes!" : "Place blocks to clear lines and score points"}
            </p>
          </div>
        </div>

        {/* Game Board */}
        <div className="flex justify-center mb-8">
          <div className="bg-white bg-opacity-10 p-4 rounded-xl shadow-2xl backdrop-blur-sm">
            <div
              className="grid gap-0.5"
              style={{
                gridTemplateColumns: `repeat(${gameState.gridSize}, 1fr)`,
                gridTemplateRows: `repeat(${gameState.gridSize}, 1fr)`,
              }}
            >
              {gameState.grid.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`w-8 h-8 border border-amber-800 flex items-center justify-center
                      ${cell === 1 ? 'bg-amber-600' : 'bg-amber-900'}
                    `}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e.dataTransfer.getData('shapeIndex'), rowIndex, colIndex)}
                  >
                    {/* Cell content if any */}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Available Shapes */}
        <div className="text-center mb-6">
          <h3 className="text-white text-xl font-bold mb-4">Available Blocks:</h3>
          <div className="flex justify-center space-x-4">
            {gameState.currentShapes.map((shape, shapeIndex) => (
              <div
                key={shapeIndex}
                className="bg-white bg-opacity-10 p-2 rounded-lg cursor-grab shadow-lg"
                draggable
                onDragStart={(e) => e.dataTransfer.setData('shapeIndex', shapeIndex)}
              >
                {shape.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex">
                    {row.map((cell, colIndex) => (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className={`w-4 h-4 border border-amber-800
                          ${cell === 1 ? 'bg-amber-600' : 'bg-transparent'}
                        `}
                      ></div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Game Over / Win Message */}
        {gameState.gameOver && !gameState.completed && (
          <div className="text-center">
            <div className="bg-red-600 text-white p-6 rounded-xl inline-block shadow-2xl border-4 border-white">
              <div className="text-4xl mb-2">😵</div>
              <h2 className="text-2xl font-bold mb-2">Game Over!</h2>
              <p className="text-lg">No more moves possible. Try again!</p>
              <Button onClick={resetGame} className="mt-4 bg-white text-red-600 hover:bg-gray-100">
                Play Again
              </Button>
            </div>
          </div>
        )}

        {/* Win Message */}
        {gameState.completed && (
          <div className="text-center">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6 rounded-xl inline-block shadow-2xl border-4 border-white">
              <div className="text-4xl mb-2">🎉</div>
              <h2 className="text-2xl font-bold mb-2">Level Complete!</h2>
              <p className="text-lg">You cleared the board and scored {gameState.score} points!</p>
              <div className="mt-4 text-3xl">⭐⭐⭐</div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-center mt-8">
          <div className="bg-white bg-opacity-10 rounded-lg p-4 max-w-2xl mx-auto backdrop-blur-sm">
            <h3 className="text-white font-semibold mb-2">How to Play:</h3>
            <p className="text-amber-200 text-sm">
              Drag and drop the available wooden blocks onto the grid. Fill entire rows or columns to clear them and score points. 
              The game ends when you can no longer place any of the available blocks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WoodenBlocks;


