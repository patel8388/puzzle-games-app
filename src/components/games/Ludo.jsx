import React, { useState, useEffect } from 'react';

const Ludo = ({ level = 1, onComplete, onBack }) => {
  const [gameState, setGameState] = useState('playing');
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [diceValue, setDiceValue] = useState(null);
  const [canRollDice, setCanRollDice] = useState(true);
  const [players, setPlayers] = useState([]);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [moves, setMoves] = useState(0);
  const [winner, setWinner] = useState(null);

  const colors = ['#ef4444', '#3b82f6', '#22c55e', '#eab308'];
  const playerNames = ['Red', 'Blue', 'Green', 'Yellow'];

  // Initialize game
  useEffect(() => {
    initializeGame();
  }, [level]);

  const initializeGame = () => {
    // Initialize 4 players with 4 pieces each
    const newPlayers = colors.map((color, index) => ({
      id: index,
      color,
      name: playerNames[index],
      pieces: Array(4).fill().map((_, pieceIndex) => ({
        id: pieceIndex,
        position: -1, // -1 means in home
        isInHome: true,
        isFinished: false
      }))
    }));

    setPlayers(newPlayers);
    setCurrentPlayer(0);
    setDiceValue(null);
    setCanRollDice(true);
    setSelectedPiece(null);
    setMoves(0);
    setWinner(null);
    setGameState('playing');
  };

  const rollDice = () => {
    if (!canRollDice) return;
    
    const value = Math.floor(Math.random() * 6) + 1;
    setDiceValue(value);
    setCanRollDice(false);
    setMoves(moves + 1);

    // Check if player can move any piece
    setTimeout(() => {
      const player = players[currentPlayer];
      const canMove = checkIfPlayerCanMove(player, value);
      
      if (!canMove) {
        // No moves available, switch to next player
        nextPlayer();
      }
    }, 1000);
  };

  const checkIfPlayerCanMove = (player, diceValue) => {
    return player.pieces.some(piece => {
      if (piece.isFinished) return false;
      if (piece.isInHome && diceValue === 6) return true;
      if (!piece.isInHome && piece.position + diceValue <= 56) return true;
      return false;
    });
  };

  const movePiece = (playerIndex, pieceIndex) => {
    if (playerIndex !== currentPlayer || !diceValue) return;

    const newPlayers = [...players];
    const piece = newPlayers[playerIndex].pieces[pieceIndex];

    // Can't move finished pieces
    if (piece.isFinished) return;

    // Move piece from home
    if (piece.isInHome && diceValue === 6) {
      piece.isInHome = false;
      piece.position = 0;
    }
    // Move piece on board
    else if (!piece.isInHome) {
      const newPosition = piece.position + diceValue;
      if (newPosition <= 56) {
        piece.position = newPosition;
        if (newPosition === 56) {
          piece.isFinished = true;
        }
      } else {
        return; // Invalid move
      }
    } else {
      return; // Invalid move
    }

    setPlayers(newPlayers);

    // Check for win condition
    const allPiecesFinished = newPlayers[playerIndex].pieces.every(p => p.isFinished);
    if (allPiecesFinished) {
      setWinner(playerIndex);
      setGameState('won');
      onComplete?.({
        level,
        moves,
        time: Date.now(),
        score: Math.max(1000 - moves * 10, 100)
      });
      return;
    }

    // Next turn (unless rolled 6)
    if (diceValue !== 6) {
      nextPlayer();
    } else {
      setCanRollDice(true);
      setDiceValue(null);
    }
  };

  const nextPlayer = () => {
    setCurrentPlayer((currentPlayer + 1) % 4);
    setCanRollDice(true);
    setDiceValue(null);
  };

  const resetGame = () => {
    initializeGame();
  };

  const renderBoard = () => {
    return (
      <div className="relative w-80 h-80 bg-white border-4 border-gray-800 mx-auto">
        {/* Center area */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gray-200 border-2 border-gray-400 flex items-center justify-center">
          <div className="text-xs font-bold text-gray-600">LUDO</div>
        </div>

        {/* Home areas */}
        {colors.map((color, playerIndex) => {
          const positions = [
            { top: '10px', left: '10px' }, // Red
            { top: '10px', right: '10px' }, // Blue
            { bottom: '10px', left: '10px' }, // Green
            { bottom: '10px', right: '10px' } // Yellow
          ];

          return (
            <div
              key={playerIndex}
              className="absolute w-32 h-32 border-2 border-gray-400"
              style={{
                backgroundColor: color + '20',
                ...positions[playerIndex]
              }}
            >
              <div className="p-2">
                <div className="text-xs font-bold mb-1" style={{ color }}>
                  {playerNames[playerIndex]}
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {players[playerIndex]?.pieces.map((piece, pieceIndex) => (
                    <div
                      key={pieceIndex}
                      className={`w-6 h-6 rounded-full border-2 cursor-pointer transition-all ${
                        piece.isInHome ? 'border-gray-400' : 'border-white'
                      } ${
                        currentPlayer === playerIndex && diceValue && !piece.isFinished
                          ? 'hover:scale-110 hover:shadow-lg'
                          : ''
                      }`}
                      style={{
                        backgroundColor: piece.isFinished ? '#10b981' : color,
                        opacity: piece.isInHome ? 0.7 : 1
                      }}
                      onClick={() => movePiece(playerIndex, pieceIndex)}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        {/* Track pieces on board */}
        {players.map((player, playerIndex) =>
          player.pieces.map((piece, pieceIndex) => {
            if (piece.isInHome || piece.isFinished) return null;
            
            // Calculate position on track (simplified visualization)
            const trackPosition = piece.position;
            const angle = (trackPosition / 56) * 360;
            const radius = 120;
            const x = Math.cos((angle - 90) * Math.PI / 180) * radius + 160;
            const y = Math.sin((angle - 90) * Math.PI / 180) * radius + 160;

            return (
              <div
                key={`${playerIndex}-${pieceIndex}`}
                className="absolute w-4 h-4 rounded-full border-2 border-white transform -translate-x-1/2 -translate-y-1/2 z-10"
                style={{
                  backgroundColor: player.color,
                  left: `${x}px`,
                  top: `${y}px`
                }}
              />
            );
          })
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-white">Ludo</h1>
          <div className="text-white text-right">
            <div>Level {level}</div>
            <div>Moves: {moves}</div>
          </div>
        </div>

        {/* Game Status */}
        <div className="text-center mb-6">
          <div className="text-xl text-white mb-2">
            Current Player: <span style={{ color: colors[currentPlayer] }} className="font-bold">
              {playerNames[currentPlayer]}
            </span>
          </div>
          {winner !== null && (
            <div className="text-2xl font-bold text-green-400 mb-4">
              🎉 {playerNames[winner]} Wins! 🎉
            </div>
          )}
        </div>

        {/* Game Board */}
        <div className="mb-6">
          {renderBoard()}
        </div>

        {/* Dice and Controls */}
        <div className="text-center mb-6">
          <div className="mb-4">
            {diceValue && (
              <div className="inline-block w-16 h-16 bg-white border-2 border-gray-400 rounded-lg flex items-center justify-center text-2xl font-bold mb-4">
                {diceValue}
              </div>
            )}
          </div>
          
          {gameState === 'playing' && (
            <button
              onClick={rollDice}
              disabled={!canRollDice}
              className={`px-6 py-3 rounded-lg font-bold text-white transition-all ${
                canRollDice
                  ? 'bg-green-600 hover:bg-green-700 hover:scale-105'
                  : 'bg-gray-500 cursor-not-allowed'
              }`}
            >
              {canRollDice ? 'Roll Dice' : 'Move a Piece'}
            </button>
          )}

          {gameState === 'won' && (
            <button
              onClick={resetGame}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Play Again
            </button>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-black bg-opacity-30 rounded-lg p-4 text-white text-sm">
          <h3 className="font-bold mb-2">How to Play:</h3>
          <ul className="space-y-1">
            <li>• Roll the dice to move your pieces</li>
            <li>• Roll 6 to move a piece out of home</li>
            <li>• Get all 4 pieces to the finish line to win</li>
            <li>• Rolling 6 gives you another turn</li>
            <li>• Click on a piece to move it after rolling</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Ludo;


