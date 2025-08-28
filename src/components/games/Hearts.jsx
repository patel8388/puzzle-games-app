import React, { useState, useEffect } from 'react';

const Hearts = ({ level = 1, onComplete, onBack }) => {
  const [gameState, setGameState] = useState('dealing');
  const [players, setPlayers] = useState([]);
  const [currentTrick, setCurrentTrick] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [selectedCard, setSelectedCard] = useState(null);
  const [trickWinner, setTrickWinner] = useState(null);
  const [scores, setScores] = useState([0, 0, 0, 0]);
  const [roundScores, setRoundScores] = useState([0, 0, 0, 0]);
  const [heartsBroken, setHeartsBroken] = useState(false);
  const [tricksPlayed, setTricksPlayed] = useState(0);
  const [gameWinner, setGameWinner] = useState(null);
  const [moves, setMoves] = useState(0);

  const suits = ['♠', '♥', '♦', '♣'];
  const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const playerNames = ['You', 'North', 'East', 'South'];

  useEffect(() => {
    initializeGame();
  }, [level]);

  const initializeGame = () => {
    const deck = createDeck();
    const shuffledDeck = shuffleDeck(deck);
    
    // Deal 13 cards to each player
    const newPlayers = Array(4).fill().map((_, index) => ({
      id: index,
      name: playerNames[index],
      hand: shuffledDeck.slice(index * 13, (index + 1) * 13).sort(sortCards),
      tricksWon: []
    }));

    setPlayers(newPlayers);
    setCurrentTrick([]);
    setCurrentPlayer(findPlayerWithTwoOfClubs(newPlayers));
    setSelectedCard(null);
    setTrickWinner(null);
    setRoundScores([0, 0, 0, 0]);
    setHeartsBroken(false);
    setTricksPlayed(0);
    setGameWinner(null);
    setMoves(0);
    setGameState('playing');
  };

  const createDeck = () => {
    const deck = [];
    suits.forEach(suit => {
      ranks.forEach((rank, index) => {
        deck.push({
          suit,
          rank,
          value: index + 2,
          color: suit === '♥' || suit === '♦' ? 'red' : 'black',
          id: `${suit}-${rank}`,
          points: getCardPoints(suit, rank)
        });
      });
    });
    return deck;
  };

  const getCardPoints = (suit, rank) => {
    if (suit === '♥') return 1;
    if (suit === '♠' && rank === 'Q') return 13;
    return 0;
  };

  const shuffleDeck = (deck) => {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const sortCards = (a, b) => {
    const suitOrder = { '♣': 0, '♦': 1, '♠': 2, '♥': 3 };
    if (suitOrder[a.suit] !== suitOrder[b.suit]) {
      return suitOrder[a.suit] - suitOrder[b.suit];
    }
    return a.value - b.value;
  };

  const findPlayerWithTwoOfClubs = (players) => {
    for (let i = 0; i < players.length; i++) {
      if (players[i].hand.some(card => card.suit === '♣' && card.rank === '2')) {
        return i;
      }
    }
    return 0;
  };

  const isValidPlay = (card, playerIndex) => {
    const player = players[playerIndex];
    const leadSuit = currentTrick.length > 0 ? currentTrick[0].card.suit : null;

    // First trick must start with 2 of clubs
    if (tricksPlayed === 0 && currentTrick.length === 0) {
      return card.suit === '♣' && card.rank === '2';
    }

    // Must follow suit if possible
    if (leadSuit && card.suit !== leadSuit) {
      const hasLeadSuit = player.hand.some(c => c.suit === leadSuit);
      if (hasLeadSuit) return false;
    }

    // Can't play hearts or queen of spades on first trick
    if (tricksPlayed === 0) {
      if (card.suit === '♥' || (card.suit === '♠' && card.rank === 'Q')) {
        return false;
      }
    }

    // Can't lead hearts unless hearts broken or only hearts left
    if (currentTrick.length === 0 && card.suit === '♥' && !heartsBroken) {
      const hasNonHearts = player.hand.some(c => c.suit !== '♥');
      if (hasNonHearts) return false;
    }

    return true;
  };

  const playCard = (card, playerIndex) => {
    if (!isValidPlay(card, playerIndex)) return;

    const newPlayers = [...players];
    newPlayers[playerIndex].hand = newPlayers[playerIndex].hand.filter(c => c.id !== card.id);
    setPlayers(newPlayers);

    const newTrick = [...currentTrick, { card, player: playerIndex }];
    setCurrentTrick(newTrick);
    setMoves(moves + 1);

    // Check if hearts broken
    if (card.suit === '♥') {
      setHeartsBroken(true);
    }

    if (newTrick.length === 4) {
      // Trick complete, determine winner
      const winner = determineTrickWinner(newTrick);
      setTrickWinner(winner);
      
      setTimeout(() => {
        completeTrick(newTrick, winner);
      }, 2000);
    } else {
      // Next player's turn
      setCurrentPlayer((currentPlayer + 1) % 4);
      
      // AI players play automatically
      if ((currentPlayer + 1) % 4 !== 0) {
        setTimeout(() => {
          playAICard((currentPlayer + 1) % 4);
        }, 1000);
      }
    }
  };

  const determineTrickWinner = (trick) => {
    const leadSuit = trick[0].card.suit;
    let winner = trick[0];
    
    for (let i = 1; i < trick.length; i++) {
      const current = trick[i];
      if (current.card.suit === leadSuit && current.card.value > winner.card.value) {
        winner = current;
      }
    }
    
    return winner.player;
  };

  const completeTrick = (trick, winner) => {
    const newPlayers = [...players];
    newPlayers[winner].tricksWon.push(trick);
    setPlayers(newPlayers);

    setCurrentTrick([]);
    setCurrentPlayer(winner);
    setTrickWinner(null);
    setTricksPlayed(tricksPlayed + 1);

    if (tricksPlayed + 1 === 13) {
      // Round complete
      calculateRoundScores(newPlayers);
    } else if (winner !== 0) {
      // AI player leads next trick
      setTimeout(() => {
        playAICard(winner);
      }, 1000);
    }
  };

  const calculateRoundScores = (players) => {
    const newRoundScores = players.map(player => {
      return player.tricksWon.reduce((total, trick) => {
        return total + trick.reduce((trickTotal, play) => {
          return trickTotal + play.card.points;
        }, 0);
      }, 0);
    });

    // Check for shooting the moon
    const shootingPlayer = newRoundScores.findIndex(score => score === 26);
    if (shootingPlayer !== -1) {
      // Player shot the moon, others get 26 points
      for (let i = 0; i < 4; i++) {
        if (i !== shootingPlayer) {
          newRoundScores[i] = 26;
        } else {
          newRoundScores[i] = 0;
        }
      }
    }

    const newTotalScores = scores.map((score, index) => score + newRoundScores[index]);
    setScores(newTotalScores);
    setRoundScores(newRoundScores);

    // Check for game end
    const maxScore = Math.max(...newTotalScores);
    if (maxScore >= 100) {
      const winner = newTotalScores.indexOf(Math.min(...newTotalScores));
      setGameWinner(winner);
      setGameState('finished');
      
      if (winner === 0) {
        onComplete?.({
          level,
          moves,
          time: Date.now(),
          score: Math.max(1000 - newTotalScores[0] * 10, 100)
        });
      }
    } else {
      // Start new round
      setTimeout(() => {
        initializeGame();
      }, 3000);
    }
  };

  const playAICard = (playerIndex) => {
    const player = players[playerIndex];
    const validCards = player.hand.filter(card => isValidPlay(card, playerIndex));
    
    if (validCards.length > 0) {
      // Simple AI: play lowest valid card, avoid points if possible
      let cardToPlay = validCards[0];
      
      const safeCards = validCards.filter(card => card.points === 0);
      if (safeCards.length > 0) {
        cardToPlay = safeCards[0];
      }
      
      playCard(cardToPlay, playerIndex);
    }
  };

  const handleCardClick = (card) => {
    if (currentPlayer !== 0 || gameState !== 'playing') return;
    
    if (selectedCard?.id === card.id) {
      setSelectedCard(null);
      return;
    }

    if (isValidPlay(card, 0)) {
      playCard(card, 0);
      setSelectedCard(null);
    } else {
      setSelectedCard(card);
    }
  };

  const resetGame = () => {
    setScores([0, 0, 0, 0]);
    initializeGame();
  };

  const renderCard = (card, isSelected = false, isPlayable = false) => {
    return (
      <div
        className={`w-12 h-16 border rounded text-xs flex flex-col items-center justify-center cursor-pointer transition-all ${
          card.color === 'red' ? 'text-red-500' : 'text-black'
        } bg-white border-gray-300 hover:shadow-lg ${
          isSelected ? 'ring-2 ring-blue-400 transform scale-105' : ''
        } ${isPlayable ? 'hover:ring-2 hover:ring-green-400' : ''}`}
        onClick={() => handleCardClick(card)}
      >
        <div className="text-xs font-bold">{card.rank}</div>
        <div className="text-lg">{card.suit}</div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-700 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-white">♥ Hearts ♠</h1>
          <div className="text-white text-right">
            <div>Level {level}</div>
            <div>Tricks: {tricksPlayed}/13</div>
            <div>Moves: {moves}</div>
          </div>
        </div>

        {/* Scores */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {playerNames.map((name, index) => (
            <div key={index} className="bg-black bg-opacity-30 rounded-lg p-3 text-white text-center">
              <div className="font-bold">{name}</div>
              <div>Total: {scores[index]}</div>
              <div>Round: {roundScores[index]}</div>
            </div>
          ))}
        </div>

        {/* Current Trick */}
        <div className="text-center mb-6">
          <div className="text-white mb-2">
            Current Player: <span className="font-bold text-yellow-300">{playerNames[currentPlayer]}</span>
            {heartsBroken && <span className="ml-4 text-red-300">♥ Hearts Broken</span>}
          </div>
          
          <div className="flex justify-center space-x-4 mb-4">
            {currentTrick.map((play, index) => (
              <div key={index} className="text-center">
                <div className="text-white text-xs mb-1">{playerNames[play.player]}</div>
                {renderCard(play.card)}
              </div>
            ))}
            {Array(4 - currentTrick.length).fill().map((_, index) => (
              <div key={index} className="w-12 h-16 border-2 border-dashed border-white rounded opacity-50"></div>
            ))}
          </div>

          {trickWinner !== null && (
            <div className="text-yellow-300 font-bold">
              {playerNames[trickWinner]} wins the trick!
            </div>
          )}
        </div>

        {/* Player's Hand */}
        {players.length > 0 && (
          <div className="mb-6">
            <div className="text-white text-center mb-2">Your Hand:</div>
            <div className="flex flex-wrap justify-center gap-1">
              {players[0].hand.map(card => {
                const isPlayable = currentPlayer === 0 && isValidPlay(card, 0);
                return renderCard(
                  card, 
                  selectedCard?.id === card.id, 
                  isPlayable
                );
              })}
            </div>
          </div>
        )}

        {/* Game Over */}
        {gameWinner !== null && (
          <div className="text-center">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-6 rounded-xl inline-block shadow-2xl border-4 border-white">
              <div className="text-4xl mb-2">🎉</div>
              <h2 className="text-2xl font-bold mb-2">Game Over!</h2>
              <p className="text-lg">{playerNames[gameWinner]} wins!</p>
              <p className="text-sm">Final Scores: {scores.join(' - ')}</p>
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
            <li>• Avoid taking hearts (1 point each) and Queen of Spades (13 points)</li>
            <li>• Follow suit if possible, otherwise play any card</li>
            <li>• Lowest total score wins when someone reaches 100 points</li>
            <li>• First trick must start with 2 of Clubs</li>
            <li>• Can't lead hearts until hearts are "broken"</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Hearts;

