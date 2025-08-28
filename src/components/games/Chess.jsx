import React, { useState, useEffect } from 'react';

const Chess = ({ level = 1, onComplete, onBack }) => {
  const [board, setBoard] = useState([]);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [turn, setTurn] = useState("white");
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    initializeBoard();
  }, []);

  const initializeBoard = () => {
    const initialBoard = [
      ["br", "bn", "bb", "bq", "bk", "bb", "bn", "br"],
      ["bp", "bp", "bp", "bp", "bp", "bp", "bp", "bp"],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      ["wp", "wp", "wp", "wp", "wp", "wp", "wp", "wp"],
      ["wr", "wn", "wb", "wq", "wk", "wb", "wn", "wr"],
    ];
    setBoard(initialBoard);
    setSelectedPiece(null);
    setValidMoves([]);
    setTurn("white");
    setGameOver(false);
    setMessage("");
  };

  const getPieceImage = (piece) => {
    if (!piece) return null;
    return `/pieces/${piece}.png`; // Assuming images are in public/pieces folder
  };

  const handleSquareClick = (row, col) => {
    if (gameOver) return;

    if (selectedPiece) {
      // A piece is already selected, try to move it
      const { row: sRow, col: sCol, piece: sPiece } = selectedPiece;
      const move = { from: { row: sRow, col: sCol }, to: { row, col } };

      if (isValidMove(sPiece, move)) {
        makeMove(move);
        setSelectedPiece(null);
        setValidMoves([]);
      } else {
        // Invalid move, deselect and re-select if clicking on own piece
        if (board[row][col] && board[row][col][0] === turn[0]) {
          setSelectedPiece({ row, col, piece: board[row][col] });
          setValidMoves(getValidMoves(board[row][col], row, col));
        } else {
          setSelectedPiece(null);
          setValidMoves([]);
        }
      }
    } else {
      // No piece selected, try to select one
      const piece = board[row][col];
      if (piece && piece[0] === turn[0]) {
        setSelectedPiece({ row, col, piece });
        setValidMoves(getValidMoves(piece, row, col));
      }
    }
  };

  const isValidMove = (piece, move) => {
    // This is a simplified placeholder. A real chess engine is complex.
    // For now, just check if the target square is in validMoves
    return validMoves.some(vm => vm.row === move.to.row && vm.col === move.to.col);
  };

  const getValidMoves = (piece, row, col) => {
    const moves = [];
    const color = piece[0];
    const type = piece[1];

    // Simplified move generation for demonstration
    // In a real game, this would involve complex logic for each piece type
    // and checking for checks, pins, etc.

    if (type === 'p') { // Pawn
      if (color === 'w') {
        if (!board[row - 1][col]) moves.push({ row: row - 1, col });
        if (row === 6 && !board[row - 2][col] && !board[row - 1][col]) moves.push({ row: row - 2, col });
        if (col > 0 && board[row - 1][col - 1] && board[row - 1][col - 1][0] === 'b') moves.push({ row: row - 1, col: col - 1 });
        if (col < 7 && board[row - 1][col + 1] && board[row - 1][col + 1][0] === 'b') moves.push({ row: row - 1, col: col + 1 });
      } else { // Black pawn
        if (!board[row + 1][col]) moves.push({ row: row + 1, col });
        if (row === 1 && !board[row + 2][col] && !board[row + 1][col]) moves.push({ row: row + 2, col });
        if (col > 0 && board[row + 1][col - 1] && board[row + 1][col - 1][0] === 'w') moves.push({ row: row + 1, col: col - 1 });
        if (col < 7 && board[row + 1][col + 1] && board[row + 1][col + 1][0] === 'w') moves.push({ row: row + 1, col: col + 1 });
      }
    }
    // Add more piece logic here (Rook, Knight, Bishop, Queen, King)

    return moves.filter(m => {
      const targetPiece = board[m.row][m.col];
      return !targetPiece || targetPiece[0] !== color; // Cannot capture own piece
    });
  };

  const makeMove = (move) => {
    const newBoard = board.map(row => [...row]);
    const piece = newBoard[move.from.row][move.from.col];
    newBoard[move.to.row][move.to.col] = piece;
    newBoard[move.from.row][move.from.col] = null;

    setBoard(newBoard);
    setTurn(turn === "white" ? "black" : "white");
    setMessage("");

    // Basic check for game over (e.g., king capture - very simplified)
    if (piece[1] === 'k') {
      setGameOver(true);
      setMessage(`${turn === "white" ? "Black" : "White"} wins!`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-700 to-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => { /* onBack */ }} className="text-white border-white hover:bg-white hover:text-black px-4 py-2 rounded">
            Back
          </button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-1">♟️ Chess</h1>
            <p className="text-gray-200">Level {level} - {turn}\'s Turn</p>
          </div>
          <div className="flex space-x-2">
            <button onClick={() => { /* showHint */ }} className="text-white border-white hover:bg-yellow-500 px-4 py-2 rounded">
              Hint
            </button>
            <button onClick={initializeBoard} className="text-white border-white hover:bg-blue-500 px-4 py-2 rounded">
              Reset
            </button>
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
                    ${(rowIndex + colIndex) % 2 === 0 ? "bg-gray-300" : "bg-gray-600"}
                    ${selectedPiece?.row === rowIndex && selectedPiece?.col === colIndex ? "ring-4 ring-blue-500" : ""}
                    ${validMoves.some(m => m.row === rowIndex && m.col === colIndex) ? "bg-green-400 opacity-75" : ""}
                    cursor-pointer
                  `}
                  onClick={() => handleSquareClick(rowIndex, colIndex)}
                >
                  {piece && (
                    <img
                      src={getPieceImage(piece)}
                      alt={piece}
                      className="w-14 h-14"
                    />
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
              <button onClick={initializeBoard} className="mt-4 bg-white text-gray-800 hover:bg-gray-100 px-4 py-2 rounded">
                Play Again
              </button>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-center mt-8">
          <div className="bg-white bg-opacity-10 rounded-lg p-4 max-w-2xl mx-auto backdrop-blur-sm">
            <h3 className="text-white font-semibold mb-2">How to Play:</h3>
            <p className="text-gray-200 text-sm">
              Click on a piece to select it, then click on a valid square to move it. Capture the opponent\'s king to win. (Simplified rules for this version)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chess;


