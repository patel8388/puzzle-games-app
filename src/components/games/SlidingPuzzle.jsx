import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { RotateCcw, Lightbulb, Home } from 'lucide-react';

const SlidingPuzzle = ({ level = 1, onLevelComplete, onBack }) => {
  const getGridSize = (levelNum) => {
    if (levelNum <= 10) return 3; // 3x3
    if (levelNum <= 25) return 4; // 4x4
    return 5; // 5x5
  };

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const generatePuzzle = (size) => {
    const totalTiles = size * size;
    let tiles = Array.from({ length: totalTiles }, (_, i) => i + 1);
    tiles[totalTiles - 1] = 0; // 0 represents the empty space

    let shuffledTiles;
    let solvable = false;
    while (!solvable) {
      shuffledTiles = shuffleArray([...tiles]);
      solvable = isSolvable(shuffledTiles, size);
    }

    return shuffledTiles;
  };

  const isSolvable = (tiles, size) => {
    let inversions = 0;
    const flatTiles = tiles.filter(tile => tile !== 0);
    for (let i = 0; i < flatTiles.length - 1; i++) {
      for (let j = i + 1; j < flatTiles.length; j++) {
        if (flatTiles[i] > flatTiles[j]) {
          inversions++;
        }
      }
    }

    if (size % 2 === 1) { // Odd grid size
      return inversions % 2 === 0;
    } else { // Even grid size
      const emptyRow = Math.floor(tiles.indexOf(0) / size);
      const emptyRowFromBottom = size - emptyRow;
      return (emptyRowFromBottom % 2 === 1 && inversions % 2 === 0) ||
             (emptyRowFromBottom % 2 === 0 && inversions % 2 === 1);
    }
  };

  const [gameState, setGameState] = useState(() => {
    const size = getGridSize(level);
    const initialTiles = generatePuzzle(size);
    return {
      tiles: initialTiles,
      size,
      moves: 0,
      completed: false,
      hint: false,
    };
  });

  const getEmptyIndex = () => gameState.tiles.indexOf(0);

  const handleTileClick = (index) => {
    if (gameState.completed) return;

    const emptyIndex = getEmptyIndex();
    const size = gameState.size;

    const clickedRow = Math.floor(index / size);
    const clickedCol = index % size;
    const emptyRow = Math.floor(emptyIndex / size);
    const emptyCol = emptyIndex % size;

    const isAdjacent = (
      (clickedRow === emptyRow && Math.abs(clickedCol - emptyCol) === 1) ||
      (clickedCol === emptyCol && Math.abs(clickedRow - emptyRow) === 1)
    );

    if (isAdjacent) {
      const newTiles = [...gameState.tiles];
      [newTiles[index], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[index]];

      const isSolved = newTiles.every((tile, i) => tile === i + 1 || (tile === 0 && i === newTiles.length - 1));

      setGameState(prev => ({
        ...prev,
        tiles: newTiles,
        moves: prev.moves + 1,
        completed: isSolved,
      }));

      if (isSolved) {
        setTimeout(() => onLevelComplete(), 1500);
      }
    }
  };

  const resetGame = () => {
    const size = getGridSize(level);
    const initialTiles = generatePuzzle(size);
    setGameState({
      tiles: initialTiles,
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
    <div className="min-h-screen bg-gradient-to-b from-teal-700 to-cyan-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button onClick={onBack} variant="outline" className="text-white border-white hover:bg-white hover:text-black">
            <Home className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-1">🔢 Sliding Puzzle</h1>
            <p className="text-teal-200">Level {level} - {gameState.size}x{gameState.size} Grid</p>
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
            <p className="text-teal-200 text-sm mt-2">
              {gameState.hint ? "💡 Slide the tiles to arrange them in numerical order. The empty space is the last tile!" : "Arrange the tiles in numerical order"}
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
              {gameState.tiles.map((tile, index) => (
                <div
                  key={index}
                  className={`w-20 h-20 flex items-center justify-center text-3xl font-bold rounded-lg cursor-pointer transition-all duration-200
                    ${tile === 0 ? 'bg-transparent' : 'bg-teal-500 text-white hover:bg-teal-600'}
                    ${gameState.completed && tile !== 0 ? 'bg-green-500' : ''}
                  `}
                  onClick={() => handleTileClick(index)}
                >
                  {tile !== 0 ? tile : ''}
                </div>
              ))}
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
            <p className="text-teal-200 text-sm">
              Click on a tile adjacent to the empty space to slide it into the empty spot. Arrange the tiles in numerical order to win.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlidingPuzzle;


