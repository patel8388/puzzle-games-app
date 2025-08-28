import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { RotateCcw, Lightbulb, Home } from 'lucide-react'

const ColorCards = ({ level = 1, onLevelComplete, onBack }) => {
  const generateLevel = (levelNum) => {
    const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange']
    const shapes = ['circle', 'square', 'triangle', 'star']
    const numbers = [1, 2, 3, 4, 5]

    const numCards = Math.min(10 + levelNum * 2, 24) // Max 24 cards
    const targetMatches = Math.min(3 + Math.floor(levelNum / 5), 8) // Max 8 matches

    const cards = []
    for (let i = 0; i < numCards; i++) {
      cards.push({
        id: i,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        number: numbers[Math.floor(Math.random() * numbers.length)],
        selected: false,
        matched: false,
      })
    }

    return { cards, targetMatches }
  }

  const [gameState, setGameState] = useState(() => {
    const levelData = generateLevel(level)
    return {
      ...levelData,
      selectedCards: [],
      matchesFound: 0,
      moves: 0,
      gameOver: false,
      completed: false,
      hint: false,
    }
  })

  const checkMatch = (card1, card2) => {
    // Match if at least two properties are the same
    let matchingProperties = 0
    if (card1.color === card2.color) matchingProperties++
    if (card1.shape === card2.shape) matchingProperties++
    if (card1.number === card2.number) matchingProperties++
    return matchingProperties >= 2
  }

  const handleCardClick = (clickedCardId) => {
    if (gameState.gameOver || gameState.completed) return

    setGameState((prev) => {
      const newCards = prev.cards.map((card) =>
        card.id === clickedCardId ? { ...card, selected: !card.selected } : card
      )
      const newSelectedCards = newCards.filter((card) => card.selected)

      if (newSelectedCards.length === 2) {
        const [card1, card2] = newSelectedCards
        const isMatch = checkMatch(card1, card2)

        if (isMatch) {
          const updatedCards = newCards.map((card) =>
            card.id === card1.id || card.id === card2.id
              ? { ...card, matched: true, selected: false }
              : card
          )
          const newMatchesFound = prev.matchesFound + 1
          const completed = newMatchesFound >= prev.targetMatches

          if (completed) {
            setTimeout(() => onLevelComplete(), 1500)
          }

          return {
            ...prev,
            cards: updatedCards,
            selectedCards: [],
            matchesFound: newMatchesFound,
            moves: prev.moves + 1,
            completed,
          }
        } else {
          // No match, deselect after a short delay
          setTimeout(() => {
            setGameState((current) => ({
              ...current,
              cards: current.cards.map((card) =>
                card.id === card1.id || card.id === card2.id
                  ? { ...card, selected: false }
                  : card
              ),
              selectedCards: [],
            }))
          }, 800)
          return { ...prev, selectedCards: newSelectedCards, moves: prev.moves + 1 }
        }
      }

      return { ...prev, cards: newCards, selectedCards: newSelectedCards }
    })
  }

  const resetGame = () => {
    const levelData = generateLevel(level)
    setGameState({
      ...levelData,
      selectedCards: [],
      matchesFound: 0,
      moves: 0,
      gameOver: false,
      completed: false,
      hint: false,
    })
  }

  const showHint = () => {
    setGameState((prev) => ({ ...prev, hint: !prev.hint }))
  }

  const getShapeSVG = (shape, color) => {
    const fillColor = `var(--${color}-500)` // Using CSS variables for colors
    switch (shape) {
      case 'circle':
        return <circle cx="50" cy="50" r="40" fill={fillColor} />
      case 'square':
        return <rect x="10" y="10" width="80" height="80" fill={fillColor} />
      case 'triangle':
        return <polygon points="50,10 90,90 10,90" fill={fillColor} />
      case 'star':
        return <polygon points="50,10 61,35 89,35 68,54 79,79 50,65 21,79 32,54 11,35 39,35" fill={fillColor} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-700 to-indigo-900 p-4">
      <style>
        {`
          :root {
            --red-500: #ef4444;
            --blue-500: #3b82f6;
            --green-500: #22c55e;
            --yellow-500: #eab308;
            --purple-500: #a855f7;
            --orange-500: #f97316;
          }
        `}
      </style>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button onClick={onBack} variant="outline" className="text-white border-white hover:bg-white hover:text-black">
            <Home className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-1">🌈 Color Cards</h1>
            <p className="text-blue-200">Level {level}</p>
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
                <p className="text-lg font-semibold">Matches: {gameState.matchesFound}/{gameState.targetMatches}</p>
              </div>
              <div>
                <p className="text-lg font-semibold">Moves: {gameState.moves}</p>
              </div>
            </div>
            <div className="mt-2">
              <div className="w-64 bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-400 to-teal-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(gameState.matchesFound / gameState.targetMatches) * 100}%` }}
                ></div>
              </div>
            </div>
            <p className="text-blue-200 text-sm mt-2">
              {gameState.hint ? "💡 Find two cards that share at least two properties (color, shape, or number)!" : "Match cards by color, shape, or number"}
            </p>
          </div>
        </div>

        {/* Game Board */}
        <div className="flex justify-center mb-8">
          <div className="bg-white bg-opacity-10 p-4 rounded-xl shadow-2xl backdrop-blur-sm">
            <div
              className="grid gap-3"
              style={{
                gridTemplateColumns: `repeat(${Math.sqrt(gameState.cards.length)}, 1fr)`,
                gridTemplateRows: `repeat(${Math.sqrt(gameState.cards.length)}, 1fr)`,
              }}
            >
              {gameState.cards.map((card) => (
                <div
                  key={card.id}
                  className={`w-24 h-24 rounded-lg cursor-pointer transition-all duration-200 flex flex-col items-center justify-center text-xl font-bold border-4
                    ${card.matched ? 'border-green-400 bg-green-200' : card.selected ? 'border-yellow-400 bg-yellow-100' : 'border-gray-300 bg-white'}
                    ${card.matched ? 'opacity-50' : ''}
                  `}
                  onClick={() => handleCardClick(card.id)}
                  style={{ '--card-color': `var(--${card.color}-500)` }}
                >
                  <svg width="60" height="60" viewBox="0 0 100 100">
                    {getShapeSVG(card.shape, card.color)}
                  </svg>
                  <span className="mt-1 text-gray-800">{card.number}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Win Message */}
        {gameState.completed && (
          <div className="text-center">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6 rounded-xl inline-block shadow-2xl border-4 border-white">
              <div className="text-4xl mb-2">🎉</div>
              <h2 className="text-2xl font-bold mb-2">Level Complete!</h2>
              <p className="text-lg">You found all {gameState.matchesFound} matches in {gameState.moves} moves!</p>
              <div className="mt-4 text-3xl">⭐⭐⭐</div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-center mt-8">
          <div className="bg-white bg-opacity-10 rounded-lg p-4 max-w-2xl mx-auto backdrop-blur-sm">
            <h3 className="text-white font-semibold mb-2">How to Play:</h3>
            <p className="text-blue-200 text-sm">
              Click on two cards. If they share at least two properties (color, shape, or number), they match! Find all target matches to win.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ColorCards


