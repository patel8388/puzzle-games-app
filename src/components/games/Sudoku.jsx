import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { RotateCcw, Lightbulb, Home } from 'lucide-react';

const Sudoku = ({ level = 1, onLevelComplete, onBack }) => {
  const generateSudoku = (difficulty) => {
    // This is a simplified Sudoku generator for demonstration.
    // A full-fledged generator would be more complex.
    const board = Array(9).fill(null).map(() => Array(9).fill(0));
    const solution = Array(9).fill(null).map(() => Array(9).fill(0));

    // Fill diagonal 3x3 boxes
    const fillBox = (board, row, col) => {
      const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      shuffleArray(nums);
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          board[row + i][col + j] = nums.pop();
        }
      }
    };

    fillBox(board, 0, 0);
    fillBox(board, 3, 3);
    fillBox(board, 6, 6);

    // Solve the rest of the board (backtracking algorithm)
    const solve = (grid) => {
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (grid[r][c] === 0) {
            for (let num = 1; num <= 9; num++) {
              if (isValid(grid, r, c, num)) {
                grid[r][c] = num;
                if (solve(grid)) {
                  return true;
                } else {
                  grid[r][c] = 0; // Backtrack
                }
              }
            }
            return false;
          }
        }
      }
      return true;
    };

    const isValid = (grid, row, col, num) => {
      // Check row
      for (let x = 0; x < 9; x++) {
        if (grid[row][x] === num) return false;
      }
      // Check column
      for (let x = 0; x < 9; x++) {
        if (grid[x][col] === num) return false;
      }
      // Check 3x3 box
      const startRow = row - (row % 3);
      const startCol = col - (col % 3);
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (grid[i + startRow][j + startCol] === num) return false;
        }
      }
      return true;
    };

    const shuffleArray = (array) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    };

    // Create a copy for the solution
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        solution[r][c] = board[r][c];
      }
    }

    solve(solution); // Solve the full board to get the solution

    // Remove numbers based on difficulty
    let cellsToRemove = 0;
    if (difficulty === 'easy') cellsToRemove = 40;
    else if (difficulty === 'medium') cellsToRemove = 50;
    else cellsToRemove = 60;

    let removedCount = 0;
    while (removedCount < cellsToRemove) {
      const r = Math.floor(Math.random() * 9);
      const c = Math.floor(Math.random() * 9);
      if (board[r][c] !== 0) {
        board[r][c] = 0;
        removedCount++;
      }
    }

    return { initialBoard: board, solution };
  };

  const getDifficulty = (levelNum) => {
    if (levelNum <= 10) return 'easy';
    if (levelNum <= 30) return 'medium';
    return 'hard';
  };

  const [gameState, setGameState] = useState(() => {
    const difficulty = getDifficulty(level);
    const { initialBoard, solution } = generateSudoku(difficulty);
    return {
      board: initialBoard.map(row => row.map(cell => ({ value: cell, fixed: cell !== 0 }))),
      solution,
      difficulty,
      selectedCell: null,
      errorCells: [],
      completed: false,
      hint: false,
      moves: 0,
    };
  });

  const handleCellClick = (row, col) => {
    if (gameState.completed) return;
    setGameState(prev => ({ ...prev, selectedCell: { row, col } }));
  };

  const handleNumberInput = (num) => {
    if (!gameState.selectedCell || gameState.completed) return;
    const { row, col } = gameState.selectedCell;
    if (gameState.board[row][col].fixed) return;

    const newBoard = gameState.board.map(r => [...r]);
    newBoard[row][col] = { ...newBoard[row][col], value: num };

    const newErrorCells = [];
    // Basic validation: check if the number is correct against the solution
    if (num !== 0 && newBoard[row][col].value !== gameState.solution[row][col]) {
      newErrorCells.push({ row, col });
    }

    setGameState(prev => ({
      ...prev,
      board: newBoard,
      errorCells: newErrorCells,
      moves: prev.moves + 1,
    }));
  };

  useEffect(() => {
    // Check for completion
    const isCompleted = gameState.board.every(row =>
      row.every(cell => cell.value !== 0 && cell.value === gameState.solution[row.indexOf(cell)][gameState.board.indexOf(row)])
    );
    if (isCompleted && gameState.errorCells.length === 0) {
      setGameState(prev => ({ ...prev, completed: true }));
      setTimeout(() => onLevelComplete(), 1500);
    }
  }, [gameState.board, gameState.errorCells, gameState.solution, onLevelComplete]);

  const resetGame = () => {
    const difficulty = getDifficulty(level);
    const { initialBoard, solution } = generateSudoku(difficulty);
    setGameState({
      board: initialBoard.map(row => row.map(cell => ({ value: cell, fixed: cell !== 0 }))),
      solution,
      difficulty,
      selectedCell: null,
      errorCells: [],
      completed: false,
      hint: false,
      moves: 0,
    });
  };

  const showHint = () => {
    if (!gameState.selectedCell || gameState.completed) return;
    const { row, col } = gameState.selectedCell;
    if (gameState.board[row][col].fixed) return;

    setGameState(prev => {
      const newBoard = prev.board.map(r => [...r]);
      newBoard[row][col] = { ...newBoard[row][col], value: prev.solution[row][col] };
      return { ...prev, board: newBoard, hint: true, errorCells: [] };
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-600 to-orange-700 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button onClick={onBack} variant="outline" className="text-white border-white hover:bg-white hover:text-black">
            <Home className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-1">🔢 Sudoku</h1>
            <p className="text-red-200">Level {level} - {gameState.difficulty.toUpperCase()}</p>
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
              <div>
                <p className="text-lg font-semibold">Errors: {gameState.errorCells.length}</p>
              </div>
            </div>
            <p className="text-red-200 text-sm mt-2">
              {gameState.hint ? "💡 Select a cell and use the number pad to fill it. The hint button fills the selected cell correctly!" : "Fill the grid with numbers 1-9"}
            </p>
          </div>
        </div>

        {/* Game Board */}
        <div className="flex justify-center mb-8">
          <div className="bg-white bg-opacity-10 p-4 rounded-xl shadow-2xl backdrop-blur-sm">
            <div className="grid grid-cols-9 gap-0.5">
              {gameState.board.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`w-10 h-10 flex items-center justify-center text-lg font-bold border border-gray-400
                      ${cell.fixed ? 'bg-gray-300 text-gray-800' : 'bg-white text-gray-900 cursor-pointer'}
                      ${gameState.selectedCell?.row === rowIndex && gameState.selectedCell?.col === colIndex ? 'border-blue-500 ring-2 ring-blue-500' : ''}
                      ${gameState.errorCells.some(err => err.row === rowIndex && err.col === colIndex) ? 'bg-red-300' : ''}
                      ${(rowIndex % 3 === 2 && rowIndex !== 8) ? 'border-b-2 border-b-gray-600' : ''}
                      ${(colIndex % 3 === 2 && colIndex !== 8) ? 'border-r-2 border-r-gray-600' : ''}
                    `}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                  >
                    {cell.value !== 0 ? cell.value : ''}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Number Input Pad */}
        <div className="flex justify-center mb-8">
          <div className="grid grid-cols-3 gap-2 bg-white bg-opacity-10 p-4 rounded-xl backdrop-blur-sm">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <Button
                key={num}
                className="w-16 h-16 text-2xl font-bold bg-red-500 hover:bg-red-600 text-white"
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
              <p className="text-lg">You solved the Sudoku puzzle in {gameState.moves} moves!</p>
              <div className="mt-4 text-3xl">⭐⭐⭐</div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-center mt-8">
          <div className="bg-white bg-opacity-10 rounded-lg p-4 max-w-2xl mx-auto backdrop-blur-sm">
            <h3 className="text-white font-semibold mb-2">How to Play:</h3>
            <p className="text-red-200 text-sm">
              Fill the 9x9 grid so that each column, each row, and each of the nine 3x3 subgrids 
              (also called boxes or blocks) contain all of the digits from 1 to 9.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sudoku;


