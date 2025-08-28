import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { RotateCcw, Lightbulb, Home } from 'lucide-react';

const NumberMerge = ({ level = 1, onLevelComplete, onBack }) => {
  const getGridSize = (levelNum) => {
    if (levelNum <= 10) return 4; // 4x4
    if (levelNum <= 25) return 5; // 5x5
    return 6; // 6x6
  };

  const generateBoard = (size) => {
    const board = Array(size).fill(null).map(() => Array(size).fill(0));
    addRandomTile(board, size);
    addRandomTile(board, size);
    return board;
  };

  const addRandomTile = (board, size) => {
    let emptyCells = [];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (board[r][c] === 0) {
          emptyCells.push({ r, c });
        }
      }
    }
    if (emptyCells.length > 0) {
      const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      board[r][c] = Math.random() < 0.9 ? 2 : 4; // 90% chance of 2, 10% chance of 4
    }
  };

  const [gameState, setGameState] = useState(() => {
    const size = getGridSize(level);
    return {
      board: generateBoard(size),
      size,
      score: 0,
      moves: 0,
      gameOver: false,
      completed: false,
      hint: false,
    };
  });

  const getTileColor = (value) => {
    switch (value) {
      case 0: return 'bg-gray-300';
      case 2: return 'bg-emerald-200';
      case 4: return 'bg-emerald-300';
      case 8: return 'bg-emerald-400';
      case 16: return 'bg-emerald-500';
      case 32: return 'bg-emerald-600';
      case 64: return 'bg-emerald-700';
      case 128: return 'bg-emerald-800';
      case 256: return 'bg-emerald-900';
      case 512: return 'bg-blue-500';
      case 1024: return 'bg-blue-600';
      case 2048: return 'bg-blue-700';
      default: return 'bg-gray-400';
    }
  };

  const getTextColor = (value) => {
    if (value > 4) return 'text-white';
    return 'text-gray-800';
  };

  const slideTiles = (row) => {
    let newRow = row.filter(val => val !== 0);
    let merged = Array(newRow.length).fill(false);

    for (let i = 0; i < newRow.length - 1; i++) {
      if (newRow[i] === newRow[i + 1] && !merged[i] && !merged[i + 1]) {
        newRow[i] *= 2;
        newRow.splice(i + 1, 1);
        merged[i] = true;
        setGameState(prev => ({ ...prev, score: prev.score + newRow[i] }));
      }
    }
    while (newRow.length < row.length) {
      newRow.push(0);
    }
    return newRow;
  };

  const move = (direction) => {
    if (gameState.gameOver || gameState.completed) return;

    let newBoard = gameState.board.map(r => [...r]);
    let boardChanged = false;

    if (direction === 'left') {
      for (let r = 0; r < gameState.size; r++) {
        const originalRow = [...newBoard[r]];
        newBoard[r] = slideTiles(newBoard[r]);
        if (JSON.stringify(originalRow) !== JSON.stringify(newBoard[r])) boardChanged = true;
      }
    } else if (direction === 'right') {
      for (let r = 0; r < gameState.size; r++) {
        const originalRow = [...newBoard[r]];
        newBoard[r].reverse();
        newBoard[r] = slideTiles(newBoard[r]);
        newBoard[r].reverse();
        if (JSON.stringify(originalRow.reverse()) !== JSON.stringify(newBoard[r])) boardChanged = true;
      }
    } else if (direction === 'up') {
      for (let c = 0; c < gameState.size; c++) {
        let col = [];
        for (let r = 0; r < gameState.size; r++) col.push(newBoard[r][c]);
        const originalCol = [...col];
        col = slideTiles(col);
        for (let r = 0; r < gameState.size; r++) newBoard[r][c] = col[r];
        if (JSON.stringify(originalCol) !== JSON.stringify(col)) boardChanged = true;
      }
    } else if (direction === 'down') {
      for (let c = 0; c < gameState.size; c++) {
        let col = [];
        for (let r = 0; r < gameState.size; r++) col.push(newBoard[r][c]);
        const originalCol = [...col];
        col.reverse();
        col = slideTiles(col);
        col.reverse();
        for (let r = 0; r < gameState.size; r++) newBoard[r][c] = col[r];
        if (JSON.stringify(originalCol.reverse()) !== JSON.stringify(col)) boardChanged = true;
      }
    }

    if (boardChanged) {
      addRandomTile(newBoard, gameState.size);
      setGameState(prev => ({
        ...prev,
        board: newBoard,
        moves: prev.moves + 1,
      }));
      checkGameOver(newBoard);
      checkWinCondition(newBoard);
    }
  };

  const checkGameOver = (board) => {
    // Check if any moves are possible
    for (let r = 0; r < gameState.size; r++) {
      for (let c = 0; c < gameState.size; c++) {
        if (board[r][c] === 0) return false; // Empty cell exists, not game over
        // Check for mergeable neighbors
        if (r < gameState.size - 1 && board[r][c] === board[r + 1][c]) return false;
        if (c < gameState.size - 1 && board[r][c] === board[r][c + 1]) return false;
      }
    }
    setGameState(prev => ({ ...prev, gameOver: true }));
    return true;
  };

  const checkWinCondition = (board) => {
    for (let r = 0; r < gameState.size; r++) {
      for (let c = 0; c < gameState.size; c++) {
        if (board[r][c] >= 2048) { // Win condition: reach 2048 tile
          setGameState(prev => ({ ...prev, completed: true }));
          setTimeout(() => onLevelComplete(), 1500);
          return true;
        }
      }
    }
    return false;
  };

  const handleKeyDown = (event) => {
    if (gameState.gameOver || gameState.completed) return;
    switch (event.key) {
      case 'ArrowUp': move('up'); break;
      case 'ArrowDown': move('down'); break;
      case 'ArrowLeft': move('left'); break;
      case 'ArrowRight': move('right'); break;
      default: break;
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameState]); // Re-add event listener when gameState changes

  const resetGame = () => {
    const size = getGridSize(level);
    setGameState({
      board: generateBoard(size),
      size,
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
    <div className="min-h-screen bg-gradient-to-b from-purple-700 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button onClick={onBack} variant="outline" className="text-white border-white hover:bg-white hover:text-black">
            <Home className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-1">🔢 Number Merge</h1>
            <p className="text-purple-200">Level {level} - {gameState.size}x{gameState.size} Grid</p>
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
              </div>
              <div>
                <p className="text-lg font-semibold">Moves: {gameState.moves}</p>
              </div>
            </div>
            <p className="text-purple-200 text-sm mt-2">
              {gameState.hint ? "💡 Use arrow keys to merge tiles. Reach 2048 to win!" : "Merge numbers to reach the highest tile"}
            </p>
          </div>
        </div>

        {/* Game Board */}
        <div className="flex justify-center mb-8">
          <div className="bg-white bg-opacity-10 p-4 rounded-xl shadow-2xl backdrop-blur-sm">
            <div
              className="grid gap-2"
              style={{
                gridTemplateColumns: `repeat(${gameState.size}, 1fr)`,
                gridTemplateRows: `repeat(${gameState.size}, 1fr)`,
              }}
            >
              {gameState.board.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`w-20 h-20 flex items-center justify-center text-3xl font-bold rounded-lg
                      ${getTileColor(cell)} ${getTextColor(cell)}
                    `}
                  >
                    {cell !== 0 ? cell : ''}
                  </div>
                ))
              )}
            </div>
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
              <p className="text-lg">You reached 2048 and scored {gameState.score} points!</p>
              <div className="mt-4 text-3xl">⭐⭐⭐</div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-center mt-8">
          <div className="bg-white bg-opacity-10 rounded-lg p-4 max-w-2xl mx-auto backdrop-blur-sm">
            <h3 className="text-white font-semibold mb-2">How to Play:</h3>
            <p className="text-purple-200 text-sm">
              Use the arrow keys to move the tiles. When two tiles with the same number touch, they merge into one! Reach the 2048 tile to win.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NumberMerge;


