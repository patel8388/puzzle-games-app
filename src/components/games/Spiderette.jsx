import React, { useState, useEffect } from 'react';

const Spiderette = ({ level = 1, onComplete, onBack }) => {
  const [tableau, setTableau] = useState([]);
  const [stock, setStock] = useState([]);
  const [foundation, setFoundation] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [selectedSource, setSelectedSource] = useState(null);
  const [moves, setMoves] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [score, setScore] = useState(0);
  const [hint, setHint] = useState(null);

  const suits = ['♠'];
  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

  useEffect(() => {
    initializeGame();
  }, [level]);

  const initializeGame = () => {
    // Create 2 decks of spades only for Spiderette
    const deck = [];
    for (let deckNum = 0; deckNum < 2; deckNum++) {
      suits.forEach(suit => {
        ranks.forEach((rank, index) => {
          deck.push({
            suit,
            rank,
            value: index + 1,
            color: 'black',
            faceUp: false,
            id: `${suit}-${rank}-${deckNum}`,
            deckNum
          });
        });
      });
    }

    // Shuffle the deck
    const shuffledDeck = shuffleDeck(deck);
    
    // Deal cards to tableau (7 columns)
    const newTableau = Array(7).fill().map(() => []);
    let deckIndex = 0;
    
    // Deal cards: first 4 columns get 6 cards, last 3 get 5 cards
    for (let col = 0; col < 7; col++) {
      const cardsInColumn = col < 4 ? 6 : 5;
      for (let row = 0; row < cardsInColumn; row++) {
        const card = { ...shuffledDeck[deckIndex] };
        if (row === cardsInColumn - 1) card.faceUp = true; // Top card is face up
        newTableau[col].push(card);
        deckIndex++;
      }
    }

    // Remaining cards go to stock
    const remainingCards = shuffledDeck.slice(deckIndex);

    setTableau(newTableau);
    setStock(remainingCards);
    setFoundation([]);
    setSelectedCards([]);
    setSelectedSource(null);
    setMoves(0);
    setGameWon(false);
    setScore(0);
    setHint(null);
  };

  const shuffleDeck = (deck) => {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const dealFromStock = () => {
    if (stock.length === 0) return;

    const newTableau = [...tableau];
    const newStock = [...stock];

    // Deal one card to each column
    for (let col = 0; col < 7 && newStock.length > 0; col++) {
      const card = { ...newStock.pop(), faceUp: true };
      newTableau[col].push(card);
    }

    setTableau(newTableau);
    setStock(newStock);
    setMoves(moves + 1);
    checkForCompletedSequences(newTableau);
  };

  const canMoveSequence = (cards, targetColumn) => {
    if (cards.length === 0) return false;

    // Check if cards form a valid descending sequence
    for (let i = 0; i < cards.length - 1; i++) {
      if (cards[i].value !== cards[i + 1].value + 1) {
        return false;
      }
    }

    const targetCol = tableau[targetColumn];
    if (targetCol.length === 0) {
      return true; // Can place any sequence on empty column
    }

    const topCard = targetCol[targetCol.length - 1];
    const bottomCard = cards[cards.length - 1];
    
    return topCard.value === bottomCard.value + 1;
  };

  const moveSequence = (cards, fromColumn, toColumn) => {
    if (!canMoveSequence(cards, toColumn)) return false;

    const newTableau = [...tableau];
    
    // Remove cards from source column
    newTableau[fromColumn] = newTableau[fromColumn].slice(0, -cards.length);
    
    // Add cards to target column
    newTableau[toColumn] = [...newTableau[toColumn], ...cards];

    // Flip top card of source column if it exists and is face down
    if (newTableau[fromColumn].length > 0) {
      const topCard = newTableau[fromColumn][newTableau[fromColumn].length - 1];
      if (!topCard.faceUp) {
        topCard.faceUp = true;
        setScore(score + 5);
      }
    }

    setTableau(newTableau);
    setMoves(moves + 1);
    checkForCompletedSequences(newTableau);
    return true;
  };

  const checkForCompletedSequences = (currentTableau) => {
    const newTableau = [...currentTableau];
    let foundSequence = false;

    for (let col = 0; col < 7; col++) {
      const column = newTableau[col];
      if (column.length >= 13) {
        // Check for complete K-A sequence
        const topCards = column.slice(-13);
        if (isCompleteSequence(topCards)) {
          // Remove the sequence and add to foundation
          newTableau[col] = column.slice(0, -13);
          setFoundation(prev => [...prev, topCards]);
          setScore(score + 100);
          foundSequence = true;

          // Flip top card if exists
          if (newTableau[col].length > 0) {
            const topCard = newTableau[col][newTableau[col].length - 1];
            if (!topCard.faceUp) {
              topCard.faceUp = true;
              setScore(score + 5);
            }
          }
        }
      }
    }

    if (foundSequence) {
      setTableau(newTableau);
      
      // Check for win condition
      if (foundation.length + 1 >= 8) { // 8 complete sequences needed
        setGameWon(true);
        onComplete?.({
          level,
          moves,
          time: Date.now(),
          score: score + Math.max(1000 - moves * 5, 100)
        });
      }
    }
  };

  const isCompleteSequence = (cards) => {
    if (cards.length !== 13) return false;
    
    // Check if it's K down to A
    for (let i = 0; i < 12; i++) {
      if (cards[i].value !== 13 - i) return false;
    }
    return cards[12].value === 1; // Ace
  };

  const getSelectableSequence = (column, cardIndex) => {
    const cards = [];
    for (let i = cardIndex; i < column.length; i++) {
      const card = column[i];
      if (!card.faceUp) break;
      
      if (cards.length > 0 && card.value !== cards[cards.length - 1].value - 1) {
        break;
      }
      
      cards.push(card);
    }
    return cards;
  };

  const handleCardClick = (columnIndex, cardIndex) => {
    const column = tableau[columnIndex];
    const card = column[cardIndex];
    
    if (!card.faceUp) return;

    if (selectedCards.length > 0 && selectedSource?.column === columnIndex) {
      // Deselect
      setSelectedCards([]);
      setSelectedSource(null);
      return;
    }

    if (selectedCards.length > 0) {
      // Try to move selected cards to this column
      const moved = moveSequence(selectedCards, selectedSource.column, columnIndex);
      if (moved) {
        setSelectedCards([]);
        setSelectedSource(null);
      }
    } else {
      // Select sequence starting from this card
      const sequence = getSelectableSequence(column, cardIndex);
      if (sequence.length > 0) {
        setSelectedCards(sequence);
        setSelectedSource({ column: columnIndex, startIndex: cardIndex });
      }
    }
  };

  const handleEmptyColumnClick = (columnIndex) => {
    if (selectedCards.length > 0) {
      const moved = moveSequence(selectedCards, selectedSource.column, columnIndex);
      if (moved) {
        setSelectedCards([]);
        setSelectedSource(null);
      }
    }
  };

  const resetGame = () => {
    initializeGame();
  };

  const getHint = () => {
    // Simple hint: find any valid move
    for (let fromCol = 0; fromCol < 7; fromCol++) {
      const column = tableau[fromCol];
      for (let cardIndex = 0; cardIndex < column.length; cardIndex++) {
        const card = column[cardIndex];
        if (!card.faceUp) continue;
        
        const sequence = getSelectableSequence(column, cardIndex);
        if (sequence.length === 0) continue;
        
        for (let toCol = 0; toCol < 7; toCol++) {
          if (fromCol === toCol) continue;
          if (canMoveSequence(sequence, toCol)) {
            setHint({ from: fromCol, to: toCol, card: card.rank });
            setTimeout(() => setHint(null), 3000);
            return;
          }
        }
      }
    }
    setHint({ message: "No moves available. Try dealing from stock." });
    setTimeout(() => setHint(null), 3000);
  };

  const renderCard = (card, isSelected = false) => {
    return (
      <div
        className={`w-12 h-16 border rounded text-xs flex flex-col items-center justify-center cursor-pointer transition-all ${
          card.faceUp
            ? `bg-white text-black border-gray-300 hover:shadow-lg`
            : 'bg-red-800 border-red-600 text-white'
        } ${isSelected ? 'ring-2 ring-blue-400 transform scale-105' : ''}`}
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
          <h1 className="text-3xl font-bold text-white">♠ Spiderette ♠</h1>
          <div className="text-white text-right">
            <div>Level {level}</div>
            <div>Moves: {moves}</div>
            <div>Score: {score}</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-4">
            <button
              onClick={dealFromStock}
              disabled={stock.length === 0}
              className={`px-4 py-2 rounded-lg font-bold text-white transition-all ${
                stock.length > 0
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-gray-500 cursor-not-allowed'
              }`}
            >
              Deal ({stock.length})
            </button>
            <button
              onClick={getHint}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Hint
            </button>
          </div>

          <div className="text-white text-center">
            <div>Completed: {foundation.length}/8</div>
            {hint && (
              <div className="text-yellow-300 text-sm mt-1">
                {hint.message || `Move ${hint.card} from column ${hint.from + 1} to ${hint.to + 1}`}
              </div>
            )}
          </div>

          <div className="flex space-x-2">
            {Array(8).fill().map((_, index) => (
              <div 
                key={index} 
                className="w-12 h-16 border-2 border-dashed border-white rounded flex items-center justify-center"
              >
                {foundation[index] ? (
                  <div className="text-white text-xs">K-A</div>
                ) : (
                  <span className="text-white text-xs">♠</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tableau */}
        <div className="grid grid-cols-7 gap-2 mb-6">
          {tableau.map((column, colIndex) => (
            <div key={colIndex} className="min-h-20">
              {column.map((card, cardIndex) => {
                const isSelected = selectedCards.some(c => c.id === card.id);
                return (
                  <div 
                    key={cardIndex} 
                    style={{ marginTop: cardIndex > 0 ? '-40px' : '0', zIndex: cardIndex }}
                    className="relative"
                    onClick={() => handleCardClick(colIndex, cardIndex)}
                  >
                    {renderCard(card, isSelected)}
                  </div>
                );
              })}
              {column.length === 0 && (
                <div 
                  className="w-12 h-16 border-2 border-dashed border-white rounded flex items-center justify-center cursor-pointer hover:bg-white hover:bg-opacity-10"
                  onClick={() => handleEmptyColumnClick(colIndex)}
                >
                  <span className="text-white text-xs">Empty</span>
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
              <p className="text-lg">You completed Spiderette!</p>
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
            <li>• Build sequences from King down to Ace in the same suit</li>
            <li>• Move sequences of cards that are in descending order</li>
            <li>• Complete sequences (K-A) are automatically removed</li>
            <li>• Clear all 8 sequences to win</li>
            <li>• Click "Deal" to add cards when stuck</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Spiderette;

