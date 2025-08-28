import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { RotateCcw, Lightbulb, Home } from 'lucide-react';

const Checkers = ({ level = 1, onLevelComplete, onBack }) => {
  const initialBoard = [
    [0, 1, 0, 1, 0, 1, 0, 1], // 1 = Red piece
    [1, 0, 1, 0, 1, 0, 1, 0],
    [0, 1, 0, 1, 0, 1, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [2, 0, 2, 0, 2, 0, 2, 0], // 2 = Black piece
    [0, 2, 0, 2, 0, 2, 0, 2],
    [2, 0, 2, 0, 2, 0, 2, 0],
  ];

  const [board, setBoard] = useState(initialBoard);
  const [selectedPiece, setSelectedPiece] = useState(null); // { row, col, piece }
  const [turn, setTurn] = useState(1); // 1 for Red, 2 for Black
  const [message, setMessage] = useState('');
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    checkWinCondition();
  }, [board]);

  const checkWinCondition = () => {
    let redPieces = 0;
    let blackPieces = 0;
    board.forEach(row => {
      row.forEach(cell => {
        if (cell === 1 || cell === 3) redPieces++; // 3 = Red King
        if (cell === 2 || cell === 4) blackPieces++; // 4 = Black King
      });
    });

    if (redPieces === 0) {
      setGameOver(true);
      setMessage('Black Wins!');
      setTimeout(() => onLevelComplete(), 1500);
    } else if (blackPieces === 0) {
      setGameOver(true);
      setMessage('Red Wins!');
      setTimeout(() => onLevelComplete(), 1500);
    }
  };

  const isValidMove = (sRow, sCol, tRow, tCol) => {
    const piece = board[sRow][sCol];
    const target = board[tRow][tCol];

    if (target !== 0) return false; // Target must be empty

    const rowDiff = Math.abs(tRow - sRow);
    const colDiff = Math.abs(tCol - sCol);

    if (rowDiff === 1 && colDiff === 1) { // Normal move
      if (piece === 1 && tRow > sRow) return false; // Red can only move up
      if (piece === 2 && tRow < sRow) return false; // Black can only move down
      return true;
    } else if (rowDiff === 2 && colDiff === 2) { // Jump move
      const jumpedRow = (sRow + tRow) / 2;
      const jumpedCol = (sCol + tCol) / 2;
      const jumpedPiece = board[jumpedRow][jumpedCol];

      if (piece === 1 && (jumpedPiece === 2 || jumpedPiece === 4)) return true; // Red jumps Black
      if (piece === 2 && (jumpedPiece === 1 || jumpedPiece === 3)) return true; // Black jumps Red
      return false;
    }
    return false;
  };

  const makeMove = (sRow, sCol, tRow, tCol) => {
    const newBoard = board.map(row => [...row]);
    const piece = newBoard[sRow][sCol];

    newBoard[tRow][tCol] = piece;
    newBoard[sRow][sCol] = 0;

    const rowDiff = Math.abs(tRow - sRow);
    if (rowDiff === 2) { // A jump occurred
      const jumpedRow = (sRow + tRow) / 2;
      const jumpedCol = (sCol + tCol) / 2;
      newBoard[jumpedRow][jumpedCol] = 0; // Remove jumped piece
    }

    // Check for kinging
    if (piece === 1 && tRow === 0) newBoard[tRow][tCol] = 3; // Red kings
    if (piece === 2 && tRow === 7) newBoard[tRow][tCol] = 4; // Black kings

    setBoard(newBoard);
    setTurn(turn === 1 ? 2 : 1);
    setSelectedPiece(null);
    setMessage('');
  };

  const handleSquareClick = (row, col) => {
    if (gameOver) return;

    if (selectedPiece) {
      const { row: sRow, col: sCol, piece: sPiece } = selectedPiece;
      if (sRow === row && sCol === col) {
        setSelectedPiece(null); // Deselect
      } else if (isValidMove(sRow, sCol, row, col)) {
        makeMove(sRow, sCol, row, col);
      } else {
        setMessage('Invalid move. Try again.');
      }
    } else {
      const piece = board[row][col];
      if (piece !== 0 && (piece === turn || (piece === 3 && turn === 1) || (piece === 4 && turn === 2))) {
        setSelectedPiece({ row, col, piece });
        setMessage('');
      } else if (piece !== 0) {
        setMessage('It\'s not your turn or you selected an opponent\'s piece.');
      }
    }
  };

  const resetGame = () => {
    setBoard(initialBoard);
    setSelectedPiece(null);
    setTurn(1);
    setMessage('');
    setGameOver(false);
  };

  const getPieceColor = (piece) => {
    if (piece === 1 || piece === 3) return 'bg-red-600';
    if (piece === 2 || piece === 4) return 'bg-gray-800';
    return '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-700 to-red-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button onClick={onBack} variant="outline" className="text-white border-white hover:bg-white hover:text-black">
            <Home className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-1">⚫ Checkers</h1>
            <p className="text-orange-200">Level {level} - {turn === 1 ? 'Red' : 'Black'}'s Turn</p>
          </div>
          <div className="flex space-x-2">
            <Button onClick={() => {}} variant="outline" size="sm" className="text-white border-white hover:bg-yellow-500">
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
            <p className="text-orange-200 text-sm mt-2">
              {message || 'Select a piece to move'}
            </p>
          </div>
        </div>

        {/* Game Board */}
        <div className="flex justify-center mb-8">
          <div className="grid grid-cols-8 border-2 border-gray-400">
            {board.map((row, rowIndex) =>
              row.map((piece, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`w-16 h-16 flex items-center justify-center
                    ${(rowIndex + colIndex) % 2 === 0 ? 'bg-orange-300' : 'bg-orange-800'}
                    ${selectedPiece?.row === rowIndex && selectedPiece?.col === colIndex ? 'ring-4 ring-blue-500' : ''}
                    cursor-pointer
                  `}
                  onClick={() => handleSquareClick(rowIndex, colIndex)}
                >
                  {piece !== 0 && (
                    <div className={`w-12 h-12 rounded-full ${getPieceColor(piece)} flex items-center justify-center text-white text-xl font-bold`}>
                      {(piece === 3 || piece === 4) && 'K'}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Game Over Message */}
        {gameOver && (
          <div className="text-center">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6 rounded-xl inline-block shadow-2xl border-4 border-white">
              <div className="text-4xl mb-2">🎉</div>
              <h2 className="text-2xl font-bold mb-2">Game Over!</h2>
              <p className="text-lg">{message}</p>
              <Button onClick={resetGame} className="mt-4 bg-white text-gray-800 hover:bg-gray-100">
                Play Again
              </Button>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-center mt-8">
          <div className="bg-white bg-opacity-10 rounded-lg p-4 max-w-2xl mx-auto backdrop-blur-sm">
            <h3 className="text-white font-semibold mb-2">How to Play:</h3>
            <p className="text-orange-200 text-sm">
              Move your pieces diagonally forward. Capture opponent's pieces by jumping over them. Reach the opponent's back row to crown a King.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkers;


