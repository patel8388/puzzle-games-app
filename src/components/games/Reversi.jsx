import React, { useState, useEffect } from 'react';

const Reversi = ({ level = 1, onComplete, onBack }) => {
  const [board, setBoard] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(1); // 1 = black (player), 2 = white (AI)
  const [gameState, setGameState] = useState('playing');
  const [validMoves, setValidMoves] = useState([]);
  const [score, setScore] = useState({ black: 2, white: 2 });
  const [moves, setMoves] = useState(0);
  const [gameWinner, setGameWinner] = useState(null);
  const [lastMove, setLastMove] = useState(null);
  const [passCount, setPassCount] = useState(0);

  useEffect(() => {
    initializeGame();
  }, [level]);

  useEffect(() => {
    if (currentPlayer === 2 && gameState === 'playing') {
      // AI turn
      setTimeout(() => {
        makeAIMove();
      }, 1000);
    }
  }, [currentPlayer, gameState]);

  const initializeGame = () => {
    // Initialize 8x8 board
    const newBoard = Array(8).fill().map(() => Array(8).fill(0));
    
    // Place initial pieces
    newBoard[3][3] = 2; // White
    newBoard[3][4] = 1; // Black
    newBoard[4][3] = 1; // Black
    newBoard[4][4] = 2; // White

    setBoard(newBoard);
    setCurrentPlayer(1);
    setGameState('playing');
    setScore({ black: 2, white: 2 });
    setMoves(0);
    setGameWinner(null);
    setLastMove(null);
    setPassCount(0);
    
    // Calculate initial valid moves
    const moves = getValidMoves(newBoard, 1);
    setValidMoves(moves);
  };

  const getValidMoves = (board, player) => {
    const moves = [];
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ];

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (board[row][col] === 0) {
          // Check if this empty cell is a valid move
          for (const [dr, dc] of directions) {
            if (isValidDirection(board, row, col, dr, dc, player)) {
              moves.push([row, col]);
              break;
            }
          }
        }
      }
    }
    return moves;
  };

  const isValidDirection = (board, row, col, dr, dc, player) => {
    const opponent = player === 1 ? 2 : 1;
    let r = row + dr;
    let c = col + dc;
    let hasOpponentPiece = false;

    while (r >= 0 && r < 8 && c >= 0 && c < 8) {
      if (board[r][c] === 0) {
        return false; // Empty cell, no capture possible
      } else if (board[r][c] === opponent) {
        hasOpponentPiece = true;
      } else if (board[r][c] === player) {
        return hasOpponentPiece; // Found our piece, valid if we passed opponent pieces
      }
      r += dr;
      c += dc;
    }
    return false;
  };

  const makeMove = (row, col, player) => {
    if (!isValidMove(row, col, player)) return false;

    const newBoard = board.map(row => [...row]);
    newBoard[row][col] = player;

    // Flip pieces in all valid directions
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ];

    for (const [dr, dc] of directions) {
      if (isValidDirection(board, row, col, dr, dc, player)) {
        flipPieces(newBoard, row, col, dr, dc, player);
      }
    }

    setBoard(newBoard);
    setLastMove([row, col]);
    setMoves(moves + 1);

    // Update score
    const newScore = calculateScore(newBoard);
    setScore(newScore);

    // Check for game end
    const nextPlayer = player === 1 ? 2 : 1;
    const nextValidMoves = getValidMoves(newBoard, nextPlayer);
    
    if (nextValidMoves.length === 0) {
      // Next player has no moves
      const currentValidMoves = getValidMoves(newBoard, player);
      if (currentValidMoves.length === 0) {
        // Current player also has no moves - game over
        endGame(newScore);
        return true;
      } else {
        // Current player continues
        setValidMoves(currentValidMoves);
        setPassCount(passCount + 1);
        if (passCount >= 1) {
          endGame(newScore);
          return true;
        }
        return true;
      }
    } else {
      // Switch to next player
      setCurrentPlayer(nextPlayer);
      setValidMoves(nextValidMoves);
      setPassCount(0);
    }

    return true;
  };

  const isValidMove = (row, col, player) => {
    return validMoves.some(([r, c]) => r === row && c === col);
  };

  const flipPieces = (board, row, col, dr, dc, player) => {
    const opponent = player === 1 ? 2 : 1;
    let r = row + dr;
    let c = col + dc;

    while (r >= 0 && r < 8 && c >= 0 && c < 8 && board[r][c] === opponent) {
      board[r][c] = player;
      r += dr;
      c += dc;
    }
  };

  const calculateScore = (board) => {
    let black = 0;
    let white = 0;
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (board[row][col] === 1) black++;
        else if (board[row][col] === 2) white++;
      }
    }
    
    return { black, white };
  };

  const endGame = (finalScore) => {
    setGameState('finished');
    
    if (finalScore.black > finalScore.white) {
      setGameWinner('black');
      onComplete?.({
        level,
        moves,
        time: Date.now(),
        score: Math.max(1000 + (finalScore.black - finalScore.white) * 10, 100)
      });
    } else if (finalScore.white > finalScore.black) {
      setGameWinner('white');
    } else {
      setGameWinner('tie');
    }
  };

  const makeAIMove = () => {
    if (validMoves.length === 0) {
      // AI has no moves, pass turn back
      const playerMoves = getValidMoves(board, 1);
      if (playerMoves.length === 0) {
        endGame(score);
      } else {
        setCurrentPlayer(1);
        setValidMoves(playerMoves);
      }
      return;
    }

    // Simple AI: choose move that flips the most pieces
    let bestMove = validMoves[0];
    let bestScore = -1;

    for (const [row, col] of validMoves) {
      const testBoard = board.map(row => [...row]);
      testBoard[row][col] = 2;

      const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1]
      ];

      let flippedCount = 0;
      for (const [dr, dc] of directions) {
        if (isValidDirection(board, row, col, dr, dc, 2)) {
          flippedCount += countFlips(board, row, col, dr, dc, 2);
        }
      }

      if (flippedCount > bestScore) {
        bestScore = flippedCount;
        bestMove = [row, col];
      }
    }

    makeMove(bestMove[0], bestMove[1], 2);
  };

  const countFlips = (board, row, col, dr, dc, player) => {
    const opponent = player === 1 ? 2 : 1;
    let r = row + dr;
    let c = col + dc;
    let count = 0;

    while (r >= 0 && r < 8 && c >= 0 && c < 8 && board[r][c] === opponent) {
      count++;
      r += dr;
      c += dc;
    }

    return count;
  };

  const handleCellClick = (row, col) => {
    if (currentPlayer !== 1 || gameState !== 'playing') return;
    makeMove(row, col, 1);
  };

  const resetGame = () => {
    initializeGame();
  };

  const renderCell = (row, col) => {
    const piece = board[row][col];
    const isValidMove = validMoves.some(([r, c]) => r === row && c === col);
    const isLastMove = lastMove && lastMove[0] === row && lastMove[1] === col;

    return (
      <div
        key={`${row}-${col}`}
        className={`w-12 h-12 border border-green-600 flex items-center justify-center cursor-pointer transition-all ${
          isValidMove && currentPlayer === 1 ? 'bg-green-300 hover:bg-green-200' : 'bg-green-500'
        } ${isLastMove ? 'ring-2 ring-yellow-400' : ''}`}
        onClick={() => handleCellClick(row, col)}
      >
        {piece === 1 && (
          <div className="w-10 h-10 rounded-full bg-black border-2 border-gray-300"></div>
        )}
        {piece === 2 && (
          <div className="w-10 h-10 rounded-full bg-white border-2 border-gray-300"></div>
        )}
        {isValidMove && currentPlayer === 1 && piece === 0 && (
          <div className="w-6 h-6 rounded-full bg-black opacity-30"></div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-white">⚫ Reversi ⚪</h1>
          <div className="text-white text-right">
            <div>Level {level}</div>
            <div>Moves: {moves}</div>
          </div>
        </div>

        {/* Score and Status */}
        <div className="flex justify-between items-center mb-6">
          <div className="bg-black bg-opacity-30 rounded-lg p-4 text-white">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-black border-2 border-white"></div>
              <span className="font-bold">You: {score.black}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full bg-white border-2 border-gray-300"></div>
              <span className="font-bold">AI: {score.white}</span>
            </div>
          </div>

          <div className="text-center text-white">
            <div className="text-lg font-bold">
              {gameState === 'playing' ? (
                currentPlayer === 1 ? "Your Turn" : "AI's Turn"
              ) : (
                "Game Over"
              )}
            </div>
            {validMoves.length === 0 && currentPlayer === 1 && gameState === 'playing' && (
              <div className="text-yellow-300">No valid moves - AI's turn</div>
            )}
          </div>

          <div className="bg-black bg-opacity-30 rounded-lg p-4 text-white text-center">
            <div className="font-bold">Valid Moves</div>
            <div className="text-2xl">{validMoves.length}</div>
          </div>
        </div>

        {/* Game Board */}
        <div className="flex justify-center mb-6">
          <div className="grid grid-cols-8 gap-1 bg-green-800 p-2 rounded-lg">
            {board.map((row, rowIndex) =>
              row.map((_, colIndex) => renderCell(rowIndex, colIndex))
            )}
          </div>
        </div>

        {/* Game Over Message */}
        {gameState === 'finished' && (
          <div className="text-center">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-6 rounded-xl inline-block shadow-2xl border-4 border-white">
              <div className="text-4xl mb-2">
                {gameWinner === 'black' ? '🎉' : gameWinner === 'white' ? '😔' : '🤝'}
              </div>
              <h2 className="text-2xl font-bold mb-2">Game Over!</h2>
              <p className="text-lg">
                {gameWinner === 'black' && 'You Win!'}
                {gameWinner === 'white' && 'AI Wins!'}
                {gameWinner === 'tie' && "It's a Tie!"}
              </p>
              <p className="text-sm">Final Score: You {score.black} - {score.white} AI</p>
              <button 
                onClick={resetGame} 
                className="mt-4 px-4 py-2 bg-white text-gray-800 rounded hover:bg-gray-100 transition-colors"
              >
                Play Again
              </button>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-black bg-opacity-30 rounded-lg p-4 text-white text-sm">
          <h3 className="font-bold mb-2">How to Play:</h3>
          <ul className="space-y-1">
            <li>• Place your black pieces to trap white pieces between your pieces</li>
            <li>• All trapped pieces flip to your color</li>
            <li>• You must make a move that flips at least one opponent piece</li>
            <li>• Game ends when no more moves are possible</li>
            <li>• Player with the most pieces wins</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Reversi;

