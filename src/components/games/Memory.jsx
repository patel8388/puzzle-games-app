import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { RotateCcw, Lightbulb, Home } from 'lucide-react'

const Memory = ({ level = 1, onLevelComplete, onBack }) => {
  // Generate level data based on level number
  const generateLevel = (levelNum) => {
    const symbols = ['🍎', '🍊', '🍌', '🍇', '🍓', '🥝', '🍑', '🥭', '🍍', '🥥', '🍒', '🍈', '🫐', '🍋', '🥑', '🍅']
    const gridSize = Math.min(4 + Math.floor(levelNum / 8), 6) // 4x4 to 6x6
    const totalCards = gridSize * gridSize
    const pairs = totalCards / 2
    
    // Select symbols for this level
    const selectedSymbols = symbols.slice(0, pairs)
    
    // Create pairs and shuffle
    const cards = []
    selectedSymbols.forEach((symbol, index) => {
      cards.push({ id: index * 2, symbol, matched: false })
      cards.push({ id: index * 2 + 1, symbol, matched: false })
    })
    
    // Shuffle cards
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]]
    }
    
    return { cards, gridSize, pairs }
  }

  const [gameState, setGameState] = useState(() => {
    const levelData = generateLevel(level)
    return {
      ...levelData,
      flippedCards: [],
      matchedPairs: 0,
      moves: 0,
      timeLeft: Math.max(60 - level * 2, 30), // Less time for higher levels
      gameOver: false,
      completed: false,
      hint: false,
      showingHint: false
    }
  })

  // Timer effect
  useEffect(() => {
    if (gameState.timeLeft > 0 && !gameState.gameOver && !gameState.completed) {
      const timer = setTimeout(() => {
        setGameState(prev => {
          const newTimeLeft = prev.timeLeft - 1
          if (newTimeLeft <= 0) {
            return { ...prev, timeLeft: 0, gameOver: true }
          }
          return { ...prev, timeLeft: newTimeLeft }
        })
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [gameState.timeLeft, gameState.gameOver, gameState.completed])

  // Check for matches when two cards are flipped
  useEffect(() => {
    if (gameState.flippedCards.length === 2) {
      const [first, second] = gameState.flippedCards
      const firstCard = gameState.cards[first]
      const secondCard = gameState.cards[second]
      
      if (firstCard.symbol === secondCard.symbol) {
        // Match found
        setTimeout(() => {
          setGameState(prev => {
            const newCards = [...prev.cards]
            newCards[first].matched = true
            newCards[second].matched = true
            
            const newMatchedPairs = prev.matchedPairs + 1
            const completed = newMatchedPairs === prev.pairs
            
            return {
              ...prev,
              cards: newCards,
              flippedCards: [],
              matchedPairs: newMatchedPairs,
              completed
            }
          })
          
          if (gameState.matchedPairs + 1 === gameState.pairs) {
            setTimeout(() => onLevelComplete(), 1500)
          }
        }, 1000)
      } else {
        // No match
        setTimeout(() => {
          setGameState(prev => ({
            ...prev,
            flippedCards: []
          }))
        }, 1000)
      }
    }
  }, [gameState.flippedCards, gameState.cards, gameState.matchedPairs, gameState.pairs, onLevelComplete])

  const handleCardClick = (index) => {
    if (gameState.gameOver || gameState.completed) return
    if (gameState.flippedCards.length >= 2) return
    if (gameState.flippedCards.includes(index)) return
    if (gameState.cards[index].matched) return

    setGameState(prev => ({
      ...prev,
      flippedCards: [...prev.flippedCards, index],
      moves: prev.flippedCards.length === 0 ? prev.moves + 1 : prev.moves
    }))
  }

  const resetGame = () => {
    const levelData = generateLevel(level)
    setGameState({
      ...levelData,
      flippedCards: [],
      matchedPairs: 0,
      moves: 0,
      timeLeft: Math.max(60 - level * 2, 30),
      gameOver: false,
      completed: false,
      hint: false,
      showingHint: false
    })
  }

  const showHint = () => {
    if (gameState.showingHint) return
    
    setGameState(prev => ({ ...prev, showingHint: true }))
    
    // Briefly show all cards
    setTimeout(() => {
      setGameState(prev => ({ ...prev, showingHint: false }))
    }, 2000)
  }

  const toggleHint = () => {
    setGameState(prev => ({ ...prev, hint: !prev.hint }))
  }

  const isCardVisible = (index) => {
    return gameState.flippedCards.includes(index) || 
           gameState.cards[index].matched || 
           gameState.showingHint
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-600 to-pink-600 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button onClick={onBack} variant="outline" className="text-white border-white hover:bg-white hover:text-black">
            <Home className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-1">🧠 Memory</h1>
            <p className="text-purple-200">Level {level}</p>
          </div>
          <div className="flex space-x-2">
            <Button onClick={toggleHint} variant="outline" size="sm" className="text-white border-white hover:bg-yellow-500">
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
                <p className="text-lg font-semibold">Pairs: {gameState.matchedPairs}/{gameState.pairs}</p>
                <p className="text-sm">Moves: {gameState.moves}</p>
              </div>
              <div>
                <p className={`text-lg font-semibold ${gameState.timeLeft <= 10 ? 'text-red-300' : ''}`}>
                  Time: {formatTime(gameState.timeLeft)}
                </p>
                {gameState.showingHint && <p className="text-sm text-yellow-300">Showing hint...</p>}
              </div>
            </div>
            <div className="mt-2">
              <div className="w-64 bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-yellow-400 to-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(gameState.matchedPairs / gameState.pairs) * 100}%` }}
                ></div>
              </div>
            </div>
            <p className="text-purple-200 text-sm mt-2">
              {gameState.hint ? "💡 Remember the positions of matching symbols. Use the hint button to peek at all cards!" : "Find all matching pairs before time runs out"}
            </p>
          </div>
        </div>

        {/* Game Board */}
        <div className="flex justify-center mb-8">
          <div className="bg-white bg-opacity-10 p-4 rounded-xl shadow-2xl backdrop-blur-sm">
            <div 
              className="grid gap-3"
              style={{ 
                gridTemplateColumns: `repeat(${gameState.gridSize}, 1fr)`,
                gridTemplateRows: `repeat(${gameState.gridSize}, 1fr)`
              }}
            >
              {gameState.cards.map((card, index) => (
                <div
                  key={index}
                  className={`w-16 h-16 rounded-lg cursor-pointer transition-all duration-300 flex items-center justify-center text-2xl font-bold ${
                    isCardVisible(index)
                      ? card.matched 
                        ? 'bg-green-400 scale-105 shadow-lg' 
                        : 'bg-white shadow-lg'
                      : 'bg-purple-400 hover:bg-purple-300 hover:scale-105'
                  }`}
                  onClick={() => handleCardClick(index)}
                >
                  {isCardVisible(index) ? (
                    <span className="drop-shadow-sm">{card.symbol}</span>
                  ) : (
                    <span className="text-white">?</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Hint Button */}
        <div className="text-center mb-6">
          <Button 
            onClick={showHint} 
            disabled={gameState.showingHint}
            className="bg-yellow-500 hover:bg-yellow-600 text-black"
          >
            {gameState.showingHint ? 'Showing...' : 'Peek at All Cards (2s)'}
          </Button>
        </div>

        {/* Game Over Message */}
        {gameState.gameOver && !gameState.completed && (
          <div className="text-center">
            <div className="bg-red-600 text-white p-6 rounded-xl inline-block shadow-2xl border-4 border-white">
              <div className="text-4xl mb-2">⏰</div>
              <h2 className="text-2xl font-bold mb-2">Time's Up!</h2>
              <p className="text-lg">You found {gameState.matchedPairs} out of {gameState.pairs} pairs in {gameState.moves} moves.</p>
              <Button onClick={resetGame} className="mt-4 bg-white text-red-600 hover:bg-gray-100">
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Win Message */}
        {gameState.completed && (
          <div className="text-center">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6 rounded-xl inline-block shadow-2xl border-4 border-white">
              <div className="text-4xl mb-2">🎉</div>
              <h2 className="text-2xl font-bold mb-2">Perfect Memory!</h2>
              <p className="text-lg">You found all {gameState.pairs} pairs in {gameState.moves} moves with {formatTime(gameState.timeLeft)} remaining!</p>
              <div className="mt-4 text-3xl">⭐⭐⭐</div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-center mt-8">
          <div className="bg-white bg-opacity-10 rounded-lg p-4 max-w-2xl mx-auto backdrop-blur-sm">
            <h3 className="text-white font-semibold mb-2">How to Play:</h3>
            <p className="text-purple-200 text-sm">
              Click cards to flip them and find matching pairs. Remember the positions! 
              Find all pairs before time runs out to complete the level.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Memory

