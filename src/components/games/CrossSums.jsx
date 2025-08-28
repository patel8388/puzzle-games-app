import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { RotateCcw, Lightbulb, Home } from 'lucide-react';

const CrossSums = ({ level = 1, onLevelComplete, onBack }) => {
  const generatePuzzle = (levelNum) => {
    const size = Math.min(3 + Math.floor(levelNum / 10), 5); // Grid size from 3x3 to 5x5
    const maxNum = 9; // Max number in cells
    const board = Array(size).fill(null).map(() => Array(size).fill(0));
    const rowSums = Array(size).fill(0);
    const colSums = Array(size).fill(0);

    // Simple generation: fill with random numbers and calculate sums
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const num = Math.floor(Math.random() * maxNum) + 1; // 1-9
        board[r][c] = num;
        rowSums[r] += num;
        colSums[c] += num;
      }
    }

    // Randomly hide some cells for the player to fill
    const cellsToHide = Math.floor(size * size * (0.3 + levelNum * 0.01)); // Hide 30% to 80% of cells
    const initialBoard = board.map(row => [...row]);
    let hiddenCount = 0;
    while (hiddenCount < cellsToHide) {
      const r = Math.floor(Math.random() * size);
      const c = Math.floor(Math.random() * size);
      if (initialBoard[r][c] !== 0) {
        initialBoard[r][c] = 0; // Hide the number
        hiddenCount++;
      }
    }

    return { initialBoard, solution: board, rowSums, colSums, size };
  };

  const [gameState, setGameState] = useState(() => {
    const puzzle = generatePuzzle(level);
    return {
      ...puzzle,
      currentBoard: puzzle.initialBoard.map(row => [...row]),
      selectedCell: null,
      moves: 0,
      completed: false,
      hint: false,
    };
  });

  const checkCompletion = (currentBoard) => {
    for (let r = 0; r < gameState.size; r++) {
      let currentRowSum = 0;
      for (let c = 0; c < gameState.size; c++) {
        if (currentBoard[r][c] === 0) return false; // Still empty cells
        currentRowSum += currentBoard[r][c];
      }
      if (currentRowSum !== gameState.rowSums[r]) return false; // Row sum mismatch
    }

    for (let c = 0; c < gameState.size; c++) {
      let currentColSum = 0;
      for (let r = 0; r < gameState.size; r++) {
        currentColSum += currentBoard[r][c];
      }
      if (currentColSum !== gameState.colSums[c]) return false; // Column sum mismatch
    }

    return true; // All checks passed
  };

  useEffect(() => {
    if (checkCompletion(gameState.currentBoard)) {
      setGameState(prev => ({ ...prev, completed: true }));
      setTimeout(() => onLevelComplete(), 1500);
    }
  }, [gameState.currentBoard]);

  const handleCellClick = (row, col) => {
    if (gameState.completed) return;
    setGameState(prev => ({ ...prev, selectedCell: { row, col } }));
  };

  const handleNumberInput = (num) => {
    if (!gameState.selectedCell || gameState.completed) return;
    const { row, col } = gameState.selectedCell;

    const newBoard = gameState.currentBoard.map(r => [...r]);
    newBoard[row][col] = num;

    setGameState(prev => ({
      ...prev,
      currentBoard: newBoard,
      moves: prev.moves + 1,
    }));
  };

  const resetGame = () => {
    const puzzle = generatePuzzle(level);
    setGameState({
      ...puzzle,
      currentBoard: puzzle.initialBoard.map(row => [...row]),
      selectedCell: null,
      moves: 0,
      completed: false,
      hint: false,
    });
  };

  const showHint = () => {
    if (!gameState.selectedCell || gameState.completed) return;
    const { row, col } = gameState.selectedCell;

    setGameState(prev => {
      const newBoard = prev.currentBoard.map(r => [...r]);
      newBoard[row][col] = prev.solution[row][col];
      return { ...prev, currentBoard: newBoard, hint: true };
    });
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
            <h1 className="text-3xl font-bold text-white mb-1">➕ Cross Sums</h1>
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
              {gameState.hint ? "💡 Select a cell and use the number pad to fill it. The hint button fills the selected cell correctly!" : "Fill the grid so rows and columns sum correctly"}
            </p>
          </div>
        </div>

        {/* Game Board */}
        <div className="flex justify-center mb-8">
          <div className="bg-white bg-opacity-10 p-4 rounded-xl shadow-2xl backdrop-blur-sm">
            <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${gameState.size + 1}, 1fr)` }}>
              {/* Corner empty cell */}
              <div className="w-12 h-12 bg-gray-700 flex items-center justify-center text-white font-bold"></div>

              {/* Column Sums */}
              {gameState.colSums.map((sum, index) => (
                <div key={`col-sum-${index}`} className="w-12 h-12 bg-gray-700 flex items-center justify-center text-white font-bold">
                  {sum}
                </div>
              ))}

              {/* Grid Cells and Row Sums */}
              {gameState.currentBoard.map((row, rowIndex) => (
                <React.Fragment key={rowIndex}>
                  {/* Row Sum */}
                  <div className="w-12 h-12 bg-gray-700 flex items-center justify-center text-white font-bold">
                    {gameState.rowSums[rowIndex]}
                  </div>
                  {/* Cells */}
                  {row.map((cell, colIndex) => (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className={`w-12 h-12 flex items-center justify-center text-lg font-bold border border-gray-400
                        ${gameState.initialBoard[rowIndex][colIndex] !== 0 ? 'bg-gray-300 text-gray-800' : 'bg-white text-gray-900 cursor-pointer'}
                        ${gameState.selectedCell?.row === rowIndex && gameState.selectedCell?.col === colIndex ? 'border-blue-500 ring-2 ring-blue-500' : ''}
                      `}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                    >
                      {cell !== 0 ? cell : ''}
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Number Input Pad */}
        <div className="flex justify-center mb-8">
          <div className="grid grid-cols-3 gap-2 bg-white bg-opacity-10 p-4 rounded-xl backdrop-blur-sm">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <Button
                key={num}
                className="w-16 h-16 text-2xl font-bold bg-blue-500 hover:bg-blue-600 text-white"
                onClick={() => handleNumberInput(num)}
                disabled={!gameState.selectedCell || gameState.completed}
              >
                {num}
              </Button>
            ))}
            <Button
              className="w-16 h-16 text-2xl font-bold bg-gray-500 hover:bg-gray-600 text-white col-span-3"
              onClick={() => handleNumberInput(0)}
              disabled={!gameState.selectedCell || gameState.completed}
            >
              Clear
            </Button>
          </div>
        </div>

        {/* Win Message */}
        {gameState.completed && (
          <div className="text-center">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6 rounded-xl inline-block shadow-2xl border-4 border-white">
              <div className="text-4xl mb-2">🎉</div>
              <h2 className="text-2xl font-bold mb-2">Level Complete!</h2>
              <p className="text-lg">You solved the Cross Sums puzzle in {gameState.moves} moves!</p>
              <div className="mt-4 text-3xl">⭐⭐⭐</div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-center mt-8">
          <div className="bg-white bg-opacity-10 rounded-lg p-4 max-w-2xl mx-auto backdrop-blur-sm">
            <h3 className="text-white font-semibold mb-2">How to Play:</h3>
            <p className="text-blue-200 text-sm">
              Fill in the empty cells with numbers from 1 to 9 so that the sum of the numbers in each row and column matches the given sums.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrossSums;


