import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { RotateCcw, Lightbulb, Home } from 'lucide-react';

const Backgammon = ({ level = 1, onLevelComplete, onBack }) => {
  // Board representation: 24 points + 2 bar + 2 home
  // Each point can have multiple checkers. Positive for white, negative for black.
  // e.g., [0, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, -5, 0, 0, 0, 0, -3, 0, 5, 0, 0, 0, 0, 0] (24 points)
  // bar: [white_bar, black_bar], home: [white_home, black_home]
  const initialBoard = {
    points: [
      0, 0, 0, 0, 0, 5, // Point 6 (White)
      0, 3, 0, 0, 0, -5, // Point 12 (Black)
      -5, 0, 0, 0, 0, 3, // Point 18 (White)
      0, -5, 0, 0, 0, 0, // Point 24 (Black)
    ].flatMap(x => [x]).concat(Array(12).fill(0)), // Fill remaining 12 points with 0
    bar: [0, 0], // [white_bar, black_bar]
    home: [0, 0], // [white_home, black_home]
  };

  // Adjust initial board to match standard setup (simplified for now)
  initialBoard.points[5] = 5; // White on point 6
  initialBoard.points[7] = 3; // White on point 8
  initialBoard.points[12] = -5; // Black on point 13
  initialBoard.points[16] = -3; // Black on point 17
  initialBoard.points[18] = 5; // White on point 19
  initialBoard.points[23] = -2; // Black on point 24

  const [board, setBoard] = useState(initialBoard);
  const [dice, setDice] = useState([0, 0]);
  const [turn, setTurn] = useState("white"); // 


  const [selectedPoint, setSelectedPoint] = useState(null);
  const [moves, setMoves] = useState(0);
  const [gameWon, setGameWon] = useState(false);

  useEffect(() => {
    rollDice();
  }, []);

  const rollDice = () => {
    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;
    setDice([die1, die2]);
  };

  const handlePointClick = (pointIndex) => {
    if (gameWon) return;
    
    if (selectedPoint === null) {
      // Select a point if it has pieces of the current player
      const pieces = board.points[pointIndex];
      if ((turn === "white" && pieces > 0) || (turn === "black" && pieces < 0)) {
        setSelectedPoint(pointIndex);
      }
    } else {
      // Try to move from selected point to this point
      if (canMoveTo(selectedPoint, pointIndex)) {
        makeMove(selectedPoint, pointIndex);
        setSelectedPoint(null);
        setMoves(moves + 1);
        
        // Switch turns after move
        setTimeout(() => {
          setTurn(turn === "white" ? "black" : "white");
          rollDice();
        }, 500);
      } else {
        setSelectedPoint(null);
      }
    }
  };

  const canMoveTo = (fromPoint, toPoint) => {
    // Simplified move validation
    const distance = Math.abs(toPoint - fromPoint);
    return dice.includes(distance);
  };

  const makeMove = (fromPoint, toPoint) => {
    const newBoard = { ...board };
    const pieces = newBoard.points[fromPoint];
    
    if (turn === "white" && pieces > 0) {
      newBoard.points[fromPoint]--;
      newBoard.points[toPoint]++;
    } else if (turn === "black" && pieces < 0) {
      newBoard.points[fromPoint]++;
      newBoard.points[toPoint]--;
    }
    
    setBoard(newBoard);
    
    // Check for win condition (simplified)
    if (checkWinCondition(newBoard)) {
      setGameWon(true);
      onLevelComplete?.();
    }
  };

  const checkWinCondition = (currentBoard) => {
    // Simplified win condition - all pieces in home
    const whiteHome = currentBoard.home[0];
    const blackHome = currentBoard.home[1];
    return whiteHome >= 15 || blackHome >= 15;
  };

  const resetGame = () => {
    setBoard(initialBoard);
    setDice([0, 0]);
    setTurn("white");
    setSelectedPoint(null);
    setMoves(0);
    setGameWon(false);
    rollDice();
  };

  const renderPoint = (pointIndex) => {
    const pieces = board.points[pointIndex];
    const isSelected = selectedPoint === pointIndex;
    
    return (
      <div
        key={pointIndex}
        className={`w-12 h-20 border-2 cursor-pointer flex flex-col items-center justify-end ${
          isSelected ? 'border-yellow-400 bg-yellow-100' : 'border-gray-400 bg-gray-100'
        }`}
        onClick={() => handlePointClick(pointIndex)}
      >
        <div className="text-xs text-gray-600">{pointIndex + 1}</div>
        {pieces > 0 && (
          <div className="flex flex-col">
            {Array(Math.min(pieces, 5)).fill().map((_, i) => (
              <div key={i} className="w-8 h-3 bg-white border border-gray-400 rounded-full mb-1"></div>
            ))}
            {pieces > 5 && <div className="text-xs text-center">+{pieces - 5}</div>}
          </div>
        )}
        {pieces < 0 && (
          <div className="flex flex-col">
            {Array(Math.min(Math.abs(pieces), 5)).fill().map((_, i) => (
              <div key={i} className="w-8 h-3 bg-black border border-gray-400 rounded-full mb-1"></div>
            ))}
            {Math.abs(pieces) > 5 && <div className="text-xs text-center text-white">+{Math.abs(pieces) - 5}</div>}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-700 to-amber-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button onClick={onBack} variant="outline" className="text-white border-white hover:bg-white hover:text-black">
            <Home className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-1">🎲 Backgammon</h1>
            <p className="text-amber-200">Level {level} - {turn === "white" ? "White" : "Black"}'s Turn</p>
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

        {/* Dice */}
        <div className="text-center mb-6">
          <div className="bg-white bg-opacity-20 rounded-lg p-4 inline-block backdrop-blur-sm">
            <div className="flex items-center justify-center space-x-4 text-white">
              <div className="w-12 h-12 bg-white text-black rounded border-2 border-gray-400 flex items-center justify-center text-xl font-bold">
                {dice[0]}
              </div>
              <div className="w-12 h-12 bg-white text-black rounded border-2 border-gray-400 flex items-center justify-center text-xl font-bold">
                {dice[1]}
              </div>
            </div>
            <p className="text-amber-200 text-sm mt-2">Moves: {moves}</p>
          </div>
        </div>

        {/* Game Board */}
        <div className="flex justify-center mb-8">
          <div className="bg-amber-600 p-4 rounded-lg border-4 border-amber-800">
            {/* Top half of board */}
            <div className="grid grid-cols-12 gap-1 mb-4">
              {Array(12).fill().map((_, i) => renderPoint(i + 12))}
            </div>
            
            {/* Bar */}
            <div className="h-8 bg-amber-800 mb-4 flex items-center justify-center">
              <div className="text-white text-sm">Bar</div>
            </div>
            
            {/* Bottom half of board */}
            <div className="grid grid-cols-12 gap-1">
              {Array(12).fill().map((_, i) => renderPoint(11 - i))}
            </div>
          </div>
        </div>

        {/* Win Message */}
        {gameWon && (
          <div className="text-center">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6 rounded-xl inline-block shadow-2xl border-4 border-white">
              <div className="text-4xl mb-2">🎉</div>
              <h2 className="text-2xl font-bold mb-2">Level Complete!</h2>
              <p className="text-lg">{turn === "white" ? "White" : "Black"} wins!</p>
              <div className="mt-4 text-3xl">⭐⭐⭐</div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-center mt-8">
          <div className="bg-white bg-opacity-10 rounded-lg p-4 max-w-2xl mx-auto backdrop-blur-sm">
            <h3 className="text-white font-semibold mb-2">How to Play:</h3>
            <p className="text-amber-200 text-sm">
              Move your checkers according to the dice roll. Get all your pieces to the home board to win.
              Click a point with your pieces, then click where you want to move.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Backgammon;

