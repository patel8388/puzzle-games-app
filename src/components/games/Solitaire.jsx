import React, { useState, useEffect } from 'react';

const Solitaire = ({ level = 1, onComplete, onBack }) => {
  const [tableau, setTableau] = useState([]);
  const [foundation, setFoundation] = useState([[], [], [], []]);
  const [waste, setWaste] = useState([]);
  const [stock, setStock] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedSource, setSelectedSource] = useState(null);
  const [moves, setMoves] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [score, setScore] = useState(0);

  const suits = ['♠', '♥', '♦', '♣'];
  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

  useEffect(() => {
    initializeGame();
  }, [level]);

  const initializeGame = () => {
    // Create a standard deck of 52 cards
    const newDeck = [];
    suits.forEach(suit => {
      ranks.forEach((rank, index) => {
        newDeck.push({
          suit,
          rank,
          value: index + 1,
          color: suit === '♥' || suit === '♦' ? 'red' : 'black',
          faceUp: false,
          id: `${suit}-${rank}`
        });
      });
    });

    // Shuffle the deck
    const shuffledDeck = shuffleDeck(newDeck);
    
    // Deal cards to tableau (7 columns)
    const newTableau = Array(7).fill().map(() => []);
    let deckIndex = 0;
    
    for (let col = 0; col < 7; col++) {
      for (let row = 0; row <= col; row++) {
        const card = { ...shuffledDeck[deckIndex] };
        if (row === col) card.faceUp = true; // Top card is face up
        newTableau[col].push(card);
        deckIndex++;
      }
    }

    // Remaining cards go to stock
    const remainingCards = shuffledDeck.slice(deckIndex);

    setTableau(newTableau);
    setStock(remainingCards);
    setWaste([]);
    setFoundation([[], [], [], []]);
    setSelectedCard(null);
    setSelectedSource(null);
    setMoves(0);
    setGameWon(false);
    setScore(0);
  };

  const shuffleDeck = (deck) => {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const drawFromStock = () => {
    if (stock.length === 0) {
      // Reset stock from waste
      if (waste.length > 0) {
        setStock([...waste].reverse().map(card => ({ ...card, faceUp: false })));
        setWaste([]);
        setMoves(moves + 1);
      }
    } else {
      const newCard = { ...stock[0], faceUp: true };
      setWaste([newCard, ...waste]);
      setStock(stock.slice(1));
      setMoves(moves + 1);
    }
  };

  const canPlaceOnFoundation = (card, foundationIndex) => {
    const foundationPile = foundation[foundationIndex];
    if (foundationPile.length === 0) {
      return card.rank === 'A';
    }
    const topCard = foundationPile[foundationPile.length - 1];
    return card.suit === topCard.suit && card.value === topCard.value + 1;
  };

  const canPlaceOnTableau = (card, tableauIndex) => {
    const tableauColumn = tableau[tableauIndex];
    if (tableauColumn.length === 0) {
      return card.rank === 'K';
    }
    const topCard = tableauColumn[tableauColumn.length - 1];
    return card.color !== topCard.color && card.value === topCard.value - 1;
  };

  const moveToFoundation = (card, foundationIndex) => {
    if (!canPlaceOnFoundation(card, foundationIndex)) return false;

    const newFoundation = [...foundation];
    newFoundation[foundationIndex] = [...newFoundation[foundationIndex], card];
    setFoundation(newFoundation);
    setScore(score + 10);
    return true;
  };

  const moveToTableau = (card, tableauIndex) => {
    if (!canPlaceOnTableau(card, tableauIndex)) return false;

    const newTableau = [...tableau];
    newTableau[tableauIndex] = [...newTableau[tableauIndex], card];
    setTableau(newTableau);
    return true;
  };

  const handleCardClick = (card, source, sourceIndex) => {
    if (!card.faceUp) return;

    if (selectedCard && selectedCard.id === card.id) {
      // Deselect
      setSelectedCard(null);
      setSelectedSource(null);
      return;
    }

    if (selectedCard) {
      // Try to move selected card to this location
      let moved = false;

      if (source === 'foundation') {
        // Can't move to foundation by clicking on it
        return;
      } else if (source === 'tableau') {
        moved = moveToTableau(selectedCard, sourceIndex);
        if (moved) {
          removeCardFromSource();
          flipTopCard();
        }
      }

      if (moved) {
        setMoves(moves + 1);
        setSelectedCard(null);
        setSelectedSource(null);
        checkWinCondition();
      }
    } else {
      // Select this card
      setSelectedCard(card);
      setSelectedSource({ type: source, index: sourceIndex });
    }
  };

  const handleFoundationClick = (foundationIndex) => {
    if (selectedCard) {
      const moved = moveToFoundation(selectedCard, foundationIndex);
      if (moved) {
        removeCardFromSource();
        flipTopCard();
        setMoves(moves + 1);
        setSelectedCard(null);
        setSelectedSource(null);
        checkWinCondition();
      }
    }
  };

  const removeCardFromSource = () => {
    if (!selectedSource) return;

    if (selectedSource.type === 'waste') {
      setWaste(waste.slice(1));
    } else if (selectedSource.type === 'tableau') {
      const newTableau = [...tableau];
      newTableau[selectedSource.index] = newTableau[selectedSource.index].slice(0, -1);
      setTableau(newTableau);
    }
  };

  const flipTopCard = () => {
    if (selectedSource?.type === 'tableau') {
      const newTableau = [...tableau];
      const column = newTableau[selectedSource.index];
      if (column.length > 0 && !column[column.length - 1].faceUp) {
        column[column.length - 1].faceUp = true;
        setTableau(newTableau);
        setScore(score + 5);
      }
    }
  };

  const checkWinCondition = () => {
    const allFoundationsFull = foundation.every(pile => pile.length === 13);
    if (allFoundationsFull) {
      setGameWon(true);
      onComplete?.({
        level,
        moves,
        time: Date.now(),
        score: score + Math.max(1000 - moves * 5, 100)
      });
    }
  };

  const resetGame = () => {
    initializeGame();
  };

  const renderCard = (card, isSelected = false) => {
    if (!card) return null;
    
    return (
      <div
        className={`w-12 h-16 border rounded text-xs flex flex-col items-center justify-center cursor-pointer transition-all ${
          card.faceUp
            ? `bg-white ${card.color === 'red' ? 'text-red-500' : 'text-black'} border-gray-300 hover:shadow-lg`
            : 'bg-blue-800 border-blue-600 text-white'
        } ${isSelected ? 'ring-2 ring-yellow-400 transform scale-105' : ''}`}
      >
        {card.faceUp ? (
          <>
            <div className="text-xs font-bold">{card.rank}</div>
            <div className="text-lg">{card.suit}</div>
          </>
        ) : (
          <div className="text-xs">🂠</div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-emerald-800 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-white">♠ Solitaire ♥</h1>
          <div className="text-white text-right">
            <div>Level {level}</div>
            <div>Moves: {moves}</div>
            <div>Score: {score}</div>
          </div>
        </div>

        {/* Foundation and Stock */}
        <div className="flex justify-between mb-6">
          <div className="flex space-x-2">
            <div
              className="w-12 h-16 border-2 border-dashed border-white rounded cursor-pointer flex items-center justify-center hover:bg-white hover:bg-opacity-10"
              onClick={drawFromStock}
            >
              {stock.length > 0 ? (
                renderCard({ faceUp: false, suit: '🂠', rank: '' })
              ) : (
                <span className="text-white text-xs text-center">↻</span>
              )}
            </div>
            <div className="w-12 h-16 border-2 border-dashed border-white rounded">
              {waste.length > 0 ? (
                <div onClick={() => handleCardClick(waste[0], 'waste', 0)}>
                  {renderCard(waste[0], selectedCard?.id === waste[0]?.id)}
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-white text-xs">Waste</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex space-x-2">
            {foundation.map((pile, index) => (
              <div 
                key={index} 
                className="w-12 h-16 border-2 border-dashed border-white rounded flex items-center justify-center cursor-pointer hover:bg-white hover:bg-opacity-10"
                onClick={() => handleFoundationClick(index)}
              >
                {pile.length > 0 ? (
                  renderCard(pile[pile.length - 1])
                ) : (
                  <span className="text-white text-lg">{suits[index]}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tableau */}
        <div className="grid grid-cols-7 gap-2 mb-6">
          {tableau.map((column, colIndex) => (
            <div key={colIndex} className="min-h-20">
              {column.map((card, cardIndex) => (
                <div 
                  key={cardIndex} 
                  style={{ marginTop: cardIndex > 0 ? '-40px' : '0', zIndex: cardIndex }}
                  className="relative"
                  onClick={() => handleCardClick(card, 'tableau', colIndex)}
                >
                  {renderCard(card, selectedCard?.id === card.id)}
                </div>
              ))}
              {column.length === 0 && (
                <div 
                  className="w-12 h-16 border-2 border-dashed border-white rounded flex items-center justify-center cursor-pointer hover:bg-white hover:bg-opacity-10"
                  onClick={() => selectedCard && handleCardClick({ rank: 'K', faceUp: true }, 'tableau', colIndex)}
                >
                  <span className="text-white text-xs">K</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Game Won Message */}
        {gameWon && (
          <div className="text-center">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-6 rounded-xl inline-block shadow-2xl border-4 border-white">
              <div className="text-4xl mb-2">🎉</div>
              <h2 className="text-2xl font-bold mb-2">Congratulations!</h2>
              <p className="text-lg">You won in {moves} moves!</p>
              <p className="text-lg">Final Score: {score}</p>
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
            <li>• Move all cards to foundation piles (Ace to King by suit)</li>
            <li>• Build down in tableau alternating colors (Red on Black, Black on Red)</li>
            <li>• Click stock to draw cards, click waste pile to select drawn card</li>
            <li>• Only Kings can be placed on empty tableau columns</li>
            <li>• Click a card to select it, then click destination to move</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Solitaire;

