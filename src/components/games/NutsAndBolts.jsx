import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { RotateCcw, Lightbulb, Home } from 'lucide-react'

const NutsAndBolts = ({ level = 1, onLevelComplete, onBack }) => {
  // Generate level data based on level number
  const generateLevel = (levelNum) => {
    const colors = ['red', 'green', 'blue', 'yellow', 'purple', 'orange']
    const numColors = Math.min(3 + Math.floor(levelNum / 10), 6)
    const piecesPerColor = 3 + Math.floor(levelNum / 20)
    const numRods = numColors + 1 + Math.floor(levelNum / 15)
    
    // Create pieces
    const pieces = []
    for (let i = 0; i < numColors; i++) {
      for (let j = 0; j < piecesPerColor; j++) {
        pieces.push({
          color: colors[i],
          type: Math.random() > 0.5 ? 'nut' : 'bolt',
          id: `${colors[i]}-${j}`
        })
      }
    }
    
    // Shuffle pieces
    for (let i = pieces.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pieces[i], pieces[j]] = [pieces[j], pieces[i]]
    }
    
    // Distribute pieces among rods (leave last rod empty)
    const rods = Array(numRods).fill().map(() => [])
    pieces.forEach((piece, index) => {
      const rodIndex = index % (numRods - 1)
      rods[rodIndex].push(piece)
    })
    
    return rods
  }

  const [gameState, setGameState] = useState({
    rods: generateLevel(level),
    selectedRod: null,
    selectedPiece: null,
    moves: 0,
    completed: false,
    hint: false
  })

  const colors = {
    red: 'bg-red-500',
    green: 'bg-green-500', 
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500'
  }

  const checkWinCondition = (rods) => {
    // Check if all non-empty rods contain only pieces of the same color
    const nonEmptyRods = rods.filter(rod => rod.length > 0)
    return nonEmptyRods.every(rod => {
      const firstColor = rod[0].color
      return rod.every(piece => piece.color === firstColor)
    })
  }

  const canMovePiece = (fromRod, toRod) => {
    if (fromRod.length === 0) return false
    if (toRod.length >= 6) return false // Max 6 pieces per rod
    return true
  }

  const handleRodClick = (rodIndex) => {
    if (gameState.completed) return

    const currentRod = gameState.rods[rodIndex]
    
    if (gameState.selectedRod === null) {
      // Select a rod to move from
      if (currentRod.length > 0) {
        setGameState(prev => ({ 
          ...prev, 
          selectedRod: rodIndex,
          selectedPiece: currentRod[currentRod.length - 1]
        }))
      }
    } else {
      // Try to move piece to this rod
      if (rodIndex !== gameState.selectedRod) {
        const newRods = [...gameState.rods]
        const fromRod = newRods[gameState.selectedRod]
        const toRod = newRods[rodIndex]
        
        if (canMovePiece(fromRod, toRod)) {
          const piece = fromRod.pop()
          toRod.push(piece)
          
          const completed = checkWinCondition(newRods)
          
          setGameState(prev => ({
            ...prev,
            rods: newRods,
            selectedRod: null,
            selectedPiece: null,
            moves: prev.moves + 1,
            completed
          }))
          
          if (completed) {
            setTimeout(() => onLevelComplete(), 1500)
          }
        } else {
          // Invalid move
          setGameState(prev => ({ 
            ...prev, 
            selectedRod: null,
            selectedPiece: null
          }))
        }
      } else {
        // Deselect
        setGameState(prev => ({ 
          ...prev, 
          selectedRod: null,
          selectedPiece: null
        }))
      }
    }
  }

  const resetGame = () => {
    setGameState({
      rods: generateLevel(level),
      selectedRod: null,
      selectedPiece: null,
      moves: 0,
      completed: false,
      hint: false
    })
  }

  const showHint = () => {
    setGameState(prev => ({ ...prev, hint: !prev.hint }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button onClick={onBack} variant="outline" className="text-white border-white hover:bg-white hover:text-black">
            <Home className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-1">🔩 Nuts & Bolts</h1>
            <p className="text-slate-300">Level {level}</p>
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
          <div className="bg-slate-700 rounded-lg p-4 inline-block">
            <p className="text-white text-lg font-semibold">Moves: {gameState.moves}</p>
            <p className="text-slate-300 text-sm mt-1">
              {gameState.hint ? "💡 Group all pieces of the same color together on each rod!" : "Sort nuts and bolts by color"}
            </p>
          </div>
        </div>

        {/* Game Board */}
        <div className="flex justify-center items-end space-x-4 mb-8 overflow-x-auto pb-4">
          {gameState.rods.map((rod, rodIndex) => (
            <div
              key={rodIndex}
              className={`relative cursor-pointer transition-all duration-300 flex-shrink-0 ${
                gameState.selectedRod === rodIndex ? 'scale-110 z-10' : 'hover:scale-105'
              }`}
              onClick={() => handleRodClick(rodIndex)}
            >
              {/* Rod Base */}
              <div className="w-20 h-6 bg-gradient-to-r from-gray-600 to-gray-500 rounded-full mb-2 shadow-lg border-2 border-gray-400"></div>
              
              {/* Rod */}
              <div className="w-3 h-40 bg-gradient-to-t from-gray-500 to-gray-300 mx-auto relative rounded-t-full shadow-lg">
                {/* Pieces on rod */}
                <div className="absolute bottom-0 w-full flex flex-col-reverse items-center">
                  {rod.map((piece, pieceIndex) => (
                    <div
                      key={piece.id}
                      className={`relative mb-1 transition-all duration-200 ${
                        gameState.selectedPiece?.id === piece.id ? 'animate-pulse' : ''
                      }`}
                      style={{ zIndex: rod.length - pieceIndex }}
                    >
                      {piece.type === 'nut' ? (
                        // Nut design
                        <div className={`w-14 h-10 ${colors[piece.color]} rounded-lg border-3 border-white shadow-lg relative`}>
                          <div className="absolute inset-2 bg-white bg-opacity-20 rounded"></div>
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-inner"></div>
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-gray-400 rounded-full"></div>
                        </div>
                      ) : (
                        // Bolt design  
                        <div className={`w-12 h-12 ${colors[piece.color]} rounded-full border-3 border-white shadow-lg relative`}>
                          <div className="absolute inset-1 bg-white bg-opacity-20 rounded-full"></div>
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-inner"></div>
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-gray-400 rounded-full"></div>
                          {/* Bolt threads */}
                          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-2 bg-gray-300"></div>
                          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-2 bg-gray-300"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Rod selection indicator */}
                {gameState.selectedRod === rodIndex && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <div className="w-6 h-6 bg-yellow-400 rounded-full animate-bounce shadow-lg border-2 border-white"></div>
                  </div>
                )}
              </div>
              
              {/* Rod number */}
              <div className="text-center mt-2">
                <span className="text-white text-sm bg-slate-600 px-2 py-1 rounded">{rodIndex + 1}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Win Message */}
        {gameState.completed && (
          <div className="text-center">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6 rounded-xl inline-block shadow-2xl border-4 border-white">
              <div className="text-4xl mb-2">🎉</div>
              <h2 className="text-2xl font-bold mb-2">Level Complete!</h2>
              <p className="text-lg">Perfect sorting! You completed it in {gameState.moves} moves.</p>
              <div className="mt-4 text-3xl">⭐⭐⭐</div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-center mt-8">
          <div className="bg-slate-700 rounded-lg p-4 max-w-2xl mx-auto">
            <h3 className="text-white font-semibold mb-2">How to Play:</h3>
            <p className="text-slate-300 text-sm">
              Click a rod to select the top piece, then click another rod to move it there. 
              Group all pieces of the same color together on each rod to win!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NutsAndBolts

